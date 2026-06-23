"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { SpinnerIcon } from "@/components/ui/icons";
import { isTurnstileConfigured } from "@/lib/security/turnstile-public";

interface SiteGateFormProps {
  returnTo: string;
  labels: {
    loading: string;
    error: string;
    turnstileError: string;
  };
}

export function SiteGateForm({ returnTo, labels }: SiteGateFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isTurnstileConfigured()) {
      router.replace(returnTo);
    }
  }, [returnTo, router]);

  async function verifyAccess(token: string) {
    if (!token || status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/site-gate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? labels.error);
        return;
      }

      router.replace(returnTo);
      router.refresh();
    } catch {
      setStatus("error");
      setErrorMessage(labels.error);
    }
  }

  return (
    <div className="mt-8">
      <div
        className={`rounded-2xl border bg-slate-50/60 p-5 transition-colors sm:p-6 ${
          status === "error"
            ? "border-red-200 bg-red-50/40"
            : "border-slate-200/90"
        }`}
      >
        <TurnstileWidget
          onTokenChange={(token) => void verifyAccess(token)}
          loadErrorLabel={labels.turnstileError}
          className="flex min-h-[72px] items-center justify-center"
        />

        {status === "loading" && (
          <div
            className="mt-4 flex items-center justify-center gap-2.5 text-sm text-slate-500"
            role="status"
            aria-live="polite"
          >
            <SpinnerIcon className="h-4 w-4 text-gold" />
            <span>{labels.loading}</span>
          </div>
        )}
      </div>

      {status === "error" && errorMessage && (
        <div
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700"
          role="alert"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}
