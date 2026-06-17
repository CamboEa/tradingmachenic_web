import { isTurnstileEnabled } from "@/lib/security/turnstile";

export const SITE_GATE_COOKIE = "aat_site_verified";
export const SITE_GATE_MAX_AGE_SEC = 60 * 60 * 24; // 24 hours

export function isSiteGateEnabled(): boolean {
  return isTurnstileEnabled();
}

function gateSecret(): string | null {
  return process.env.TURNSTILE_SECRET_KEY ?? process.env.SITE_GATE_SECRET ?? null;
}

async function hmacHex(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return [...new Uint8Array(sig)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function createSiteGateToken(): Promise<string | null> {
  const secret = gateSecret();
  if (!secret) return null;

  const expires = Date.now() + SITE_GATE_MAX_AGE_SEC * 1000;
  const payload = String(expires);
  const sig = await hmacHex(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifySiteGateToken(
  token: string | undefined,
): Promise<boolean> {
  if (!isSiteGateEnabled()) return true;
  if (!token) return false;

  const secret = gateSecret();
  if (!secret) return true;

  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  const expected = await hmacHex(secret, payload);
  return timingSafeEqualHex(sig, expected);
}

/** Prevent open redirects after the gate. */
export function safeGateReturnTo(
  value: string | null | undefined,
  locale: string,
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return `/${locale}`;
  }
  return value;
}
