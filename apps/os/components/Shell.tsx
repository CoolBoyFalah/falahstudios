"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { usePreferences, type MessageKey } from "../lib/i18n";
import { getClient, getToken, signOut, type SessionClient } from "../lib/session";
import { Icon } from "./icons";
import { cx } from "./ui";

const navigation: Array<{ key: MessageKey; href: string; icon: keyof typeof Icon }> = [
  { key: "nav.overview", href: "/dashboard", icon: "Overview" },
  { key: "nav.website", href: "/dashboard/website", icon: "Globe" },
  { key: "nav.catalog", href: "/dashboard/catalog", icon: "Tag" },
  { key: "nav.orders", href: "/dashboard/orders", icon: "Bag" },
  { key: "nav.customers", href: "/dashboard/customers", icon: "Users" },
  { key: "nav.bookings", href: "/dashboard/bookings", icon: "Calendar" },
  { key: "nav.analytics", href: "/dashboard/analytics", icon: "Chart" },
  { key: "nav.ai", href: "/dashboard/ai", icon: "Spark" },
  { key: "nav.notifications", href: "/dashboard/notifications", icon: "Bell" },
];

/** Pages fire this after reading notifications so the badge updates immediately. */
export const NOTIFICATIONS_CHANGED = "falah:notifications";

export function Preferences({ compact }: { compact?: boolean }) {
  const { t, language, setLanguage, theme, setTheme } = usePreferences();
  return (
    <div className="flex items-center gap-1 rounded-xl border border-gold/20 bg-bg/40 p-1 text-[11px] font-medium">
      <button type="button" onClick={() => setLanguage(language === "en" ? "ar" : "en")} className="rounded-lg px-2.5 py-1.5 text-gold-text transition hover:bg-gold/10" aria-label={t("pref.language")}>
        {t("pref.otherLanguage")}
      </button>
      <span className="h-4 w-px bg-gold/20" />
      {(["dark", "light"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setTheme(option)}
          aria-pressed={theme === option}
          className={cx("rounded-lg px-2.5 py-1.5 transition", theme === option ? "bg-gold text-[#080808]" : "text-muted hover:text-gold-text", compact && "px-2")}
        >
          {t(option === "dark" ? "pref.dark" : "pref.light")}
        </button>
      ))}
    </div>
  );
}

function Brand() {
  const { t } = usePreferences();
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 text-sm font-black text-[#160e03] shadow-[0_0_24px_rgba(232,160,32,0.35)]">F</span>
      <span>
        <span className="os-kicker block">{t("brand.studio")}</span>
        <span className="mt-0.5 block text-base font-semibold tracking-tight">{t("brand.os")}</span>
      </span>
    </Link>
  );
}

function NavLinks({ pathname, unread, onNavigate }: { pathname: string; unread: number; onNavigate?: () => void }) {
  const { t, number } = usePreferences();
  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  const link = (item: (typeof navigation)[number] | { key: MessageKey; href: string; icon: keyof typeof Icon }) => {
    const active = isActive(item.href);
    const ItemIcon = Icon[item.icon];
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cx(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
          active ? "bg-gold/[0.12] text-fg" : "text-muted hover:bg-gold/[0.07] hover:text-fg"
        )}
      >
        {active && <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-gold shadow-[0_0_10px_rgba(245,185,66,0.9)]" />}
        <ItemIcon size={17} className={active ? "text-gold-text" : "text-faint transition group-hover:text-gold-text"} />
        <span>{t(item.key)}</span>
        {item.href === "/dashboard/notifications" && unread > 0 && (
          <span className="ms-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-bold text-[#140d03]">{number(unread > 99 ? 99 : unread)}</span>
        )}
      </Link>
    );
  };

  return (
    <nav className="flex flex-1 flex-col">
      <p className="os-kicker px-3 pb-3 opacity-70">{t("nav.workspace")}</p>
      <div className="space-y-0.5">{navigation.map(link)}</div>
      <div className="mt-auto pt-6">{link({ key: "nav.settings", href: "/dashboard/settings", icon: "Settings" })}</div>
    </nav>
  );
}

function Account({ client }: { client: SessionClient | null }) {
  const { t } = usePreferences();
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-line/80 bg-bg/30 p-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-xs font-bold text-gold-text">{(client?.name || "·").slice(0, 1).toUpperCase()}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium">{client?.name || "—"}</span>
        <span className="block truncate text-[10px] text-faint">{client?.clientCode}</span>
      </span>
      <button type="button" onClick={signOut} aria-label={t("auth.signOut")} title={t("auth.signOut")} className="rounded-lg p-1.5 text-faint transition hover:bg-fg/5 hover:text-fg">
        <Icon.Logout size={16} />
      </button>
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t, setCurrency } = usePreferences();
  const [ready, setReady] = useState(false);
  const [client, setClient] = useState<SessionClient | null>(null);
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const refresh = useCallback(() => {
    api<{ client: SessionClient; unreadNotifications: number }>("/business/me")
      .then((me) => {
        setUnread(me.unreadNotifications);
        if (me.client.currency) setCurrency(me.client.currency);
      })
      .catch(() => undefined);
  }, [setCurrency]);

  // Auth guard: no token means straight back to sign-in.
  useEffect(() => {
    if (!getToken()) {
      window.location.replace("/");
      return;
    }
    const saved = getClient();
    setClient(saved);
    if (saved?.currency) setCurrency(saved.currency);
    setReady(true);
    const syncClient = () => setClient(getClient());
    window.addEventListener("falah:client", syncClient);
    window.addEventListener(NOTIFICATIONS_CHANGED, refresh);
    return () => {
      window.removeEventListener("falah:client", syncClient);
      window.removeEventListener(NOTIFICATIONS_CHANGED, refresh);
    };
  }, [refresh, setCurrency]);

  useEffect(() => {
    if (!ready) return;
    refresh();
    setMenuOpen(false);
  }, [pathname, ready, refresh]);

  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(refresh, 60_000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, [ready, refresh]);

  if (!ready) {
    return <div className="os-shell min-h-screen" />;
  }

  return (
    <div className="os-shell min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-72 flex-col border-e border-gold/15 bg-surface/80 px-4 py-5 backdrop-blur-xl lg:flex">
        <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/15 via-transparent to-transparent px-4 py-4">
          <Brand />
        </div>
        <div className="mt-7 flex flex-1 flex-col overflow-y-auto">
          <NavLinks pathname={pathname} unread={unread} />
        </div>
        <div className="border-t border-gold/15 pt-4">
          <Preferences />
          <Account client={client} />
          <p className="os-kicker mt-4 px-1 !text-[9px] !text-faint">{t("brand.version")}</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gold/15 bg-bg/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Brand />
        <div className="flex items-center gap-1">
          <Link href="/dashboard/notifications" aria-label={t("nav.notifications")} className="relative rounded-lg p-2 text-muted hover:text-fg">
            <Icon.Bell />
            {unread > 0 && <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-gold shadow-[0_0_8px_rgba(245,185,66,0.9)]" />}
          </Link>
          <button type="button" onClick={() => setMenuOpen(true)} aria-label={t("nav.menu")} aria-expanded={menuOpen} className="rounded-lg p-2 text-muted hover:text-fg">
            <Icon.Menu />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button type="button" aria-label={t("nav.close")} onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div style={{ ["--slide-from" as string]: document.documentElement.dir === "rtl" ? "100%" : "-100%" }} className="absolute inset-y-0 start-0 flex w-[82%] max-w-xs animate-slide-in flex-col border-e border-gold/20 bg-surface px-4 py-5">
            <div className="mb-6 flex items-center justify-between">
              <Brand />
              <button type="button" onClick={() => setMenuOpen(false)} aria-label={t("nav.close")} className="rounded-lg p-2 text-muted hover:text-fg"><Icon.Close /></button>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
              <NavLinks pathname={pathname} unread={unread} onNavigate={() => setMenuOpen(false)} />
            </div>
            <div className="border-t border-gold/15 pt-4">
              <Preferences compact />
              <Account client={client} />
            </div>
          </div>
        </div>
      )}

      <div className="lg:ps-72">
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
