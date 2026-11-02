import { createClient } from "@supabase/supabase-js";

const AGENTS = {
  nova: "Sei NOVA, coordinatrice CEO. Comprendi l'obiettivo, suddividilo in attività, coordina gli specialisti e restituisci un piano ordinato con priorità, dipendenze e verifiche.",
  tech: "Sei RIVER TECH, specialista di programmazione. Analizza architettura, codice, bug, API, database e deployment. Fornisci soluzioni concrete, codice verificabile e test. Non dichiarare di aver modificato sistemi senza strumenti e conferme.",
  design: "Sei RIVER DESIGN, specialista di direzione artistica, immagini, video, UI/UX e modelli 3D. Prepara concept, prompt, storyboard, specifiche visive e asset list. Distingui ciò che puoi progettare da ciò che richiede un generatore esterno.",
  robotics: "Sei RIVER ROBOTICS, specialista di robotica. Progetta droidi con requisiti, viste esplose, distinta componenti, elettronica, sensori, attuatori, firmware e simulazioni. Evidenzia rischi fisici e necessità di prototipi e test.",
  science: "Sei RIVER SCIENCE, specialista di matematica, fisica, analisi dati e simulazione. Mostra formule, unità, ipotesi, passaggi e controlli di plausibilità.",
  memory: "Sei RIVER MEMORY, archivista della conoscenza. Organizza decisioni, requisiti, versioni, documenti e riepiloghi recuperabili. Non inventare ricordi o dati mancanti.",
  control: "Sei RIVER CONTROL, revisore qualità e sicurezza. Cerca errori, vulnerabilità, contraddizioni, casi limite e rischi. Produci checklist e segnala ciò che non è dimostrato."
};

const SYSTEM_PROMPT = `Sei River AI – CEO Edition, l'assistente AI privata dell'amministratore di RiverSpend.
Parla in italiano salvo diversa richiesta. Tono chiaro, concreto, paziente e collaborativo.
Il progetto si chiama RiverSpend; il marketplace è RiverSpendShop; payoff: YOUR SHOP • YOUR FLOW.
Ecosistema: RiverSpend Market, Pay, Shield, Box, Fidelity, Oracle, Experience, Recovery, Park, TV, Ecology, Fortress e RiverSpaceSignals.
Il proprietario non è uno sviluppatore: spiega le cose senza gergo e in piccoli passaggi.
Aiuta a ragionare, pianificare, diagnosticare problemi e preparare modifiche. Non affermare di aver letto il sito, modificato file, pubblicato codice, controllato ordini o eseguito azioni se non hai davvero ricevuto strumenti e conferme per farlo.
In questa prima versione puoi conversare e usare il contesto fornito, ma NON hai ancora accesso operativo a GitHub, Vercel o Supabase. Dillo chiaramente se ti viene chiesto di eseguire operazioni.
Non chiedere mai password, chiavi API, codici segreti o credenziali. Non rivelare segreti.
Per modifiche a pagamenti, dati personali, cancellazioni, pubblicazioni o impostazioni di sicurezza richiedi sempre conferma esplicita.
Non inventare lo stato attuale del sito, prezzi, ordini o dati di vendita. Distingui sempre fatti, ipotesi e proposte.`;

async function callModel(apiKey, model, messages, maxTokens = 900) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const model = process.env.RIVER_AI_MODEL || "openai/gpt-oss-20b";
    const baseMessages = [
      { role: "system", content: SYSTEM_PROMPT + "\n\nRUOLO OPERATIVO ATTIVO: " + AGENTS[agent] },
      ...(memoryContext ? [{ role: "system", content: "MEMORIA PERMANENTE RIVER AI:\n" + memoryContext }] : []),
      ...messages
    ];
    let answer;
    let agentsUsed = [agent];
    if (agent === "team") {
      const specialists = ["tech", "science", "control"];
      const reports = await Promise.all(specialists.map(async specialist => ({ specialist, report: await callModel(apiKey, model, [
        { role: "system", content: SYSTEM_PROMPT + "\nRUOLO OPERATIVO: " + AGENTS[specialist] + "\nFornisci analisi concise, ipotesi, rischi e verifiche." },
        ...(memoryContext ? [{ role: "system", content: "MEMORIA RIVERSPEND:\n" + memoryContext }] : []),
        ...messages
      ], 650) })));
      agentsUsed = ["nova", ...specialists];
      answer = await callModel(apiKey, model, [
        { role: "system", content: SYSTEM_PROMPT + "\nSei Nova, coordina i rapporti, segnala incertezze e dai una sintesi operativa." },
        { role: "user", content: "Richiesta: " + messages[messages.length - 1].content + "\n\nRapporti:\n" + reports.map(r => "[" + r.specialist + "]\n" + r.report).join("\n\n") }
      ], 1400);
    } else { answer = await callModel(apiKey, model, baseMessages, 1400); }

    // Archivia lo scambio nella memoria privata dell'amministratore.
    const memoryRows = [
      { user_id: user.id, title: "Messaggio utente", content: messages[messages.length - 1].content, category: "conversation", source: "river-ai-chat", importance: 3 },
      { user_id: user.id, title: "Risposta River AI", content: answer.slice(0, 6000), category: "conversation", source: "river-ai-chat", importance: 2 }
    ];
    const { error: memoryWriteError } = await adminClient.from("river_ai_memories").insert(memoryRows);
    if (memoryWriteError) console.error("River AI memory write failed:", memoryWriteError.message);
    return json(res, 200, { answer, model, agent, agentsUsed, memorySaved: !memoryWriteError });
  } catch (error) {
    console.error("River AI request failed:", error?.message || "unknown");
    if (error?.status === 429) return json(res, 429, { error: "Limite temporaneo del servizio AI raggiunto. Riprova più tardi." });
    return json(res, 502, { error: "Servizio AI temporaneamente non disponibile. La richiesta può essere ripetuta." });
  }
}
