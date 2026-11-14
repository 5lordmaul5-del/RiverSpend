# RiverSSAI 10.0 — struttura commerciale (anteprima)

Stato: proposta commerciale aggiornata; nessun pagamento o abbonamento attivo.

## Piani pubblici

| Piano | Prezzo mensile |
|---|---:|
| Free | Gratis |
| Bronzo | € 2,99 |
| Argento | € 5,99 |
| Oro | € 12,99 |
| Platinum | € 24,99 |

Valuta: EUR. Periodicità proposta: mensile.

## Perimetro implementato in questa fase

- Catalogo centralizzato in `lib/riverSSAI/publicPlans.mjs`.
- Pagina informativa pubblica in `/river-ai/piani`.
- Prezzi visibili e descrizioni qualitative dei livelli.
- Stato commerciale esplicito `preview`.
- Checkout, sottoscrizioni e provisioning account disabilitati.
- Nessun SDK PSP, endpoint di pagamento o chiave di pagamento aggiunti.
- Piano Owner escluso dal catalogo pubblico.

## Decisioni ancora necessarie prima della vendita

1. Definire quote misurabili per piano: messaggi, token, frequenza, dimensione contesto, memoria e accesso agli specialisti.
2. Misurare costi effettivi del provider e fissare limiti anti-abuso e margini sostenibili.
3. Definire IVA, fatturazione, rinnovi, cancellazioni, rimborsi e informativa consumatori con consulenza fiscale/legale.
4. Scegliere il PSP e progettare webhook idempotenti, riconciliazione e gestione sicura dei segreti.
5. Implementare account e sottoscrizioni con isolamento dati per utente e controlli server-side.
6. Eseguire test e approvazione esplicita prima di attivare il checkout.

I nomi e i prezzi non implicano quote o prestazioni tecniche già disponibili. Le differenze quantitative tra piani restano da progettare e collaudare.
