# RiverSpend ShieldGrid — architettura di continuità e protezione

Data: 2026-11-01
Stato: progetto e requisiti; non dichiarare queste difese operative finché non implementate e collaudate.

## Obiettivo
RiverSpend deve continuare a funzionare anche in caso di crash, errore di rilascio o indisponibilità di un fornitore. Account, dati personali e pagamenti devono essere protetti da accessi abusivi, frodi e perdita accidentale.

## 1. Due siti paralleli: continuità del servizio
- **Primario (A):** sito pubblico principale.
- **Secondario (B):** deployment indipendente, pronto a servire il traffico in caso di indisponibilità di A.
- Entrambi devono essere costruiti dallo stesso commit approvato e identificare chiaramente la versione.
- Il secondario non deve ricevere automaticamente modifiche non collaudate.
- Monitoraggio esterno controlla disponibilità, risposta HTTP, pagina iniziale, API essenziali e certificato TLS.
- In caso di guasto: allarme, verifica automatica, passaggio al secondario solo secondo una procedura controllata; al ripristino si verifica la sincronizzazione prima del rientro su A.
- Il failover DNS non è istantaneo e può essere influenzato dalla cache DNS. Per un passaggio più rapido serve un livello di instradamento/edge adeguato.
- Un secondo sito non basta se entrambi dipendono dallo stesso database, storage, DNS o provider. Le dipendenze critiche vanno mappate e, dove sostenibile, ridondate.

## 2. Dati e backup
- Backup separati per: codice, database, file caricati, configurazioni e log.
- Database: backup automatici con retention definita e copie indipendenti; test periodici di ripristino.
- File utenti: versioning e copie indipendenti; verifica integrità tramite checksum.
- Obiettivi iniziali da concordare: RPO (quanti dati al massimo si possono perdere) e RTO (tempo massimo per ripristinare).
- Non sincronizzare ciecamente cancellazioni o corruzioni dal primario al secondario.
- Segreti, password, token e chiavi API non devono mai finire nel repository o nei backup accessibili pubblicamente.

## 3. Profili di sicurezza utente
Ogni account ha una protezione di base attiva per impostazione predefinita:
- verifica email e, quando opportuno, telefono;
- password robuste e supporto passkey/MFA;
- avvisi per accessi da nuovi dispositivi o località anomale, senza blocchi arbitrari;
- gestione sessioni e disconnessione remota;
- limiti di tentativi, protezione da credential stuffing e recupero account sicuro;
- impostazioni privacy, autorizzazioni e cronologia attività;
- protezioni aggiuntive per venditori, amministratori e account che gestiscono denaro.

Non promettere sicurezza assoluta: mostrare agli utenti lo stato delle protezioni e spiegare cosa è attivo.

## 4. Unità Protettori RiverSpend
Nome collettivo proposto: **RiverSpend ShieldGrid — Unità Protettori della Rete**.
Le unità sono servizi software di difesa, non persone o bot autorizzati ad agire senza limiti.

- **Sentinella Uptime:** salute del sito, API e servizi; rileva crash e degrado.
- **Guardiano Accessi:** login, MFA, sessioni, tentativi anomali e privilegi.
- **Scudo Anti-Hacker:** WAF, rate limiting, protezione bot, vulnerabilità, patch e monitoraggio.
- **Scudo Anti-Frode:** analisi rischio ordini e pagamenti, anomalie e revisione; decisioni proporzionate, possibilità di contestazione e revisione umana.
- **Custode Dati:** backup, cifratura, integrità, retention e ripristino.
- **Controllore Rilasci:** test, rilevamento regressioni, blocco rilasci non validi e rollback.
- **Centro Allarmi:** registro eventi, notifiche e procedure di risposta agli incidenti.

Ogni unità deve avere permessi minimi, log verificabili, limiti di azione e supervisione umana per blocchi account, congelamento fondi o decisioni che incidono sugli utenti.

## 5. Pagamenti e antifrode
- RiverSpend non conserva numeri completi di carte o codici CVV.
- Usare PSP conformi e tokenizzazione; autenticazione forte/3-D Secure quando applicabile.
- Verificare webhook lato server, firma, importo, valuta, ordine e idempotenza.
- Separare autorizzazione, cattura, rimborso e contestazione.
- Regole antifrode con soglie, segnali spiegabili, revisione per casi dubbi e percorso di ricorso.
- Mai bloccare o trattenere denaro sulla sola base di un punteggio automatico non verificato.

## 6. Sequenza di realizzazione
1. Inventario di sito, repository, database, storage, domini, provider e segreti.
2. Proteggere account GitHub/Vercel/Supabase e attivare MFA; limitare i privilegi.
3. Completare backup del codice e provare il ripristino.
4. Configurare backup database e file, quindi eseguire un restore di prova.
5. Costruire il deployment secondario indipendente e verificare che usi solo release approvate.
6. Aggiungere monitoraggio e procedura di failover/rollback.
7. Implementare profili di sicurezza e unità Protettori per fasi.
8. Integrare i controlli antifrode con il PSP e collaudare scenari reali in sandbox.
9. Eseguire esercitazioni di crash, perdita database, compromissione credenziali e ripristino.

## 7. Criteri per dichiarare una protezione attiva
Ogni voce deve avere: responsabile, configurazione, test eseguito, data, esito, evidenza e procedura di rollback. Una funzione solo progettata o descritta non va presentata come attiva.

## Regola inviolabile
Nessun rilascio in produzione senza backup verificato, test di regressione, prova di riapertura e approvazione. Le modifiche restano su branch/preview fino al superamento dei controlli.
