type BatchOptions<T, R> = {
  items: T[];
  handler: (item: T, index: number) => Promise<R>;
  concurrency?: number;
  stopOnError?: boolean;
};

export async function runWithConcurrency<T, R>({
  items,
  handler,
  concurrency = 4,
  stopOnError = false,
}: BatchOptions<T, R>): Promise<R[]> {

  if (!Array.isArray(items)) {
    throw new Error("Items must be an array");
  }

  if (items.length === 0) return [];

  // 🔥 Step 1: Create deterministic chunks (NO shared state)
  const chunks: { item: T; index: number }[][] = Array.from(
    { length: concurrency },
    () => []
  );

  for (let i = 0; i < items.length; i++) {
    const workerIndex = i % concurrency;
    chunks[workerIndex].push({ item: items[i], index: i });
  }

  // 🔥 Step 2: Preallocate results (keeps order stable)
  const results: R[] = new Array(items.length);

  // 🔥 Step 3: Run workers in parallel
  const workers = chunks.map(async (chunk) => {
    for (const { item, index } of chunk) {
      try {
        const result = await handler(item, index);
        results[index] = result; // ✅ deterministic write
      } catch (err) {
        console.error("Batch task failed:", err);

        if (stopOnError) {
          throw err;
        }
      }
    }
  });

  await Promise.all(workers);

  return results;
}