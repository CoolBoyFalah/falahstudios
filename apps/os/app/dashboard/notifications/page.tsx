"use client";

import Link from "next/link";
import { NOTIFICATIONS_CHANGED } from "../../../components/Shell";
import { Icon } from "../../../components/icons";
import { Button, cx, EmptyState, ErrorState, ListSkeleton, PageHeader, Panel, useToast } from "../../../components/ui";
import { api } from "../../../lib/api";
import { usePreferences } from "../../../lib/i18n";
import type { Notice } from "../../../lib/types";
import { useResource } from "../../../lib/useResource";

const typeIcon = { order: Icon.Bag, booking: Icon.Calendar, system: Icon.Bell };
const typeHref = { order: "/dashboard/orders", booking: "/dashboard/bookings", system: null } as const;

export default function NotificationsPage() {
  const { t, tx, relative, date, number, language, errorText } = usePreferences();
  const toast = useToast();
  const { data, error, loading, reload, setData } = useResource<Notice[]>("/business/notifications");
  const unread = data?.filter((n) => !n.readAt).length ?? 0;

  /** The API stores English copy; re-create known messages in the viewer's language. */
  function message(notice: Notice) {
    if (language !== "ar") return notice.message;
    const order = notice.message.match(/^A new order from (.+) was received\.$/);
    if (order) return `تم استلام طلب جديد من ${order[1]}.`;
    const booking = notice.message.match(/^(.+) booked (.+)\.$/);
    if (booking) return `${booking[1]} قام بحجز ${booking[2]}.`;
    return notice.message;
  }

  async function markRead(notice: Notice) {
    if (notice.readAt) return;
    setData((current) => current?.map((n) => (n._id === notice._id ? { ...n, readAt: new Date().toISOString() } : n)) ?? null);
    try {
      await api(`/business/notifications/${notice._id}/read`, { method: "PATCH" });
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
    } catch {
      void reload();
    }
  }

  async function markAll() {
    try {
      await api("/business/notifications/read-all", { method: "POST" });
      const now = new Date().toISOString();
      setData((current) => current?.map((n) => ({ ...n, readAt: n.readAt || now })) ?? null);
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
    } catch (reason) {
      toast(errorText(reason instanceof Error ? reason.message : null), "error");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        kicker={t("notifications.kicker")}
        title={t("notifications.title")}
        subtitle={unread ? t("notifications.unread", { n: number(unread) }) : t("notifications.subtitle")}
        actions={unread > 0 && <Button variant="quiet" onClick={markAll}><Icon.Check size={15} />{t("notifications.markAll")}</Button>}
      />

      <Panel className="overflow-hidden">
        {error && !data ? (
          <div className="p-6"><ErrorState message={error} onRetry={reload} /></div>
        ) : loading && !data ? (
          <div className="px-6"><ListSkeleton rows={5} /></div>
        ) : !data?.length ? (
          <div className="p-6"><EmptyState icon={<Icon.Bell />} title={t("notifications.empty")} /></div>
        ) : (
          <ul className="divide-y divide-line/60">
            {data.map((notice) => {
              const TypeIcon = typeIcon[notice.type] ?? Icon.Bell;
              const href = typeHref[notice.type];
              const content = (
                <>
                  <span className={cx("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border", notice.readAt ? "border-line bg-fg/5 text-faint" : "border-gold/25 bg-gold/10 text-gold-text")}>
                    <TypeIcon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className={cx("text-sm", notice.readAt ? "text-muted" : "font-semibold")}>{tx(`notice.${notice.title}`, notice.title)}</span>
                      <span className="shrink-0 text-[11px] text-faint" title={date(notice.createdAt)}>{relative(notice.createdAt)}</span>
                    </span>
                    <span className={cx("mt-1 block text-sm", notice.readAt ? "text-faint" : "text-muted")}>{message(notice)}</span>
                  </span>
                  {!notice.readAt && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold shadow-[0_0_10px_rgba(245,185,66,0.9)]" aria-hidden />}
                </>
              );
              const className = "flex w-full items-start gap-4 px-5 py-4 text-start transition hover:bg-gold/[0.04] sm:px-6";
              return (
                <li key={notice._id}>
                  {href ? (
                    <Link href={href} onClick={() => markRead(notice)} className={className}>{content}</Link>
                  ) : (
                    <button type="button" onClick={() => markRead(notice)} className={className}>{content}</button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
