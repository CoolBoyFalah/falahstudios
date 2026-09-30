"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NOTIFICATIONS_CHANGED } from "../../../components/Shell";
import { Icon } from "../../../components/icons";
import {
  Avatar, Button, DeleteButton, EmptyState, ErrorState, Field, IconButton, Input, ListSkeleton, PageHeader,
  Pagination, Panel, SearchInput, Segmented, Select, Sheet, StatusSelect, Textarea, useDebounced, useToast,
} from "../../../components/ui";
import { api, json } from "../../../lib/api";
import { usePreferences } from "../../../lib/i18n";
import { STATUSES, type CatalogItem, type Order, type Paginated, type Status, type WorkspaceSettings } from "../../../lib/types";
import { useResource } from "../../../lib/useResource";

type Filter = Status | "all";
type Draft = { name: string; quantity: string; unitPrice: string };
const emptyItem = (): Draft => ({ name: "", quantity: "1", unitPrice: "" });

/** Mirrors the API's tax calculation so the preview matches the saved order. */
function previewTotals(sum: number, rate: number, inclusive: boolean) {
  const r = (n: number) => Math.round(n * 100) / 100;
  if (!rate) return { subtotal: r(sum), tax: 0, total: r(sum) };
  if (inclusive) { const tax = r(sum - sum / (1 + rate / 100)); return { subtotal: r(sum - tax), tax, total: r(sum) }; }
  const tax = r(sum * (rate / 100));
  return { subtotal: r(sum), tax, total: r(sum + tax) };
}

function NewOrderSheet({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { t, money, errorText } = usePreferences();
  const toast = useToast();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [items, setItems] = useState<Draft[]>([emptyItem()]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("pending");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { data: catalog } = useResource<CatalogItem[]>(open ? "/business/catalog?type=all&available=true" : null);
  const { data: settings } = useResource<WorkspaceSettings>(open ? "/business/settings" : null);

  useEffect(() => {
    if (!open) return;
    setCustomerName(""); setCustomerEmail(""); setItems([emptyItem()]); setNotes(""); setStatus("pending"); setError("");
  }, [open]);

  const lineSum = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const taxRate = settings?.taxRate || 0;
  const totals = previewTotals(lineSum, taxRate, settings?.pricesIncludeTax ?? true);
  const update = (index: number, patch: Partial<Draft>) => setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  /** Adds a catalog item, or bumps its quantity if it's already on the order. */
  function addFromCatalog(id: string) {
    const product = catalog?.find((c) => c._id === id);
    if (!product) return;
    setItems((current) => {
      const existing = current.findIndex((i) => i.name === product.name && Number(i.unitPrice) === product.price);
      if (existing >= 0) return current.map((i, idx) => (idx === existing ? { ...i, quantity: String((Number(i.quantity) || 0) + 1) } : i));
      const line = { name: product.name, quantity: "1", unitPrice: String(product.price) };
      const blankIndex = current.findIndex((i) => !i.name.trim() && !i.unitPrice);
      return blankIndex >= 0 ? current.map((i, idx) => (idx === blankIndex ? line : i)) : [...current, line];
    });
  }

  /** Typing a catalog name fills in its price. */
  function updateName(index: number, name: string) {
    const match = catalog?.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    update(index, match && !items[index].unitPrice ? { name, unitPrice: String(match.price) } : { name });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api<Order>("/business/orders", {
        method: "POST",
        body: json({
          customerName,
          customerEmail,
          notes,
          status,
          items: items
            .filter((item) => item.name.trim())
            .map((item) => ({ name: item.name, quantity: Number(item.quantity) || 1, unitPrice: Number(item.unitPrice) || 0 })),
        }),
      });
      toast(t("orders.created"));
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
      onCreated();
      onClose();
    } catch (reason) {
      setError(errorText(reason instanceof Error ? reason.message : null));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      kicker={t("orders.kicker")}
      title={t("orders.new")}
      footer={
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-faint">
              {t("common.total")}
              {taxRate > 0 && (settings?.pricesIncludeTax
                ? <> · {t("tax.included", { rate: taxRate })}</>
                : <> · {t("tax.subtotal")} {money(totals.subtotal)} + {t("tax.vat", { rate: taxRate })} {money(totals.tax)}</>)}
            </p>
            <p className="os-metric text-xl font-semibold">{money(totals.total)}</p>
          </div>
          <Button type="submit" form="new-order" loading={saving}>{saving ? t("orders.creating") : t("orders.create")}</Button>
        </div>
      }
    >
      <form id="new-order" onSubmit={submit} className="space-y-5">
        <Field label={t("orders.customerName")}>{(id) => <Input id={id} required maxLength={120} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />}</Field>
        <Field label={t("orders.customerEmail")} hint={t("common.optional")}>{(id) => <Input id={id} type="email" dir="ltr" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />}</Field>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted">{t("orders.items")}</p>
            {Boolean(catalog?.length) && (
              <Select aria-label={t("catalog.pick")} value="" onChange={(e) => addFromCatalog(e.target.value)} className="!h-9 !w-auto max-w-[60%] text-xs">
                <option value="">{t("catalog.pick")}</option>
                {catalog!.map((c) => <option key={c._id} value={c._id}>{c.name} · {money(c.price)}</option>)}
              </Select>
            )}
          </div>
          <datalist id="order-catalog">{catalog?.map((c) => <option key={c._id} value={c.name} />)}</datalist>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-[1fr_4.5rem_6.5rem_auto] items-center gap-2">
                <Input aria-label={t("orders.item")} placeholder={t("orders.item")} list="order-catalog" required={index === 0} maxLength={160} value={item.name} onChange={(e) => updateName(index, e.target.value)} />
                <Input aria-label={t("orders.qty")} type="number" min={1} step={1} required value={item.quantity} onChange={(e) => update(index, { quantity: e.target.value })} className="px-2 text-center" />
                <Input aria-label={t("orders.price")} placeholder={t("orders.price")} type="number" min={0} step="0.01" required={Boolean(item.name)} value={item.unitPrice} onChange={(e) => update(index, { unitPrice: e.target.value })} />
                <IconButton label={t("orders.removeItem")} disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, i) => i !== index))}><Icon.Close size={15} /></IconButton>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setItems((current) => [...current, emptyItem()])} disabled={items.length >= 50}>
            <Icon.Plus size={14} />{t("orders.addItem")}
          </Button>
        </div>

        <Field label={t("orders.initialStatus")}>
          {(id) => (
            <Select id={id} value={status} onChange={(e) => setStatus(e.target.value as Status)}>
              {STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
            </Select>
          )}
        </Field>
        <Field label={t("common.notes")} hint={t("common.optional")}>{(id) => <Textarea id={id} rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />}</Field>

        {error && <p role="alert" className="rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-xs text-danger">{error}</p>}
      </form>
    </Sheet>
  );
}

export default function OrdersPage() {
  const { t, money, date, relative, errorText } = usePreferences();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const q = useDebounced(query);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("new")) setCreating(true);
    const status = params.get("status");
    if (status && (STATUSES as string[]).includes(status)) setFilter(status as Status);
  }, []);

  useEffect(() => setPage(1), [filter, q]);

  const path = `/business/orders?status=${filter}&page=${page}&limit=20&q=${encodeURIComponent(q)}`;
  const { data, error, loading, reload, setData } = useResource<Paginated<Order> & { counts: Partial<Record<Status, number>> }>(path);

  const counts = data?.counts ?? {};
  const allCount = Object.values(counts).reduce((a, b) => a + (b || 0), 0);

  async function changeStatus(order: Order, status: Status) {
    // Optimistic: reflect the change immediately, roll back on failure.
    setData((current) => current && { ...current, items: current.items.map((o) => (o._id === order._id ? { ...o, status } : o)) });
    try {
      await api<Order>(`/business/orders/${order._id}/status`, { method: "PATCH", body: json({ status }) });
      toast(t("orders.updated"));
      void reload();
    } catch (reason) {
      setData((current) => current && { ...current, items: current.items.map((o) => (o._id === order._id ? order : o)) });
      toast(errorText(reason instanceof Error ? reason.message : null), "error");
    }
  }

  async function remove(order: Order) {
    try {
      await api(`/business/orders/${order._id}`, { method: "DELETE" });
      toast(t("common.deleted"));
      setExpanded(null);
      void reload();
    } catch (reason) {
      toast(errorText(reason instanceof Error ? reason.message : null), "error");
    }
  }

  return (
    <>
      <PageHeader
        kicker={t("orders.kicker")}
        title={t("orders.title")}
        subtitle={t("orders.subtitle")}
        actions={<Button onClick={() => setCreating(true)}><Icon.Plus size={16} />{t("orders.new")}</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Segmented
          label={t("common.status")}
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: t("common.all"), count: data ? allCount : undefined },
            ...STATUSES.map((s) => ({ value: s as Filter, label: t(`status.${s}`), count: data ? counts[s] || 0 : undefined })),
          ]}
        />
        <SearchInput value={query} onChange={setQuery} placeholder={t("orders.search")} />
      </div>

      <Panel className="overflow-hidden">
        {error && !data ? (
          <div className="p-6"><ErrorState message={error} onRetry={reload} /></div>
        ) : loading && !data ? (
          <div className="px-6"><ListSkeleton rows={6} /></div>
        ) : !data?.items.length ? (
          <div className="p-6">
            {allCount === 0 && !q ? (
              <EmptyState icon={<Icon.Bag />} title={t("orders.empty")} hint={t("orders.emptyHint")} action={<Button onClick={() => setCreating(true)}><Icon.Plus size={16} />{t("orders.new")}</Button>} />
            ) : (
              <EmptyState icon={<Icon.Search />} title={t("orders.noMatch")} />
            )}
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[1.4fr_1.6fr_1fr_0.9fr_auto] gap-4 border-b border-line/70 px-6 py-3 text-[11px] font-medium text-faint md:grid">
              <span>{t("orders.customer")}</span>
              <span>{t("orders.items")}</span>
              <span>{t("common.date")}</span>
              <span className="text-end">{t("common.total")}</span>
              <span className="w-28">{t("common.status")}</span>
            </div>
            <ul className={loading ? "opacity-60 transition" : "transition"}>
              {data.items.map((order) => {
                const open = expanded === order._id;
                return (
                  <li key={order._id} className="border-b border-line/60 last:border-0">
                    <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-5 py-4 md:grid-cols-[1.4fr_1.6fr_1fr_0.9fr_auto] md:px-6">
                      <button type="button" onClick={() => setExpanded(open ? null : order._id)} aria-expanded={open} className="flex min-w-0 items-center gap-3 text-start">
                        <Avatar name={order.customerName} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{order.customerName}</span>
                          <span className="block truncate text-xs text-faint md:hidden">{relative(order.createdAt)}</span>
                          {order.customerEmail && <span className="hidden truncate text-xs text-faint md:block">{order.customerEmail}</span>}
                        </span>
                      </button>
                      <p className="hidden truncate text-sm text-muted md:block">
                        {order.items.slice(0, 2).map((item) => `${item.name} × ${item.quantity}`).join(", ")}
                        {order.items.length > 2 && <span className="text-faint"> {t("orders.more", { n: order.items.length - 2 })}</span>}
                      </p>
                      <p className="hidden text-xs text-muted md:block" title={date(order.createdAt)}>{relative(order.createdAt)}</p>
                      <p className="text-end text-sm font-semibold tabular-nums">{money(order.total, order.currency)}</p>
                      <div className="col-span-2 flex justify-start md:col-span-1 md:w-28">
                        <StatusSelect label={t("common.status")} value={order.status} onChange={(status) => changeStatus(order, status)} />
                      </div>
                    </div>
                    {open && (
                      <div className="animate-fade-up border-t border-line/50 bg-bg/30 px-5 py-5 md:px-6">
                        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-start text-[11px] text-faint">
                                <th className="pb-2 text-start font-medium">{t("orders.item")}</th>
                                <th className="pb-2 text-end font-medium">{t("orders.qty")}</th>
                                <th className="pb-2 text-end font-medium">{t("orders.price")}</th>
                                <th className="pb-2 text-end font-medium">{t("common.total")}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line/50">
                              {order.items.map((item, i) => (
                                <tr key={i}>
                                  <td className="py-2">{item.name}</td>
                                  <td className="py-2 text-end tabular-nums">{item.quantity}</td>
                                  <td className="py-2 text-end tabular-nums text-muted">{money(item.unitPrice, order.currency)}</td>
                                  <td className="py-2 text-end tabular-nums">{money(item.unitPrice * item.quantity, order.currency)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="space-y-3 text-xs text-muted">
                            {Boolean(order.tax) && (
                              <dl className="space-y-1 rounded-lg border border-line/60 bg-bg/40 p-3 tabular-nums">
                                <div className="flex justify-between"><dt>{t("tax.subtotal")}</dt><dd>{money(order.subtotal ?? order.total, order.currency)}</dd></div>
                                <div className="flex justify-between"><dt>{t("tax.vat", { rate: order.taxRate ?? 0 })}</dt><dd>{money(order.tax ?? 0, order.currency)}</dd></div>
                                <div className="flex justify-between font-semibold text-fg"><dt>{t("common.total")}</dt><dd>{money(order.total, order.currency)}</dd></div>
                              </dl>
                            )}
                            <p>{date(order.createdAt)}</p>
                            {order.notes && <p className="whitespace-pre-wrap rounded-lg border border-line/60 bg-bg/40 p-3 text-fg/80">{order.notes}</p>}
                            <div className="flex flex-wrap items-start gap-2">
                              <Link href={`/receipt/${order._id}`} target="_blank" className="os-quiet-button inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold">
                                <Icon.Printer size={14} />{t("receipt.print")}
                              </Link>
                              <DeleteButton onConfirm={() => remove(order)} confirmText={t("orders.deleteConfirm")} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <Pagination page={data.page} pages={data.pages} onChange={setPage} />
          </>
        )}
      </Panel>

      <NewOrderSheet open={creating} onClose={() => setCreating(false)} onCreated={reload} />
    </>
  );
}
