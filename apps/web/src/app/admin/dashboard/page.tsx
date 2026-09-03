"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  totalServices: number;
  totalProjects: number;
  totalContacts: number;
  newContacts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalServices: 0,
    totalProjects: 0,
    totalContacts: 0,
    newContacts: 0,
  });

  useEffect(() => {
    // TODO: Fetch stats from API
    const fetchStats = async () => {
      try {
        // Replace with actual API calls
        setStats({
          totalServices: 6,
          totalProjects: 12,
          totalContacts: 45,
          newContacts: 3,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-black mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-amber-400 text-sm font-semibold mb-2">
            Total Services
          </h3>
          <p className="text-3xl font-black">{stats.totalServices}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-amber-400 text-sm font-semibold mb-2">
            Portfolio Projects
          </h3>
          <p className="text-3xl font-black">{stats.totalProjects}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-amber-400 text-sm font-semibold mb-2">
            Total Contacts
          </h3>
          <p className="text-3xl font-black">{stats.totalContacts}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 ring-2 ring-amber-500">
          <h3 className="text-amber-400 text-sm font-semibold mb-2">
            New Inquiries
          </h3>
          <p className="text-3xl font-black text-amber-400">
            {stats.newContacts}
          </p>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/services/new"
            className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-center transition"
          >
            Add Service
          </a>
          <a
            href="/admin/portfolio/new"
            className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-center transition"
          >
            Add Project
          </a>
          <a
            href="/admin/blog/new"
            className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-center transition"
          >
            Write Post
          </a>
          <a
            href="/admin/contacts"
            className="p-4 bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-lg text-center transition font-semibold"
          >
            View Inquiries
          </a>
        </div>
      </div>
    </div>
  );
}
