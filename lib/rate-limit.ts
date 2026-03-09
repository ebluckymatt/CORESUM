type Bucket = {
  count: number;
  resetAt: number;
};

declare global {
  var __htsgRateLimitStore: Map<string, Bucket> | undefined;
}

const store = global.__htsgRateLimitStore ?? new Map<string, Bucket>();
if (!global.__htsgRateLimitStore) {
  global.__htsgRateLimitStore = store;
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  store.set(key, existing);
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}