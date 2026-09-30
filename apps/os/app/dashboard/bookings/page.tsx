"use client";

import { useEffect, useMemo, useState } from "react";
import { NOTIFICATIONS_CHANGED } from "../../../components/Shell";
import { Icon } from "../../../components/icons";
import {
  Button, DeleteButton, EmptyState, ErrorState, Field, Input, ListSkeleton, PageHeader, Panel, Segmented, Sheet,
  StatusSelect, Textarea, cx, useToast,
} from "../../../components/ui";
import { api, json } from "../../../lib/api";
import { usePreferences } from "../../../lib/i18n";
import type { Booking, CatalogItem, Status } from "../../../lib/types";
import { useResource } from "../../../lib/useResource";

type Scope = "upcoming" | "past";

/** Value for a datetime-local input, in the viewer's local time. */
function localInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function nextHalfHour() {
  const date = new Date();
  date.setMinutes(date.getMinutes() < 30 ? 30 : 60, 0, 0);
  return date;
}

function NewBookingSheet({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { t, errorText } = usePreferences();
  const toast = useToast();
  const [form, setForm] = useState({ customerName: "", customerEmail: "", service: "", scheduledFor: "", durationMinutes: "60", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({ customerName: "", customerEmail: "", service: "", scheduledFor: localInputValue(nextHalfHour()), durationMinutes: "60", notes: "" });
      setError("");
    }
  }, [open]);

  const { data: services } = useResource<CatalogItem[]>(open ? "/business/catalog?type=service&available=true" : null);

  /** Picking a catalog service fills its name and default duration. */
  function onServiceChange(service: string) {
    const match = services?.find((s) => s.name.toLowerCase() === service.trim().toLowerCase());
    setForm((f) => ({ ...f, service, durationMinutes: match?.durationMinutes ? String(match.durationMinutes) : f.durationMinutes }));
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const inPast = form.scheduledFor && new Date(form.scheduledFor).getTime() < Date.now() - 60_000;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api("/business/bookings", {
        method: "POST",
        body: json({ ...form, scheduledFor: new Date(form.scheduledFor).toISOString(), durationMinutes: Number(form.durationMinutes) || 60 }),
      });
      toast(t("bookings.created"));
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
    <Sheet open={open} onClose={onClose} kicker={t("bookings.kicker")} title={t("bookings.new")} footer={<div className="flex justify-end"><Button type="submit" form="new-booking" loading={saving}>{t("bookings.create")}</Button></div>}>
      <form id="new-booking" onSubmit={submit} className="space-y-5">
        <Field label={t("orders.customerName")}>{(id) => <Input id={id} required maxLength={120} value={form.customerName} onChange={set("customerName")} />}</Field>
        <Field label={t("orders.customerEmail")} hint={t("common.optional")}>{(id) => <Input id={id} type="email" dir="ltr" value={form.customerEmail} onChange={set("customerEmail")} />}</Field>
        <Field label={t("bookings.service")}>
          {(id) => (
            <>
              <Input id={id} required maxLength={160} list="booking-services" placeholder={services?.length ? t("catalog.pickService") : undefined} value={form.service} onChange={(e) => onServiceChange(e.target.value)} />
              <datalist id="booking-services">{services?.map((s) => <option key={s._id} value={s.name} />)}</datalist>
            </>
          )}
        </Field>
        <div className="grid gap-5 sm:grid-cols-[1.6fr_1fr]">
          <Field label={t("bookings.when")} error={inPast ? t("bookings.pastDate") : undefined}>{(id) => <Input id={id} type="datetime-local" required value={form.scheduledFor} onChange={set("scheduledFor")} />}</Field>
          <Field label={t("bookings.duration")}>{(id) => <Input id={id} type="number" min={5} max={1440} step={5} value={form.durationMinutes} onChange={set("durationMinutes")} />}</Field>
        </div>
        <Field label={t("common.notes")} hint={t("common.optional")}>{(id) => <Textarea id={id} rows={3} maxLength={1000} value={form.notes} onChange={set("notes")} />}</Field>
        {error && <p role="alert" className="rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-xs text-danger">{error}</p>}
      </form>
    </Sheet>
  );
}

export default function BookingsPage() {
  const { t, date, errorText } = usePreferences();
  const toast = useToast();
  const [scope, setScope] = useState<Scope>("upcoming");
  const [creating, setCreating] = useState(false);
  const { data, error, loading, reload, setData } = useResource<Booking[]>(`/business/bookings?scope=${scope}`);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new")) setCreating(true);
  }, []);

  // Group by the viewer's local calendar day.
  const groups = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const booking of data ?? []) {
      const key = new Date(booking.scheduledFor).toDateString();
      map.set(key, [...(map.get(key) ?? []), booking]);
    }
    return Array.from(map.entries());
  }, [data]);

  const todayKey = new Date().toDateString();
  const tomorrowKey = new Date(Date.now() + 86_400_000).toDateString();
  const heading = (key: string, sample: string) =>
    key === todayKey ? t("common.today") : key === tomorrowKey ? t("common.tomorrow") : date(sample, "weekday");

  async function changeStatus(booking: Booking, status: Status) {
    setData((current) => current?.map((b) => (b._id === booking._id ? { ...b, status } : b)) ?? null);
    try {
      await api(`/business/bookings/${booking._id}`, { method: "PATCH", body: json({ status }) });
      toast(t("bookings.updated"));
    } catch (reason) {
      setData((current) => current?.map((b) => (b._id === booking._id ? booking : b)) ?? null);
      toast(errorText(reason instanceof Error ? reason.message : null), "error");
    }
  }

  async function remove(booking: Booking) {
    try {
      await api(`/business/bookings/${booking._id}`, { method: "DELETE" });
      setData((current) => current?.filter((b) => b._id !== booking._id) ?? null);
      toast(t("common.deleted"));
    } catch (reason) {
      toast(errorText(reason instanceof Error ? reason.message : null), "error");
    }
  }

  return (
    <>
      <PageHeader
        kicker={t("bookings.kicker")}
        title={t("bookings.title")}
        subtitle={t("bookings.subtitle")}
        actions={<Button onClick={() => setCreating(true)}><Icon.Plus size={16} />{t("bookings.new")}</Button>}
      />

      <div className="mb-5">
        <Segmented label={t("bookings.title")} value={scope} onChange={setScope} options={[{ value: "upcoming", label: t("bookings.upcoming") }, { value: "past", label: t("bookings.past") }]} />
      </div>

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <Panel className="px-6"><ListSkeleton rows={4} /></Panel>
      ) : !groups.length ? (
        <Panel className="p-6">
          <EmptyState
            icon={<Icon.Calendar />}
            title={scope === "upcoming" ? t("bookings.emptyUpcoming") : t("bookings.emptyPast")}
            hint={scope === "upcoming" ? t("bookings.emptyHint") : undefined}
            action={scope === "upcoming" ? <Button onClick={() => setCreating(true)}><Icon.Plus size={16} />{t("bookings.new")}</Button> : undefined}
          />
        </Panel>
      ) : (
        <div className={cx("space-y-6", loading && "opacity-60")}>
          {groups.map(([key, bookings]) => (
            <section key={key}>
              <h2 className={cx("mb-3 flex items-center gap-2 text-xs font-semibold", key === todayKey ? "text-gold-text" : "text-muted")}>
                {key === todayKey && <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(245,185,66,0.9)]" />}
                {heading(key, bookings[0].scheduledFor)}
                <span className="font-normal text-faint">· {bookings.length}</span>
              </h2>
              <Panel className="divide-y divide-line/60 overflow-hidden">
                {bookings.map((booking) => (
                  <div key={booking._id} className="group grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 px-5 py-4 sm:grid-cols-[auto_1fr_auto_auto]">
                    <div className="w-16 text-center">
                      <p className="text-sm font-semibold tabular-nums">{date(booking.scheduledFor, "time")}</p>
                      <p className="text-[10px] text-faint">{t("common.minutes", { n: booking.durationMinutes || 60 })}</p>
                    </div>
                    <div className="min-w-0 border-s border-gold/20 ps-4">
                      <p className={cx("truncate text-sm font-medium", booking.status === "cancelled" && "text-faint line-through")}>{booking.service}</p>
                      <p className="mt-0.5 truncate text-xs text-muted">{booking.customerName}{booking.notes ? ` · ${booking.notes}` : ""}</p>
                    </div>
                    <div className="col-start-2 sm:col-start-auto">
                      <StatusSelect label={t("common.status")} value={booking.status} onChange={(status) => changeStatus(booking, status)} />
                    </div>
                    <div className="col-start-2 sm:col-start-auto sm:opacity-0 sm:transition sm:focus-within:opacity-100 sm:group-hover:opacity-100">
                      <DeleteButton onConfirm={() => remove(booking)} />
                    </div>
                  </div>
                ))}
              </Panel>
            </section>
          ))}
        </div>
      )}

      <NewBookingSheet open={creating} onClose={() => setCreating(false)} onCreated={() => { setScope("upcoming"); void reload(); }} />
    </>
  );
}
