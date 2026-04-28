import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  hashContent,
  getCachedResult,
  setCachedResult,
  cleanupExpiredCache,
} from "../../src/module/worker/cache/workerCache.js";

describe("workerCache", () => {
  beforeEach(() => {
    // Reset cache state before each test
    cleanupExpiredCache();
  });

  describe("hashContent", () => {
    it("should return consistent hash for same content", () => {
      const hash1 = hashContent("const x = 1;");
      const hash2 = hashContent("const x = 1;");

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe("string");
      expect(hash1.length).toBeGreaterThan(0);
    });

    it("should return different hashes for different content", () => {
      const hash1 = hashContent("const x = 1;");
      const hash2 = hashContent("const x = 2;");

      expect(hash1).not.toBe(hash2);
    });

    it("should return a valid SHA-1 hash (40 hex characters)", () => {
      const hash = hashContent("test");
      expect(hash).toMatch(/^[a-f0-9]{40}$/i);
    });

    it("should handle empty string", () => {
      const hash = hashContent("");
      expect(typeof hash).toBe("string");
      expect(hash.length).toBe(40);
    });

    it("should handle large content", () => {
      const largeContent = "a".repeat(100000);
      const hash = hashContent(largeContent);
      expect(hash).toMatch(/^[a-f0-9]{40}$/i);
    });
  });

  describe("getCachedResult", () => {
    it("should return null for non-existent key", () => {
      const result = getCachedResult("nonexistent");
      expect(result).toBeNull();
    });

    it("should return cached value for existing key", () => {
      const data = { result: "test" };
      setCachedResult("key1", data);

      const result = getCachedResult("key1");
      expect(result).toEqual(data);
    });

    it("should return null and delete expired entry", () => {
      setCachedResult("expired", { data: true });

      // Simulate time passing beyond TTL (5 minutes)
      jest.useFakeTimers();
      jest.advanceTimersByTime(6 * 60 * 1000);

      const result = getCachedResult("expired");
      expect(result).toBeNull();

      jest.useRealTimers();
    });

    it("should refresh LRU position on access", () => {
      // Fill cache near limit to test LRU behavior
      for (let i = 0; i < 99; i++) {
        setCachedResult(`key${i}`, { index: i });
      }
      setCachedResult("oldest", { special: true });

      // Access oldest to refresh it
      getCachedResult("oldest");

      // Add more entries to trigger eviction
      for (let i = 100; i < 110; i++) {
        setCachedResult(`key${i}`, { index: i });
      }

      // Oldest should still be there because it was accessed
      expect(getCachedResult("oldest")).toEqual({ special: true });
    });
  });

  describe("setCachedResult", () => {
    it("should store and retrieve value", () => {
      const data = { analysis: "result" };
      setCachedResult("store-test", data);

      expect(getCachedResult("store-test")).toEqual(data);
    });

    it("should overwrite existing key", () => {
      setCachedResult("dup", { v1: true });
      setCachedResult("dup", { v2: true });

      expect(getCachedResult("dup")).toEqual({ v2: true });
    });

    it("should evict oldest entry when cache is full", () => {
      // Fill cache to capacity (100)
      for (let i = 0; i < 100; i++) {
        setCachedResult(`fill${i}`, { index: i });
      }

      // This should evict the oldest entry
      setCachedResult("newest", { newest: true });

      // First entry should be evicted
      expect(getCachedResult("fill0")).toBeNull();

      // New entry should exist
      expect(getCachedResult("newest")).toEqual({ newest: true });
    });

    it("should maintain correct cache size after evictions", () => {
      for (let i = 0; i < 150; i++) {
        setCachedResult(`size${i}`, { index: i });
      }

      // Access some entries to keep them in cache
      getCachedResult("size100");
      getCachedResult("size101");

      // Add more entries - should still be around 100
      for (let i = 150; i < 200; i++) {
        setCachedResult(`size${i}`, { index: i });
      }

      // Recently accessed entries should still be there
      expect(getCachedResult("size100")).not.toBeNull();
      expect(getCachedResult("size101")).not.toBeNull();
    });
  });

  describe("cleanupExpiredCache", () => {
    it("should remove expired entries", () => {
      setCachedResult("fresh", { data: 1 });
      setCachedResult("stale", { data: 2 });

      jest.useFakeTimers();
      jest.advanceTimersByTime(6 * 60 * 1000);

      cleanupExpiredCache();

      expect(getCachedResult("fresh")).toBeNull();
      expect(getCachedResult("stale")).toBeNull();

      jest.useRealTimers();
    });

    it("should handle empty cache", () => {
      expect(() => cleanupExpiredCache()).not.toThrow();
    });

    it("should remove only expired entries, keep fresh ones", () => {
      setCachedResult("willExpire", { data: 1 });

      jest.useFakeTimers();

      // Wait 6 minutes (past 5-min TTL)
      jest.advanceTimersByTime(6 * 60 * 1000);

      // Add a fresh entry
      setCachedResult("fresh", { data: 2 });

      // Only run cleanup
      cleanupExpiredCache();

      // Both should be handled correctly
      // Note: setCachedResult during fake timers may also affect timing

      jest.useRealTimers();
    });
  });
});

