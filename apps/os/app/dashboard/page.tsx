"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "../../components/icons";
import { Avatar, cx, ErrorState, ListSkeleton, Panel, PanelHeader, Skeleton, StatusPill } from "../../components/ui";
import { tzOffset } from "../../lib/api";
import { usePreferences, type MessageKey } from "../../lib/i18n";
import { getClient } from "../../lib/session";
import type { DashboardData } from "../../lib/types";
import { useResource } from "../../lib/useResource";

function greetingKey(): MessageKey {
  const hour = new Date().getHours();
  return hour < 12 ? "overview.morning" : hour < 18 ? "overview.afternoon" : "overview.evening";
}

function Metric({ label, value, detail, icon, loading, accent }: { label: string; value: string; detail?: string; icon: React.ReactNode; loading: boolean; accent?: boolean }) {
  return (
    <Panel as="div" className="os-panel-hover group relative overflow-hidden p-5 hover:-translate-y-0.5">
      <div className="absolute -end-6 -top-6 h-24 w-24 rounded-full bg-gold/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
      <div className="relative flex items-start justify-between">
        <p className="text-xs text-muted">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold/20 bg-gold/10 text-gold-text">{icon}</span>
      </div>
      {loading ? (
        <Skeleton className="mt-6 h-8 w-28" />
      ) : (
        <p className={cx("os-metric relative mt-6 text-3xl font-semibold", accent && "os-gold-text")}>{value}</p>
      )}
      <p className="relative mt-2 h-4 text-xs text-faint">{loading ? "" : detail}</p>
    </Panel>
  );
}

export default function Overview() {
  const { t, money, number, date, relative } = usePreferences();
  const [clientName, setClientName] = useState("");
  const { data, error, loading, reload } = useResource<DashboardData>(`/business/dashboard?tzOffset=${tzOffset()}`);

  useEffect(() => {
    const sync = () => setClientName(getClient()?.name || "");
    sync();
    window.addEventListener("falah:client", sync);
    return () => window.removeEventListener("falah:client", sync);
  }, []);

  const m = data?.metrics;
  const isLoading = loading && !data;

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-2 sm:pb-12">
        <div className="pointer-events-none absolute -end-20 -top-10 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
        <div className="relative animate-fade-up">
          <p className="os-kicker">{t("overview.kicker")} · {date(new Date(), "weekday")}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            {t(greetingKey())} <span className="os-gold-text">{clientName}</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted">{t("overview.subtitle")}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/dashboard/orders?new=1" className="os-amber-button inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[13px] font-semibold">
              <Icon.Plus size={16} />{t("overview.newOrder")}
            </Link>
            <Link href="/dashboard/bookings?new=1" className="os-quiet-button inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[13px] font-semibold">
              <Icon.Calendar size={16} />{t("overview.newBooking")}
            </Link>
            <Link href="/dashboard/website" className="inline-flex h-11 items-center gap-2 rounded-xl px-4 text-[13px] font-medium text-muted transition hover:text-fg">
              {t("overview.manageWebsite")}<Icon.Arrow size={15} />
            </Link>
          </div>
        </div>
      </section>

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          {m && m.pendingOrders > 0 && (
            <Link href="/dashboard/orders?status=pending" className="mb-5 flex animate-fade-up items-center gap-3 rounded-2xl border border-gold/30 bg-gold/[0.08] px-5 py-4 text-sm transition hover:bg-gold/[0.12]">
              <span className="h-2 w-2 shrink-0 rounded-full bg-gold shadow-[0_0_12px_rgba(245,185,66,0.9)]" />
              <span className="flex-1">{m.pendingOrders === 1 ? t("overview.pendingBannerOne") : t("overview.pendingBanner", { n: number(m.pendingOrders) })}</span>
              <span className="flex items-center gap-1 text-xs font-semibold text-gold-text">{t("overview.review")}<Icon.Arrow size={14} /></span>
            </Link>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric loading={isLoading} accent label={t("overview.revenue30")} value={money(m?.revenue30d || 0)} detail={t("overview.revenueAll", { value: money(m?.revenue || 0) })} icon={<Icon.TrendUp size={16} />} />
            <Metric loading={isLoading} label={t("overview.ordersToday")} value={number(m?.ordersToday || 0)} detail={t("overview.vsYesterday", { n: number(m?.ordersYesterday || 0) })} icon={<Icon.Bag size={16} />} />
            <Metric loading={isLoading} label={t("overview.customers")} value={number(m?.customers || 0)} detail={t("overview.newCustomers", { n: number(m?.newCustomers30d || 0) })} icon={<Icon.Users size={16} />} />
            <Metric loading={isLoading} label={t("overview.bookingsToday")} value={number(m?.bookingsToday || 0)} detail={t("overview.upcomingLabel")} icon={<Icon.Calendar size={16} />} />
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <Panel className="p-6">
              <PanelHeader
                kicker={t("overview.recent")}
                title={t("overview.latestOrders")}
                action={<Link href="/dashboard/orders" className="os-quiet-button rounded-lg px-3 py-2 text-[11px] font-semibold">{t("common.viewAll")}</Link>}
              />
              <div className="mt-5">
                {isLoading ? (
                  <ListSkeleton />
                ) : data?.recentOrders.length ? (
                  <ul className="divide-y divide-gold/10">
                    {data.recentOrders.map((order) => (
                      <li key={order._id} className="flex items-center justify-between gap-4 py-3.5">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar name={order.customerName} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{order.customerName}</p>
                            <p className="mt-0.5 truncate text-xs text-faint">{relative(order.createdAt)} · {order.items.map((i) => i.name).join(", ")}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="hidden sm:inline"><StatusPill status={order.status} /></span>
                          <p className="text-sm font-semibold tabular-nums">{money(order.total, order.currency)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-gold/15 bg-gold/[0.025] text-center">
                    <Icon.Spark className="text-gold-text" />
                    <p className="mt-3 text-sm">{t("overview.noOrders")}</p>
                    <p className="mt-1 text-xs text-faint">{t("overview.noOrdersHint")}</p>
                  </div>
                )}
              </div>
            </Panel>

            <div className="grid gap-5">
              <Panel className="p-6">
                <PanelHeader
                  kicker={t("overview.upcoming")}
                  title={t("overview.nextBookings")}
                  action={<Link href="/dashboard/bookings" className="os-quiet-button rounded-lg px-3 py-2 text-[11px] font-semibold">{t("common.viewAll")}</Link>}
                />
                <div className="mt-4">
                  {isLoading ? (
                    <ListSkeleton rows={2} />
                  ) : data?.upcomingBookings.length ? (
                    <ul className="space-y-2">
                      {data.upcomingBookings.map((booking) => (
                        <li key={booking._id} className="flex items-center gap-3 rounded-xl border border-line/70 bg-bg/30 p-3">
                          <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-gold/10 py-1.5 text-gold-text">
                            <span className="text-[10px] font-medium uppercase">{date(booking.scheduledFor, "month")}</span>
                            <span className="text-lg font-semibold leading-none">{date(booking.scheduledFor, "day")}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{booking.service}</p>
                            <p className="mt-0.5 truncate text-xs text-faint">{booking.customerName} · {date(booking.scheduledFor, "time")}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-xl border border-dashed border-line py-8 text-center text-xs text-faint">{t("overview.noBookings")}</p>
                  )}
                </div>
              </Panel>

              <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-[#352308] via-[#171006] to-[#0b0a08] p-6 text-[#f2ede6] shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
                <div className="absolute -end-8 -top-8 h-36 w-36 rounded-full bg-amber-400/20 blur-3xl" />
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-black"><Icon.Spark size={18} /></div>
                  <p className="os-kicker mt-5 !text-amber-300">{t("nav.ai")}</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight">{t("overview.aiTitle")}</h3>
                  <p className="mt-2 text-sm leading-6 text-amber-100/60">{t("overview.aiBody")}</p>
                  <Link href="/dashboard/ai" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-black transition hover:bg-amber-300">
                    {t("overview.aiCta")}<Icon.Arrow size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
