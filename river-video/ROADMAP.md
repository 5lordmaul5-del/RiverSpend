# River Video — roadmap

## Fase 0 — inventario e verifica
Verificare app Expo e web, build Android, dipendenze, routing, account, API, schema database, Storage, provider video e configurazione deploy senza esporre segreti. Distinguere funzioni attive, incomplete, demo e solo documentate.
Uscita: rapporto con prove, rischi e decisioni aperte.

## Fase 1 — prototipo app
Brand River Video, navigazione Home/Cerca/Libreria/Account, catalogo demo etichettato, schede e player su video di test autorizzati, stati vuoti/errori/loading e accessibilità.
Uscita: build Android di test verificata; nessuna promessa di catalogo live.

## Fase 2 — backend RiverStreaming
API catalogo, identità e permessi, storage privato, upload in quarantena, elaborazione, playback HLS protetto, CDN, monitoraggio, quote, costi e backup.
Uscita: test end-to-end con contenuti autorizzati.

## Fase 3 — creator e UGC
Canali creator, upload, moderazione, Rights Check, segnalazioni, dashboard e metriche. Monetizzazione solo dopo policy, contratti e verifiche.

## Fase 4 — catalogo professionale
Film, serie, musica, documentari e Originals con licenze, territori, finestre, sottotitoli e rendicontazione royalties. Abbonamenti, noleggio o acquisto solo quando diritti e sistemi commerciali sono pronti.

## Fase 5 — live e TV
Live streaming con pipeline verificata, app Android TV/Google TV e poi altre piattaforme; test telecomando, playback lungo, prestazioni e certificazioni store.

## Regole
Ogni fase ha test e criteri di accettazione. Nessuna migrazione distruttiva, nessun deploy o cambiamento produzione senza autorizzazione. Non confondere schermate demo con servizi operativi. Misurare costo per ora vista, banda, transcodifica, storage e supporto prima di scalare.