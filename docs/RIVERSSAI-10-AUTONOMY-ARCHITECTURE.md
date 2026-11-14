# RiverSSAI 10.0 — Architettura di autonomia per l'ecosistema RiverSpend

Stato: specifica iniziale di progetto, non implementazione.  
Branch di riferimento: `feat/riverssai-public-plans-preview`.

## Obiettivo

RiverSSAI 10.0 deve diventare il livello centrale di coordinamento intelligente per l'intero ecosistema RiverSpend. Nova riceve gli obiettivi dell'amministratore, li scompone in attività, seleziona competenze e strumenti, esegue operazioni autorizzate, verifica i risultati e conserva una traccia verificabile.

L'autonomia non significa accesso illimitato o assenza di controlli. Significa eseguire senza supervisione continua le attività autorizzate, fermandosi prima di azioni ad alto impatto o irreversibili.

## Settori da coordinare

- RiverSpend Shop / Market: catalogo, venditori, ordini, spedizioni, resi e assistenza.
- RiverPay e contabilità: checkout, PSP, webhook, riconciliazione e rimborsi.
- RiverSpaceSignals: messaggistica, chiamate, identità, disponibilità e protezione degli account.
- Streaming / River TV: ingestione, transcodifica, distribuzione, qualità e moderazione.
- RiverPark: disponibilità, prenotazioni, accessi e servizi collegati.
- Altri moduli RiverSpend: Fidelity, Ecology, Experience, Oracle, Recovery e servizi futuri.
- Piattaforma: GitHub, Vercel, Supabase, monitoraggio, backup, sicurezza e continuità operativa.

Ogni settore mantiene API, dati, permessi e responsabilità separati. Nova coordina, ma non deve diventare un unico punto di guasto o un superutente capace di aggirare i controlli dei singoli servizi.

## Stato tecnico verificato nel branch al momento della stesura

- Il registro `lib/riverSSAI/agentsRegistry.js` contiene il catalogo dei ruoli specialistici.
- `lib/riverSSAI/router.js` seleziona ruoli in base a segnali testuali e può completare la squadra fino alla dimensione richiesta.
- `pages/api/river-ai/chat.js` invia il catalogo e le competenze selezionate in una singola richiesta al provider AI.
- Di conseguenza, i ruoli attuali sono competenze/prompt orchestrati in una singola elaborazione, non agenti indipendenti che eseguono lavori in parallelo.
- La chat salva una memoria conversazionale su Supabase, ma non dispone ancora di un sistema completo di progetti, piani di esecuzione, strumenti operativi, approvazioni e verifica dei risultati.
- Il backend attuale non espone ancora a Nova un runtime generale di strumenti per modificare repository, distribuire applicazioni o amministrare i servizi.

Questa fotografia è limitata ai file esaminati; prima di ogni implementazione va verificato il resto del repository e delle integrazioni.

## Architettura obiettivo

### 1. Nova Orchestrator
Riceve l'obiettivo, identifica il settore, crea un piano con passi e criteri di successo, assegna competenze, sceglie gli strumenti e mantiene lo stato del lavoro. Ogni attività ha un identificativo, proprietario, stato, scadenza e risultato.

### 2. Specialist Registry
Il registro descrive competenze, ambiti, input richiesti, strumenti consentiti e criteri di verifica. Il numero dei ruoli non deve essere presentato come numero di modelli autonomi. L'esecuzione parallela sarà dichiarata solo quando esisteranno processi distinti, tracciati e realmente concorrenti.

### 3. Tool Runtime
Strumenti modulari con schema rigoroso, validazione degli input, identità di esecuzione, timeout, limiti di frequenza e output strutturato. Prima fase: strumenti di sola lettura per GitHub, Vercel e stato dei servizi. In seguito: scrittura su branch dedicati, test, Preview e gestione controllata delle risorse.

### 4. Policy e autorizzazioni
Ogni strumento dichiara il proprio livello:
- L0 — lettura e diagnostica: eseguibile automaticamente.
- L1 — modifiche reversibili in ambiente di sviluppo/branch: eseguibili con policy predefinite e audit.
- L2 — Preview, modifiche a dati non critici o operazioni che coinvolgono utenti: approvazione esplicita o policy specifica.
- L3 — produzione, pagamenti, rimborsi, trasferimenti, cancellazioni definitive, accessi privilegiati e rotazione di segreti: approvazione esplicita dell'amministratore e controlli aggiuntivi.

Nessun prompt del modello può concedere permessi. Le autorizzazioni sono applicate dal backend e dagli strumenti, non dal testo generato dall'AI.

### 5. Memoria e registro delle attività
Separare memoria conversazionale, memoria di progetto, stato dei task e audit log. Salvare decisioni e risultati con timestamp, riferimenti a commit/deployment e autore dell'azione. Proteggere i dati per utente e settore; applicare retention e cancellazione conformi.

### 6. Verifica e qualità
Ogni azione produce evidenze: output dello strumento, test, commit, URL Preview, stato deployment e controlli applicativi. Nova non deve dire "fatto" se non dispone dell'evidenza corrispondente. Prevedere retry limitati, idempotenza e gestione degli errori.

### 7. Resilienza e continuità
Implementare le sette protezioni approvate:
1. Backup database automatici e verificati.
2. Copie versionate di codice e configurazioni.
3. Copie esterne cifrate e, ove possibile, immutabili.
4. Monitoraggio e allarmi.
5. Protezione di identità, accessi, segreti e superfici di attacco.
6. Test periodici di ripristino e procedure di subentro.
7. Idempotenza e riconciliazione per evitare ordini o pagamenti persi o duplicati.

Prevedere ridondanza per i componenti critici, ma non considerare una seconda copia come un backup valido finché il ripristino non è stato provato.

## Fasi di realizzazione

### Fase A — Fondamenta e inventario
Mappare API, database, ruoli, servizi, segreti, dipendenze e ambienti. Definire contratti degli strumenti, policy, audit log e modello dei task. Nessuna modifica automatica alla produzione.

### Fase B — Agente operativo in sola lettura
Nova può ispezionare repository, branch, commit, deployment, log e stato dei servizi. Produce diagnosi con riferimenti verificabili, senza poter scrivere o pubblicare.

### Fase C — Modifiche controllate
Nova crea branch dedicati, propone patch, esegue test, apre PR e genera Preview. Le modifiche alla produzione restano bloccate.

### Fase D — Operazioni sui settori
Integrare un settore alla volta tramite API interne con permessi minimi, sandbox, test, audit e rollback. Ordini e pagamenti richiedono idempotenza e riconciliazione prima dell'automazione.

### Fase E — Autonomia operativa sorvegliata
Abilitare workflow pianificati, monitoraggio e autoriparazione limitata a procedure sicure e reversibili. Le azioni ad alto impatto restano soggette ad approvazione.

### Fase F — Prove di accettazione
Simulare guasti, provider AI indisponibile, quota Supabase esaurita, deployment fallito, webhook duplicati, perdita di connessione e ripristino da backup. Passare a un livello di autonomia superiore solo dopo test ripetibili e superati.

## Criteri per dichiarare RiverSSAI autonoma

1. Nova pianifica ed esegue un'attività end-to-end su un branch senza interventi manuali intermedi.
2. Ogni chiamata a uno strumento è autenticata, autorizzata, limitata e registrata.
3. Nova distingue sempre tra azione proposta, avviata, riuscita e verificata.
4. Errori e timeout non producono false conferme né operazioni duplicate.
5. Un deployment Preview viene testato prima di qualunque promozione.
6. Backup e ripristino sono dimostrati con prove documentate.
7. Le operazioni critiche richiedono approvazione esplicita e dispongono di rollback o procedura di recupero.
8. I test vengono ripetuti dopo modifiche sostanziali e prima di ogni passaggio in produzione.

## Regola di rilascio

Lavorare prima su branch e Preview. Non unire automaticamente alla produzione, non modificare pagamenti reali e non eseguire cancellazioni irreversibili. Ogni avanzamento deve indicare chiaramente: codice modificato, build, test, deployment e verifica funzionale.