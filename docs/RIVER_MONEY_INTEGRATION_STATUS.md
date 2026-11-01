# RiverMoney / River Pay — stato integrazione condivisa

## Modulo frontend aggiunto
Il client condiviso è disponibile in `lib/river-money/client.js` ed è riutilizzabile dai frontend RiverSpendShop e, dopo l'adattamento del progetto, RiverSpaceSignals.

Espone chiamate autenticate:
- `getWallet()` → `GET /api/river/wallet`
- `getTransactions()` → `GET /api/river/transactions`
- `createPaymentIntent()` → `POST /api/river/payment-intents`

Il client non calcola né modifica saldi e non conferma pagamenti.

## Verifica dello schema Supabase Riverspend
Verifica in sola lettura del progetto Supabase `Riverspend` (1 novembre 2026):
- Esiste `public.rs_wallets` con `user_id`, `rivermoney` (numeric) e `rsp` (bigint).
- Esiste `public.rs_wallet_transactions` con utente, valuta, importo, saldo successivo, causale, fonte e riferimento.
- Esistono `payment_orders`, `payment_transactions` e `payment_events`.
- Esistono inoltre tabelle di tesoreria `rs_treasury_accounts` e `rs_treasury_movements`.
- RLS risulta attivo su tutte le tabelle wallet e payment esaminate. Wallet e movimenti sono leggibili dal proprietario; gli eventi di pagamento negano l'accesso diretto a `anon` e `authenticated`.
- La funzione di tesoreria individuata è `rs_create_treasury_allocation(...)`, marcata SECURITY DEFINER; prima di usarla in un flusso nuovo va revisionato il suo corpo e il suo perimetro di esecuzione.

**Limite della verifica:** l'esistenza delle tabelle non dimostra che il wallet sia un conto in denaro reale né che esistano già tutte le procedure sicure per accrediti/addebiti. Non sono stati letti dati finanziari personali e non sono state eseguite modifiche al database.

## Stato effettivo
- [x] Sorgente client condiviso inserito nel branch di lavoro RiverSpendShop.
- [x] Contratto API documentato.
- [x] Schema Supabase esistente ispezionato in sola lettura.
- [x] Endpoint backend autenticati in sola lettura: wallet e storico movimenti.
- [ ] Procedure server-side per saldo, accredito, addebito e idempotenza revisionate e testate.
- [ ] Autenticazione e autorizzazione testate end-to-end.
- [ ] App RiverSpaceSignals collegata al backend condiviso.
- [ ] Altre app RiverSpend collegate al backend condiviso.
- [ ] Test sandbox del provider e webhook completati.

## Regole di sicurezza
1. Il saldo autorevole è calcolato esclusivamente dal server.
2. Ogni operazione richiede una sessione valida e autorizzazione server-side.
3. Gli importi sono interi in centesimi per EUR; l'unità di RiverMoney va definita senza confonderla con euro o RSP.
4. Ogni operazione finanziaria deve essere idempotente e registrata in modo verificabile.
5. I webhook devono essere firmati e verificati.
6. Nessuna chiave segreta nel browser o nel repository.
7. Non mostrare RiverMoney come conto, moneta elettronica o servizio di trasferimento reale finché non sono completati gli accordi con un PSP autorizzato e le verifiche legali/regolamentari applicabili.

## ZIP RiverSignals
Il file `RSSignals-sorgente.zip` contiene la pagina statica `index.html`, manifest PWA, service worker, icone e i sei file audio Karma Zen Relax. Il README del pacchetto lo identifica come sorgente/correzione audio di RiverSignals, non come sorgente RiverMoney. Non contiene codice RiverMoney né un collegamento a un backend wallet.

La distribuzione Vercel ispezionata contiene già la pagina statica, le icone e i sei file audio. La versione pubblica e la preview sono state tenute distinte; nessuna promozione in produzione è stata effettuata in questa verifica.

## Build di anteprima
- Branch: `feature/rivermoney-shared-foundation`.
- Preview Vercel: `https://river-spend-8xgzcbpuy-mauryle75-8055s-projects.vercel.app`.
- Build Vercel: `READY` per il commit `73f9b3a8a35f8e4694ddbfeeb7f025e870b677d3`.
- Pull request draft: `https://github.com/5lordmaul5-del/RiverSpend/pull/28`.

La build riuscita verifica compilazione e packaging, non ancora le chiamate API autenticate end-to-end. La preview non è stata promossa in produzione; il dominio live non è stato modificato.
