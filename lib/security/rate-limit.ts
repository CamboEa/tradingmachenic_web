type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  ok: boolean;
  retryAfterSec?: number;
};

type BucketEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, BucketEntry>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/** In-memory sliding window — per server instance; pair with Cloudflare edge rules in production. */
export function checkRateLimit(
  namespace: string,
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();

  // Periodic memory cleanup to prevent memory leaks
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    lastCleanup = now;
    for (const [k, entry] of buckets.entries()) {
      if (now >= entry.resetAt) {
        buckets.delete(k);
      }
    }
  }

  const bucketKey = `${namespace}:${key}`;
  const existing = buckets.get(bucketKey);

  if (!existing || now >= existing.resetAt) {
    buckets.set(bucketKey, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return { ok: true };
  }

  if (existing.count >= options.limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true };
}

export const RATE_LIMITS = {
  auth: { limit: 10, windowMs: 15 * 60 * 1000 },
  r2Api: { limit: 30, windowMs: 60 * 60 * 1000 },
  toolDownload: { limit: 60, windowMs: 60 * 1000 },
} as const;
