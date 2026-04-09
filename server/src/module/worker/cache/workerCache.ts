import crypto from "crypto";

type CacheEntry = {
  value: any;
  expiresAt: number;
};

// 🔥 CONFIG (tune these)
const MAX_CACHE_SIZE = 100;        // max files in memory
const TTL_MS = 5 * 60 * 1000;     // 5 minutes

const fileCache = new Map<string, CacheEntry>();

// ✅ HASH FUNCTION
export function hashContent(content: string): string {
  return crypto.createHash("sha1").update(content).digest("hex");
}

// ✅ GET CACHE (with TTL + LRU update)
export function getCachedResult(hash: string) {
  const entry = fileCache.get(hash);

  if (!entry) return null;

  // ❌ expired
  if (Date.now() > entry.expiresAt) {
    fileCache.delete(hash);
    return null;
  }

  // 🔥 LRU: refresh position
  fileCache.delete(hash);
  fileCache.set(hash, entry);

  return entry.value;
}

// ✅ SET CACHE (with eviction)
export function setCachedResult(hash: string, value: any) {
  // if exists → refresh
  if (fileCache.has(hash)) {
    fileCache.delete(hash);
  }

  // 🔥 EVICT oldest if limit reached
  if (fileCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = fileCache.keys().next().value;
    if (oldestKey) {
      fileCache.delete(oldestKey);
    }
  }

  fileCache.set(hash, {
    value,
    expiresAt: Date.now() + TTL_MS,
  });
}

// ✅ OPTIONAL: manual cleanup (can call occasionally)
export function cleanupExpiredCache() {
  const now = Date.now();

  for (const [key, entry] of fileCache.entries()) {
    if (now > entry.expiresAt) {
      fileCache.delete(key);
    }
  }
}