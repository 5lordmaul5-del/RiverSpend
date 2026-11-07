# RiverSSAI 11.0 — Semantic Cluster Routing

## Obiettivo

Aggiungere un router modulare a due livelli mantenendo il registry canonico da 90 voci e la compatibilità del router 10.0.

## Cluster attuali

- `fiscal`: fiscalità, IVA, contabilità e tesoreria.
- `p2p`: WebRTC, signaling, media, sincronizzazione e runtime edge.
- `ecommerce`: checkout, pagamenti, venditori, catalogo, logistica e supporto.
- `analytics`: BI, funnel, coorti, esperimenti e metriche AI.
- `security`: sicurezza applicativa, identità, privacy e protezione wallet.
- `platform`: AI, infrastruttura, PWA, sviluppo, contenuti e operazioni.

## Flusso

1. Cluster Router: valuta i cluster e seleziona il dominio più pertinente.
2. Agent Picker: ordina gli specialisti del solo cluster selezionato.
3. Nova: riceve al massimo due prompt specialistici e produce la risposta.
4. Fallback: se il match manca o è ambiguo, la richiesta resta a Nova.

## Stato della ricerca vettoriale

Il router supporta cosine similarity quando riceve `queryEmbedding` e `agentEmbeddings` precalcolati. Non genera embedding e non scarica modelli. In assenza di un provider di embedding configurato usa il fallback keyword, esplicitamente identificato come `keyword-fallback`.

## Rollout

L’API usa inizialmente la modalità shadow: il nuovo router viene confrontato con il router 10.0, ma non cambia la selezione effettiva. Per attivarlo impostare `RIVER_AI_SEMANTIC_ROUTER_MODE=active` solo dopo test di precisione e latenza. Non sono richieste modifiche a Supabase.

## Misure da raccogliere

Precisione Top-1/Top-2, falsi instradamenti, fallback, latenza p50/p95 e token per richiesta. La soglia vettoriale predefinita è provvisoria e va calibrata su richieste etichettate.
