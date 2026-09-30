"use client";

import { useEffect, useState } from "react";
import { Icon } from "../../../components/icons";
import {
  Avatar, Button, DeleteButton, EmptyState, ErrorState, Field, Input, ListSkeleton, PageHeader, Pagination, Panel,
  SearchInput, Segmented, Sheet, Skeleton, StatusPill, Textarea, useDebounced, useToast,
} from "../../../components/ui";
import { api, json } from "../../../lib/api";
import { usePreferences } from "../../../lib/i18n";
import type { Customer, Order, Paginated } from "../../../lib/types";
import { useResource } from "../../../lib/useResource";

type Sort = "recent" | "spend" | "name";
type FormState = { name: string; email: string; phone: string; notes: string };
const blank: FormState = { name: "", email: "", phone: "", notes: "" };

function CustomerForm({ id, value, onChange, onSubmit }: { id: string; value: FormState; onChange: (value: FormState) => void; onSubmit: (event: React.FormEvent) => void }) {
  const { t } = usePreferences();
  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, [key]: e.target.value });
  return (
    <form id={id} onSubmit={onSubmit} className="space-y-5">
      <Field label={t("common.name")}>{(fid) => <Input id={fid} required maxLength={120} value={value.name} onChange={set("name")} />}</Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("common.email")} hint={t("common.optional")}>{(fid) => <Input id={fid} type="email" dir="ltr" value={value.email} onChange={set("email")} />}</Field>
        <Field label={t("common.phone")} hint={t("common.optional")}>{(fid) => <Input id={fid} type="tel" dir="ltr" maxLength={40} value={value.phone} onChange={set("phone")} />}</Field>
      </div>
      <Field label={t("common.notes")} hint={t("common.optional")}>{(fid) => <Textarea id={fid} rows={4} maxLength={2000} value={value.notes} onChange={set("notes")} />}</Field>
    </form>
  );
}

function CustomerSheet({ customerId, onClose, onChanged }: { customerId: string | null; onClose: () => void; onChanged: () => void }) {
  const { t, money, date, errorText } = usePreferences();
  const toast = useToast();
  const { data, loading } = useResource<{ customer: Customer; orders: Order[] }>(customerId ? `/business/customers/${customerId}` : null);
  const [form, setForm] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.customer) {
      const c = data.customer;
      setForm({ name: c.name, email: c.email || "", phone: c.phone || "", notes: c.notes || "" });
    }
  }, [data]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await api(`/business/customers/${customerId}`, { method: "PATCH", body: json(form) });
      toast(t("customers.updated"));
      onChanged();
    } catch (reason) {
      toast(errorText(reason instanceof Error ? reason.message : null), "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await api(`/business/customers/${customerId}`, { method: "DELETE" });
      toast(t("common.deleted"));
      onChanged();
      onClose();
    } catch (reason) {
      toast(errorText(reason instanceof Error ? reason.message : null), "error");
    }
  }

  const c = data?.customer;

  return (
    <Sheet
      open={Boolean(customerId)}
      onClose={onClose}
      kicker={t("customers.profile")}
      title={c?.name || "…"}
      footer={
        <div className="flex items-center justify-between gap-3">
          <DeleteButton onConfirm={remove} confirmText={t("customers.deleteConfirm")} />
          <Button type="submit" form="edit-customer" loading={saving} disabled={!c}>{saving ? t("common.saving") : t("common.save")}</Button>
        </div>
      }
    >
      {loading && !c ? (
        <div className="space-y-4"><Skeleton className="h-20" /><Skeleton className="h-11" /><Skeleton className="h-11" /></div>
      ) : c ? (
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-2">
            {[
              [t("customers.spent"), money(c.totalSpent)],
              [t("nav.orders"), String(c.orderCount)],
              [t("customers.since"), date(c.createdAt, "short")],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-line/70 bg-bg/40 p-3">
                <p className="text-[10px] text-faint">{label}</p>
                <p className="mt-1 truncate text-sm font-semibold tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          <CustomerForm id="edit-customer" value={form} onChange={setForm} onSubmit={save} />

          <div>
            <p className="os-kicker mb-3">{t("customers.history")}</p>
            {data.orders.length ? (
              <ul className="divide-y divide-line/60 rounded-xl border border-line/70">
                {data.orders.map((order) => (
                  <li key={order._id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{order.items.map((i) => i.name).join(", ")}</p>
                      <p className="mt-0.5 text-xs text-faint">{date(order.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-semibold tabular-nums">{money(order.total, order.currency)}</span>
                      <StatusPill status={order.status} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-line py-6 text-center text-xs text-faint">{t("customers.noHistory")}</p>
            )}
          </div>
        </div>
      ) : null}
    </Sheet>
  );
}

function NewCustomerSheet({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { t, errorText } = usePreferences();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { setForm(blank); setError(""); }
  }, [open]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api("/business/customers", { method: "POST", body: json(form) });
      toast(t("customers.created"));
      onCreated();
      onClose();
    } catch (reason) {
      setError(errorText(reason instanceof Error ? reason.message : null));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} kicker={t("customers.kicker")} title={t("customers.new")} footer={<div className="flex justify-end"><Button type="submit" form="new-customer" loading={saving}>{t("customers.new")}</Button></div>}>
      <CustomerForm id="new-customer" value={form} onChange={setForm} onSubmit={submit} />
      {error && <p role="alert" className="mt-5 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-xs text-danger">{error}</p>}
    </Sheet>
  );
}

export default function CustomersPage() {
  const { t, money, relative } = usePreferences();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const q = useDebounced(query);

  useEffect(() => setPage(1), [q, sort]);

  const { data, error, loading, reload } = useResource<Paginated<Customer>>(
    `/business/customers?page=${page}&limit=24&sort=${sort}&q=${encodeURIComponent(q)}`
  );

  return (
    <>
      <PageHeader
        kicker={t("customers.kicker")}
        title={t("customers.title")}
        subtitle={t("customers.subtitle")}
        actions={<Button onClick={() => setCreating(true)}><Icon.Plus size={16} />{t("customers.new")}</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          label={t("customers.sort")}
          value={sort}
          onChange={setSort}
          options={[
            { value: "recent", label: t("customers.sortRecent") },
            { value: "spend", label: t("customers.sortSpend") },
            { value: "name", label: t("customers.sortName") },
          ]}
        />
        <SearchInput value={query} onChange={setQuery} placeholder={t("customers.search")} />
      </div>

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Panel className="px-6"><ListSkeleton rows={6} /></Panel>
      ) : !data?.items.length ? (
        <Panel className="p-6">
          {q ? (
            <EmptyState icon={<Icon.Search />} title={t("customers.noMatch")} />
          ) : (
            <EmptyState icon={<Icon.Users />} title={t("customers.empty")} hint={t("customers.emptyHint")} action={<Button onClick={() => setCreating(true)}><Icon.Plus size={16} />{t("customers.new")}</Button>} />
          )}
        </Panel>
      ) : (
        <>
          <div className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
            {data.items.map((customer) => (
              <button
                key={customer._id}
                type="button"
                onClick={() => setSelected(customer._id)}
                className="os-panel os-panel-hover group flex flex-col rounded-2xl p-5 text-start hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={customer.name} className="h-10 w-10" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{customer.name}</p>
                    <p className="mt-0.5 truncate text-xs text-faint" dir="auto">{customer.email || customer.phone || t("customers.noContact")}</p>
                  </div>
                  <Icon.Chevron size={16} className="text-faint transition group-hover:text-gold-text" />
                </div>
                <div className="mt-5 flex items-end justify-between border-t border-line/60 pt-4">
                  <div>
                    <p className="text-[10px] text-faint">{t("customers.spent")}</p>
                    <p className="mt-0.5 text-base font-semibold tabular-nums">{money(customer.totalSpent)}</p>
                  </div>
                  <div className="text-end text-xs text-muted">
                    <p>{customer.orderCount === 1 ? t("customers.ordersOne") : t("customers.orders", { n: customer.orderCount })}</p>
                    {customer.lastOrderAt && <p className="mt-0.5 text-faint">{relative(customer.lastOrderAt)}</p>}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {data.pages > 1 && <Panel className="mt-4 overflow-hidden"><Pagination page={data.page} pages={data.pages} onChange={setPage} /></Panel>}
        </>
      )}

      <NewCustomerSheet open={creating} onClose={() => setCreating(false)} onCreated={reload} />
      <CustomerSheet customerId={selected} onClose={() => setSelected(null)} onChanged={reload} />
    </>
  );
}
