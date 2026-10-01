"use client";

import { useEffect, useRef, useState } from "react";
import { Preferences } from "../components/Shell";
import { Icon } from "../components/icons";
import { publicApi } from "../lib/api";
import { usePreferences } from "../lib/i18n";
import { getToken, saveSession, type SessionClient } from "../lib/session";

/** Normalises typing/pasting into the FAL-XXXX-XXXXXXXX shape. */
function formatCode(raw: string) {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24);
  if ("FAL".startsWith(clean)) return clean;
  const body = clean.startsWith("FAL") ? clean.slice(3) : clean;
  return ["FAL", body.slice(0, 4), body.slice(4)].filter(Boolean).join("-");
}

export default function SignIn() {
  const { t, errorText } = usePreferences();
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (getToken()) {
      window.location.replace("/dashboard");
      return;
    }
    if (new URLSearchParams(window.location.search).get("expired")) setError(t("login.expired"));
    inputRef.current?.focus();
    // Only on first mount; the message is re-translated if the language changes below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!accessCode.trim()) {
      setError(t("login.required"));
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const result = await publicApi<{ token: string; client: SessionClient }>("/auth/access", {
        method: "POST",
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      });
      saveSession(result.token, result.client);
      window.location.assign("/dashboard");
    } catch (reason) {
      setError(errorText(reason instanceof Error ? reason.message : null));
      setLoading(false);
      inputRef.current?.select();
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 os-shell opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="absolute end-5 top-5"><Preferences compact /></div>

      <div className="relative w-full max-w-md animate-fade-up text-center">
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 text-xl font-black text-[#160e03] shadow-[0_0_48px_rgba(232,160,32,0.35)]">F</div>
        <p className="os-kicker !tracking-[0.45em]">{t("brand.studio")}</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">{t("brand.os")}</h1>
        <p className="mt-4 text-sm text-muted">{t("brand.tagline")}</p>

        <form onSubmit={handleSubmit} noValidate className="os-panel mt-12 rounded-2xl p-5 text-start sm:p-6">
          <label htmlFor="access-code" className="os-kicker mb-3 block">{t("login.label")}</label>
          <input
            ref={inputRef}
            id="access-code"
            type="text"
            inputMode="text"
            value={accessCode}
            onChange={(event) => {
              setAccessCode(formatCode(event.target.value));
              setError("");
            }}
            placeholder="FAL-XXXX-XXXXXXXX"
            autoComplete="one-time-code"
            autoCapitalize="characters"
            spellCheck={false}
            dir="ltr"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "access-error" : undefined}
            className="os-field h-14 px-5 font-mono text-base tracking-[0.12em]"
          />

          {error && (
            <p id="access-error" role="alert" className="mt-3 flex items-start gap-2 text-xs text-danger">
              <Icon.Alert size={14} className="mt-px shrink-0" />
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="os-amber-button mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-e-transparent" />{t("login.connecting")}</>
            ) : (
              <>{t("login.continue")}<Icon.Arrow size={16} /></>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4 text-[11px] text-faint">
          <span className="h-px flex-1 bg-line" />{t("login.or")}<span className="h-px flex-1 bg-line" />
        </div>
        <a href="/demo" className="os-quiet-button mt-6 flex h-14 w-full flex-col items-center justify-center rounded-xl text-sm font-semibold">
          <span className="flex items-center gap-2"><Icon.Spark size={16} />{t("login.demo")}</span>
          <span className="mt-0.5 text-[11px] font-normal text-muted">{t("login.demoHint")}</span>
        </a>

        <p className="mt-8 text-xs text-muted">
          {t("login.noCode")}{" "}
          <a href="mailto:hello@falahstudios.com" className="text-gold-text underline-offset-4 transition hover:underline">{t("login.contact")}</a>
        </p>

        <p className="os-kicker mt-16 !text-[9px] !text-faint">{t("brand.version")}</p>
      </div>
    </main>
  );
}
