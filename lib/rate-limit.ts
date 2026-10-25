// Pembatas percobaan sederhana (in-memory), pengganti express-rate-limit.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

export function hit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, bucketKey: key };
  }
  b.count += 1;
  return { limited: b.count > limit, bucketKey: key };
}

export function reset(key: string) {
  buckets.delete(key);
}
