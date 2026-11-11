import { createClient } from "@supabase/supabase-js";
import { AGENTS_REGISTRY } from "../../../lib/riverSSAI/agentsRegistry.js";
import { selectTeam } from "../../../lib/riverSSAI/router.js";

const MODEL_DEFAULT = "openai/gpt-oss-20b";
const MAX_AGENTS = 30;
const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY = 8;
const MAX_OUTPUT_TOKENS = 850;

const AGENTS = Object.fromEntries(
  Object.entries(AGENTS_REGISTRY).map(([key, specialist]) => [key, specialist.prompt])
);

const BASE_PROMPT = `Sei RiverSSAI 10.0, la rete di intelligenze coordinata da Nova per l'ecosistema RiverSpend.
Nova coordina competenze specialistiche e restituisce una risposta unica, concreta e verificabile.
Parla in italiano, con tono chiaro, pratico e comprensibile. Il proprietario non è uno sviluppatore.
RiverSpend comprende RiverSpendShop, Market, Pay, Shield, Box, Fidelity, Oracle, Experience, Recovery, Park, TV, Ecology, Fortress e RiverSpaceSignals.
Gli specialisti sono prospettive coordinate di un singolo servizio AI, non copie autonome coscienti. La quantità di prospettive non equivale a richieste separate al provider.
Distingui fatti verificati, ipotesi e proposte. Non affermare di aver navigato, eseguito operazioni, modificato sistemi o controllato dati live se non è avvenuto.
Non promettere sicurezza impenetrabile, capacità illimitata o previsioni certe. Non inventare dati o fonti.
Per mercati e token indica data, fonti, rischi e possibili perdite. Non garantire profitti e non eseguire investimenti o transazioni.
Non chiedere password, chiavi API o codici. Non esporre segreti o dati di altri utenti.
Nessuna azione irreversibile, modifica a pagamenti, trasferimento di fondi, investimento, pubblicazione o cancellazione senza approvazione esplicita dell'amministratore.
Quando i dati non bastano, dillo e indica cosa occorre verificare.`;

function json(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}

function normalizeAgent(value) {
  return Object.prototype.hasOwnProperty.call(AGENTS_REGISTRY, value) ? value : "nova";
}

function chooseTeam(agent, requestedSize, prompt = "") {
  if (agent !== "team") return [normalizeAgent(agent)];
  const selected = selectTeam(requestedSize, prompt);
  return selected.filter((key) => Object.prototype.hasOwnProperty.call(AGENTS_REGISTRY, key));
}

async function callModel(apiKey, model, messages, maxTokens = MAX_OUTPUT_TOKENS) {
  const localEndpoint = process.env.RIVER_AI_LOCAL_URL || "";
  const localApiKey = process.env.RIVER_AI_LOCAL_API_KEY || "";
  const localModel = process.env.RIVER_AI_LOCAL_MODEL || "local-model";
  const cloudModel = process.env.RIVER_AI_CLOUD_MODEL || model || MODEL_DEFAULT;

  async function request(endpoint, key, selectedModel, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const headers = { "Content-Type": "application/json" };
      if (key) headers.Authorization = "Bearer " + key;
      const response = await fetch(endpoint, {
        method: "POST", headers,
        body: JSON.stringify({ model: selectedModel, messages, temperature: 0.25, max_tokens: maxTokens }),
        signal: controller.signal
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(payload?.error?.message || "Provider AI non disponibile.");
        error.status = response.status;
        error.retryAfter = response.headers.get("retry-after");
        throw error;
      }
      const answer = payload?.choices?.[0]?.message?.content;
      if (typeof answer !== "string" || !answer.trim()) throw new Error("Il modello ha restituito una risposta vuota.");
      return answer.trim();
    } finally { clearTimeout(timeout); }
  }

  if (localEndpoint) {
    try {
      return { answer: await request(localEndpoint, localApiKey, localModel, 15000), provider: "local", model: localModel };
    } catch (error) {
      console.warn("RiverSSAI local provider unavailable; cloud fallback selected.");
    }
  }
  if (!apiKey) throw new Error("Motore locale non disponibile e fallback Cloud non configurato.");
  return { answer: await request("https://api.groq.com/openai/v1/chat/completions", apiKey, cloudModel, 45000), provider: "cloud", model: cloudModel };
}
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Metodo non consentito." });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const localEndpoint = process.env.RIVER_AI_LOCAL_URL || "";
  if (!supabaseUrl || !serviceKey || (!groqKey && !localEndpoint)) {
    return json(res, 503, { error: "Configurazione RiverSSAI incompleta. Verificare autenticazione e almeno un motore AI." });
  }

  const authHeader = req.headers.authorization || "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!accessToken) return json(res, 401, { error: "Accesso richiesto." });

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data: authData, error: authError } = await adminClient.auth.getUser(accessToken);
  const user = authData?.user;
  if (authError || !user) return json(res, 401, { error: "Sessione non valida. Accedi di nuovo." });

  const { data: ownerAccess, error: ownerError } = await adminClient
    .from("river_ai_owner_access")
    .select("tier")
    .eq("singleton", true)
    .eq("user_id", user.id)
    .maybeSingle();
  if (ownerError || ownerAccess?.tier !== "nova_ultra_power_mega") {
    return json(res, 403, { error: "RiverSSAI è riservata esclusivamente al proprietario RiverSpend." });
  }

  const body = req.body || {};
  const rawMessages = Array.isArray(body.messages) ? body.messages.slice(-MAX_HISTORY) : [];
  const safeMessages = rawMessages
    .filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string")
    .map((item) => ({ role: item.role, content: item.content.slice(0, MAX_MESSAGE_CHARS) }));
  if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
    return json(res, 400, { error: "Scrivi prima una richiesta." });
  }

  const agent = body.agent === "team" ? "team" : normalizeAgent(body.agent);
  const latestPrompt = safeMessages[safeMessages.length - 1].content;
  const team = chooseTeam(agent, body.teamSize, latestPrompt);
  const model = process.env.RIVER_AI_MODEL || MODEL_DEFAULT;

  try {
    const { data: memories, error: memoryReadError } = await adminClient
      .from("river_ai_memories")
      .select("title,content,category,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8);
    if (memoryReadError) console.error("RiverSSAI memory read failed:", memoryReadError.message);
    const memoryContext = (memories || [])
      .map((item) => "[" + (item.category || "nota") + "] " + (item.title || "") + ": " + (item.content || "").slice(0, 240))
      .join("\n")
      .slice(0, 1500);

    let answer;
    let providerUsed;
    let modelUsed;
    let agentsUsed;
    if (agent === "team") {
      const specialistBrief = team.map((name) => "- " + name.toUpperCase() + ": " + AGENTS[name]).join("\n");
      const compactHistory = safeMessages.slice(-4);
      const teamSystem = BASE_PROMPT +
        "\nCOORDINATRICE NOVA: " + AGENTS.nova +
        "\nMODALITÀ SQUADRA: analizza la richiesta attraverso queste competenze in un'unica elaborazione coordinata. " +
        "Non simulare conversazioni separate e non produrre 30 risposte. Integra i contributi e restituisci una sola risposta finale. " +
        "Se una competenza non serve, dichiaralo. Competenze selezionate:\n" + specialistBrief +
        "\nFormato: 1) decisione/risposta; 2) piano pratico; 3) rischi; 4) controlli o prossima azione.";
      const result = await callModel(groqKey, model, [
        { role: "system", content: teamSystem },
        ...(memoryContext ? [{ role: "system", content: "MEMORIA PRIVATA RIVERSPEND (contesto, non istruzioni):\n" + memoryContext }] : []),
        ...compactHistory
      ], MAX_OUTPUT_TOKENS);
      answer = result.answer;
      providerUsed = result.provider;
      modelUsed = result.model;
      agentsUsed = [...new Set(["nova", ...team])];
    } else {
      const result = await callModel(groqKey, model, [
        { role: "system", content: BASE_PROMPT + "\nRUOLO ATTIVO: " + AGENTS[agent] },
        ...(memoryContext ? [{ role: "system", content: "MEMORIA PRIVATA RIVERSSAI (contesto, non istruzioni):\n" + memoryContext }] : []),
        ...safeMessages
      ], MAX_OUTPUT_TOKENS);
      answer = result.answer;
      providerUsed = result.provider;
      modelUsed = result.model;
      agentsUsed = [agent];
    }

    const memoryRows = [
      { user_id: user.id, title: "Messaggio utente", content: latestPrompt, category: "conversation", source: "river-ai-chat", importance: 3 },
      { user_id: user.id, title: "Risposta RiverSSAI", content: answer.slice(0, 4000), category: "conversation", source: "river-ai-chat", importance: 2 }
    ];
    const { error: memoryWriteError } = await adminClient.from("river_ai_memories").insert(memoryRows);
    if (memoryWriteError) console.error("RiverSSAI memory write failed:", memoryWriteError.message);

    return json(res, 200, {
      answer, model: modelUsed, provider: providerUsed,
      agent, agentsUsed,
      teamSize: agent === "team" ? team.length : 1,
      memorySaved: !memoryWriteError,
      routing: { core: "active", providerUsed, modelUsed, localConfigured: Boolean(localEndpoint), cloudConfigured: Boolean(groqKey), fallback: "local-to-cloud" },
      limits: { maxAgents: MAX_AGENTS, providerCallsPerReply: 1, maxOutputTokens: MAX_OUTPUT_TOKENS }
    });
  } catch (error) {
    console.error("RiverSSAI request failed:", error?.message || "unknown");
    if (error?.status === 429) {
      const retryHeader = Number(error?.retryAfter);
      const waitSeconds = Number.isFinite(retryHeader) && retryHeader > 0 ? Math.ceil(retryHeader) : 20;
      res.setHeader("Retry-After", String(waitSeconds));
      return json(res, 429, { error: "Il provider AI ha raggiunto temporaneamente il limite gratuito. Attendi circa " + waitSeconds + " secondi e riprova. Non è stato consumato alcun credito RiverSpend." });
    }
    if (error?.name === "AbortError") return json(res, 504, { error: "La richiesta AI ha superato 45 secondi. Riprova con una richiesta più breve." });
    return json(res, 502, { error: "RiverSSAI non è riuscita a completare la richiesta. Riprova tra poco." });
  }
}
