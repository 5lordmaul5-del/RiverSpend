# RiverMoney / River Pay — stato integrazione condivisa

## Modulo aggiunto
Il client condiviso è disponibile in `lib/river-money/client.js` ed è riutilizzabile dal frontend RiverSpendShop.

Espone solo chiamate autenticate:
- `getWallet()` → `GET /api/river/wallet`
- `getTransactions()` → `GET /api/river/transactions`
- `createPaymentIntent()` → `POST /api/river/payment-intents`

Il client non calcola né modifica saldi e non conferma pagamenti.

## Stato effettivo
- [x] Sorgente client condiviso inserito nel branch di lavoro RiverSpendShop.
- [x] Contratto API documentato.
- [ ] Endpoint backend RiverMoney implementati.
- [ ] Ledger e schema database verificati.
- [ ] Autenticazione e autorizzazione testate end-to-end.
- [ ] App RiverSpaceSignals collegata al backend condiviso.
- [ ] Altre app RiverSpend collegate al backend condiviso.
- [ ] Test sandbox del provider e webhook completati.

## Regole di sicurezza
1. Il saldo autorevole è calcolato esclusivamente dal server.
2. Ogni operazione richiede una sessione valida e autorizzazione server-side.
3. Gli importi sono interi in centesimi e ogni operazione ha una chiave idempotente.
4. I webhook devono essere firmati e verificati.
5. Nessuna chiave segreta nel browser o nel repository.
6. Non mostrare RiverMoney come conto, moneta elettronica o servizio di trasferimento reale finché non sono completati gli accordi con un PSP autorizzato e le verifiche legali/regolamentari applicabili.

## Pubblicazione
Questo lavoro è su un branch separato di sviluppo e non modifica il sito live. Non unire né distribuire in produzione prima di aver completato gli endpoint, i test e la revisione.
