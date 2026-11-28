/**
 * PostgreSQL session-level advisory semaphore shared by RiverCloud API instances.
 * Slot locks are released automatically when the psql session exits.
 */
export const RIVERCLOUD_SEMAPHORE_NAMESPACE = 2147483000;

export function buildDbAdvisorySemaphoreScript(slots = 8) {
  if (!Number.isInteger(slots) || slots < 1 || slots > 256) {
    throw new TypeError("slots must be an integer from 1 to 256");
  }
  return [
    "SELECT CASE WHEN EXISTS (",
    "  SELECT 1 FROM generate_series(1, " + slots + ") AS slots(slot)",
    "  WHERE pg_try_advisory_lock(" + RIVERCLOUD_SEMAPHORE_NAMESPACE + ", slots.slot)",
    ") THEN 'true' ELSE 'false' END AS acquired \\gset",
    "\\if :acquired",
    "\\else",
    "\\echo RIVERCLOUD_SEMAPHORE_FULL",
    "\\quit",
    "\\endif",
    ""
  ].join("\n");
}
