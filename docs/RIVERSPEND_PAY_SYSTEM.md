# RiverSpend Pay — System Foundation

## Obiettivo
RiverSpend Pay è il livello di orchestrazione dei pagamenti di RiverSpendShop, RiverSpendStream, RS Spons, Music e servizi futuri.

## Flusso
1. Creazione ordine/payment order.
2. Idempotency key.
3. Provider checkout/payment intent.
4. Apple Pay / Google Pay dove supportati dal provider.
5. PayPal come provider separato.
6. Webhook firmato.
7. Conferma ordine.
8. RiverSpend Shield / refund / dispute.
9. Calcolo commissione piattaforma.
10. Seller payout e riconciliazione.

## Sicurezza
- Nessun PAN/CVV nel database RiverSpend.
- Secret/service keys solo server-side.
- Webhook verificati con firma del provider.
- Eventi idempotenti con provider + provider_event_id.
- RLS su tutte le tabelle esposte.
- Payout separati dal pagamento del cliente.

## Tabelle
- payment_orders
- payment_transactions
- payment_refunds
- payment_events
- seller_payouts

## Provider
La prima integrazione consigliata è un PSP con supporto marketplace/platform, con Stripe come candidato iniziale, più PayPal. L'attivazione effettiva dipende da account merchant, paese, KYC, valute, prodotti e termini dei provider.

## Stato
La struttura dati è pronta. Checkout reale, webhook, payout e provider keys devono essere configurati e testati in sandbox prima della produzione.
