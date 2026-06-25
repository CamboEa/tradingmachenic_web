"use client";

import { useEffect, useId, useRef, useState } from "react";

import { getTurnstileSiteKey } from "@/lib/security/turnstile-public";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      theme?: "light" | "dark" | "auto";
    },
  ) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onTurnstileLoad?: () => void;
  }
}

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";

interface TurnstileWidgetProps {
  onTokenChange: (token: string) => void;
  loadErrorLabel?: string;
  className?: string;
}

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      window.onTurnstileLoad = () => resolve();
      if (window.turnstile) resolve();
      return;
    }

    window.onTurnstileLoad = () => resolve();

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load Turnstile"));
    document.head.appendChild(script);
  });
}

export function TurnstileWidget({
  onTokenChange,
  loadErrorLabel = "Security check could not load. Refresh the page or disable ad blockers.",
  className,
}: TurnstileWidgetProps) {
  const siteKey = getTurnstileSiteKey();
  const containerId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const [failed, setFailed] = useState(false);

  onTokenChangeRef.current = onTokenChange;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "dark",
          callback: (token) => onTokenChangeRef.current(token),
          "expired-callback": () => onTokenChangeRef.current(""),
          "error-callback": () => {
            onTokenChangeRef.current("");
            setFailed(true);
          },
        });
      })
      .catch(() => {
        setFailed(true);
        onTokenChangeRef.current("");
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  if (!siteKey) return null;

  if (failed) {
    return (
      <p className="text-center text-sm leading-relaxed text-red-400">
        {loadErrorLabel}
      </p>
    );
  }

  return (
    <div ref={containerRef} id={containerId} className={className ?? "min-h-[65px]"} />
  );
}
