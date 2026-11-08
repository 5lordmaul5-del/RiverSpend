# RiverSSAI 10.0 — architettura a tre livelli

Aggiornato: 6 novembre 2026

## 1. RiverSSAI Core (coordinamento)
Il Core è l'API server-side `pages/api/river-ai/chat.js`. Autentica l'utente, applica il controllo owner-only, carica il contesto autorizzato, seleziona le competenze, limita la risposta e instrada la richiesta. Le competenze sono prospettive in un'unica richiesta al modello, non 30 agenti remoti autonomi.

## 2. RiverSSAI Local (motore prioritario, predisposto)
Il Core può chiamare un endpoint AI compatibile con l'API OpenAI tramite:
- `RIVER_AI_LOCAL_URL`: URL HTTPS completo dell'endpoint chat completions;
- `RIVER_AI_LOCAL_MODEL`: nome del modello locale;
- `RIVER_AI_LOCAL_API_KEY`: chiave opzionale, conservata solo come variabile server-side.

Il motore locale viene provato per primo. La chiamata ha un timeout breve; se non risponde, restituisce un errore o un output vuoto, il Core passa al livello Cloud. Non inserire chiavi in codice, browser, repository o chat.

**Limite operativo:** un modello installato sul PC/telefono dell'utente non è automaticamente raggiungibile dalle funzioni Vercel. Serve una macchina sempre accesa e un endpoint raggiungibile in modo sicuro (ad esempio rete privata/tunnel autenticato o server dedicato). Non pubblicare un endpoint locale senza autenticazione e HTTPS. Questa modifica prepara l'adattatore, ma non installa né ospita ancora il modello locale.

## 3. RiverSSAI Cloud (riserva)
Il fallback attuale è Groq:
- `GROQ_API_KEY`: segreto server-side;
- `RIVER_AI_CLOUD_MODEL`: modello Cloud opzionale;
- in assenza di questa variabile si usa `RIVER_AI_MODEL` o il modello predefinito.

Se Local non è configurato, il sistema continua a usare Cloud come prima. Se Local è configurato ma non disponibile, il Core tenta Cloud. Se entrambi non sono disponibili, restituisce un errore controllato.

## Gestione dei token AI
- I token sono unità di testo elaborate dal modello, non monete o criptovalute.
- La richiesta squadra usa una sola chiamata al provider per risposta.
- Il limite di output è configurato a 850 token.
- I limiti del provider (per esempio TPM) continuano ad applicarsi: una sola richiesta non significa consumo zero.
- Non vengono creati crediti RiverMoney né addebitati pagamenti per il consumo AI.

## Variabili da configurare solo quando il motore locale sarà pronto
Aggiungere le variabili in ambiente server Vercel, mai nel frontend:
```text
RIVER_AI_LOCAL_URL=https://<endpoint-protetto>/v1/chat/completions
RIVER_AI_LOCAL_MODEL=<nome-modello>
RIVER_AI_LOCAL_API_KEY=<segreto-opzionale>
```

Non aggiungere ancora valori segnaposto a Vercel: un URL non funzionante provocherebbe un timeout prima del fallback. Prima va scelta e collaudata la macchina che ospiterà il modello.

## Stato e criteri di rilascio
- Adapter Local-first e fallback Cloud: implementazione su branch di prova.
- Installazione del modello locale: non eseguita.
- Credenziali Local: non configurate.
- Produzione: non modificata.
- Prima del merge: build Preview riuscita, verifica API autenticata da owner, test di fallback con endpoint locale irraggiungibile e verifica che nessun segreto venga restituito al browser.
