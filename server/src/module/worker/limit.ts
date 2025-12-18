export function withTimeout<T>(fn: () => Promise<T>, ms: number) {
  return Promise.race([
    fn(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    )
  ]);
}

export function checkMemory() {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  if (used > 512) {
    throw new Error("Memory limit exceeded");
  }
}
