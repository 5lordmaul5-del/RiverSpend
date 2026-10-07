# RSPC — RiverSpend Treasury

## Obiettivo
RiverSpend Treasury è il modulo finanziario amministrativo di RSPC per classificare e distribuire contabilmente gli incassi di RiverSpend.

## Flusso
RiverSpend Pay → Incasso confermato → RiverSpend Treasury → Accantonamenti / disponibilità → Pagamenti autorizzati → Riconciliazione

## Contenitori configurabili
- Incassi disponibili
- Fornitori
- Stipendi e collaboratori
- Commercialista
- Imposte e contributi
- Rimborsi e controversie
- Logistica / RiverSpend Box
- Tecnologia e servizi
- Marketing / RS Spons
- Riserva aziendale
- Utile/distribuzione, quando legalmente disponibile

Le percentuali e gli importi sono configurabili e non vengono fissati automaticamente in base a ipotesi fiscali.

## Regole di sicurezza
1. Un pagamento deve partire da un incasso confermato.
2. Gli accantonamenti non devono essere confusi con denaro già trasferito.
3. Nessun pagamento fiscale, fornitore o professionista viene eseguito automaticamente senza le autorizzazioni previste.
4. Ogni movimento deve avere stato, importo, valuta, destinatario, motivazione e riferimento.
5. I doppi pagamenti devono essere prevenuti con idempotenza.
6. Rimborsi e storni devono essere tracciati separatamente.
7. Le commissioni dei provider devono essere registrate.
8. Il sistema deve distinguere lordo, commissioni, netto, accantonato, pagato e disponibile.
9. Le regole fiscali devono essere configurabili per Paese e verificate con il commercialista.
10. Il modulo deve essere accessibile solo agli utenti autorizzati RSPC.

## Dashboard RSPC
- Totale incassi
- Disponibile
- Accantonato
- Da pagare
- Pagato
- Tasse/contributi accantonati
- Fornitori da pagare
- Commercialista
- Rimborsi
- Commissioni
- Flussi per Paese e valuta
- Scadenze
- Riconciliazione bancaria

## Stati dei movimenti
planned → reserved → pending_approval → approved → processing → paid
Eccezioni: cancelled, failed, refunded, reversed.

## Fase successiva
Implementare nel database RSPC le tabelle per wallet/conti logici, regole di allocazione, movimenti Treasury, beneficiari, richieste di pagamento, approvazioni e riconciliazioni.

L'esecuzione dei trasferimenti reali sarà collegata ai provider/banca solo dopo la configurazione degli account commerciali e delle autorizzazioni.