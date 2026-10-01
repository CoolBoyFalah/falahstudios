"use client";

import { useCallback, useEffect, useState } from "react";
import { Preferences } from "../../components/Shell";
import { Icon } from "../../components/icons";
import { publicApi } from "../../lib/api";
import { usePreferences } from "../../lib/i18n";
import { saveSession, type SessionClient } from "../../lib/session";

/**
 * One-click entry to the public demo workspace: signs in to the sample
 * bakery and opens the dashboard. Shareable as os.falahstudios.com/demo.
 */
export default function DemoPage() {
  const { t, errorText } = usePreferences();
  const [error, setError] = useState("");

  const open = useCallback(async () => {
    setError("");
    try {
      const result = await publicApi<{ token: string; client: SessionClient }>("/auth/demo", { method: "POST" });
      saveSession(result.token, result.client);
      window.location.replace("/dashboard");
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : null;
      setError(message === "generic" ? t("demo.failed") : errorText(message));
    }
  }, [t, errorText]);

  useEffect(() => {
    void open();
    // Run once on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <div className="absolute end-5 top-5"><Preferences compact /></div>
      <div className="animate-fade-up text-center">
        <div className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 text-xl font-black text-[#160e03] shadow-[0_0_48px_rgba(232,160,32,0.35)]">F</div>
        <p className="os-kicker">{t("brand.os")}</p>
        {error ? (
          <>
            <p role="alert" className="mt-5 flex items-center justify-center gap-2 text-sm text-danger"><Icon.Alert size={16} />{error}</p>
            <button type="button" onClick={open} className="os-amber-button mt-6 inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-semibold">
              <Icon.Refresh size={16} />{t("demo.retry")}
            </button>
          </>
        ) : (
          <p className="mt-5 flex items-center justify-center gap-3 text-sm text-muted" aria-live="polite">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gold border-e-transparent" />
            {t("demo.opening")}
          </p>
        )}
      </div>
    </main>
  );
}
