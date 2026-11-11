# RiverSpend — Piano delle sette protezioni e continuità operativa

**Stato:** specifica architetturale da implementare e verificare. La presenza di questo documento NON significa che backup, replica, monitoraggio o failover siano già attivi.

## Obiettivi

RiverSpend deve poter continuare a offrire le funzioni essenziali durante il guasto di un singolo componente e deve poter recuperare dati e servizi dopo un incidente grave. Le applicazioni commerciali (catalogo, ordini e pagamenti) devono restare separate dal runtime AI: un guasto di RiverSSAI/Ollama non deve bloccare il percorso di acquisto.

Obiettivi iniziali da convalidare con costi, provider e test:
- **RTO:** obiettivo di ripristino del servizio essenziale entro 15 minuti.
- **RPO:** obiettivo di perdita dati non superiore a 1 minuto per le transazioni critiche, solo se la tecnologia e il piano scelti lo consentono e i test lo dimostrano.
- Nessuna dichiarazione di alta disponibilità finché non sono provati ripristino e failover end-to-end.

## Le sette protezioni obbligatorie

### 1. Backup automatici e indipendenti del database
- Pianificare backup coerenti e verificabili dei database effettivamente in uso, inclusi schema e dati.
- Conservare copie fuori dall'host e, ove sostenibile, fuori dall'account/provider primario.
- Definire retention, cifratura, controllo accessi e monitoraggio degli esiti.
- Per PostgreSQL valutare dump logici e backup fisici/PITR in base a dimensione, RPO e capacità del piano.
- Non presumere che il database PostgreSQL del prototipo RiverSSAI sia il database di produzione: oggi il runtime RiverSSAI è isolato dal database Supabase live.

### 2. Backup di codice e configurazioni
- Conservare il codice versionato in Git e mantenere tag/revisioni di rilascio recuperabili.
- Salvare configurazioni infrastrutturali, manifest, workflow e documentazione di ripristino.
- Escludere segreti, token, password, chiavi private e dati personali dai repository e dagli artefatti non protetti.
- Conservare separatamente le istruzioni per ricreare servizi e ambienti.

### 3. Copie cifrate e immutabili
- Cifrare i backup in transito e a riposo.
- Conservare almeno una copia con protezione da modifica/cancellazione (immutabilità o object lock) e credenziali separate.
- Separare i domini di guasto: account, credenziali e possibilmente provider/regione distinti.
- Verificare periodicamente integrità, chiavi di cifratura e possibilità effettiva di decifrare e ripristinare.

### 4. Monitoraggio continuo
- Controllare disponibilità HTTP, error rate, latenza, saturazione risorse, database, storage, code e scadenza certificati.
- Distinguere health check superficiali da controlli sintetici del percorso reale di acquisto.
- Generare allarmi con escalation e registrare incidenti e tempi di risposta.
- Il monitoraggio deve coprire anche backup falliti, ritardi di replica e spazio insufficiente.

### 5. Sicurezza di accessi, attacchi e segreti
- Applicare minimo privilegio, MFA dove disponibile, rotazione/revoca delle credenziali e separazione degli ambienti.
- Tenere segreti esclusivamente in secret manager o variabili protette lato server; mai nel browser o nel repository.
- Proteggere gli endpoint con autenticazione, autorizzazione, rate limiting e validazione degli input.
- Abilitare audit log e alert per accessi anomali; predisporre procedure di risposta e ripristino dopo compromissione.
- Per Supabase verificare RLS su tutte le tabelle esposte e non esporre mai service-role/secret key al client.

### 6. Prove di ripristino e subentro
- Eseguire prove periodiche di restore in un ambiente isolato, senza sovrascrivere produzione.
- Simulare indisponibilità di app, database, provider e regione; misurare RTO/RPO reali.
- Preparare tre livelli: **A produzione**, **B standby caldo** su dominio di guasto separato, **C disaster recovery** con backup/restore indipendente.
- Il subentro deve prevedere health check, decisione/fencing del nodo attivo, verifica dati e procedura di ritorno.
- Non attivare due nodi scrittori sullo stesso flusso dati senza leader election/fencing e protezione split-brain.

### 7. Integrità di ordini e pagamenti
- Usare chiavi di idempotenza per creazione ordine, richieste al PSP, capture, refund e webhook.
- Rendere le transizioni di stato atomiche e verificabili; usare vincoli univoci e una strategia outbox/queue dove appropriato.
- Non ritentare alla cieca una capture o un rimborso dopo timeout: interrogare il PSP e riconciliare prima lo stato.
- Separare disponibilità dell'AI dai flussi commerciali; nessuna AI può autorizzare o eseguire movimenti di denaro fuori dalle policy e dalle approvazioni previste.
- Dopo failover, sospendere le operazioni ambigue e riconciliare ordini, webhook e movimenti prima di riaprire completamente i flussi.

## Architettura di continuità

Le tre copie applicative non sono sufficienti da sole. La continuità deve includere anche database, storage degli oggetti, DNS/routing, certificati, segreti, code, servizi di pagamento e dipendenze esterne. Le applicazioni devono essere il più possibile stateless; i dati devono avere una strategia esplicita di replica e ripristino.

- **A — Produzione:** ambiente primario.
- **B — Standby caldo:** versione compatibile e verificata, pronta al subentro.
- **C — Disaster recovery:** ambiente ricostruibile da copie indipendenti, preferibilmente in un diverso dominio di guasto.
- Un solo writer autorevole per ordini e pagamenti, salvo architettura multi-writer formalmente progettata e provata.
- Failover automatico solo quando la promozione è sicura e non crea split-brain; altrimenti failover controllato.

## Sequenza di implementazione

1. Inventario read-only di servizi, database, storage, provider, domini, segreti e flussi di pagamento realmente in uso.
2. Definizione dei requisiti RTO/RPO e dei costi accettabili.
3. Attivazione dei backup e verifica indipendente del primo restore.
4. Monitoraggio, allarmi e hardening degli accessi.
5. Progettazione e prova dello standby B e del disaster recovery C.
6. Idempotenza, riconciliazione e test dei flussi ordini/pagamenti.
7. Simulazione completa di guasto, report dei risultati e approvazione prima di qualsiasi passaggio in produzione.

## Regole di modifica e rilascio

- Nessuna migrazione, cancellazione o sostituzione del database Supabase live senza export, checksum/integrity check, restore test e approvazione esplicita.
- Nessun deploy o cambio di DNS, variabili Vercel, credenziali, provider o routing come conseguenza automatica di questa specifica.
- Ogni protezione va marcata separatamente come **specificata**, **configurata**, **testata** e **operativa**. Non confondere questi stati.
- Le prove vanno eseguite prima in staging e devono produrre evidenze ripetibili.
- Ogni incidente e ogni restore devono lasciare un audit trail.

## Stato iniziale noto del ramo

Il runtime RiverSSAI standalone in `infra/river-ai` è un prototipo isolato con PostgreSQL e Ollama in Docker. La documentazione del ramo dichiara backup indipendenti e restore testati come attività ancora da completare; non risulta un sistema di backup/failover di produzione configurato da questo solo codice. La UI live non è collegata al runtime standalone. Verificare sempre lo stato reale dei provider e dell'infrastruttura prima di dichiarare una protezione operativa.
