import "server-only";

/**
 * Простое ограничение попыток в памяти процесса (скользящее окно).
 * Достаточно для одного экземпляра приложения. При нескольких экземплярах
 * за балансировщиком — вынести в Redis/PostgreSQL.
 */

type Bucket = { hits: number[] };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    const retryAfterMs = windowMs - (now - bucket.hits[0]);
    return { ok: false as const, retryAfterMinutes: Math.max(1, Math.ceil(retryAfterMs / 60_000)) };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { ok: true as const };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
