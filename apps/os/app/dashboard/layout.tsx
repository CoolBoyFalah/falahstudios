import Link from "next/link";
import OsPreferences from "../../components/OsPreferences";

const navigation = [
  { name: "Overview", href: "/dashboard", mark: "01" },
  { name: "Website", href: "/dashboard/website", mark: "02" },
  { name: "Orders", href: "/dashboard/orders", mark: "03" },
  { name: "Customers", href: "/dashboard/customers", mark: "04" },
  { name: "Bookings", href: "/dashboard/bookings", mark: "05" },
  { name: "Analytics", href: "/dashboard/analytics", mark: "06" },
  { name: "Falah AI", href: "/dashboard/ai", mark: "07" },
  { name: "Notifications", href: "/dashboard/notifications", mark: "08" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="os-shell min-h-screen bg-black text-white">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-amber-500/15 bg-[#090909]/95 px-4 py-5 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/15 via-transparent to-transparent px-5 py-5">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 text-sm font-black text-[#160e03] shadow-[0_0_24px_rgba(232,160,32,0.35)]">F</div><div><p className="os-kicker">Falah Studios</p><p className="mt-1 text-base font-semibold tracking-tight text-white">Falah OS</p></div></div>
        </div>
        <nav className="mt-8 flex-1"><p className="os-kicker px-3 pb-3 text-amber-400/70">Workspace</p><div className="space-y-1">{navigation.map((item) => <Link key={item.href} href={item.href} className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-400 transition hover:bg-amber-500/10 hover:text-amber-200"><span className="w-5 text-[9px] font-medium tracking-wider text-amber-500/45 group-hover:text-amber-400">{item.mark}</span><span>{item.name}</span><span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400 opacity-0 shadow-[0_0_10px_rgba(245,185,66,0.9)] transition group-hover:opacity-100" /></Link>)}</div></nav>
        <div className="border-t border-amber-500/15 pt-4"><OsPreferences /><Link href="/dashboard/settings" className="mt-3 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-400 transition hover:bg-amber-500/10 hover:text-amber-200"><span className="w-5 text-[9px] font-medium tracking-wider text-amber-500/45">09</span>Settings</Link><p className="mt-4 px-3 text-[9px] tracking-[0.28em] text-zinc-700 uppercase">Falah OS · v1.00</p></div>
      </aside>
      <div className="lg:pl-72">{children}</div>
    </div>
  );
}
