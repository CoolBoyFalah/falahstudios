"use client";

import { useEffect, useState } from "react";
import { Icon } from "../../../components/icons";
import { Button, Field, Input, PageHeader, Panel, PanelHeader, Segmented, Select, Skeleton, Textarea, Toggle, useToast } from "../../../components/ui";
import { api, json } from "../../../lib/api";
import { usePreferences } from "../../../lib/i18n";
import { signOut, updateClient } from "../../../lib/session";
import { CURRENCIES, type WorkspaceSettings } from "../../../lib/types";
import { useResource } from "../../../lib/useResource";

function CopyValue({ value }: { value: string }) {
  const { t } = usePreferences();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ }
      }}
      className="group flex items-center gap-2 font-mono text-sm"
      dir="ltr"
    >
      {value}
      <span className="text-faint transition group-hover:text-gold-text">{copied ? <Icon.Check size={14} /> : <Icon.Copy size={14} />}</span>
      <span className="sr-only">{copied ? t("common.copied") : t("common.copy")}</span>
    </button>
  );
}

type TaxDraft = { currency: string; taxRate: string; pricesIncludeTax: boolean; taxNumber: string; receiptNote: string };

function BusinessPanel({ data, onSaved }: { data: WorkspaceSettings | null; onSaved: (settings: WorkspaceSettings) => void }) {
  const { t, errorText, setCurrency } = usePreferences();
  const toast = useToast();
  const [draft, setDraft] = useState<TaxDraft | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setDraft({ currency: data.currency, taxRate: String(data.taxRate ?? 0), pricesIncludeTax: data.pricesIncludeTax ?? true, taxNumber: data.taxNumber || "", receiptNote: data.receiptNote || "" });
  }, [data]);

  const dirty = Boolean(data && draft) && (
    draft!.currency !== data!.currency || Number(draft!.taxRate) !== (data!.taxRate ?? 0) || draft!.pricesIncludeTax !== (data!.pricesIncludeTax ?? true) ||
    draft!.taxNumber !== (data!.taxNumber || "") || draft!.receiptNote !== (data!.receiptNote || "")
  );

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setSaving(true);
    try {
      const updated = await api<WorkspaceSettings>("/business/settings", { method: "PUT", body: json({ ...draft, taxRate: Number(draft.taxRate) || 0 }) });
      onSaved(updated);
      setCurrency(updated.currency);
      updateClient({ currency: updated.currency });
      toast(t("common.saved"));
    } catch (reason) {
      toast(errorText(reason instanceof Error ? reason.message : null), "error");
    } finally {
      setSaving(false);
    }
  }

  const set = <K extends keyof TaxDraft>(key: K, value: TaxDraft[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  return (
    <Panel className="p-6">
      <PanelHeader title={t("settings.business")} />
      <p className="mt-1 text-xs text-muted">{t("settings.businessHint")}</p>
      {!draft ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2"><Skeleton className="h-11" /><Skeleton className="h-11" /></div>
      ) : (
        <form onSubmit={save} className="mt-5 space-y-5">
          <div className="grid gap-5 sm:grid-cols-3 sm:items-end">
            <Field label={t("settings.currency")}>
              {(id) => <Select id={id} value={draft.currency} onChange={(e) => set("currency", e.target.value)}>{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</Select>}
            </Field>
            <Field label={t("settings.taxRate")} hint={t("settings.taxRateHint")}>
              {(id) => <Input id={id} type="number" min={0} max={100} step="0.01" inputMode="decimal" value={draft.taxRate} onChange={(e) => set("taxRate", e.target.value)} />}
            </Field>
            <Field label={t("settings.taxNumber")}>
              {(id) => <Input id={id} dir="ltr" maxLength={40} value={draft.taxNumber} onChange={(e) => set("taxNumber", e.target.value)} />}
            </Field>
          </div>
          {Number(draft.taxRate) > 0 && (
            <Toggle checked={draft.pricesIncludeTax} onChange={(v) => set("pricesIncludeTax", v)} label={t("settings.pricesIncludeTax")} description={t("settings.pricesIncludeTaxHint")} />
          )}
          <Field label={t("settings.receiptNote")} hint={t("common.optional")}>
            {(id) => <Textarea id={id} rows={2} maxLength={500} placeholder={t("settings.receiptNoteHint")} value={draft.receiptNote} onChange={(e) => set("receiptNote", e.target.value)} />}
          </Field>
          <div className="flex justify-end">
            <Button type="submit" loading={saving} disabled={!dirty}>{saving ? t("common.saving") : t("common.save")}</Button>
          </div>
        </form>
      )}
    </Panel>
  );
}

export default function SettingsPage() {
  const { t, date, language, setLanguage, theme, setTheme, errorText } = usePreferences();
  const toast = useToast();
  const { data, loading, setData } = useResource<WorkspaceSettings>("/business/settings");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (data) setName(data.name); }, [data]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await api<WorkspaceSettings>("/business/settings", { method: "PUT", body: json({ name }) });
      setData(updated);
      updateClient({ name: updated.name });
      toast(t("common.saved"));
    } catch (reason) {
      toast(errorText(reason instanceof Error ? reason.message : null), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader kicker={t("settings.kicker")} title={t("settings.title")} subtitle={t("settings.subtitle")} />

      <div className="space-y-5">
        <Panel className="p-6">
          <PanelHeader title={t("settings.profile")} />
          <form onSubmit={save} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field label={t("settings.businessName")} className="flex-1">
              {(id) => (loading && !data ? <Skeleton className="h-11" /> : <Input id={id} required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />)}
            </Field>
            <Button type="submit" loading={saving} disabled={!data || name.trim() === data.name}>{saving ? t("common.saving") : t("common.save")}</Button>
          </form>
        </Panel>

        <BusinessPanel data={data} onSaved={setData} />

        <Panel className="p-6">
          <PanelHeader title={t("settings.workspace")} />
          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              [t("settings.slug"), data?.slug],
              [t("settings.clientCode"), data?.clientCode],
              [t("settings.memberSince"), data ? date(data.createdAt, "date") : undefined],
            ].map(([label, value], index) => (
              <div key={label} className="rounded-xl border border-line/70 bg-bg/40 p-4">
                <dt className="text-[11px] text-faint">{label}</dt>
                <dd className="mt-1.5">{value ? (index < 2 ? <CopyValue value={value} /> : <span className="text-sm">{value}</span>) : <Skeleton className="h-5 w-20" />}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel className="p-6">
          <PanelHeader title={t("settings.preferences")} />
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-muted">{t("settings.language")}</p>
              <Segmented label={t("settings.language")} value={language} onChange={setLanguage} options={[{ value: "en", label: "English" }, { value: "ar", label: "العربية" }]} />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted">{t("settings.theme")}</p>
              <Segmented label={t("settings.theme")} value={theme} onChange={setTheme} options={[{ value: "dark", label: t("pref.dark") }, { value: "light", label: t("pref.light") }]} />
            </div>
          </div>
        </Panel>

        <Panel className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight">{t("settings.session")}</h2>
            <p className="mt-1 text-xs text-muted">{t("settings.sessionBody")}</p>
          </div>
          <Button variant="danger" onClick={signOut}><Icon.Logout size={15} />{t("auth.signOut")}</Button>
        </Panel>
      </div>
    </div>
  );
}
