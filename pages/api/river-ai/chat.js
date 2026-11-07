import { createClient } from "@supabase/supabase-js";
import { AGENTS_REGISTRY } from "../../../lib/riverSSAI/agentsRegistry";
import { routeToSpecialists, selectTeam } from "../../../lib/riverSSAI/router";

const MODEL_DEFAULT = "openai/gpt-oss-20b";
const MAX_AGENTS = Object.keys(AGENTS_REGISTRY).length;
const MAX_MESSAGE_CHARS = 4000;
const MAX_HISTORY = 16;
const MAX_PARALLEL = 2; // limita i picchi di richieste al provider

const AGENTS = Object.fromEntries(Object.entries(AGENTS_REGISTRY).map(([key, agent]) => [key, agent.prompt]));

const BASE_PROMPT = `Sei RiverSSAI 10.0, la rete di intelligenze coordinata da Nova per l'ecosistema RiverSpend. Nova opera come coordinatrice strategica: seleziona competenze pertinenti, confronta analisi e rende espliciti priorità, dipendenze e criteri di verifica.
Parla in italiano, con tono chiaro, concreto e comprensibile. Il proprietario non è uno sviluppatore.
RiverSpend comprende RiverSpendShop, Market, Pay, Shield, Box, Fidelity, Oracle, Experience, Recovery, Park, TV, Ecology, Fortress e RiverSpaceSignals.
Gli agenti sono istanze coordinate dello stesso servizio AI, non copie autonome coscienti. Il numero di agenti è limitato dalle risorse, dai limiti del provider e dai costi.
Distingui sempre fatti verificati, ipotesi e proposte. Non affermare di aver navigato, eseguito calcoli esterni, modificato sistemi o controllato dati live se non è avvenuto.
Non promettere sicurezza impenetrabile, capacità illimitata o previsioni certe. Progetta difesa a livelli, monitoraggio, backup, test e risposta agli incidenti.
Per mercati e token usa scenari probabilistici, dati con data e fonte quando disponibili, rischi e possibili perdite. Non garantire profitti e non eseguire investimenti o transazioni.
Non chiedere password, chiavi API o codici. Non esporre segreti o dati di altri utenti.
Nessuna azione irreversibile, modifica a pagamenti, trasferimento di fondi, investimento, pubblicazione o cancellazione senza approvazione esplicita dell'amministratore.
Quando i dati non bastano, dillo e indica cosa occorre verificare.`;

function json(res, status, body) {
  return res.status(status).json(body);
}

function normalizeAgent(value) {
  return Object.prototype.hasOwnProperty.call(AGENTS, value) ? value : "nova";
}

function chooseTeam(agent, requestedSize, prompt = "") {
  if (agent !== "team") return [normalizeAgent(agent)];
  return selectTeam(requestedSize, prompt);
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
  if (!supabaseUrl || !serviceKey || !groqKey) {
    return json(res, 503, { error: "Configurazione River AI incompleta. Controllare le variabili server." });
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
    .map((item) => ({ role: item.role, content: item.content.slice(0, MAX_MESSAGE_CHARS) }));
  if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
    return json(res, 400, { error: "Scrivi prima una richiesta." });
  }

  const agent = body.agent === "team" ? "team" : normalizeAgent(body.agent);
  const team = chooseTeam(agent, body.teamSize, safeMessages[safeMessages.length - 1].content);
  const model = process.env.RIVER_AI_MODEL || MODEL_DEFAULT;

  try {
    const { data: memories, error: memoryReadError } = await adminClient
      .from("river_ai_memories")
      .select("title,content,category,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(12);
    if (memoryReadError) console.error("River AI memory read failed:", memoryReadError.message);
    const memoryContext = (memories || [])
      .map((item) => "[" + (item.category || "nota") + "] " + (item.title || "") + ": " + (item.content || "").slice(0, 350))
      .join("\n")
      .slice(0, 2600);

    const latestPrompt = safeMessages[safeMessages.length - 1].content;
    let answer;
    let agentsUsed = team;

    if (agent === "team") {
      // La Squadra usa un contesto compatto per rispettare il limite TPM del provider.
      const teamHistory = safeMessages.slice(-4);
      const teamMemory = memoryContext.slice(0, 900);
      const reports = await runWithLimit(team, MAX_PARALLEL, async (specialist) => {
        const report = await callModel(groqKey, model, [
          { role: "system", content: BASE_PROMPT + "\nRUOLO SPECIALISTA: " + AGENTS[specialist] + "\nFornisci un rapporto sintetico: priorità, un rischio e verifica essenziale." },
          ...(teamMemory ? [{ role: "system", content: "CONTESTO PRIVATO RIVERSPEND (sintesi):\n" + teamMemory }] : []),
          ...teamHistory
        ], 300);
        return { specialist, report };
      });
      const synthesis = await callModel(groqKey, model, [
        { role: "system", content: BASE_PROMPT + "\nSei NOVA, coordinatrice. Confronta i rapporti, risolvi le contraddizioni senza nasconderle e restituisci decisione, piano, rischi e verifiche." },
        { role: "user", content: "RICHIESTA:\n" + latestPrompt + "\n\nRAPPORTI SPECIALISTI:\n" + reports.map((item) => "AGENTE " + item.specialist.toUpperCase() + ":\n" + item.report).join("\n\n") }
      ], 900);
      answer = synthesis;
      agentsUsed = ["nova", ...team];
    } else {
      // Nova attiva al massimo due competenze pertinenti senza chiamate AI aggiuntive.
      const autoSpecialists = agent === "nova" ? routeToSpecialists(latestPrompt, 2) : [];
      const specialistContext = autoSpecialists.length
        ? "\nCOMPETENZE SPECIALISTICHE ATTIVATE DA NOVA:\n" +
          autoSpecialists.map((key) => AGENTS_REGISTRY[key].name + ": " + AGENTS[key]).join("\n") +
          "\nIntegra queste competenze nella risposta, mantenendo Nova responsabile della sintesi."
        : "";
      const coordinatorContext = agent === "nova"
        ? "\nSei Nova, coordinatrice centrale. Usa le competenze attivate come prospettive mirate; non dichiarare verifiche esterne non eseguite."
        : "\nRUOLO ATTIVO: " + AGENTS[agent];
      answer = await callModel(groqKey, model, [
        { role: "system", content: BASE_PROMPT + coordinatorContext + specialistContext },
        ...(memoryContext ? [{ role: "system", content: "MEMORIA PRIVATA RIVER AI:\n" + memoryContext }] : []),
        ...safeMessages
      ], 1500);
      agentsUsed = agent === "nova" ? ["nova", ...autoSpecialists] : [agent];
    }

    const memoryRows = [
      { user_id: user.id, title: "Messaggio utente", content: latestPrompt, category: "conversation", source: "river-ai-chat", importance: 3 },
      { user_id: user.id, title: "Risposta River AI", content: answer.slice(0, 6000), category: "conversation", source: "river-ai-chat", importance: 2 }
    ];
    const { error: memoryWriteError } = await adminClient.from("river_ai_memories").insert(memoryRows);
    if (memoryWriteError) console.error("River AI memory write failed:", memoryWriteError.message);

    return json(res, 200, {
      answer,
      model,
      agent,
      agentsUsed,
      teamSize: agent === "team" ? team.length : (agent === "nova" ? Math.max(1, agentsUsed.length - 1) : 1),
      memorySaved: !memoryWriteError,
      limits: { maxAgents: MAX_AGENTS, maxParallel: MAX_PARALLEL }
    });
  } catch (error) {
    console.error("River AI request failed:", error?.message || "unknown");
    if (error?.status === 429) {
      const waitMatch = String(error?.message || "").match(/try again in ([0-9.]+)s/i);
      const waitSeconds = waitMatch ? Math.ceil(Number(waitMatch[1])) : 20;
      res.setHeader("Retry-After", String(waitSeconds));
      return json(res, 429, { error: "Il servizio AI sta raggiungendo il limite di richieste. Attendi circa " + waitSeconds + " secondi e riprova. La Squadra non ha completato l'analisi." });
    }
    if (error?.name === "AbortError") return json(res, 504, { error: "La richiesta ha superato il tempo massimo. Riprova con una richiesta più breve." });
    return json(res, 502, { error: "Servizio AI temporaneamente non disponibile. La richiesta può essere ripetuta." });
  }
}
