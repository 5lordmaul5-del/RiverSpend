# Verifica sicurezza Supabase RiverSpend — 11 novembre 2026

**Tipo di verifica:** sola lettura tramite Supabase project metadata, schema, policies e advisors. Nessuna modifica è stata applicata al database.

## Stato del progetto

- Progetto Supabase `rkwqmteuxpdgdhgowbpn`: `ACTIVE_HEALTHY`.
- Organizzazione RiverSpend: piano **Free**.
- PostgreSQL 17.6.1.166.
- 88 tabelle nello schema `public`; RLS risulta abilitato su tutte le tabelle elencate.
- Il progetto contiene dati reali di catalogo, ordini, pagamenti, wallet, chat e media: evitare migrazioni o test distruttivi.

## Rilievi da trattare

### 1. Funzioni SECURITY DEFINER eseguibili da authenticated

Supabase Advisors ha segnalato otto funzioni. La verifica delle definizioni ha rilevato:

- `rs_admin_global_intelligence()`: controlla esplicitamente il ruolo amministratore.
- `rs_admin_shop_customers()`: controlla esplicitamente il ruolo amministratore.
- `rs_admin_insights()`: la definizione letta non contiene un controllo esplicito del ruolo amministratore, pur essendo SECURITY DEFINER e concedendo EXECUTE ad authenticated. La pagina di controllo verifica il ruolo prima di chiamarla, ma questo controllo UI non protegge una chiamata RPC diretta. La funzione restituisce statistiche aggregate di utilizzo e ricerca. **Priorità alta:** aggiungere il controllo admin nella funzione o revocare l'accesso client se non deve essere invocata direttamente.
- `rs_fortune_credit(...)`: richiede un utente autenticato e limita l'uso ordinario a una ricompensa per utente, ma accetta dal chiamante tipo, etichetta, importi RIVERMONEY/RSP e metadata. La pagina `pages/index.js` costruisce `rewardMap` nel browser e passa direttamente tali importi alla RPC. Poiché `authenticated` ha EXECUTE e la funzione accredita i valori ricevuti senza un'allowlist server-side, un utente può invocare la RPC direttamente con importi alterati. **Priorità critica:** il client non deve scegliere il valore del premio. L'estrazione e il calcolo devono avvenire lato server, con idempotenza e audit.
- `rs_claim_collaborator(text)`: verifica l'utente autenticato, l'email corrispondente, il codice invito e la scadenza.
- `rs_local_confirm_pickup(uuid)`: limita la conferma ad acquirente o venditore del ritiro.
- `rs_local_create_pickup(...)`: limita la proposta all'acquirente dell'ordine RS Local.
- `rs_lottery_issue_code(uuid)`: controlla che l'ordine appartenga all'utente e sia pagato.

Questi controlli statici non sostituiscono test d'integrazione con utenti non autorizzati. Non revocare indiscriminatamente EXECUTE: alcune schermate possono dipendere dalle RPC. Preparare una modifica mirata e testarla prima in staging.

### 2. Tabelle RLS abilitate senza policy

Sono state rilevate 11 tabelle senza policy in `public`:

- `inventory_stock_deductions`
- `river_ai_owner_access`
- `rs_gift_card_batches`
- `rs_gift_card_transactions`
- `rs_gift_cards`
- `rs_payment_verification_events`
- `rs_treasury_accounts`
- `rs_treasury_allocation_rules`
- `rs_treasury_allocations`
- `rs_treasury_movements`
- `web_push_subscriptions`

Con RLS attivo e nessuna policy, le richieste anon/authenticated sono normalmente negate: è un comportamento fail-closed, non un motivo per aprire queste tabelle. Verificare che l'accesso avvenga solo da API server-side o service role e che non siano necessari accessi client legittimi.

### 3. Protezione password compromesse

Supabase Advisors segnala che la protezione contro password compromesse è disattivata. Valutare l'attivazione nelle impostazioni Auth dopo aver verificato compatibilità e impatto sul flusso di registrazione/password.

### 4. Edge Function push

La funzione `riverspend-push-send` è attiva, versione 4, con `verify_jwt=false`. Il codice applica un segreto applicativo `PUSH_SEND_SECRET` e usa chiavi VAPID e service-role da variabili server-side. La funzione è stata copiata nel repository in `supabase/functions/riverspend-push-send/index.ts` per il versionamento del codice.

Requisiti residui: mantenere segreti fuori da Git, ruotare il segreto applicativo, limitare chi può invocare l'endpoint, introdurre rate limiting/monitoraggio e testare l'autorizzazione. Il codice versionato non contiene i valori dei segreti.

## Azioni sicure successive

1. Verificare l'interfaccia che chiama `rs_admin_insights()` e `rs_fortune_credit()`.
2. Preparare correzioni mirate con test per utente anonimo, utente autenticato non admin, admin e service role.
3. Verificare le 11 tabelle senza policy e documentare quali sono server-only.
4. Abilitare la protezione password compromesse dopo un test del flusso Auth.
5. Conservare le configurazioni Auth e i segreti in un archivio operativo separato e protetto.

**Nessuna delle correzioni sopra è stata applicata in produzione.**
