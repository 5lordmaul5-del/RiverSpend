#!/usr/bin/env node
import fs from "node:fs";
const source = fs.readFileSync("server/river-ai-worker.mjs", "utf8");
const checks = [
  ["tracked sleeper set", /const sleepWakeups = new Set\(\)/],
  ["sleep registers wake callback", /sleepWakeups\.add\(wake\)/],
  ["sleep callback clears timer", /clearTimeout\(timer\)/],
  ["shutdown wakes pending sleepers", /for \(const wake of \[\.\.\.sleepWakeups\]\) wake\(\)/],
  ["shutdown drains active tasks", /await Promise\.allSettled\(\[\.\.\.active\]\)/],
  ["shutdown closes pool", /await pool\.end\(\)/],
  ["SIGTERM handler present", /process\.on\("SIGTERM"/],
  ["SIGINT handler present", /process\.on\("SIGINT"/],
];
let failed = false;
for (const [label, regex] of checks) {
  const ok = regex.test(source);
  console.log((ok ? "PASS " : "FAIL ") + label);
  failed ||= !ok;
}
process.exitCode = failed ? 1 : 0;
