"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "../../../components/icons";
import {
  Button, cx, DeleteButton, EmptyState, ErrorState, Field, Input, ListSkeleton, PageHeader, Panel, SearchInput,
  Segmented, Sheet, Textarea, Toggle, useDebounced, useToast,
} from "../../../components/ui";
import { api, json } from "../../../lib/api";
import { usePreferences } from "../../../lib/i18n";
import type { CatalogItem, CatalogType } from "../../../lib/types";
import { useResource } from "../../../lib/useResource";

type Filter = CatalogType | "all";
type Draft = { type: CatalogType; name: string; description: string; category: string; price: string; durationMinutes: string; available: boolean; featured: boolean };

const blank = (type: CatalogType = "product"): Draft => ({
  type, name: "", description: "", category: "", price: "", durationMinutes: type === "service" ? "60" : "", available: true, featured: false,
});

function toDraft(item: CatalogItem): Draft {
  return {
    type: item.type, name: item.name, description: item.description, category: item.category, price: String(item.price),
    durationMinutes: item.durationMinutes ? String(item.durationMinutes) : "", available: item.available, featured: item.featured,
  };
}

function ItemSheet({ item, open, categories, defaultType, onClose, onSaved }: {
  item: CatalogItem | null; open: boolean; categories: string[]; defaultType: CatalogType; onClose: () => void; onSaved: () => void;
}) {
  const { t, errorText, currency } = usePreferences();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft>(blank());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setDraft(item ? toDraft(item) : blank(defaultType));
    setError("");
  }, [open, item, defaultType]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const body = {
      type: draft.type,
      name: draft.name,
      description: draft.description,
      category: draft.category,
      price: Number(draft.price) || 0,
      durationMinutes: draft.type === "service" && draft.durationMinutes ? Number(draft.durationMinutes) : null,
      available: draft.available,
      featured: draft.featured,
    };
    try {
      if (item) await api(`/business/catalog/${item._id}`, { method: "PATCH", body: json(body) });
      else await api("/business/catalog", { method: "POST", body: json({ ...body, durationMinutes: body.durationMinutes ?? undefined }) });
      toast(item ? t("catalog.updated") : t("catalog.created"));
      onSaved();
      onClose();
    } catch (reason) {
      setError(errorText(reason instanceof Error ? reason.message : null));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!item) return;
    try {
      await api(`/business/catalog/${item._id}`, { method: "DELETE" });
      toast(t("common.deleted"));
      onSaved();
      onClose();
    } catch (reason) {
      toast(errorText(reason instanceof Error ? reason.message : null), "error");
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      kicker={t("catalog.kicker")}
      title={item ? t("catalog.edit") : t("catalog.new")}
      footer={
        <div className={cx("flex items-center gap-3", item ? "justify-between" : "justify-end")}>
          {item && <DeleteButton onConfirm={remove} confirmText={t("catalog.deleteConfirm")} />}
          <Button type="submit" form="catalog-item" loading={saving}>{saving ? t("common.saving") : item ? t("common.save") : t("catalog.new")}</Button>
        </div>
      }
    >
      <form id="catalog-item" onSubmit={submit} className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-medium text-muted">{t("catalog.type")}</p>
          <Segmented
            label={t("catalog.type")}
            value={draft.type}
            onChange={(type) => setDraft((d) => ({ ...d, type, durationMinutes: type === "service" && !d.durationMinutes ? "60" : d.durationMinutes }))}
            options={[{ value: "product", label: t("catalog.product") }, { value: "service", label: t("catalog.service") }]}
          />
        </div>
        <Field label={t("catalog.name")}>{(id) => <Input id={id} required maxLength={160} value={draft.name} onChange={(e) => set("name", e.target.value)} />}</Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={`${t("catalog.price")} (${currency})`}>
            {(id) => <Input id={id} type="number" required min={0} step="0.01" inputMode="decimal" value={draft.price} onChange={(e) => set("price", e.target.value)} />}
          </Field>
          <Field label={t("catalog.category")} hint={t("common.optional")}>
            {(id) => (
              <>
                <Input id={id} list="catalog-categories" maxLength={60} placeholder={t("catalog.categoryHint")} value={draft.category} onChange={(e) => set("category", e.target.value)} />
                <datalist id="catalog-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
              </>
            )}
          </Field>
        </div>
        {draft.type === "service" && (
          <Field label={t("catalog.duration")}>
            {(id) => <Input id={id} type="number" min={5} max={1440} step={5} value={draft.durationMinutes} onChange={(e) => set("durationMinutes", e.target.value)} />}
          </Field>
        )}
        <Field label={t("catalog.description")} hint={t("common.optional")}>
          {(id) => <Textarea id={id} rows={3} maxLength={1000} value={draft.description} onChange={(e) => set("description", e.target.value)} />}
        </Field>
        <div className="space-y-2">
          <Toggle checked={draft.available} onChange={(v) => set("available", v)} label={t("catalog.available")} description={t("catalog.availableHint")} />
          <Toggle checked={draft.featured} onChange={(v) => set("featured", v)} label={t("catalog.featured")} description={t("catalog.featuredHint")} />
        </div>
        {error && <p role="alert" className="rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-xs text-danger">{error}</p>}
      </form>
    </Sheet>
  );
}

export default function CatalogPage() {
  const { t, money, number, errorText } = usePreferences();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const q = useDebounced(query);
  const { data, error, loading, reload, setData } = useResource<CatalogItem[]>(`/business/catalog?type=all&q=${encodeURIComponent(q)}`);

  const counts = useMemo(() => ({
    all: data?.length ?? 0,
    product: data?.filter((i) => i.type === "product").length ?? 0,
    service: data?.filter((i) => i.type === "service").length ?? 0,
  }), [data]);

  const categories = useMemo(() => Array.from(new Set((data ?? []).map((i) => i.category).filter(Boolean))).sort(), [data]);

  // Group visible items by category; uncategorised last.
  const groups = useMemo(() => {
    const visible = (data ?? []).filter((i) => filter === "all" || i.type === filter);
    const map = new Map<string, CatalogItem[]>();
    for (const item of visible) map.set(item.category, [...(map.get(item.category) ?? []), item]);
    return Array.from(map.entries()).sort(([a], [b]) => (!a ? 1 : !b ? -1 : a.localeCompare(b)));
  }, [data, filter]);

  function openNew() { setEditing(null); setSheetOpen(true); }
  function openEdit(item: CatalogItem) { setEditing(item); setSheetOpen(true); }

  async function toggleAvailable(item: CatalogItem) {
    const available = !item.available;
    setData((current) => current?.map((i) => (i._id === item._id ? { ...i, available } : i)) ?? null);
    try {
      await api(`/business/catalog/${item._id}`, { method: "PATCH", body: json({ available }) });
    } catch (reason) {
      setData((current) => current?.map((i) => (i._id === item._id ? item : i)) ?? null);
      toast(errorText(reason instanceof Error ? reason.message : null), "error");
    }
  }

  return (
    <>
      <PageHeader
        kicker={t("catalog.kicker")}
        title={t("catalog.title")}
        subtitle={t("catalog.subtitle")}
        actions={<Button onClick={openNew}><Icon.Plus size={16} />{t("catalog.new")}</Button>}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          label={t("catalog.type")}
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: t("common.all"), count: data ? counts.all : undefined },
            { value: "product", label: t("catalog.products"), count: data ? counts.product : undefined },
            { value: "service", label: t("catalog.services"), count: data ? counts.service : undefined },
          ]}
        />
        <SearchInput value={query} onChange={setQuery} placeholder={t("catalog.search")} />
      </div>

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Panel className="px-6"><ListSkeleton rows={5} /></Panel>
      ) : !groups.length ? (
        <Panel className="p-6">
          {q || (data?.length ?? 0) > 0 ? (
            <EmptyState icon={<Icon.Search />} title={t("catalog.noMatch")} />
          ) : (
            <EmptyState icon={<Icon.Tag />} title={t("catalog.empty")} hint={t("catalog.emptyHint")} action={<Button onClick={openNew}><Icon.Plus size={16} />{t("catalog.new")}</Button>} />
          )}
        </Panel>
      ) : (
        <div className={cx("space-y-7", loading && "opacity-60")}>
          {groups.map(([category, items]) => (
            <section key={category || "_"}>
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted">
                {category || t("catalog.uncategorised")}
                <span className="font-normal text-faint">· {number(items.length)}</span>
              </h2>
              <Panel className="divide-y divide-line/60 overflow-hidden">
                {items.map((item) => (
                  <div key={item._id} className={cx("flex items-center gap-4 px-5 py-4 transition", !item.available && "opacity-55")}>
                    <button type="button" onClick={() => openEdit(item)} className="flex min-w-0 flex-1 items-center gap-4 text-start">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold/10 text-gold-text">
                        {item.type === "service" ? <Icon.Calendar size={17} /> : <Icon.Tag size={17} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{item.name}</span>
                          {item.featured && <Icon.Star size={13} className="shrink-0 fill-current text-gold-text" aria-label={t("catalog.featured")} />}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-faint">
                          {item.type === "service" ? t("catalog.service") : t("catalog.product")}
                          {item.durationMinutes ? ` · ${t("common.minutes", { n: item.durationMinutes })}` : ""}
                          {item.description ? ` · ${item.description}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">{money(item.price)}</span>
                    </button>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.available}
                      aria-label={`${t("catalog.available")}: ${item.name}`}
                      title={item.available ? t("catalog.available") : t("catalog.unavailable")}
                      onClick={() => toggleAvailable(item)}
                      className={cx("relative h-6 w-11 shrink-0 rounded-full transition", item.available ? "bg-gold" : "bg-fg/15")}
                    >
                      <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", item.available ? "start-[22px]" : "start-0.5")} />
                    </button>
                  </div>
                ))}
              </Panel>
            </section>
          ))}
        </div>
      )}

      <ItemSheet
        open={sheetOpen}
        item={editing}
        categories={categories}
        defaultType={filter === "service" ? "service" : "product"}
        onClose={() => setSheetOpen(false)}
        onSaved={reload}
      />
    </>
  );
}
