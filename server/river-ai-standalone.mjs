import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;
const PORT = Number(process.env.PORT || 8787);
const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_TOKEN = process.env.RIVER_AI_ADMIN_TOKEN || "";
const MODEL_URL = process.env.RIVER_AI_LOCAL_URL || "http://127.0.0.1:11434/v1/chat/completions";
const MODEL = process.env.RIVER_AI_LOCAL_MODEL || "qwen2.5:7b";
const MAX_BODY = 24 * 1024;
const MAX_MESSAGE = 4000;
const MAX_HISTORY = 12;
const RATE_LIMIT = Number(process.env.RIVER_AI_MAX_REQUESTS_PER_MINUTE || 20);
const hits = new Map();

if (!DATABASE_URL || ADMIN_TOKEN.length < 32) {
  throw new Error("DATABASE_URL and a RIVER_AI_ADMIN_TOKEN of at least 32 characters are required.");
}
const pool = new Pool({ connectionString: DATABASE_URL, max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000, ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: true } : undefined });

const schemaPath = path.resolve("infra/river-ai/schema.sql");
await pool.query(fs.readFileSync(schemaPath, "utf8"));

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(payload), "cache-control": "no-store", "x-content-type-options": "nosniff" });
  res.end(payload);
}
function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
function authorized(req) {
  const value = req.headers.authorization || "";
  return value.startsWith("Bearer ") && safeEqual(value.slice(7), ADMIN_TOKEN);
}
function rateLimited(req) {
  const ip = req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}
async function readBody(req) {
  let data = "";
  for await (const chunk of req) {
    data += chunk;
    if (Buffer.byteLength(data) > MAX_BODY) throw new Error("BODY_TOO_LARGE");
  }
  return data ? JSON.parse(data) : {};
}
const SYSTEM = `Sei RiverSSAI 10.0, Nova, l'intelligenza coordinatrice di RiverSpend. Rispondi in italiano, in modo concreto e verificabile. Distingui fatti, ipotesi e proposte. Non dichiarare di aver eseguito operazioni che non hai eseguito. Non eseguire pagamenti, trasferimenti, pubblicazioni o cancellazioni. Non rivelare segreti. Non promettere sicurezza assoluta. Le azioni commerciali richiedono approvazione umana esplicita.`;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  if (req.method === "GET" && url.pathname === "/health") {
    try {
      await pool.query("SELECT 1");
      return send(res, 200, { ok: true, service: "RiverSSAI Independent Core", database: "connected", provider: "local-configured", model: MODEL });
    } catch {
      return send(res, 503, { ok: false, service: "RiverSSAI Independent Core", database: "unavailable" });
    }
  }
  if (!["POST"].includes(req.method) || !["/v1/chat", "/v1/memories"].includes(url.pathname)) {
    return send(res, 404, { error: "Not found" });
  }
  if (!authorized(req)) return send(res, 401, { error: "Accesso amministratore non valido." });
  if (rateLimited(req)) return send(res, 429, { error: "Limite temporaneo raggiunto. Riprova tra un minuto." });
  try {
    const body = await readBody(req);
    if (url.pathname === "/v1/memories") {
      const title = String(body.title || "").slice(0, 160).trim();
      const content = String(body.content || "").slice(0, 4000).trim();
      const category = String(body.category || "note").slice(0, 40);
      if (!title || !content) return send(res, 400, { error: "Titolo e contenuto sono obbligatori." });
      const result = await pool.query("INSERT INTO river_ai_memories(title,content,category) VALUES($1,$2,$3) RETURNING id,created_at", [title, content, category]);
      await pool.query("INSERT INTO river_ai_audit(action,status,details) VALUES($1,$2,$3)", ["memory.write", "success", { id: result.rows[0].id }]);
      return send(res, 201, { memory: result.rows[0] });
    }
    const messages = Array.isArray(body.messages) ? body.messages.slice(-MAX_HISTORY) : [];
    const safe = messages.filter(m => m && ["user","assistant"].includes(m.role) && typeof m.content === "string")
      .map(m => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE) }));
    if (!safe.length || safe[safe.length - 1].role !== "user") return send(res, 400, { error: "Inserisci un messaggio." });
    const memoryResult = await pool.query("SELECT title,content,category FROM river_ai_memories WHERE owner_id='owner' ORDER BY created_at DESC LIMIT 8");
    const memoryText = memoryResult.rows.map(m => "[" + m.category + "] " + m.title + ": " + m.content.slice(0,300)).join("\n").slice(0,1800);
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages: [{ role: "system", content: SYSTEM + (memoryText ? "\nMemoria privata:\n" + memoryText : "") }, ...safe], temperature: 0.25, max_tokens: 1000 }),
      signal: AbortSignal.timeout(90000)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      await pool.query("INSERT INTO river_ai_audit(action,status,details) VALUES($1,$2,$3)", ["chat", "provider_error", { status: response.status }]);
      return send(res, 502, { error: "Il modello AI locale non è disponibile. Verifica che Ollama sia avviato e che il modello sia installato." });
    }
    const answer = result?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) return send(res, 502, { error: "Il modello locale ha restituito una risposta vuota." });
    const last = safe[safe.length - 1].content;
    await pool.query("INSERT INTO river_ai_memories(title,content,category,source) VALUES($1,$2,$3,$4),($5,$6,$7,$8)", ["Messaggio utente", last, "conversation", "river-ai-chat", "Risposta Nova", answer.slice(0,4000), "conversation", "river-ai-chat"]);
    await pool.query("INSERT INTO river_ai_audit(action,status,details) VALUES($1,$2,$3)", ["chat", "success", { model: MODEL }]);
    return send(res, 200, { answer: answer.trim(), provider: "local", model: MODEL, memory: "saved" });
  } catch (error) {
    if (error.message === "BODY_TOO_LARGE") return send(res, 413, { error: "Richiesta troppo grande." });
    if (error instanceof SyntaxError) return send(res, 400, { error: "JSON non valido." });
    console.error("RiverSSAI standalone error:", error.message);
    return send(res, 500, { error: "Errore interno RiverSSAI." });
  }
});
server.listen(PORT, "0.0.0.0", () => console.log("RiverSSAI Independent Core listening on " + PORT));
