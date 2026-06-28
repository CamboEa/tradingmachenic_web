import { type NextRequest, NextResponse } from "next/server";

import { enforceApiRateLimit } from "@/lib/security/api-rate-limit";
import { getSharedAdminClient } from "@/lib/supabase/server";

type PlatformParam = "mt4" | "mt5" | "single";

function resolvePlatform(raw: string | null): PlatformParam {
  if (raw === "mt4" || raw === "mt5") return raw;
  return "single";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = enforceApiRateLimit(request, "toolDownload");
  if (limited) return limited;

  const { id } = await params;
  const platform = resolvePlatform(request.nextUrl.searchParams.get("platform"));

  const supabase = getSharedAdminClient();

  const { data: tool, error } = await supabase
    .from("tools")
    .select("file_url, file_url_mt4, file_url_mt5")
    .eq("id", id)
    .single();

  if (error || !tool) {
    return new NextResponse("Tool not found", { status: 404 });
  }

  const target =
    platform === "mt4"
      ? tool.file_url_mt4
      : platform === "mt5"
        ? tool.file_url_mt5
        : tool.file_url;

  if (!target) {
    return new NextResponse("No file available for this platform", { status: 404 });
  }

  // Count the download. Never block the file on a counter failure.
  const { error: rpcError } = await supabase.rpc("increment_tool_download", {
    p_tool_id: id,
    p_platform: platform,
  });
  if (rpcError) {
    console.error("[tools/download] failed to increment count:", rpcError.message);
  }

  return NextResponse.redirect(target, 302);
}
