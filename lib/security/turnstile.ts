const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
      process.env.TURNSTILE_SECRET_KEY,
  );
}

export function getTurnstileSiteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
}

type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

/** Returns true when Turnstile is disabled (keys not set). */
export async function verifyTurnstileToken(
  token: string | null | undefined,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isTurnstileEnabled()) {
    return { ok: true };
  }

  if (!token?.trim()) {
    return { ok: false, error: "Please complete the security check." };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY!;

  const response = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret,
      response: token,
    }),
  });

  if (!response.ok) {
    return { ok: false, error: "Security check failed. Please try again." };
  }

  const data = (await response.json()) as TurnstileVerifyResponse;

  if (!data.success) {
    return { ok: false, error: "Security check failed. Please try again." };
  }

  return { ok: true };
}
