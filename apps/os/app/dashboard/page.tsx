"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, formatCurrency, formatDate } from "../../lib/api";

interface DashboardData {
  metrics: { revenue: number; ordersToday: number; customers: number; bookingsToday: number };
  recentOrders: Array<{ _id: string; customerName: string; total: number; currency: string; status: string; createdAt: string }>;
  unreadNotifications: number;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [clientName, setClientName] = useState("Your business");

  useEffect(() => {
    const savedClient = localStorage.getItem("falah_os_client");
    if (savedClient) setClientName(JSON.parse(savedClient).name || "Your business");
    api<DashboardData>("/business/dashboard").then(setData).catch(() => undefined);
  }, []);

  const metrics = data?.metrics;
  const cards = [
    { label: "Revenue", value: formatCurrency(metrics?.revenue || 0), detail: "Completed orders", icon: "↗" },
    { label: "Orders", value: String(metrics?.ordersToday || 0), detail: "Today", icon: "◫" },
    { label: "Customers", value: String(metrics?.customers || 0), detail: "Total", icon: "◉" },
    { label: "Bookings", value: String(metrics?.bookingsToday || 0), detail: "Today", icon: "◷" },
  ];

  return (
    <main className="min-h-screen px-5 py-5 text-white sm:px-8 lg:px-10 lg:py-8">
      <header className="os-panel flex min-h-20 items-center justify-between rounded-2xl px-5 py-4 sm:px-6"><div><p className="os-kicker">Falah Studios · Workspace</p><h1 className="mt-1 text-lg font-semibold tracking-tight">Falah OS</h1></div><Link href="/dashboard/notifications" className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-right transition hover:bg-amber-500/10"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-xs font-bold text-black">{data?.unreadNotifications || 0}</span><span><span className="block text-xs font-medium text-zinc-200">{clientName}</span><span className="mt-0.5 block text-[9px] tracking-[0.18em] text-amber-300 uppercase">Notifications</span></span></Link></header>
      <section className="relative overflow-hidden py-14 sm:py-16"><div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" /><div className="relative"><p className="os-kicker">Live workspace</p><h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Good morning, <span className="bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600 bg-clip-text text-transparent">{clientName}</span></h2><p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">Everything important in your business, in one calm and clear place.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/dashboard/orders" className="os-amber-button rounded-xl px-5 py-3 text-xs font-semibold">Create order <span className="ml-2">→</span></Link><Link href="/dashboard/website" className="os-quiet-button rounded-xl px-5 py-3 text-xs font-semibold">Manage website</Link></div></div></section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <div key={card.label} className="os-panel group relative overflow-hidden rounded-2xl p-5 transition duration-300 hover:-translate-y-1"><div className="absolute -right-5 -top-5 text-7xl text-amber-400/5 transition group-hover:text-amber-400/10">{card.icon}</div><div className="relative flex items-start justify-between"><p className="text-xs text-zinc-500">{card.label}</p><span className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-xs text-amber-300">{card.icon}</span></div><p className="os-metric relative mt-7 text-3xl font-semibold">{data ? card.value : "—"}</p><p className="relative mt-2 text-xs text-zinc-600">{card.detail}</p></div>)}</section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.8fr]"><div className="os-panel rounded-2xl p-6"><div className="flex items-start justify-between"><div><p className="os-kicker">Recent</p><h3 className="mt-2 text-lg font-semibold">Latest activity</h3></div><Link href="/dashboard/orders" className="os-quiet-button rounded-lg px-3 py-2 text-[11px] font-semibold">View orders</Link></div><div className="mt-6 divide-y divide-amber-500/10">{data?.recentOrders.length ? data.recentOrders.map((order) => <div key={order._id} className="flex items-center justify-between py-4"><div className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(245,185,66,0.8)]" /><div><p className="text-sm font-medium text-zinc-200">{order.customerName}</p><p className="mt-1 text-xs text-zinc-600">{formatDate(order.createdAt)} · {order.status}</p></div></div><p className="text-sm font-medium text-amber-200">{formatCurrency(order.total, order.currency)}</p></div>) : <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-amber-500/15 bg-amber-500/[0.025] text-center"><span className="text-2xl text-amber-400">✦</span><p className="mt-3 text-sm text-zinc-400">No activity yet.</p><p className="mt-1 text-xs text-zinc-600">Your new orders will appear here.</p></div>}</div></div><div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-[#352308] via-[#171006] to-[#0b0a08] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]"><div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-amber-400/20 blur-3xl" /><div className="relative"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-lg font-black text-black">F</div><p className="os-kicker mt-6 text-amber-300">Falah AI</p><h3 className="mt-2 text-2xl font-semibold tracking-tight">Your business, understood.</h3><p className="mt-3 text-sm leading-6 text-amber-100/60">Get a private, instant summary based on the activity in your workspace.</p><Link href="/dashboard/ai" className="mt-7 inline-flex rounded-xl bg-amber-400 px-4 py-3 text-xs font-bold text-black transition hover:bg-amber-300">Ask Falah AI <span className="ml-2">→</span></Link></div></div></section>
    </main>
  );
}
