import { type NextRequest, NextResponse } from "next/server";

import { presignUpload, type UploadFolder } from "@/lib/r2/upload";

const ALLOWED_FOLDERS: UploadFolder[] = ["videos", "tools"];

const ALLOWED_TYPES: Record<UploadFolder, string[]> = {
  videos: ["video/mp4", "video/webm", "video/quicktime"],
  tools: [
    "application/octet-stream",
    "application/zip",
    "application/x-zip-compressed",
  ],
};

const MAX_SIZE_MB: Record<UploadFolder, number> = {
  videos: 500,
  tools: 20,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folder, filename, contentType, sizeBytes } = body as {
      folder: string;
      filename: string;
      contentType: string;
      sizeBytes: number;
    };

    if (!ALLOWED_FOLDERS.includes(folder as UploadFolder)) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }

    const typedFolder = folder as UploadFolder;
    const maxBytes = MAX_SIZE_MB[typedFolder] * 1024 * 1024;

    if (sizeBytes > maxBytes) {
      return NextResponse.json(
        { error: `File exceeds ${MAX_SIZE_MB[typedFolder]} MB limit` },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES[typedFolder].includes(contentType)) {
      return NextResponse.json(
        { error: `Content type ${contentType} not allowed for ${folder}` },
        { status: 400 },
      );
    }

    const result = await presignUpload({ folder: typedFolder, filename, contentType });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[r2/presign]", err);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 },
    );
  }
}
