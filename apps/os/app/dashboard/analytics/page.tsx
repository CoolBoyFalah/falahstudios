"use client";

import { useState } from "react";
import { Icon } from "../../../components/icons";
import { Avatar, cx, EmptyState, ErrorState, PageHeader, Panel, PanelHeader, Segmented, Skeleton } from "../../../components/ui";
import { tzOffset } from "../../../lib/api";
import { usePreferences } from "../../../lib/i18n";
import { STATUSES, type AnalyticsData, type Status } from "../../../lib/types";
import { useResource } from "../../../lib/useResource";

type Range = "7" | "30" | "90";

function Delta({ current, previous }: { current: number; previous: number }) {
  const { t, number } = usePreferences();
  if (!previous && !current) return null;
  if (!previous) return <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-[11px] font-medium text-success">{t("analytics.new")}</span>;
  const change = Math.round(((current - previous) / previous) * 100);
  const up = change >= 0;
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums", up ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}>
      {up ? <Icon.TrendUp size={12} /> : <Icon.TrendDown size={12} />}
      {number(Math.abs(change))}%
    </span>
  );
}

function RevenueChart({ series }: { series: AnalyticsData["series"] }) {
  const { money, date, number, t, language } = usePreferences();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...series.map((d) => d.revenue), 1);
  // Round the scale up to a tidy number so gridlines land on readable values.
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const top = Math.ceil(max / magnitude) * magnitude;
  const ticks = [0, top / 2, top];
  const width = 100 / series.length;
  const labelEvery = series.length <= 7 ? 1 : series.length <= 30 ? 5 : 15;
  const active = hover !== null ? series[hover] : null;

  return (
    <div className="relative">
      <div className="flex gap-3">
        {/* Y axis */}
        <div className="flex h-56 flex-col justify-between pb-6 text-end text-[10px] tabular-nums text-faint">
          {[...ticks].reverse().map((tick) => <span key={tick} className="-translate-y-1/2 leading-none">{number(tick)}</span>)}
        </div>

        <div className="relative flex-1">
          <div className="relative h-56 pb-6" onMouseLeave={() => setHover(null)}>
            {/* Gridlines */}
            <div className="pointer-events-none absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between">
              {ticks.map((tick) => <div key={tick} className="border-t border-line/70" />)}
            </div>

            {/* Bars: the whole column is the hit target, the bar is the mark. */}
            <div className="absolute inset-x-0 bottom-6 top-0 flex items-end" dir="ltr">
              {series.map((d, i) => (
                <button
                  key={d.date}
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  aria-label={`${date(d.date + "T12:00:00", "date")}: ${money(d.revenue)}`}
                  className="group flex h-full items-end justify-center outline-none"
                  style={{ width: `${width}%`, paddingInline: series.length > 45 ? 1 : 2 }}
                >
                  <span
                    className={cx("block w-full max-w-[28px] rounded-t transition-colors", d.revenue ? "bg-chart" : "bg-line", hover !== null && hover !== i && "opacity-45")}
                    style={{ height: d.revenue ? `${Math.max((d.revenue / top) * 100, 1.5)}%` : "2px" }}
                  />
                </button>
              ))}
            </div>

            {/* X labels */}
            <div className="absolute inset-x-0 bottom-0 flex h-5 items-end text-[10px] text-faint" dir="ltr">
              {series.map((d, i) => (
                <span key={d.date} className="text-center" style={{ width: `${width}%` }}>
                  {(series.length - 1 - i) % labelEvery === 0 ? date(d.date + "T12:00:00", "short") : ""}
                </span>
              ))}
            </div>
          </div>

          {active && hover !== null && (
            <div
              className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl border border-gold/25 bg-surface/95 px-3 py-2 shadow-xl backdrop-blur"
              style={{ left: `${Math.min(Math.max((hover + 0.5) * width, 12), 88)}%` }}
              dir={language === "ar" ? "rtl" : "ltr"}
            >
              <p className="text-[10px] text-faint">{date(active.date + "T12:00:00", "date")}</p>
              <p className="text-sm font-semibold tabular-nums">{money(active.revenue)}</p>
              <p className="text-[10px] text-muted">{t("analytics.orders")}: {number(active.orders)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Table view for screen readers */}
      <table className="sr-only">
        <caption>{t("analytics.revenueChart")}</caption>
        <thead><tr><th>{t("common.date")}</th><th>{t("analytics.revenue")}</th><th>{t("analytics.orders")}</th></tr></thead>
        <tbody>
          {series.map((d) => <tr key={d.date}><td>{d.date}</td><td>{money(d.revenue)}</td><td>{d.orders}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

const statusBar: Record<Status, string> = {
  pending: "bg-gold",
  confirmed: "bg-info",
  completed: "bg-success",
  cancelled: "bg-faint",
};

function StatusBreakdown({ title, counts }: { title: string; counts: Partial<Record<Status, number>> }) {
  const { t, number } = usePreferences();
  const total = STATUSES.reduce((sum, s) => sum + (counts[s] || 0), 0);
  return (
    <Panel className="p-6">
      <PanelHeader title={title} action={<span className="text-xs tabular-nums text-faint">{number(total)}</span>} />
      {total ? (
        <ul className="mt-5 space-y-3.5">
          {STATUSES.map((status) => {
            const value = counts[status] || 0;
            return (
              <li key={status}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted">{t(`status.${status}`)}</span>
                  <span className="tabular-nums">{number(value)} <span className="text-faint">· {number(Math.round((value / total) * 100))}%</span></span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-fg/5">
                  <div className={cx("h-full rounded-full transition-all", statusBar[status])} style={{ width: `${(value / total) * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-line py-8 text-center text-xs text-faint">{t("analytics.noData")}</p>
      )}
    </Panel>
  );
}

export default function AnalyticsPage() {
  const { t, money, number } = usePreferences();
  const [range, setRange] = useState<Range>("30");
  const { data, error, loading, reload } = useResource<AnalyticsData>(`/business/analytics?days=${range}&tzOffset=${tzOffset()}`);
  const days = Number(range);
  const hasRevenue = data?.series.some((d) => d.revenue > 0);

  const kpis = data
    ? [
        { label: t("analytics.revenue"), value: money(data.totals.revenue), current: data.totals.revenue, previous: data.totals.previousRevenue },
        { label: t("analytics.orders"), value: number(data.totals.orders), current: data.totals.orders, previous: data.totals.previousOrders },
        { label: t("analytics.average"), value: money(Math.round(data.totals.averageOrder)) },
      ]
    : [];

  return (
    <>
      <PageHeader
        kicker={t("analytics.kicker")}
        title={t("analytics.title")}
        subtitle={t("analytics.subtitle")}
        actions={
          <Segmented label={t("analytics.title")} value={range} onChange={setRange} options={(["7", "30", "90"] as Range[]).map((v) => ({ value: v, label: t("analytics.days", { n: number(Number(v)) }) }))} />
        }
      />

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className={cx("space-y-5 transition", loading && data && "opacity-60")}>
          <section className="grid gap-4 sm:grid-cols-3">
            {!data
              ? Array.from({ length: 3 }, (_, i) => <Panel key={i} className="p-5"><Skeleton className="h-3 w-24" /><Skeleton className="mt-5 h-8 w-32" /></Panel>)
              : kpis.map((kpi) => (
                  <Panel key={kpi.label} className="p-5">
                    <p className="text-xs text-muted">{kpi.label}</p>
                    <p className="os-metric mt-4 text-3xl font-semibold">{kpi.value}</p>
                    <div className="mt-2 flex h-5 items-center gap-2 text-[11px] text-faint">
                      {kpi.previous !== undefined && (
                        <>
                          <Delta current={kpi.current!} previous={kpi.previous} />
                          <span>{t("analytics.vsPrevious", { n: number(days) })}</span>
                        </>
                      )}
                    </div>
                  </Panel>
                ))}
          </section>

          <Panel className="p-6">
            <PanelHeader title={t("analytics.revenueChart")} action={<span className="text-[11px] text-faint">{t("analytics.revenueChartHint")}</span>} />
            <div className="mt-6">
              {!data ? <Skeleton className="h-56" /> : hasRevenue ? <RevenueChart series={data.series} /> : <EmptyState icon={<Icon.Chart />} title={t("analytics.noData")} />}
            </div>
          </Panel>

          <section className="grid gap-5 lg:grid-cols-3">
            {data ? (
              <>
                <StatusBreakdown title={t("analytics.statusBreakdown")} counts={data.ordersByStatus} />
                <StatusBreakdown title={t("analytics.bookingBreakdown")} counts={data.bookingsByStatus} />
                <Panel className="p-6">
                  <PanelHeader title={t("analytics.topCustomers")} />
                  {data.topCustomers.length ? (
                    <ol className="mt-4 space-y-1">
                      {data.topCustomers.map((customer, index) => (
                        <li key={customer._id} className="flex items-center gap-3 rounded-lg py-2">
                          <span className="w-4 text-center text-[11px] tabular-nums text-faint">{number(index + 1)}</span>
                          <Avatar name={customer.name} className="h-8 w-8" />
                          <span className="min-w-0 flex-1 truncate text-sm">{customer.name}</span>
                          <span className="text-sm font-semibold tabular-nums">{money(customer.totalSpent)}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-5 rounded-xl border border-dashed border-line py-8 text-center text-xs text-faint">{t("analytics.noData")}</p>
                  )}
                </Panel>
              </>
            ) : (
              Array.from({ length: 3 }, (_, i) => <Panel key={i} className="p-6"><Skeleton className="h-40" /></Panel>)
            )}
          </section>
        </div>
      )}
    </>
  );
}
