import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { R2_BUCKETS, R2_PUBLIC_URL, r2 } from "./client";

export type BucketName = keyof typeof R2_BUCKETS;

/** Generate a presigned PUT URL so the browser can upload directly to R2. */
export async function presignUpload({
  bucketName,
  filename,
  contentType,
  expiresIn = 600,
}: {
  bucketName: BucketName;
  filename: string;
  contentType: string;
  expiresIn?: number;
}): Promise<{ presignedUrl: string; publicUrl: string; key: string }> {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${Date.now()}-${sanitized}`;
  const bucket = R2_BUCKETS[bucketName];

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(r2, command, { expiresIn });
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;

  return { presignedUrl, publicUrl, key };
}

/** Generate a presigned GET URL for private objects (e.g. tool files). */
export async function presignDownload(
  bucketName: BucketName,
  key: string,
  expiresIn = 3600,
): Promise<string> {
  const bucket = R2_BUCKETS[bucketName];
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(r2, command, { expiresIn });
}

/** Delete an object from R2 by its key. */
export async function deleteObject(
  bucketName: BucketName,
  key: string,
): Promise<void> {
  const bucket = R2_BUCKETS[bucketName];
  await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
