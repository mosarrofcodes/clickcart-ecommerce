interface Bucket {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Bucket>();
const MAX_ENTRIES = 10_000;

const DISABLED = { allowed: true, remaining: Number.MAX_SAFE_INTEGER, retryAfterMs: 0 } as const;

export function checkRateLimit(
  identifier: string,
  opts: { limit: number; windowMs: number },
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  if (process.env.RATE_LIMIT_DISABLED === "true") return DISABLED;

  const now = Date.now();
  if (stores.size > MAX_ENTRIES) {
    for (const [key, bucket] of stores) {
      if (bucket.resetAt <= now) stores.delete(key);
    }
  }

  const key = `${opts.windowMs}:${identifier}`;
  const bucket = stores.get(key);
  if (!bucket || bucket.resetAt <= now) {
    stores.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, remaining: opts.limit - 1, retryAfterMs: 0 };
  }

  bucket.count += 1;
  const allowed = bucket.count <= opts.limit;
  const retryAfterMs = bucket.resetAt - now;
  return { allowed, remaining: Math.max(0, opts.limit - bucket.count), retryAfterMs };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  return realIp || "unknown";
}

export function isHoneypot(body: Record<string, unknown>, field = "website"): boolean {
  const value = body[field];
  return typeof value === "string" && value.trim().length > 0;
}

export function resetRateLimits(): void {
  stores.clear();
}