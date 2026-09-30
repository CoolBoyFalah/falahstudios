"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "../../../components/icons";
import { Button, cx, ErrorState, PageHeader, Panel, Skeleton } from "../../../components/ui";
import { api, json, tzOffset } from "../../../lib/api";
import { usePreferences } from "../../../lib/i18n";
import type { Insight, InsightData } from "../../../lib/types";

const toneStyle: Record<Insight["tone"], { ring: string; icon: React.ReactNode }> = {
  positive: { ring: "border-success/25 bg-success/10 text-success", icon: <Icon.TrendUp size={16} /> },
  neutral: { ring: "border-gold/25 bg-gold/10 text-gold-text", icon: <Icon.Spark size={16} /> },
  attention: { ring: "border-danger/25 bg-danger/10 text-danger", icon: <Icon.Alert size={16} /> },
};

/** Money-like params are formatted in the viewer's locale before interpolation. */
const MONEY_PARAMS = new Set(["current", "previous", "spent", "value"]);

export default function AiPage() {
  const { t, tx, money, number, date, relative, language } = usePreferences();
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api<InsightData>("/business/ai/insights", { method: "POST", body: json({ tzOffset: tzOffset() }) }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "generic");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void generate(); }, [generate]);

  const format = (insight: Insight) => {
    const params: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(insight.params)) {
      if (key === "at") params[key] = date(String(value), "datetime");
      else if (typeof value === "number") params[key] = MONEY_PARAMS.has(key) ? money(value) : number(value);
      else params[key] = value;
    }
    return {
      title: tx(`insight.${insight.key}.title`, insight.key, params),
      body: tx(`insight.${insight.key}.body`, "", params),
    };
  };

  const summary = data?.summary;

  return (
    <>
      <PageHeader
        kicker={t("ai.kicker")}
        title={t("ai.title")}
        subtitle={t("ai.subtitle")}
        actions={<Button variant="quiet" onClick={generate} loading={loading}><Icon.Refresh size={15} />{t("ai.refresh")}</Button>}
      />

      <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-[#352308] via-[#171006] to-[#0b0a08] p-6 text-[#f2ede6] shadow-[0_24px_80px_rgba(0,0,0,0.25)] sm:p-8">
        <div className="absolute -end-10 -top-10 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-black"><Icon.Spark /></div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">{t("ai.question")}</h2>
            <p className="mt-2 text-xs text-amber-100/50">
              {loading ? t("ai.reviewing") : data ? t("ai.generated", { time: relative(data.generatedAt) }) : " "}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            {[
              [t("ai.summaryRevenue"), summary ? money(summary.revenue) : null],
              [t("ai.summaryOrders"), summary ? number(summary.orders) : null],
              [t("ai.summaryCustomers"), summary ? number(summary.customers) : null],
              [t("ai.summaryBookings"), summary ? number(summary.bookings) : null],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] text-amber-100/50">{label}</dt>
                <dd className="os-metric mt-1 text-xl font-semibold">{value ?? <span className="inline-block h-6 w-14 animate-pulse rounded bg-white/10" />}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="mt-5" aria-live="polite" aria-busy={loading}>
        {error && !data ? (
          <ErrorState message={error} onRetry={generate} />
        ) : !data ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => <Panel key={i} className="p-6"><Skeleton className="h-9 w-9" /><Skeleton className="mt-4 h-4 w-48" /><Skeleton className="mt-3 h-3 w-full" /></Panel>)}
          </div>
        ) : (
          <div className={cx("grid gap-4 md:grid-cols-2", loading && "opacity-60 transition")}>
            {data.insights.map((insight) => {
              const text = format(insight);
              const style = toneStyle[insight.tone];
              return (
                <Panel key={`${insight.key}-${language}`} as="article" className={cx("animate-fade-up p-6", data.insights.length === 1 && "md:col-span-2")}>
                  <span className={cx("flex h-9 w-9 items-center justify-center rounded-xl border", style.ring)}>{style.icon}</span>
                  <h3 className="mt-4 text-base font-semibold tracking-tight">{text.title}</h3>
                  {text.body && <p className="mt-2 text-sm leading-6 text-muted">{text.body}</p>}
                </Panel>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
