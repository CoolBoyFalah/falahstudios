"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "../../../components/icons";
import { Button } from "../../../components/ui";
import { usePreferences } from "../../../lib/i18n";
import { getToken } from "../../../lib/session";
import type { Order, WorkspaceSettings } from "../../../lib/types";
import { useResource } from "../../../lib/useResource";

/**
 * A paper receipt. Always rendered black-on-white regardless of the OS theme,
 * since it's meant to be printed or saved as PDF.
 */
export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const { t, money, date } = usePreferences();
  const { data, error } = useResource<{ order: Order; business: WorkspaceSettings }>(`/business/orders/${id}`);

  useEffect(() => {
    if (!getToken()) window.location.replace("/");
  }, []);

  useEffect(() => {
    if (data) document.title = `${t("receipt.title")} ${data.order._id.slice(-6).toUpperCase()} · ${data.business.name}`;
  }, [data, t]);

  const order = data?.order;
  const business = data?.business;
  const currency = order?.currency;
  const hasTax = Boolean(order?.tax);

  return (
    <main className="min-h-screen bg-[#e9e4da] px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto mb-5 flex max-w-xl items-center justify-between print:hidden">
        <Link href="/dashboard/orders" className="flex items-center gap-2 text-sm text-[#5d564b] hover:text-black">
          <Icon.Arrow size={15} className="rotate-180" />{t("receipt.back")}
        </Link>
        <Button onClick={() => window.print()} disabled={!data}><Icon.Printer size={16} />{t("receipt.print")}</Button>
      </div>

      <article className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-[#1c1a17] shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:p-10 print:max-w-none print:rounded-none print:shadow-none">
        {error ? (
          <p className="py-16 text-center text-sm text-[#6b645a]">{t("receipt.notFound")}</p>
        ) : !order || !business ? (
          <div className="space-y-4 py-4">{[40, 60, 100, 100, 70].map((w, i) => <div key={i} className="h-4 animate-pulse rounded bg-black/5" style={{ width: `${w}%` }} />)}</div>
        ) : (
          <>
            <header className="flex items-start justify-between gap-6 border-b border-black/10 pb-6">
              <div>
                <p className="text-xl font-semibold tracking-tight">{business.name}</p>
                {business.taxNumber && <p className="mt-1 text-xs text-[#6b645a]">{t("receipt.trn", { n: business.taxNumber })}</p>}
              </div>
              <div className="text-end">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b87a10]">{hasTax && business.taxNumber ? t("receipt.taxInvoice") : t("receipt.title")}</p>
                <p className="mt-1 font-mono text-sm">{t("receipt.number", { n: order._id.slice(-6).toUpperCase() })}</p>
                <p className="mt-0.5 text-xs text-[#6b645a]">{date(order.createdAt)}</p>
              </div>
            </header>

            <section className="py-5 text-sm">
              <p className="text-[11px] text-[#6b645a]">{t("receipt.billedTo")}</p>
              <p className="mt-1 font-medium">{order.customerName}</p>
              {order.customerEmail && <p className="text-xs text-[#6b645a]" dir="ltr">{order.customerEmail}</p>}
            </section>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-black/10 text-[11px] text-[#6b645a]">
                  <th className="py-2 text-start font-medium">{t("orders.item")}</th>
                  <th className="py-2 text-end font-medium">{t("orders.qty")}</th>
                  <th className="py-2 text-end font-medium">{t("orders.price")}</th>
                  <th className="py-2 text-end font-medium">{t("common.total")}</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className="border-b border-black/5">
                    <td className="py-2.5">{item.name}</td>
                    <td className="py-2.5 text-end tabular-nums">{item.quantity}</td>
                    <td className="py-2.5 text-end tabular-nums text-[#6b645a]">{money(item.unitPrice, currency)}</td>
                    <td className="py-2.5 text-end tabular-nums">{money(item.unitPrice * item.quantity, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <dl className="ms-auto mt-5 w-full max-w-60 space-y-1.5 text-sm tabular-nums">
              {hasTax && (
                <>
                  <div className="flex justify-between text-[#6b645a]"><dt>{t("tax.subtotal")}</dt><dd>{money(order.subtotal ?? order.total, currency)}</dd></div>
                  <div className="flex justify-between text-[#6b645a]"><dt>{t("tax.vat", { rate: order.taxRate ?? 0 })}</dt><dd>{money(order.tax ?? 0, currency)}</dd></div>
                </>
              )}
              <div className="flex justify-between border-t border-black/10 pt-2 text-base font-semibold"><dt>{t("common.total")}</dt><dd>{money(order.total, currency)}</dd></div>
            </dl>

            {order.notes && <p className="mt-8 whitespace-pre-wrap rounded-lg bg-black/[0.03] p-3 text-xs text-[#5d564b]">{order.notes}</p>}
            {business.receiptNote && <p className="mt-8 border-t border-dashed border-black/15 pt-5 text-center text-xs text-[#6b645a]">{business.receiptNote}</p>}
          </>
        )}
      </article>
    </main>
  );
}
