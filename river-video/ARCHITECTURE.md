# River Video — architettura

## Architettura logica
River Video (Android/iOS/Web, TV in fasi successive) → API RiverStreaming → identità e autorizzazioni → catalogo e diritti → upload in quarantena → elaborazione/transcodifica → storage privato → CDN e playback protetto → analytics e monetizzazione.
Questa è un'architettura obiettivo, non una descrizione di servizi già distribuiti.

## Aree dell'app
- Home: continua a guardare, novità, categorie e selezioni.
- Cerca: titolo, persone, genere e creator.
- Scheda: descrizione, durata, lingua, classificazione e disponibilità.
- Player: riproduzione adattiva, sottotitoli, audio ed errori gestiti.
- La mia lista: preferiti e continua a guardare.
- Creator: canale, upload, revisione e gestione contenuti.
- Live: eventi e dirette, solo quando il backend live è pronto.
- Account: sessioni, privacy e impostazioni.

## Classi di contenuto
Ogni contenuto deve avere tipo, proprietario, stato pubblicazione, stato diritti, territori, finestra di disponibilità, classificazione, lingua, sottotitoli e policy di monetizzazione. UGC, catalogo editoriale e contenuti licenziati richiedono flussi di approvazione distinti.

## Flusso upload
1. Utente autenticato richiede una sessione al backend.
2. Backend verifica ruolo, quota, limiti e policy.
3. Upload diretto verso area privata/quarantena con URL firmato a scadenza breve.
4. Validazione formato, dimensione, durata, malware e policy.
5. Pipeline genera rendition, poster e sottotitoli.
6. Revisione e Rights Check.
7. Solo contenuti approvati diventano pubblici.
8. Playback autorizzato dal backend.

Gli originali e i contenuti non pubblicati non devono stare in bucket pubblici.

## Playback
Preferire HLS adattivo (DASH se necessario), token brevi, verifica account/diritti/territorio, limiti di sessione e logging privo di token o dati personali non necessari.

## Modello dati da progettare
Media assets, contenuti video, tracce audio/sottotitoli, diritti/licenze, canali creator, progresso visione, liste utente, sessioni playback e casi di moderazione. Prima di creare migration, verificare lo schema esistente e prevenire duplicazioni.

## Integrazione
Prima di modificare l'app Expo o le API esistenti, inventariare build, dipendenze, route, autenticazione, schema database, storage e deploy. Evolvere il codice esistente quando sano.