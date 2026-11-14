# RiverCloud — baseline di sicurezza

Questa baseline si applica a ogni componente nuovo e a ogni migrazione. È una lista di requisiti da verificare, non una certificazione già ottenuta.

## Identità e privilegi

- MFA obbligatoria per amministratori e accessi infrastrutturali.
- Account individuali; vietati account condivisi per attività amministrative.
- Ruoli separati per amministrazione, applicazioni, supporto e backup.
- Privilegio minimo e revisione periodica degli accessi.
- Revoca sessioni e credenziali in caso di compromissione o uscita di un collaboratore.

## Applicazioni e API

- Autorizzazione server-side su ogni operazione e controllo proprietà della risorsa (anti-IDOR/BOLA).
- Validazione input, limiti dimensione/rate, timeout e protezione da abuso.
- Cookie/sessioni con impostazioni sicure; token mai salvati o esposti senza necessità.
- CORS ristretto; protezioni CSRF dove applicabili.
- Errori pubblici senza stack trace, segreti o dati personali.
- Dipendenze bloccate a versioni note, lockfile committati e scansioni vulnerabilità.

## Database e file

- RLS o meccanismo equivalente su ogni tabella esposta; testare anche accessi negati.
- Le policy di UPDATE devono impedire il cambio del proprietario/tenant.
- Credenziali privilegiate solo server-side; mai usare variabili pubbliche per segreti.
- Bucket privati per impostazione predefinita; URL firmati a scadenza per accessi temporanei.
- Backup cifrati, accessi separati e cancellazione protetta.

## Segreti e chiavi

- Nessun segreto in Git, ticket, screenshot o log.
- Secret manager o variabili protette per ambiente; separare sviluppo, preview e produzione.
- Rotazione documentata e prova periodica della rotazione.
- Chiavi di cifratura separate dai dati cifrati e dai backup.

## Monitoraggio e risposta

- Audit degli accessi amministrativi e delle modifiche ai dati sensibili.
- Allarmi per login anomali, errori ripetuti, picchi di traffico e fallimenti backup.
- Procedura incidente: contenimento, preservazione evidenze, rotazione segreti, ripristino, comunicazioni e analisi post-incidente.
- Non registrare password, token, chiavi o contenuti privati non necessari.

## Gate prima di ogni rilascio

- [ ] Revisione delle modifiche e dipendenze
- [ ] Test di autorizzazione per proprietario, altro utente e anonimo
- [ ] Verifica che nessun segreto sia nel bundle client o nei log
- [ ] Test backup e restore del componente interessato
- [ ] Monitoraggio e allarmi verificati
- [ ] Rollback documentato e provato
- [ ] Approvazione esplicita per la produzione
