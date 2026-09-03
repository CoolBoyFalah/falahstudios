import { ReactNode } from "react";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6">
          <h1 className="text-2xl font-black mb-8">Falah Admin</h1>
          <nav className="space-y-4">
            <a href="/admin/dashboard" className="block px-4 py-2 bg-amber-500 text-slate-950 rounded-lg font-semibold">
              Dashboard
            </a>
            <a href="/admin/services" className="block px-4 py-2 hover:bg-slate-800 rounded-lg">
              Services
            </a>
            <a href="/admin/portfolio" className="block px-4 py-2 hover:bg-slate-800 rounded-lg">
              Portfolio
            </a>
            <a href="/admin/blog" className="block px-4 py-2 hover:bg-slate-800 rounded-lg">
              Blog
            </a>
            <a href="/admin/contacts" className="block px-4 py-2 hover:bg-slate-800 rounded-lg">
              Contact Inquiries
            </a>
            <a href="/admin/testimonials" className="block px-4 py-2 hover:bg-slate-800 rounded-lg">
              Testimonials
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
