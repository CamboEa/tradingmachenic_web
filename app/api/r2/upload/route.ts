import { type NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { r2 } from "@/lib/r2/client";
import { enforceApiRateLimit } from "@/lib/security/api-rate-limit";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_BUCKETS = ["trading-lesson", "trading-tool"] as const;

const ALLOWED_TYPES: Record<string, string[]> = {
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

const MAX_SIZE_MB: Record<string, number> = {
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
    const serviceClient = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("[r2/upload] user:", user.email, "profile:", profile, "err:", profileError?.message);

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucketName = formData.get("bucketName") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_BUCKETS.includes(bucketName as any)) {
      return NextResponse.json(
        { error: "Invalid bucket" },
        { status: 400 }
      );
    }

    const maxBytes = MAX_SIZE_MB[bucketName] * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File exceeds ${MAX_SIZE_MB[bucketName]} MB limit` },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES[bucketName].includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not allowed` },
        { status: 400 }
      );
    }

    // Generate unique key
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${Date.now()}-${sanitized}`;

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    const bucket = bucketName === "trading-lesson" ? "trading-lesson" : "trading-tool";

    await r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type || "application/octet-stream",
      })
    );

    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ publicUrl, key });
  } catch (err) {
    console.error("[r2/upload]", err);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
