import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { R2_BUCKET, R2_FOLDERS, R2_PUBLIC_URL, r2 } from "./client";

export type UploadFolder = keyof typeof R2_FOLDERS;

/** Generate a presigned PUT URL so the browser can upload directly to R2. */
export async function presignUpload({
  folder,
  filename,
  contentType,
  expiresIn = 600,
}: {
  folder: UploadFolder;
  filename: string;
  contentType: string;
  expiresIn?: number;
}): Promise<{ presignedUrl: string; publicUrl: string; key: string }> {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${R2_FOLDERS[folder]}/${Date.now()}-${sanitized}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(r2, command, { expiresIn });
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;

  return { presignedUrl, publicUrl, key };
}

/** Generate a presigned GET URL for private objects (e.g. tool files). */
export async function presignDownload(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: R2_BUCKET, Key: key });
  return getSignedUrl(r2, command, { expiresIn });
}

/** Delete an object from R2 by its key. */
export async function deleteObject(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
