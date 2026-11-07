import { AGENTS_REGISTRY } from "./agentsRegistry";

function normalizeText(value) {
  return String(value || "")
    .toLocaleLowerCase("it")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export const AGENT_SIGNALS = {
  tech: ["codice", "bug", "errore", "api", "svilupp", "programmaz", "javascript", "typescript", "frontend", "backend", "deploy", "github"],
  design: ["design", "grafica", "logo", "immagine", "video", "ui", "ux", "interfaccia", "banner", "colore"],
  robotics: ["robot", "droid", "sensore", "motore", "elettronica", "firmware", "3d"],
  science: ["scienza", "matematica", "fisica", "formula", "calcolo", "statistica", "simulazione"],
  memory: ["memoria", "ricorda", "storico", "archivio", "decisioni", "versione", "contesto"],
  control: ["sicurezza", "privacy", "protezione", "rischio", "permessi", "accesso", "gdpr"],
  business: ["azienda", "impresa", "strategia", "business", "modello", "margine", "ricavi"],
  finance: ["budget", "bilancio", "cassa", "costi", "finanza", "prevision", "flussi"],
  markets: ["mercato", "borsa", "token", "crypto", "liquidita", "volatilita", "invest"],
  payments: ["pagamento", "paypal", "carta", "checkout", "bonifico", "wallet", "rimborso", "stripe"],
  data: ["dati", "database", "sql", "analisi", "dashboard", "metriche", "report"],
  ai: ["intelligenza artificiale", "modello ai", "prompt", "llm", "agente", "machine learning", "nova"],
  cloud: ["cloud", "server", "hosting", "scalabilita", "backup", "infrastruttura", "vercel", "supabase"],
  cyber: ["cyber", "hacker", "attacco", "vulnerabilita", "crittografia", "enigma", "autenticazione"],
  quality: ["test", "qualita", "collaudo", "verifica", "regressione", "controllo", "funziona"],
  product: ["prodotto", "funzione", "roadmap", "priorita", "requisito", "rilascio"],
  marketing: ["marketing", "pubblicita", "campagna", "brand", "promozione", "social"],
  sales: ["vendita", "commerciale", "partner", "cliente", "offerta", "commissione"],
  support: ["assistenza", "supporto", "reclamo", "faq", "problema cliente"],
  legal: ["legge", "normativa", "contratto", "privacy policy", "conformita", "partita iva", "fiscale"],
  logistics: ["spedizione", "corriere", "consegna", "tracking", "reso", "logistica"],
  supply: ["fornitore", "magazzino", "scorte", "inventario", "approvvigionamento"],
  automation: ["automazione", "automatico", "workflow", "integrazione", "trigger"],
  research: ["ricerca", "fonti", "documentazione", "confronta", "studia", "approfondisci"],
  content: ["testo", "scrivi", "articolo", "descrizione", "contenuto", "copywriting"],
  localization: ["traduzione", "lingua", "internazionale", "paese", "valuta", "localizzazione"],
  accessibility: ["accessibilita", "screen reader", "wcag", "tastiera", "contrasto"],
  sustainability: ["ambiente", "ecologia", "sostenibilita", "riciclo", "impatto"],
  operations: ["organizzazione", "processo", "operazioni", "procedura", "gestione"],
  documentation: ["manuale", "documenta", "istruzioni", "guida", "changelog"],
  fiskus_bot: ["iva", "aliquota iva", "vies", "territorialita iva", "regime iva", "iva transfrontaliera"],
  pay_guardian: ["frode pagamento", "chargeback", "transazione sospetta", "carta clonata", "disconoscimento", "card testing"],
  ledger_sync: ["riconciliazione", "multi-valuta", "movimenti bancari", "estratto conto", "prima nota", "differenza gateway"],
  margin_ai: ["margine netto", "unit economics", "costo per prodotto", "marginalita", "commissioni gateway", "costo spedizione"],
  invoice_validator: ["fattura elettronica", "xml sdi", "tracciato xml", "sdi", "file fattura"],
  risk_radar: ["previsione liquidita", "scadenze incasso", "ritardo incasso", "cash flow", "tesoreria"],
  signal_router: ["webrtc", "signaling", "stun", "turn server", "peer-to-peer", "p2p", "ice candidate"],
  db_pool_guard: ["connection pooling", "pooler", "egress", "quota supabase", "query lenta", "postgres"],
  edge_cache_master: ["cdn", "cache-control", "s-maxage", "stale-while-revalidate", "edge cache", "invalidazione cache"],
  latency_slayer: ["cold start", "latenza api", "serverless", "tempo di risposta api", "profilazione performance"],
  sync_engine: ["offline-first", "indexeddb", "sincronizzazione offline", "conflitto dati", "sync offline"],
  stream_codec: ["codec", "compressione video", "bitrate", "webm", "h264", "streaming p2p"],
  vault_keeper: ["secret management", "chiavi api", "segreti", "variabili ambiente", "rotazione chiavi"],
  gdpr_shield: ["cancellazione dati", "diritto all'oblio", "anonimizzazione", "retention dati", "conservazione dati personali"],
  firewall_bot: ["xss", "sql injection", "sanitizzazione input", "payload malevolo", "validazione input"],
  auth_sentinel: ["jwt", "refresh token", "token scaduto", "sessione scaduta", "accesso non autorizzato"],
  audit_logger: ["audit log", "audit trail", "log immutabile", "azioni amministrative", "tracciamento admin"],
  cors_validator: ["cors", "cross-origin", "preflight", "access-control-allow-origin", "header cors"],
  token_compressor: ["compressione prompt", "prompt troppo lungo", "token groq", "riduzione token", "context compression"],
  prompt_router: ["routing agenti", "smistamento agenti", "intent classifier", "classificazione intenti", "instradamento specialisti"],
  memory_cacher: ["cache memoria", "ttl cache", "cache ttl", "letture memoria ripetute"],
  context_trimmer: ["sliding window", "finestra contesto", "taglio cronologia", "context window", "cronologia messaggi"],
  cost_tracker: ["consumo token", "costo groq", "quote api", "finops ai", "spesa ai"],
  quality_scorer: ["allucinazioni", "valutazione risposte", "quality score", "groundedness", "faithfulness"],
  pwa_checker: ["manifest", "service worker", "icona pwa", "installazione pwa", "webmanifest", "maskable"],
  a11y_auditor: ["wcag", "aria", "screen reader", "contrasto colori", "navigazione tastiera"],
  localizer: ["it en", "formato data", "formato valuta", "stringhe interfaccia", "locale ui"],
  test_runner: ["test automatici", "e2e", "playwright", "test regressione", "pipeline test"],
  notifier: ["notifica push", "webhook", "push notification", "coda notifiche", "retry notifiche"],
  sentiment_analyzer: ["sentiment", "soddisfazione utente", "tono conversazione", "analisi sentiment"]
};

export function routeToSpecialists(userMessage, maxSpecialists = 2) {
  const text = normalizeText(userMessage);
  const limit = Math.max(1, Math.min(2, Number(maxSpecialists) || 2));
  return Object.entries(AGENT_SIGNALS)
    .map(([key, signals], index) => ({
      key,
      score: signals.reduce((total, signal) => total + (text.includes(normalizeText(signal)) ? 1 : 0), 0),
      index
    }))
    .filter((item) => item.score > 0 && AGENTS_REGISTRY[item.key])
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((item) => item.key);
}

export function selectTeam(requestedSize, userMessage = "") {
  const allowedSizes = [2, 4, 8, 10, 20, 30];
  const size = allowedSizes.includes(Number(requestedSize)) ? Number(requestedSize) : 4;
  const text = normalizeText(userMessage);
  return Object.entries(AGENT_SIGNALS)
    .map(([key, signals], index) => ({
      key,
      score: signals.reduce((total, signal) => total + (text.includes(normalizeText(signal)) ? 1 : 0), 0),
      index
    }))
    .filter((item) => AGENTS_REGISTRY[item.key])
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, size)
    .map((item) => item.key);
}
