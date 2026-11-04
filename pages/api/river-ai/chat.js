import { createClient } from "@supabase/supabase-js";

const MODEL_DEFAULT = "openai/gpt-oss-20b";
const MAX_AGENTS = 10;
const MAX_MESSAGE_CHARS = 4000;
const MAX_HISTORY = 16;
const MAX_PARALLEL = 4;

const AGENTS = {
  nova: "Coordinatrice generale: scomponi il problema, assegna priorità, integra i risultati e dichiara le incertezze.",
  tech: "Ingegneria software e sistemi: architettura, codice, API, database, test e deployment.",
  design: "Design e creatività: UI/UX, identità visiva, immagini, video, storyboard e 3D.",
  robotics: "Robotica: sensori, attuatori, elettronica, firmware, simulazioni e sicurezza fisica.",
  science: "Scienza e calcolo: matematica, fisica, statistica, simulazioni e controlli dimensionali.",
  memory: "Gestione della conoscenza: organizza requisiti, decisioni, versioni e informazioni fornite.",
  control: "Sicurezza e qualità: threat modeling, vulnerabilità, privacy, casi limite e verifiche.",
  business: "Strategia d'impresa: vendite, margini, costi, ricavi, clienti e scenari operativi.",
  finance: "Analisi finanziaria: flussi di cassa, budget, rischio, diversificazione e scenari. Non impartire ordini d'investimento.",
  markets: "Ricerca mercati e token: fondamentali, liquidità, volatilità, tokenomics e rischi. Non inventare dati live né promettere rendimenti.",
  payments: "Architettura dei pagamenti: checkout, PSP, bonifici, carte, wallet, rimborsi, riconciliazione, frodi e chargeback. Progetta flussi e controlli, ma non inviare pagamenti né movimentare fondi."
};

const BASE_PROMPT = `Sei River AI ULTRA, la rete di intelligenze coordinata da Nova per l'ecosistema RiverSpend.
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

function chooseTeam(agent, requestedSize) {
  if (agent !== "team") return [normalizeAgent(agent)];
  const size = [2, 4, 8].includes(Number(requestedSize)) ? Number(requestedSize) : 4;
  const roster = ["tech", "design", "robotics", "science", "memory", "control", "business", "finance", "markets", "payments"];
  return roster.slice(0, Math.min(size, MAX_AGENTS));
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

  const { data: role, error: roleError } = await adminClient
    .from("rs_admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (roleError || role?.role !== "admin") return json(res, 403, { error: "Area riservata all'amministratore." });

  const body = req.body || {};
  const messages = Array.isArray(body.messages) ? body.messages.slice(-MAX_HISTORY) : [];
  const safeMessages = messages
    .filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string")
    .map((item) => ({ role: item.role, content: item.content.slice(0, MAX_MESSAGE_CHARS) }));
  if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
    return json(res, 400, { error: "Scrivi prima una richiesta." });
  }

  const agent = body.agent === "team" ? "team" : normalizeAgent(body.agent);
  const team = chooseTeam(agent, body.teamSize);
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
      .map((item) => "[" + (item.category || "nota") + "] " + (item.title || "") + ": " + (item.content || "").slice(0, 900))
      .join("\n")
      .slice(0, 9000);

    const latestPrompt = safeMessages[safeMessages.length - 1].content;
    let answer;
    let agentsUsed = team;

    if (agent === "team") {
      const reports = await runWithLimit(team, MAX_PARALLEL, async (specialist) => {
        const report = await callModel(groqKey, model, [
          { role: "system", content: BASE_PROMPT + "\nRUOLO SPECIALISTA: " + AGENTS[specialist] + "\nFornisci analisi indipendente, ipotesi, rischi e verifiche. Se mancano dati, dichiaralo." },
          ...(memoryContext ? [{ role: "system", content: "CONTESTO PRIVATO RIVERSPEND:\n" + memoryContext }] : []),
          ...safeMessages
        ], 650);
        return { specialist, report };
      });
      const synthesis = await callModel(groqKey, model, [
        { role: "system", content: BASE_PROMPT + "\nSei NOVA, coordinatrice. Confronta i rapporti, risolvi le contraddizioni senza nasconderle e restituisci decisione, piano, rischi e verifiche." },
        { role: "user", content: "RICHIESTA:\n" + latestPrompt + "\n\nRAPPORTI SPECIALISTI:\n" + reports.map((item) => "AGENTE " + item.specialist.toUpperCase() + ":\n" + item.report).join("\n\n") }
      ], 1500);
      answer = synthesis;
      agentsUsed = ["nova", ...team];
    } else {
      answer = await callModel(groqKey, model, [
        { role: "system", content: BASE_PROMPT + "\nRUOLO ATTIVO: " + AGENTS[agent] },
        ...(memoryContext ? [{ role: "system", content: "MEMORIA PRIVATA RIVER AI:\n" + memoryContext }] : []),
        ...safeMessages
      ], 1500);
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
      teamSize: agent === "team" ? team.length : 1,
      memorySaved: !memoryWriteError,
      limits: { maxAgents: MAX_AGENTS, maxParallel: MAX_PARALLEL }
    });
  } catch (error) {
    console.error("River AI request failed:", error?.message || "unknown");
    if (error?.status === 429) return json(res, 429, { error: "Limite temporaneo del servizio AI raggiunto. Riprova più tardi." });
    if (error?.name === "AbortError") return json(res, 504, { error: "La richiesta ha superato il tempo massimo. Riprova con una richiesta più breve." });
    return json(res, 502, { error: "Servizio AI temporaneamente non disponibile. La richiesta può essere ripetuta." });
  }
}
