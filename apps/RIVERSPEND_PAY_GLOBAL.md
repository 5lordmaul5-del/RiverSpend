# RiverSpend Pay — Architettura Globale

RiverSpend Pay è il layer centrale dei pagamenti dell'ecosistema RiverSpend.

## Obiettivo

Supportare pagamenti internazionali e metodi locali senza legare RiverSpendShop, RiverSpendStream o le future app a un singolo provider.

## Metodi previsti

- Carte internazionali: Visa, Mastercard, American Express e altri circuiti supportati.
- Wallet: PayPal, Apple Pay, Google Pay.
- Italia/Europa: BANCOMAT Pay, Postepay e altri metodi disponibili nel Paese.
- Buy Now Pay Later: Klarna, Scalapay e altri operatori disponibili per il mercato.
- Asia e mercati locali: Alipay, WeChat Pay, UPI e altri sistemi locali supportabili.
- America Latina: Pix e altri sistemi locali supportabili.
- Altri metodi internazionali saranno aggiunti per Paese/area quando disponibili e legalmente utilizzabili.

## Regola fondamentale

Il checkout non deve mostrare tutti i metodi contemporaneamente.

RiverSpend Pay deve determinare, in base a Paese, valuta, dispositivo, importo e disponibilità del provider, quali metodi mostrare al cliente.

## Architettura

RiverSpendShop / RiverSpendStream
        ↓
   RiverSpend Pay
        ↓
 Payment Orchestration Layer
        ↓
Provider di pagamento
        ↓
Metodo locale / carta / wallet

Il sistema deve poter utilizzare più provider. Nessuna singola integrazione deve diventare un vincolo per l'espansione internazionale.

## Sicurezza

- Nessuna chiave segreta nel client mobile.
- Tokenizzazione tramite provider.
- Webhook server-side per confermare i pagamenti.
- Idempotenza per evitare doppi addebiti.
- Stato ordine separato dallo stato pagamento.
- Rimborso e storno tracciati.
- Log amministrativi disponibili in RSPC.
- Modalità sandbox prima dei pagamenti reali.

## Valute

RiverSpend Pay deve essere predisposto per EUR, USD, GBP, CHF, CAD, AUD, JPY, CNY, INR, BRL e altre valute supportate dai provider e dal Paese.

## Prossimo blocco tecnico

1. Checkout RiverSpend Pay in sandbox.
2. Creazione Payment Intent / sessione tramite backend.
3. Conferma server-side tramite webhook.
4. Collegamento all'ordine RiverSpendShop.
5. Test dei metodi disponibili.
6. Attivazione graduale dei pagamenti reali dopo verifica di account, compliance e provider.
