"use client";

import { useState } from "react";

export default function Home() {
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleContinue() {
    setError("");

    if (!accessCode.trim()) {
      setError("Enter your access code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5001/api/auth/access",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessCode: accessCode.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Invalid access code.");
      }

      localStorage.setItem("falah_os_token", result.data.token);
      localStorage.setItem(
        "falah_os_client",
        JSON.stringify(result.data.client)
      );

      window.location.href = "/dashboard";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-14">
          <p className="text-[11px] font-medium tracking-[0.45em] text-zinc-500 uppercase">
            Falah Studios
          </p>

          <h1 className="mt-5 text-5xl sm:text-6xl font-semibold tracking-[-0.04em]">
            Falah OS
          </h1>

          <p className="mt-4 text-sm text-zinc-500">
            Your business, simplified.
          </p>
        </div>

        <div className="text-left">
          <label
            htmlFor="access-code"
            className="mb-3 block text-[10px] font-medium tracking-[0.25em] text-zinc-500 uppercase"
          >
            Access code
          </label>

          <input
            id="access-code"
            type="text"
            value={accessCode}
            onChange={(event) => {
              setAccessCode(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleContinue();
              }
            }}
            placeholder="FAL-XXXX-XXXX"
            autoComplete="off"
            spellCheck={false}
            className="h-14 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-zinc-500"
          />

          {error && (
            <p className="mt-3 text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleContinue}
            disabled={loading}
            className="mt-3 h-14 w-full rounded-xl bg-white text-sm font-medium text-black transition hover:bg-zinc-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Continue"}
          </button>
        </div>

        <p className="mt-8 text-xs text-zinc-600">
          Don&apos;t have an access code?{" "}
          <a
            href="mailto:hello@falahstudios.com"
            className="text-zinc-400 transition hover:text-white"
          >
            Contact Falah Studios
          </a>
        </p>

        <p className="mt-16 text-[9px] tracking-[0.3em] text-zinc-800 uppercase">
          Falah OS · v1.00
        </p>
      </div>
    </main>
  );
}
