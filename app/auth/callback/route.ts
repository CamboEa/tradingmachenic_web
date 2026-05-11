import { type NextRequest, NextResponse } from "next/server";

import { defaultLocale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? `/${defaultLocale}/education`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — redirect to login with an error hint
  return NextResponse.redirect(
    `${origin}/${defaultLocale}/login?error=auth_callback_failed`,
  );
}
