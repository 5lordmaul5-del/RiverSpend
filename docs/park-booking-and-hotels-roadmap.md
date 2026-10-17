# RiverSpend Park — prenotazioni, biglietti e futura ospitalità

## Stato
Questa specifica accompagna la pagina prototipo `/park-booking`. È una bozza di prodotto, non un sistema di prenotazione attivo. La pagina non riserva posti, non registra ordini e non esegue pagamenti.

## Tariffe stagionali proposte (da approvare)
- Ottobre–febbraio: Terra, 30 € adulto / 20 € bambino.
- Marzo–aprile: Terra, 40 € adulto / 30 € bambino.
- Maggio–settembre: Terra + Acqua, 50 € adulto / 40 € bambino.
Le tariffe bambini e il calendario sono ipotesi di lavoro. Prima di pubblicare bisogna approvare età che definisce bambino, prezzi, date di apertura, eccezioni, rimborsi e manutenzioni.

## Flusso previsto
1. Il cliente seleziona una data realmente aperta.
2. Il backend calcola stagione, area accessibile, prezzo e fasce orarie consentite; il browser non è la fonte autorevole dei prezzi.
3. Il backend verifica la capienza per data e fascia e crea una prenotazione con stato esplicito (es. pending/confirmed/cancelled).
4. La conferma e l'eventuale pagamento vengono gestiti server-side. Nessuna conferma prima del completamento delle verifiche necessarie.
5. Per ogni ingresso si emette un identificativo QR univoco, senza dati personali in chiaro nel QR.
6. Al varco, il personale verifica il biglietto lato server e lo marca come utilizzato in modo atomico per impedire riutilizzi.
7. Il cliente consulta conferme, QR, modifiche e cancellazioni dalla propria area personale.

## Regole di disponibilità
- Calendario amministrabile con giorni chiusi per manutenzione.
- Stagioni e aree Terra/Acqua configurabili con date effettive, non solo dedotte dal mese.
- Capienza giornaliera e per fascia oraria, con blocco atomico contro overbooking.
- Le date dell'area acquatica devono risultare disponibili solo quando l'area è dichiarata aperta.
- Regole pubbliche per modifiche, cancellazioni, rimborsi e maltempo.
- Non vendere o confermare ingressi quando il calendario/capienza non sono verificabili.

## Gift Card
- Le Gift Card sono un prodotto distinto dal biglietto già prenotato.
- Alla prenotazione, verificare validità, residuo ingressi, stagione/area consentita ed eventuali differenze di prezzo.
- La riscossione deve essere atomica e idempotente, con audit e protezione contro riutilizzo.
- I pulsanti d'acquisto restano disabilitati finché non esistono emissione, pagamento e rimborso verificati.

## Pannello operativo
- Calendario aperture e manutenzioni.
- Capienza per giorno e fascia, prenotazioni e lista d'attesa eventuale.
- Check-in/QR, annullamenti, eccezioni e audit degli operatori.
- Report giornalieri senza esporre dati personali non necessari.

## Evoluzione futura: RiverSpend Hotels
Predisporre il modello dati per aggiungere in seguito:
- strutture alberghiere e tipologie di camera;
- inventario camere per date, occupazione, ospiti e regole di soggiorno;
- check-in/check-out e politiche di cancellazione;
- pacchetti hotel + biglietti con disponibilità e prezzi coordinati;
- area personale unica per soggiorno, ingressi e Gift Card.

Hotel e pacchetti non devono essere mostrati come prenotabili finché inventario, disponibilità, pagamenti, conferme e cancellazioni non sono implementati e testati.

## Sicurezza e rilascio
- Non fidarsi di prezzi, capienza, stato del QR o quantità inviati dal client.
- Autorizzazioni server-side, RLS ove applicabile, limitazione tentativi, audit e protezione dei dati.
- Verificare schema Supabase e migrazioni in ambiente isolato prima di ogni applicazione.
- Testare doppia prenotazione concorrente, capienza esaurita, QR duplicato, Gift Card scaduta, cancellazioni, errori di pagamento e manutenzione improvvisa.
- Tenere la funzione in anteprima e non unire in produzione prima dei test manuali e automatici.

## Decisioni ancora da approvare
1. Tariffe definitive e definizione adulto/bambino.
2. Calendario reale e chiusure per manutenzione.
3. Capienza giornaliera e durata delle fasce orarie.
4. Politiche di modifica, cancellazione, rimborsi e maltempo.
5. Se gli orari indicano ingresso al parco o una fascia di arrivo.
6. Dati richiesti ai clienti e durata di conservazione.
