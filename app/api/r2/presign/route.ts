import { type NextRequest, NextResponse } from "next/server";

import { presignUpload, type BucketName } from "@/lib/r2/upload";
import { enforceApiRateLimit } from "@/lib/security/api-rate-limit";
import { createClient, getSharedAdminClient } from "@/lib/supabase/server";

const ALLOWED_BUCKETS: BucketName[] = ["trading-lesson", "trading-tool"];

const ALLOWED_TYPES: Record<BucketName, string[]> = {
  "trading-lesson": [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
  ],
  "trading-tool": [
    "application/octet-stream",
    "application/zip",
    "application/x-zip-compressed",
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
  ],
};

const MAX_SIZE_MB: Record<BucketName, number> = {
  "trading-lesson": 500,
  "trading-tool": 20,
};

export async function POST(request: NextRequest) {
  try {
    const limited = enforceApiRateLimit(request, "r2Api");
    if (limited) return limited;

    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in" },
        { status: 401 }
      );
    }

    // Check admin role using bare service-role client (no cookies needed)
    const serviceClient = getSharedAdminClient();

    const { data: profile } = await serviceClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bucketName, filename, contentType, sizeBytes, folder } = body as {
      bucketName: string;
      filename: string;
      contentType: string;
      sizeBytes: number;
      folder?: string;
    };

    if (!ALLOWED_BUCKETS.includes(bucketName as BucketName)) {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    const typedBucket = bucketName as BucketName;
    const maxBytes = MAX_SIZE_MB[typedBucket] * 1024 * 1024;

    if (sizeBytes > maxBytes) {
      return NextResponse.json(
        { error: `File exceeds ${MAX_SIZE_MB[typedBucket]} MB limit` },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES[typedBucket].includes(contentType)) {
      return NextResponse.json(
        { error: `Content type ${contentType} not allowed for ${bucketName}` },
        { status: 400 },
      );
    }

    const result = await presignUpload({
      bucketName: typedBucket,
      filename,
      contentType,
      folder: typeof folder === "string" ? folder : undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[r2/presign]", err);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 },
    );
  }
}
