"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "../../../components/icons";
import {
  Button, cx, ErrorState, Field, IconButton, Input, PageHeader, Panel, PanelHeader, Segmented, Skeleton, Textarea, Toggle, useToast,
} from "../../../components/ui";
import { api, json } from "../../../lib/api";
import { usePreferences, type MessageKey } from "../../../lib/i18n";
import type { Faq, OpeningHours, Website } from "../../../lib/types";
import { useResource } from "../../../lib/useResource";

type Tab = "details" | "hours" | "faq" | "seo";

// Week shown Monday-first, which is how most businesses think about it.
const WEEK = [1, 2, 3, 4, 5, 6, 0];

const defaultHours = (): OpeningHours[] => WEEK.map((day) => ({ day, closed: false, open: "09:00", close: "18:00" }));

const empty: Website = {
  businessName: "", tagline: "", description: "", contactEmail: "", phone: "", whatsapp: "", instagram: "",
  address: "", openingHours: "", hours: [], announcement: { enabled: false, text: "" }, faqs: [],
  seoTitle: "", seoDescription: "", tiktok: "", facebook: "", mapsUrl: "", published: true,
};

const LIMITS = { businessName: 120, tagline: 160, description: 2000, seoTitle: 70, seoDescription: 170, announcement: 200 };

function normalise(source: Partial<Website> | null | undefined): Website {
  const result: Website = { ...empty, ...(source ?? {}) } as Website;
  for (const key of Object.keys(empty) as Array<keyof Website>) {
    if (result[key] === undefined || result[key] === null) (result as unknown as Record<string, unknown>)[key] = empty[key];
  }
  // Always edit a full week, in display order.
  const byDay = new Map((result.hours ?? []).map((h) => [h.day, h]));
  result.hours = defaultHours().map((h) => ({ ...h, ...byDay.get(h.day) }));
  result.announcement = { enabled: Boolean(result.announcement?.enabled), text: result.announcement?.text ?? "" };
  result.faqs = (result.faqs ?? []).map((f) => ({ question: f.question ?? "", answer: f.answer ?? "" }));
  return result;
}

/** Only fields the API accepts; blank FAQs are dropped rather than rejected. */
function toPayload(site: Website) {
  const { updatedAt: _ignored, ...rest } = site;
  void _ignored;
  return { ...rest, faqs: site.faqs.filter((f) => f.question.trim()) };
}

function Preview({ site }: { site: Website }) {
  const { t } = usePreferences();
  const today = site.hours.find((h) => h.day === new Date().getDay());
  const contacts = [
    { icon: Icon.Mail, value: site.contactEmail },
    { icon: Icon.Phone, value: site.phone || site.whatsapp },
    { icon: Icon.Pin, value: site.address },
  ].filter((c) => c.value);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-bg shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-line bg-surface px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-fg/15" /><span className="h-2.5 w-2.5 rounded-full bg-fg/15" /><span className="h-2.5 w-2.5 rounded-full bg-fg/15" />
      </div>
      <div className={cx("transition", !site.published && "opacity-40 grayscale")}>
        {site.announcement.enabled && site.announcement.text && (
          <div className="flex items-center justify-center gap-2 bg-gold px-4 py-2 text-center text-xs font-medium text-[#140d03]">
            <Icon.Megaphone size={14} className="shrink-0" />{site.announcement.text}
          </div>
        )}
        <div className="relative px-6 py-9">
          <div className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />
          <p className="os-kicker relative">{site.businessName || t("website.placeholderName")}</p>
          <h3 className="relative mt-3 text-2xl font-semibold leading-tight tracking-[-0.03em]">{site.tagline || t("website.placeholderTagline")}</h3>
          <p className="relative mt-3 line-clamp-4 whitespace-pre-line text-sm leading-6 text-muted">{site.description || t("website.placeholderDescription")}</p>
          {today && (
            <p className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-[11px] text-muted">
              <span className={cx("h-1.5 w-1.5 rounded-full", today.closed ? "bg-faint" : "bg-success")} />
              {today.closed ? t("website.closedToday") : t("website.openNow", { open: today.open, close: today.close })}
            </p>
          )}
          {contacts.length > 0 && (
            <ul className="relative mt-5 space-y-2 border-t border-line pt-4 text-xs text-muted">
              {contacts.map(({ icon: ContactIcon, value }) => (
                <li key={value} className="flex items-center gap-2"><ContactIcon size={14} className="shrink-0 text-gold-text" /><span className="truncate" dir="auto">{value}</span></li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchPreview({ site, slug }: { site: Website; slug?: string }) {
  const { t } = usePreferences();
  const title = site.seoTitle || [site.businessName, site.tagline].filter(Boolean).join(" · ") || t("website.placeholderName");
  const description = site.seoDescription || site.description || t("website.placeholderDescription");
  return (
    <div className="rounded-2xl border border-line bg-white p-5 text-start shadow-xl" dir="auto">
      <p className="truncate text-xs text-[#4d5156]" dir="ltr">falahstudios.com › {slug}</p>
      <p className="mt-1 line-clamp-1 text-lg text-[#1a0dab]">{title}</p>
      <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#4d5156]">{description}</p>
    </div>
  );
}

export default function WebsitePage() {
  const { t, relative, errorText } = usePreferences();
  const toast = useToast();
  const { data, error, loading, reload } = useResource<{ website: Website | null; slug: string; defaults: { businessName: string } }>("/website");
  const [tab, setTab] = useState<Tab>("details");
  const [saved, setSaved] = useState<Website>(normalise(null));
  const [site, setSite] = useState<Website>(normalise(null));
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | undefined>();

  useEffect(() => {
    if (!data) return;
    const initial = normalise(data.website ?? { businessName: data.defaults.businessName });
    // A workspace that has never saved starts "dirty" so the owner is nudged to publish.
    setSaved(data.website ? initial : { ...initial, businessName: "" });
    setSite(initial);
    setLastSaved(data.website?.updatedAt);
  }, [data]);

  const dirty = useMemo(() => JSON.stringify(toPayload(site)) !== JSON.stringify(toPayload(saved)), [site, saved]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const set = (key: keyof Website) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSite((s) => ({ ...s, [key]: e.target.value }));
  const setHours = (day: number, patch: Partial<OpeningHours>) => setSite((s) => ({ ...s, hours: s.hours.map((h) => (h.day === day ? { ...h, ...patch } : h)) }));
  const setFaq = (index: number, patch: Partial<Faq>) => setSite((s) => ({ ...s, faqs: s.faqs.map((f, i) => (i === index ? { ...f, ...patch } : f)) }));
  const moveFaq = (index: number, by: number) => setSite((s) => {
    const faqs = [...s.faqs];
    const [item] = faqs.splice(index, 1);
    faqs.splice(index + by, 0, item);
    return { ...s, faqs };
  });

  async function save() {
    if (!site.businessName.trim()) { setTab("details"); return; }
    setSaving(true);
    try {
      const updated = await api<Website>("/website", { method: "PUT", body: json(toPayload(site)) });
      const next = normalise(updated);
      setSaved(next);
      setSite(next);
      setLastSaved(updated.updatedAt);
      toast(t("common.saved"));
    } catch (reason) {
      toast(errorText(reason instanceof Error ? reason.message : null), "error");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        if (dirty && !saving) void save();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  if (error && !data) return <><PageHeader kicker={t("website.kicker")} title={t("website.title")} /><ErrorState message={error} onRetry={reload} /></>;

  const ready = Boolean(data) && !loading;
  const counter = (value: string, max: number) => t("website.chars", { n: value.length, max });

  const tabs: Array<{ value: Tab; label: string }> = [
    { value: "details", label: t("website.tabDetails") },
    { value: "hours", label: t("website.tabHours") },
    { value: "faq", label: t("website.tabFaq") },
    { value: "seo", label: t("website.tabSeo") },
  ];

  return (
    <>
      <PageHeader
        kicker={t("website.kicker")}
        title={t("website.title")}
        subtitle={t("website.subtitle")}
        actions={
          <div className="flex items-center gap-3">
            {lastSaved && !dirty && <span className="text-xs text-faint">{t("website.lastSaved", { time: relative(lastSaved) })}</span>}
            <Button onClick={save} loading={saving} disabled={!dirty || !ready || !site.businessName.trim()}>{saving ? t("common.saving") : t("common.save")}</Button>
          </div>
        }
      />

      <div className="mb-5"><Segmented label={t("website.title")} value={tab} onChange={setTab} options={tabs} /></div>

      <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-5">
          {!ready ? (
            <Panel className="space-y-5 p-6"><Skeleton className="h-11" /><Skeleton className="h-11" /><Skeleton className="h-32" /></Panel>
          ) : tab === "details" ? (
            <>
              <Panel className="p-6">
                <PanelHeader title={t("website.announcement")} />
                <p className="mt-1 text-xs text-muted">{t("website.announcementHint")}</p>
                <div className="mt-5 space-y-3">
                  <Toggle checked={site.announcement.enabled} onChange={(enabled) => setSite((s) => ({ ...s, announcement: { ...s.announcement, enabled } }))} label={t("website.announcementOn")} />
                  {site.announcement.enabled && (
                    <Input
                      aria-label={t("website.announcement")}
                      maxLength={LIMITS.announcement}
                      placeholder={t("website.announcementPlaceholder")}
                      value={site.announcement.text}
                      onChange={(e) => setSite((s) => ({ ...s, announcement: { ...s.announcement, text: e.target.value } }))}
                    />
                  )}
                </div>
              </Panel>

              <Panel className="p-6">
                <PanelHeader title={t("website.business")} />
                <p className="mt-1 text-xs text-muted">{t("website.businessHint")}</p>
                <div className="mt-6 space-y-5">
                  <Field label={t("website.businessName")} hint={counter(site.businessName, LIMITS.businessName)} error={!site.businessName.trim() ? t("website.nameRequired") : undefined}>
                    {(id) => <Input id={id} required maxLength={LIMITS.businessName} value={site.businessName} onChange={set("businessName")} />}
                  </Field>
                  <Field label={t("website.tagline")} hint={counter(site.tagline, LIMITS.tagline)}>
                    {(id) => <Input id={id} maxLength={LIMITS.tagline} placeholder={t("website.placeholderTagline")} value={site.tagline} onChange={set("tagline")} />}
                  </Field>
                  <Field label={t("website.description")} hint={counter(site.description, LIMITS.description)}>
                    {(id) => <Textarea id={id} rows={6} maxLength={LIMITS.description} placeholder={t("website.placeholderDescription")} value={site.description} onChange={set("description")} />}
                  </Field>
                </div>
              </Panel>

              <Panel className="p-6">
                <PanelHeader title={t("website.contact")} />
                <p className="mt-1 text-xs text-muted">{t("website.contactHint")}</p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label={t("website.contactEmail")}>{(id) => <Input id={id} type="email" dir="ltr" value={site.contactEmail} onChange={set("contactEmail")} />}</Field>
                  <Field label={t("common.phone")}>{(id) => <Input id={id} type="tel" dir="ltr" maxLength={40} value={site.phone} onChange={set("phone")} />}</Field>
                  <Field label={t("website.whatsapp")}>{(id) => <Input id={id} type="tel" dir="ltr" maxLength={40} value={site.whatsapp} onChange={set("whatsapp")} />}</Field>
                  <Field label={t("website.address")}>{(id) => <Input id={id} maxLength={300} value={site.address} onChange={set("address")} />}</Field>
                </div>
              </Panel>
            </>
          ) : tab === "hours" ? (
            <Panel className="p-6">
              <PanelHeader
                title={t("website.weeklyHours")}
                action={
                  <Button variant="quiet" size="sm" onClick={() => {
                    const first = site.hours.find((h) => !h.closed);
                    if (first) setSite((s) => ({ ...s, hours: s.hours.map((h) => (h.closed ? h : { ...h, open: first.open, close: first.close })) }));
                  }}>
                    <Icon.Copy size={13} />{t("website.copyToAll")}
                  </Button>
                }
              />
              <p className="mt-1 text-xs text-muted">{t("website.weeklyHoursHint")}</p>
              <ul className="mt-5 divide-y divide-line/60">
                {site.hours.map((h) => (
                  <li key={h.day} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                    <span className="w-24 text-sm font-medium">{t(`day.${h.day}` as MessageKey)}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!h.closed}
                      aria-label={`${t(`day.${h.day}` as MessageKey)}: ${h.closed ? t("website.closed") : t("website.open")}`}
                      onClick={() => setHours(h.day, { closed: !h.closed })}
                      className="flex items-center gap-2 text-xs text-muted"
                    >
                      <span className={cx("relative h-5 w-9 shrink-0 rounded-full transition", !h.closed ? "bg-gold" : "bg-fg/15")}>
                        <span className={cx("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", !h.closed ? "start-[18px]" : "start-0.5")} />
                      </span>
                      <span className="w-12 text-start">{h.closed ? t("website.closed") : t("website.open")}</span>
                    </button>
                    {!h.closed && (
                      <div className="flex items-center gap-2">
                        <Input type="time" aria-label={t("website.opens")} value={h.open} onChange={(e) => setHours(h.day, { open: e.target.value })} className="!h-9 !w-[7.5rem] text-xs" />
                        <span className="text-faint">–</span>
                        <Input type="time" aria-label={t("website.closes")} value={h.close} onChange={(e) => setHours(h.day, { close: e.target.value })} className="!h-9 !w-[7.5rem] text-xs" />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <Field label={t("website.hoursNote")} hint={t("common.optional")} className="mt-5">
                {(id) => <Input id={id} maxLength={300} placeholder={t("website.hoursNotePlaceholder")} value={site.openingHours} onChange={set("openingHours")} />}
              </Field>
            </Panel>
          ) : tab === "faq" ? (
            <Panel className="p-6">
              <PanelHeader title={t("website.faqs")} action={
                <Button variant="quiet" size="sm" disabled={site.faqs.length >= 30} onClick={() => setSite((s) => ({ ...s, faqs: [...s.faqs, { question: "", answer: "" }] }))}>
                  <Icon.Plus size={14} />{t("website.addFaq")}
                </Button>
              } />
              <p className="mt-1 text-xs text-muted">{t("website.faqsHint")}</p>
              {site.faqs.length === 0 ? (
                <p className="mt-5 rounded-xl border border-dashed border-line py-10 text-center text-xs text-faint">{t("website.noFaqs")}</p>
              ) : (
                <ol className="mt-5 space-y-3">
                  {site.faqs.map((faq, index) => (
                    <li key={index} className="rounded-xl border border-line/70 bg-bg/30 p-4">
                      <div className="flex items-start gap-3">
                        <span className="mt-3 w-5 text-center text-xs tabular-nums text-faint">{index + 1}</span>
                        <div className="flex-1 space-y-2">
                          <Input aria-label={t("website.question")} placeholder={t("website.question")} maxLength={200} value={faq.question} onChange={(e) => setFaq(index, { question: e.target.value })} />
                          <Textarea aria-label={t("website.answer")} placeholder={t("website.answer")} rows={2} maxLength={1000} value={faq.answer} onChange={(e) => setFaq(index, { answer: e.target.value })} />
                        </div>
                        <div className="flex flex-col">
                          <IconButton label={t("website.moveUp")} disabled={index === 0} onClick={() => moveFaq(index, -1)}><Icon.Chevron size={14} className="-rotate-90" /></IconButton>
                          <IconButton label={t("website.moveDown")} disabled={index === site.faqs.length - 1} onClick={() => moveFaq(index, 1)}><Icon.Chevron size={14} className="rotate-90" /></IconButton>
                          <IconButton label={t("website.removeFaq")} onClick={() => setSite((s) => ({ ...s, faqs: s.faqs.filter((_, i) => i !== index) }))}><Icon.Trash size={14} /></IconButton>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
          ) : (
            <>
              <Panel className="p-6">
                <PanelHeader title={t("website.seo")} />
                <p className="mt-1 text-xs text-muted">{t("website.seoHint")}</p>
                <div className="mt-6 space-y-5">
                  <Field label={t("website.seoTitle")} hint={counter(site.seoTitle, LIMITS.seoTitle)}>
                    {(id) => <Input id={id} maxLength={LIMITS.seoTitle} placeholder={[site.businessName, site.tagline].filter(Boolean).join(" · ")} value={site.seoTitle} onChange={set("seoTitle")} />}
                  </Field>
                  <Field label={t("website.seoDescription")} hint={counter(site.seoDescription, LIMITS.seoDescription)}>
                    {(id) => <Textarea id={id} rows={3} maxLength={LIMITS.seoDescription} placeholder={site.description.slice(0, 160)} value={site.seoDescription} onChange={set("seoDescription")} />}
                  </Field>
                </div>
              </Panel>
              <Panel className="p-6">
                <PanelHeader title={t("website.social")} />
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label={t("website.instagram")}>{(id) => <Input id={id} dir="ltr" maxLength={80} placeholder="@" value={site.instagram} onChange={set("instagram")} />}</Field>
                  <Field label={t("website.tiktok")}>{(id) => <Input id={id} dir="ltr" maxLength={80} placeholder="@" value={site.tiktok} onChange={set("tiktok")} />}</Field>
                  <Field label={t("website.facebook")}>{(id) => <Input id={id} dir="ltr" maxLength={120} value={site.facebook} onChange={set("facebook")} />}</Field>
                  <Field label={t("website.mapsUrl")}>{(id) => <Input id={id} type="url" dir="ltr" maxLength={500} placeholder="https://maps.google.com/…" value={site.mapsUrl} onChange={set("mapsUrl")} />}</Field>
                </div>
              </Panel>
            </>
          )}
        </div>

        <div className="space-y-5 xl:sticky xl:top-8 xl:self-start">
          <div>
            <p className="os-kicker mb-3">{tab === "seo" ? t("website.searchPreview") : t("website.preview")}</p>
            {!ready ? <Skeleton className="h-80 rounded-2xl" /> : tab === "seo" ? <SearchPreview site={site} slug={data?.slug} /> : <Preview site={site} />}
          </div>
          <Panel className="p-5">
            <p className="os-kicker mb-3">{t("website.visibility")}</p>
            <Toggle
              checked={site.published}
              onChange={(published) => setSite((s) => ({ ...s, published }))}
              label={site.published ? t("website.published") : t("website.hidden")}
              description={t("website.publishedHint")}
            />
            {data?.slug && <p className="mt-3 font-mono text-[11px] text-faint" dir="ltr">/{data.slug}</p>}
          </Panel>
        </div>
      </form>

      {dirty && ready && (
        <div className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 lg:ps-72">
          <div className="flex animate-fade-up items-center gap-4 rounded-2xl border border-gold/30 bg-surface/95 py-2.5 pe-2.5 ps-5 shadow-2xl backdrop-blur-xl">
            <span className="flex items-center gap-2 text-sm"><span className="h-2 w-2 rounded-full bg-gold" />{t("website.unsaved")}</span>
            <Button variant="ghost" size="sm" onClick={() => setSite(saved.businessName ? saved : { ...saved, businessName: site.businessName })}>{t("website.discard")}</Button>
            <Button size="sm" onClick={save} loading={saving} disabled={!site.businessName.trim()}>{t("common.save")}</Button>
          </div>
        </div>
      )}
    </>
  );
}
