import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { AGENTS_REGISTRY, AGENT_SQUADS, getAgentPrompt } from "../lib/riverSSAI/agentsRegistry.mjs";
import { selectTeam } from "../lib/riverSSAI/router.mjs";

const { Pool } = pg;
const PORT = Number(process.env.PORT || 8787);
const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_TOKEN = process.env.RIVER_AI_ADMIN_TOKEN || "";
const MODEL_URL = process.env.RIVER_AI_LOCAL_URL || "http://127.0.0.1:11434/v1/chat/completions";
const MODEL = process.env.RIVER_AI_LOCAL_MODEL || "qwen2.5:7b";
const MAX_BODY = 24 * 1024;
const MAX_MESSAGE = 4000;
const MAX_HISTORY = 12;
const MAX_TEAM_SPECIALISTS = 30;
const MAX_PARALLEL = Math.max(1, Math.min(2, Number(process.env.RIVER_AI_MAX_PARALLEL || 1)));
const RATE_LIMIT = Math.max(1, Number(process.env.RIVER_AI_MAX_REQUESTS_PER_MINUTE || 20));
const ALLOWED_TEAM_SIZES = [2, 4, 8, 10, 20, 30];
const hits = new Map();

if (!DATABASE_URL || ADMIN_TOKEN.length < 32) {
  throw new Error("DATABASE_URL and a RIVER_AI_ADMIN_TOKEN of at least 32 characters are required.");
}
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: true } : undefined
});

const schemaPath = path.resolve("infra/river-ai/schema.sql");
await pool.query(fs.readFileSync(schemaPath, "utf8"));

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
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
async function callLocalModel(messages, maxTokens = 900) {
  const response = await fetch(MODEL_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.25, max_tokens: maxTokens }),
    signal: AbortSignal.timeout(90000)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error("LOCAL_MODEL_ERROR");
    error.status = response.status;
    throw error;
  }
  const answer = result?.choices?.[0]?.message?.content;
  if (typeof answer !== "string" || !answer.trim()) throw new Error("EMPTY_MODEL_RESPONSE");
  return answer.trim();
}
async function runWithLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function runner() {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runner));
  return results;
}

const SYSTEM = `Sei RiverSSAI 10.0: Nova coordina una rete di 90 ruoli registrati, con 89 specialisti organizzati in 10 squadre. Gli specialisti sono ruoli eseguiti dal modello locale, non 90 intelligenze coscienti o processi sempre attivi.
Rispondi in italiano, in modo concreto e verificabile. Distingui fatti, ipotesi e proposte. Non dichiarare di aver eseguito operazioni che non hai eseguito. Non eseguire pagamenti, trasferimenti, pubblicazioni o cancellazioni. Non rivelare segreti. Non promettere sicurezza assoluta. Le azioni commerciali richiedono approvazione umana esplicita.`;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  if (req.method === "GET" && url.pathname === "/health") {
    try {
      await pool.query("SELECT 1");
      return send(res, 200, {
        ok: true,
        service: "RiverSSAI Independent Core",
        database: "connected",
        provider: "local-configured",
        model: MODEL,
        registeredRoles: Object.keys(AGENTS_REGISTRY).length,
        squads: Object.keys(AGENT_SQUADS).length
      });
    } catch {
      return send(res, 503, { ok: false, service: "RiverSSAI Independent Core", database: "unavailable" });
    }
  }

  if (!["POST", "GET"].includes(req.method) || !["/v1/chat", "/v1/memories", "/v1/agents"].includes(url.pathname)) {
    return send(res, 404, { error: "Not found" });
  }
  if (!authorized(req)) return send(res, 401, { error: "Accesso amministratore non valido." });
  if (rateLimited(req)) return send(res, 429, { error: "Limite temporaneo raggiunto. Riprova tra un minuto." });

  if (req.method === "GET" && url.pathname === "/v1/agents") {
    return send(res, 200, {
      totalRoles: Object.keys(AGENTS_REGISTRY).length,
      squads: AGENT_SQUADS,
      maxSpecialistsPerRequest: MAX_TEAM_SPECIALISTS,
      allowedTeamSizes: ALLOWED_TEAM_SIZES
    });
  }
  if (req.method !== "POST") return send(res, 405, { error: "Metodo non consentito." });

  try {
    const body = await readBody(req);
    if (url.pathname === "/v1/memories") {
      const title = String(body.title || "").slice(0, 160).trim();
      const content = String(body.content || "").slice(0, 4000).trim();
      const category = String(body.category || "note").slice(0, 40);
      if (!title || !content) return send(res, 400, { error: "Titolo e contenuto sono obbligatori." });
      const result = await pool.query(
        "INSERT INTO river_ai_memories(title,content,category) VALUES($1,$2,$3) RETURNING id,created_at",
        [title, content, category]
      );
      await pool.query(
        "INSERT INTO river_ai_audit(action,status,details) VALUES($1,$2,$3)",
        ["memory.write", "success", { id: result.rows[0].id }]
      );
      return send(res, 201, { memory: result.rows[0] });
    }

    const messages = Array.isArray(body.messages) ? body.messages.slice(-MAX_HISTORY) : [];
    const safe = messages
      .filter((m) => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE) }));
    if (!safe.length || safe[safe.length - 1].role !== "user") {
      return send(res, 400, { error: "Inserisci un messaggio." });
    }

    const latestPrompt = safe[safe.length - 1].content;
    const requestedAgent = String(body.agent || "nova");
    const isTeam = requestedAgent === "team";
    if (!isTeam && !Object.prototype.hasOwnProperty.call(AGENTS_REGISTRY, requestedAgent)) {
      return send(res, 400, { error: "Specialista non riconosciuto." });
    }
    if (isTeam && !ALLOWED_TEAM_SIZES.includes(Number(body.teamSize || 4))) {
      return send(res, 400, { error: "Dimensione squadra non valida. Valori ammessi: 2, 4, 8, 10, 20 o 30." });
    }

    const memoryResult = await pool.query(
      "SELECT title,content,category FROM river_ai_memories WHERE owner_id='owner' ORDER BY created_at DESC LIMIT 8"
    );
    const memoryText = memoryResult.rows
      .map((m) => "[" + m.category + "] " + m.title + ": " + m.content.slice(0, 300))
      .join("\n")
      .slice(0, 1800);
    const memoryContext = memoryText ? "\nMemoria privata:\n" + memoryText : "";

    let answer;
    let agentsUsed;
    if (isTeam) {
      const team = selectTeam(Number(body.teamSize || 4), latestPrompt)
        .filter((key) => key !== "general_assistant")
        .slice(0, MAX_TEAM_SPECIALISTS);
      if (!team.length) {
        answer = await callLocalModel([
          { role: "system", content: SYSTEM + memoryContext + "\nRUOLO: " + getAgentPrompt("nova") },
          ...safe
        ], 1100);
        agentsUsed = ["nova"];
      } else {
        const reports = await runWithLimit(team, MAX_PARALLEL, async (specialist) => {
          const report = await callLocalModel([
            { role: "system", content: SYSTEM + "\nRUOLO SPECIALISTA: " + getAgentPrompt(specialist) + "\nFornisci un contributo breve: analisi, un rischio e una verifica." },
            ...(memoryContext ? [{ role: "system", content: memoryContext }] : []),
            { role: "user", content: latestPrompt }
          ], 280);
          return { specialist, report };
        });
        answer = await callLocalModel([
          { role: "system", content: SYSTEM + "\nSei NOVA, coordinatrice. Integra i contributi, segnala divergenze e restituisci decisione, piano, rischi e verifiche." },
          { role: "user", content: "RICHIESTA:\n" + latestPrompt + "\n\nCONTRIBUTI SPECIALISTI:\n" + reports.map((item) => item.specialist + ":\n" + item.report).join("\n\n") }
        ], 1200);
        agentsUsed = ["nova", ...team];
      }
    } else {
      answer = await callLocalModel([
        { role: "system", content: SYSTEM + memoryContext + "\nRUOLO ATTIVO: " + getAgentPrompt(requestedAgent) },
        ...safe
      ], 1200);
      agentsUsed = [requestedAgent];
    }

    const last = safe[safe.length - 1].content;
    await pool.query(
      "INSERT INTO river_ai_memories(title,content,category,source) VALUES($1,$2,$3,$4),($5,$6,$7,$8)",
      ["Messaggio utente", last, "conversation", "river-ai-chat", "Risposta Nova", answer.slice(0, 4000), "conversation", "river-ai-chat"]
    );
    await pool.query(
      "INSERT INTO river_ai_audit(action,status,details) VALUES($1,$2,$3)",
      ["chat", "success", { model: MODEL, agentsUsed }]
    );
    return send(res, 200, {
      answer,
      provider: "local",
      model: MODEL,
      agent: isTeam ? "team" : requestedAgent,
      agentsUsed,
      teamSize: isTeam ? Math.max(0, agentsUsed.length - 1) : 1,
      memory: "saved",
      maxParallel: MAX_PARALLEL
    });
  } catch (error) {
    if (error.message === "BODY_TOO_LARGE") return send(res, 413, { error: "Richiesta troppo grande." });
    if (error instanceof SyntaxError) return send(res, 400, { error: "JSON non valido." });
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      return send(res, 504, { error: "Il modello locale ha superato il tempo massimo." });
    }
    if (error?.message === "LOCAL_MODEL_ERROR" || error?.message === "EMPTY_MODEL_RESPONSE") {
      await pool.query(
        "INSERT INTO river_ai_audit(action,status,details) VALUES($1,$2,$3)",
        ["chat", "local_model_error", { status: error.status || null }]
      ).catch(() => {});
      return send(res, 502, { error: "Il modello AI locale non è disponibile o ha restituito una risposta vuota. Verifica Ollama e il modello installato." });
    }
    console.error("RiverSSAI standalone error:", error.message);
    return send(res, 500, { error: "Errore interno RiverSSAI." });
  }
});

server.listen(PORT, "0.0.0.0", () => console.log("RiverSSAI Independent Core listening on " + PORT));
