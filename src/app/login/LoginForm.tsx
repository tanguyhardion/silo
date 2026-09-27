"use client";

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Code incorrect.");
      }
      // Full navigation so the new cookie is sent with every subsequent request
      window.location.replace(redirectTo);
    } catch (err) {
      setError((err as Error).message);
      setCode("");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E2721]/40 backdrop-blur-sm px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-[#DFD9CC] bg-[#FDFCF9] p-6 sm:p-8 shadow-xl"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#213B2F] text-[#E8ECD7]">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-[#1E2721]">Accès protégé</h1>
          <p className="mt-1 text-sm text-[#67726A]">Saisissez le code pour accéder à Silo.</p>
        </div>

        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="current-password"
          autoFocus
          maxLength={32}
          aria-label="Code d'accès"
          placeholder="••••••"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          disabled={submitting}
          className="mt-6 w-full rounded-xl border border-[#DFD9CC] bg-white px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] text-[#213B2F] focus:border-[#213B2F] focus:outline-none disabled:opacity-60"
        />

        {error && (
          <p role="alert" className="mt-3 text-center text-sm font-semibold text-[#B3261E]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!code || submitting}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#213B2F] px-4 py-3 text-sm font-bold text-[#E8ECD7] transition hover:bg-[#2D4A3E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Déverrouiller
        </button>
      </form>
    </div>
  );
}
