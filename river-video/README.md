# River Video

River Video è l'applicazione pubblica di intrattenimento e scoperta video dell'ecosistema RiverSpend. Si appoggia a RiverStreaming, il livello tecnico che gestisce catalogo, identità, upload, elaborazione, distribuzione, playback, live e analytics.

## Ruoli distinti
- RiverStreaming: piattaforma tecnica e API.
- River Video: app per guardare, cercare, seguire creator e gestire la propria libreria; in una fase successiva anche pubblicare contenuti.
- RiverSpendStream: codice e documentazione già presenti; base da verificare ed evolvere, non da duplicare.

## Principi
1. Un'identità RiverSpend con permessi specifici per servizio.
2. Separare contenuti degli utenti (UGC), contenuti editoriali e catalogo professionale/licenziato.
3. Nessuna pubblicazione o monetizzazione senza diritti e autorizzazioni adeguati.
4. Nessuna chiave di storage o segreto nel client.
5. Playback autorizzato lato server con token a breve durata.
6. Nessuna funzione dichiarata attiva senza implementazione e test.
7. Nessuna migrazione distruttiva o modifica di produzione senza approvazione esplicita.

## Stato iniziale
Nel repository sono presenti la pagina web pages/river-spend-stream.js, l'app Expo apps/riverspendstream e docs/RIVERSPEND_STREAM.md. Le schermate attuali sono una base descrittiva: non dimostrano catalogo operativo, transcoding, CDN, upload sicuro o playback autenticato.

## Primo obiettivo
Una app River Video con navigazione e catalogo di test, player per asset autorizzati, account e libreria. I servizi media reali saranno collegati solo dopo verifica del backend RiverStreaming.