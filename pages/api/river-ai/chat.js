import { createClient } from "@supabase/supabase-js";
import { AGENTS_REGISTRY, GENERAL_ASSISTANT } from "../../../lib/riverSSAI/agentsRegistry.mjs";
import { selectTeam } from "../../../lib/riverSSAI/router.mjs";

const MODEL_DEFAULT = "openai/gpt-oss-20b";
const MAX_AGENTS = 4; // limite operativo iniziale per il piano Groq attuale
const MAX_MESSAGE_CHARS = 4000;
const MAX_ATTACHMENT_CHARS = 8000;
const MAX_HISTORY = 16;

const AGENTS = Object.fromEntries(
  Object.entries(AGENTS_REGISTRY).map(([key, agent]) => [key, agent.prompt])
);
AGENTS.general_assistant = GENERAL_ASSISTANT.prompt;

const BASE_PROMPT = `Sei RiverSSAI 10.0, la rete di intelligenze coordinata da Nova per l'ecosistema RiverSpend. Nova opera come coordinatrice strategica: seleziona competenze pertinenti, confronta analisi e rende espliciti priorità, dipendenze e criteri di verifica.
Parla in italiano, con tono chiaro, concreto e comprensibile. Il proprietario non è uno sviluppatore.
RiverSpend comprende le applicazioni e i servizi dell'ecosistema RiverSpend. Il registro centrale contiene 90 ruoli organizzati in 10 squadre; Nova coordina e seleziona gli specialisti pertinenti.
Gli agenti sono istanze coordinate dello stesso servizio AI, non copie autonome coscienti. Il numero di agenti è limitato dalle risorse, dai limiti del provider e dai costi.
Distingui sempre fatti verificati, ipotesi e proposte. Non affermare di aver navigato, eseguito calcoli esterni, modificato sistemi o controllato dati live se non è avvenuto.
Non promettere sicurezza impenetrabile, capacità illimitata o previsioni certe. Progetta difesa a livelli, monitoraggio, backup, test e risposta agli incidenti.
Per mercati e token usa scenari probabilistici, dati con data e fonte quando disponibili, rischi e possibili perdite. Non garantire profitti e non eseguire investimenti o transazioni.
Non chiedere password, chiavi API o codici. Non esporre segreti o dati di altri utenti.
Nessuna azione irreversibile, modifica a pagamenti, trasferimento di fondi, investimento, pubblicazione o cancellazione senza approvazione esplicita dell'amministratore.
Quando i dati non bastano, dillo e indica cosa occorre verificare.
ISTRUZIONI OPERATIVE:
- Se la richiesta è sufficientemente chiara, esegui direttamente il compito. Non trasformare una richiesta operativa in un questionario o in un piano di test, a meno che l'utente chieda proprio un piano.
- Fai al massimo una domanda di chiarimento, solo quando manca un dato indispensabile. Se puoi procedere con un'ipotesi ragionevole, dichiarala e procedi.
- Se l'utente chiede un test, esegui le prove richieste nella risposta: mostra input, risultato e limiti. Non dire soltanto come potrebbe essere testato.
- Distingui sempre la capacità del modello linguistico dalle funzioni realmente collegate all'app. Non dichiarare che RiverSSAI genera immagini, video, audio, esegue ricerche live, usa strumenti esterni o modifica sistemi se l'integrazione corrispondente non è presente e non è stata eseguita.
- Per richieste di immagini o video, se il generatore non è collegato, dillo subito e offri al massimo la preparazione di un prompt o di uno storyboard; non simulare un file generato.
- Per i calcoli, mostra formule e passaggi controllabili, conserva la precisione durante i passaggi e arrotonda soltanto il risultato finale. Se il calcolo è finanziario, indica le ipotesi e distingui stima da preventivo.
- Non descrivere come memoria permanente la sola cronologia della chat. La cronologia locale dell'app, la memoria persistente del database e il contesto inviato al modello sono funzioni distinte. Non promettere recupero su un altro dispositivo o in una nuova sessione senza aver verificato che i dati siano salvati e recuperabili.
- Non inventare caratteristiche tecniche, servizi, modelli, fonti, risultati di test o stato dei progetti. Se non hai accesso a un'informazione, dichiaralo chiaramente.`;

function json(res, status, body) {
  return res.status(status).json(body);
}

function normalizeAgent(value) {
  return Object.prototype.hasOwnProperty.call(AGENTS, value) ? value : "nova";
}

function chooseTeam(agent, requestedSize, prompt = "") {
  if (agent !== "team") return [normalizeAgent(agent)];
  const requested = [2, 4, 8, 10, 20, 30].includes(Number(requestedSize)) ? Number(requestedSize) : 4;
  const size = Math.min(requested, MAX_AGENTS);
  const selected = selectTeam(size, prompt).filter((key) => Object.prototype.hasOwnProperty.call(AGENTS, key));
  return selected.length ? selected : ["general_assistant"];
}

async function callModel(apiKey, model, messages, maxTokens = 850) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.25,
        max_tokens: maxTokens
      }),
      signal: controller.signal
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload?.error?.message || "Provider AI non disponibile.");
      error.status = response.status;
      throw error;
    }
    const answer = payload?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) throw new Error("Il modello ha restituito una risposta vuota.");
    return answer.trim();
  } finally {
    clearTimeout(timeout);
  }
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Metodo non consentito." });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const provider = String(process.env.RIVER_AI_PROVIDER || "groq").toLowerCase();
  if (!supabaseUrl || !serviceKey || !["groq", "standalone"].includes(provider) || (provider === "groq" && !groqKey)) {
    return json(res, 503, { error: "Configurazione River AI incompleta. Controllare provider e variabili server." });
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
    return json(res, 403, { error: "Nova Ultra Power Mega è riservata esclusivamente al proprietario RiverSpend." });
  }

  const body = req.body || {};
  const messages = Array.isArray(body.messages) ? body.messages.slice(-MAX_HISTORY) : [];
  const safeMessages = messages
    .filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string")
    .map((item, index, all) => ({ role: item.role, content: item.content.slice(0, index === all.length - 1 && item.role === "user" ? MAX_ATTACHMENT_CHARS : MAX_MESSAGE_CHARS) }));
  if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
    return json(res, 400, { error: "Scrivi prima una richiesta." });
  }

  const agent = body.agent === "team" ? "team" : normalizeAgent(body.agent);
  const team = chooseTeam(agent, body.teamSize, safeMessages[safeMessages.length - 1].content);
  const model = process.env.RIVER_AI_MODEL || MODEL_DEFAULT;
  const thinkingMode = body.thinkingMode === "deep" ? "deep" : "standard";
  const responseTokens = thinkingMode === "deep" ? 1800 : 1100;
  const modeInstruction = thinkingMode === "deep" ? "\nMODALITÀ APPROFONDITA: analizza con attenzione, verifica presupposti, confronta alternative e restituisci conclusioni, passaggi, rischi e controlli. Non mostrare ragionamenti interni privati." : "";

  try {
    if (provider === "standalone") {
      const standaloneUrl = String(process.env.RIVER_AI_STANDALONE_URL || "").trim();
      const standaloneToken = String(process.env.RIVER_AI_ADMIN_TOKEN || "");
      if (!standaloneUrl || standaloneToken.length < 32) {
        return json(res, 503, { error: "RiverSSAI locale non configurato: mancano URL o token amministrativo server-side." });
      }
      let endpoint;
      try {
        endpoint = new URL(standaloneUrl);
      } catch {
        return json(res, 503, { error: "URL del runtime RiverSSAI non valido." });
      }
      const localDevelopment = process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(endpoint.hostname);
      if (endpoint.protocol !== "https:" && !localDevelopment) {
        return json(res, 503, { error: "Il runtime RiverSSAI deve essere raggiunto tramite HTTPS." });
      }
      endpoint.pathname = endpoint.pathname.replace(/\/$/, "") + "/v1/chat";
      endpoint.search = "";
      endpoint.hash = "";
      const standaloneMessages = safeMessages.slice(-8).map((item, index, all) => ({
        role: item.role,
        content: item.content.slice(0, index === all.length - 1 && item.role === "user" ? 4000 : 2400)
      }));
      const standaloneResponse = await fetch(endpoint.toString(), {
        method: "POST",
        headers: {
          Authorization: "Bearer " + standaloneToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          agent,
          teamSize: [2, 4, 8, 10, 20, 30].includes(Number(body.teamSize)) ? Number(body.teamSize) : 4,
          messages: standaloneMessages
        }),
        signal: AbortSignal.timeout(95000)
      });
      const standalonePayload = await standaloneResponse.json().catch(() => ({}));
      if (!standaloneResponse.ok) {
        console.error("RiverSSAI standalone returned", standaloneResponse.status);
        if (standaloneResponse.status === 429) {
          res.setHeader("Retry-After", "60");
          return json(res, 429, { code: "RIVER_AI_LOCAL_BUSY", error: "RiverSSAI locale è temporaneamente occupato. Riprova tra un minuto." });
        }
        return json(res, standaloneResponse.status >= 500 ? 503 : standaloneResponse.status, {
          error: standalonePayload?.error || "Il runtime RiverSSAI non ha completato la richiesta."
        });
      }
      if (typeof standalonePayload.answer !== "string" || !standalonePayload.answer.trim()) {
        return json(res, 502, { error: "Il runtime RiverSSAI ha restituito una risposta non valida." });
      }
      return json(res, 200, {
        answer: standalonePayload.answer,
        provider: "rivercloud-local",
        model: standalonePayload.model || "local",
        agent,
        agentsUsed: Array.isArray(standalonePayload.agentsUsed) ? standalonePayload.agentsUsed : [agent],
        teamSize: standalonePayload.teamSize || (agent === "team" ? body.teamSize || 4 : 1),
        memorySaved: false,
        memoryPolicy: "rivercloud-owner-memory",
        executionMode: standalonePayload.executionMode || (agent === "team" ? "local-coordinated-team" : "local-single-agent")
      });
    }

    const { data: memories, error: memoryReadError } = await adminClient
      .from("river_ai_memories")
      .select("title,content,category,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(12);
    if (memoryReadError) console.error("River AI memory read failed:", memoryReadError.message);
    const memoryContext = (memories || [])
      .map((item) => "[" + (item.category || "nota") + "] " + (item.title || "") + ": " + (item.content || "").slice(0, 120))
      .join("\n")
      .slice(0, 900);

    const latestPrompt = safeMessages[safeMessages.length - 1].content;
    let answer;
    let agentsUsed = team;

    if (agent === "team") {
      const specialistBrief = team
        .map((specialist) => "- " + specialist.toUpperCase() + ": " + AGENTS[specialist])
        .join("\n");
      answer = await callModel(groqKey, model, [
        {
          role: "system",
          content: BASE_PROMPT + modeInstruction
            + "\nSQUADRA ULTRA COORDINATA: usa le competenze dei seguenti specialisti in un'unica elaborazione del modello. Integra le prospettive in una risposta coerente; evidenzia eventuali disaccordi, incertezze, rischi e verifiche. Non dichiarare che siano stati eseguiti calcoli o controlli esterni se non lo sono stati.\n"
            + specialistBrief
        },
        ...(memoryContext ? [{ role: "system", content: "MEMORIA PRIVATA RIVER AI:\n" + memoryContext }] : []),
        ...safeMessages
      ], responseTokens);
      agentsUsed = ["nova", ...team];
    } else {
      answer = await callModel(groqKey, model, [
        { role: "system", content: BASE_PROMPT + modeInstruction + "\nRUOLO ATTIVO: " + AGENTS[agent] },
        ...(memoryContext ? [{ role: "system", content: "MEMORIA PRIVATA RIVER AI:\n" + memoryContext }] : []),
        ...safeMessages
      ], responseTokens);
    }

    // Chat history is not permanent memory. Durable memories must be saved explicitly.

    return json(res, 200, {
      answer,
      model,
      agent,
      agentsUsed,
      teamSize: agent === "team" ? team.length : 1,
      memorySaved: false,
      memoryPolicy: "explicit-only",
      limits: { maxAgents: MAX_AGENTS, providerCallsPerRequest: 1 },
      executionMode: agent === "team" ? "coordinated-single-call" : "single-agent"
    });
  } catch (error) {
    console.error("River AI request failed:", error?.message || "unknown");
    if (error?.status === 429) {
      const providerMessage = String(error?.message || "");
      const quotaExhausted = /tokens per day|requests per day|daily quota|quota giornaliera|limit reached/i.test(providerMessage);
      const waitMatch = providerMessage.match(/try again in ([0-9.]+)s/i);
      const waitSeconds = waitMatch ? Math.max(1, Math.ceil(Number(waitMatch[1]))) : null;
      if (waitSeconds) res.setHeader("Retry-After", String(waitSeconds));
      return json(res, 429, {
        code: quotaExhausted ? "PROVIDER_QUOTA_EXHAUSTED" : "PROVIDER_RATE_LIMIT",
        retryAfterSeconds: waitSeconds,
        error: quotaExhausted
          ? "La quota del servizio AI è temporaneamente esaurita. Non è un blocco del tuo account amministratore: serve attendere il ripristino della quota o configurare un provider di riserva."
          : "Il servizio AI sta ricevendo troppe richieste. La richiesta non è stata completata; riprova tra " + (waitSeconds ? waitSeconds + " secondi" : "qualche istante") + "."
      });
    }
    if (error?.name === "AbortError" || error?.name === "TimeoutError") return json(res, 504, { error: "La richiesta ha superato il tempo massimo. Riprova tra poco." });
    return json(res, 502, { error: "Servizio AI temporaneamente non disponibile. La richiesta può essere ripetuta." });
  }
}
