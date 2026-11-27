/** A process-local cap for concurrent database child operations. */
export function createDbConcurrencyGate(limit = 8) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 256) {
    throw new TypeError("limit must be an integer from 1 to 256");
  }
  let active = 0;

  function tryAcquire() {
    if (active >= limit) return null;
    active += 1;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      active -= 1;
    };
  }

  return { tryAcquire, activeCount: () => active };
}
