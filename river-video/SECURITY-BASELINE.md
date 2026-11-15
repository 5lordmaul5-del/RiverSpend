# River Video — sicurezza, privacy e diritti

## Identità e accesso
- Autenticazione RiverSpend e revoca sessioni.
- Autorizzazioni server-side per utente, creator, moderatore, editor e amministratore.
- Minimo privilegio e RLS verificata su ogni tabella esposta.
- Segreti privilegiati esclusivamente lato server.
- Controlli ownership per prevenire accessi IDOR.

## Media e upload
- Bucket privati per originali, quarantena e contenuti in lavorazione.
- URL firmati a scadenza breve; limiti di dimensione, durata, MIME e quota.
- Validazione del contenuto reale, non solo estensione.
- Pipeline di transcodifica isolata; mai eseguire file caricati.
- Rate limit, protezione abusi, audit e backup cifrati con prove di ripristino.

## Playback e distribuzione
- Autorizzazione prima di emettere manifest o token.
- Token brevi, limitati a contenuto e sessione.
- Verifica diritti, territorio, finestra e piano.
- Nessun segreto nei bundle mobile, source map o log.
- Le URL CDN non devono aggirare le regole di accesso.

## Diritti e moderazione
- Dichiarazione diritti e autorizzazioni all'invio.
- Verifica per film, musica, immagini, sincronizzazioni, marchi e materiale di terzi.
- Segnalazione, contestazione, rimozione e ricorso con audit trail.
- Classificazione, tutela minori e controllo parentale da progettare con revisione legale.

## Privacy e conformità
Minimizzazione dati, conservazione definita, informative e consensi quando necessari, esportazione/cancellazione secondo legge, analytics aggregati ove possibile. Valutare GDPR, DSA, copyright e obblighi audiovisivi con consulenti qualificati.

## Gate di rilascio
Nessun lancio pubblico prima di testare autorizzazioni, RLS, upload, playback, moderazione, diritti, privacy, backup e risposta agli incidenti. Questo documento non è una certificazione né un parere legale.