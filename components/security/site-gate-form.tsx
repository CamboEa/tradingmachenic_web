"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { isTurnstileConfigured } from "@/lib/security/turnstile-public";

interface SiteGateFormProps {
  returnTo: string;
  labels: {
    loading: string;
    error: string;
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
    <div className="space-y-5">
      <TurnstileWidget onTokenChange={(token) => void verifyAccess(token)} />
      {status === "loading" && (
        <p className="text-center text-sm text-(--color-ink-muted)">{labels.loading}</p>
      )}
      {status === "error" && errorMessage && (
        <p className="text-center text-sm font-medium text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
