"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface WebsiteData {
  businessName: string;
  tagline: string;
  description: string;
}

const initialWebsite: WebsiteData = {
  businessName: "",
  tagline: "",
  description: "",
};

export default function WebsitePage() {
  const [website, setWebsite] = useState<WebsiteData>(initialWebsite);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("falah_os_token");
    const savedClient = localStorage.getItem("falah_os_client");

    if (!token) {
      window.location.href = "/";
      return;
    }

    async function loadWebsite() {
      try {
        const response = await fetch(`${API_URL}/website`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load website details.");
        }

        if (result.data) {
          setWebsite({
            businessName: result.data.businessName || "",
            tagline: result.data.tagline || "",
            description: result.data.description || "",
          });
        } else if (savedClient) {
          const client = JSON.parse(savedClient) as { name?: string };
          setWebsite((current) => ({ ...current, businessName: client.name || "" }));
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load website details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadWebsite();
  }, []);

  function updateField(field: keyof WebsiteData, value: string) {
    setWebsite((current) => ({ ...current, [field]: value }));
    setMessage("");
  }

  async function handleSave() {
    const token = localStorage.getItem("falah_os_token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/website`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(website),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save changes.");
      }

      setWebsite(result.data);
      setMessage("Changes saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-900">
        <div className="flex h-20 items-center justify-between px-6 lg:px-10">
          <div>
            <p className="text-[10px] font-medium tracking-[0.3em] text-zinc-600 uppercase">
              Website
            </p>

            <h1 className="mt-1 text-lg font-medium tracking-tight">
              Website Manager
            </h1>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saving}
            className="rounded-lg bg-white px-5 py-2.5 text-xs font-medium text-black transition hover:bg-zinc-200"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </header>

      <div className="max-w-5xl px-6 py-10 lg:px-10">
        <div className="mb-10">
          <h2 className="text-3xl font-semibold tracking-[-0.03em]">
            Manage your website
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Update your business information without touching code.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6">
            <div className="mb-6">
              <h3 className="text-sm font-medium">
                Business information
              </h3>

              <p className="mt-1 text-xs text-zinc-600">
                This information appears throughout your website.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="business-name"
                  className="mb-2 block text-xs text-zinc-500"
                >
                  Business name
                </label>

                <input
                  id="business-name"
                  value={website.businessName}
                  onChange={(event) =>
                    updateField("businessName", event.target.value)
                  }
                  disabled={loading || saving}
                  className="h-12 w-full rounded-xl border border-zinc-800 bg-black px-4 text-sm text-white outline-none transition focus:border-zinc-600"
                />
              </div>

              <div>
                <label
                  htmlFor="tagline"
                  className="mb-2 block text-xs text-zinc-500"
                >
                  Tagline
                </label>

                <input
                  id="tagline"
                  value={website.tagline}
                  onChange={(event) =>
                    updateField("tagline", event.target.value)
                  }
                  disabled={loading || saving}
                  className="h-12 w-full rounded-xl border border-zinc-800 bg-black px-4 text-sm text-white outline-none transition focus:border-zinc-600"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-xs text-zinc-500"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={website.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  disabled={loading || saving}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-600"
                />
              </div>

              {(loading || message || error) && (
                <p
                  className={`mt-4 text-xs ${
                    error ? "text-red-400" : "text-zinc-500"
                  }`}
                  role={error ? "alert" : "status"}
                >
                  {error || (loading ? "Loading website details..." : message)}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6">
            <div className="mb-6">
              <h3 className="text-sm font-medium">Website sections</h3>

              <p className="mt-1 text-xs text-zinc-600">
                Manage the main sections of your website.
              </p>
            </div>

            <div className="divide-y divide-zinc-900">
              {[
                ["Homepage", "Hero, introduction and featured content"],
                ["About", "Your story and business information"],
                ["Products", "Products, services and pricing"],
                ["Contact", "Contact information and location"],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="flex items-center justify-between py-5"
                >
                  <div>
                    <p className="text-sm">{title}</p>
                    <p className="mt-1 text-xs text-zinc-600">
                      {description}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="rounded-lg border border-zinc-800 px-4 py-2 text-xs text-zinc-400 transition hover:border-zinc-600 hover:text-white"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6">
            <div>
              <h3 className="text-sm font-medium">
                Website status
              </h3>

              <p className="mt-1 text-xs text-zinc-600">
                Your website connection and publishing status.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-zinc-900 bg-black p-4">
              <div>
                <p className="text-sm">Website connected</p>
                <p className="mt-1 text-xs text-zinc-600">
                  Changes can be published from Falah OS.
                </p>
              </div>

              <span className="rounded-full border border-zinc-800 px-3 py-1 text-[10px] text-zinc-400">
                CONNECTED
              </span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
