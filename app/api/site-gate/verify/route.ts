import { type NextRequest, NextResponse } from "next/server";

import { enforceApiRateLimit } from "@/lib/security/api-rate-limit";
import {
  createSiteGateToken,
  SITE_GATE_COOKIE,
  SITE_GATE_MAX_AGE_SEC,
} from "@/lib/security/site-gate";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

export async function POST(request: NextRequest) {
  const limited = enforceApiRateLimit(request, "auth");
  if (limited) return limited;

  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const turnstile = await verifyTurnstileToken(body.token);
  if (!turnstile.ok) {
    return NextResponse.json({ error: turnstile.error }, { status: 400 });
  }

  const gateToken = await createSiteGateToken();
  if (!gateToken) {
    return NextResponse.json(
      { error: "Site gate is not configured." },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SITE_GATE_COOKIE, gateToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SITE_GATE_MAX_AGE_SEC,
  });

  return response;
}
