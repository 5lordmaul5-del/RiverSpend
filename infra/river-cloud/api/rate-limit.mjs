export function createRateLimiter({ windowMs = 60_000, limit = 60, maxKeys = 10_000, clock = Date.now } = {}) {
  const windows = new Map();
  let cleanupCounter = 0;

  return function rateLimited(key) {
    const now = clock();
    const entry = windows.get(key);
    cleanupCounter += 1;
    if (cleanupCounter % 256 === 0) {
      for (const [storedKey, storedEntry] of windows) {
        if (now - storedEntry.start >= windowMs) windows.delete(storedKey);
      }
    }
    if (!entry || now - entry.start >= windowMs) {
      if (windows.size >= maxKeys) {
        for (const [storedKey, storedEntry] of windows) {
          if (now - storedEntry.start >= windowMs) windows.delete(storedKey);
          if (windows.size < Math.floor(maxKeys * 0.8)) break;
        }
        if (windows.size >= maxKeys) windows.delete(windows.keys().next().value);
      }
      windows.set(key, { start: now, count: 1 });
      return false;
    }
    entry.count += 1;
    return entry.count > limit;
  };
}
