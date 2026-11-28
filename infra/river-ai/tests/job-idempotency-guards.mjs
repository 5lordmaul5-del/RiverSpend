import fs from "node:fs";
const api=fs.readFileSync("server/river-ai-standalone.mjs","utf8");
const sql=fs.readFileSync("infra/river-ai/worker-queue.sql","utf8");
const checks=[
 ["header validation",api.includes('req.headers["idempotency-key"]')&&api.includes("idempotencyKey.length < 8")],
 ["request fingerprint",api.includes("requestHash")&&api.includes("createHash(\"sha256\")")],
 ["key serialization",api.includes("pg_advisory_xact_lock(hashtextextended")],
 ["replay existing job",api.includes("replayed ? 200 : 202")],
 ["conflict mismatch",api.includes("return send(res, 409")],
 ["unique persistence",sql.includes("UNIQUE INDEX IF NOT EXISTS river_ai_jobs_idempotency_key_idx")],
 ["hash persistence",sql.includes("ADD COLUMN IF NOT EXISTS request_hash TEXT")]
];
for(const [name,ok] of checks){console.log((ok?"PASS ":"FAIL ")+name);if(!ok)process.exitCode=1;}
