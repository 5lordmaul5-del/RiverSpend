# River SSAI Ultra — architettura e stato

## Obiettivo
Costruire River SSAI come assistente operativo multi-agente, con coordinamento centrale, memoria privata, strumenti verificabili e recupero controllato dagli errori.

## Implementato in questa fase (feature branch)
- Selettore UI per Nova e agenti specializzati: Tech, Design, Robotics, Science, Memory e Control.
- Modalità Squadra Ultra: Tech, Science e Control analizzano in parallelo; Nova integra i rapporti in una risposta unica.
- Richieste al modello con timeout di 45 secondi.
- Un tentativo automatico aggiuntivo per errori di rete o server 5xx, con breve attesa progressiva.
- Gli errori 429 vengono restituiti in modo esplicito senza ritentativi aggressivi.
- Modello configurabile tramite variabile server-only RIVER_AI_MODEL; default attuale openai/gpt-oss-20b.
- Autenticazione Supabase e ruolo admin restano obbligatori.
- La memoria resta privata e viene scritta dopo la risposta.

## Significato di “autorigenerante”
In questa fase significa recupero controllato: timeout, retry limitato, error handling e possibilità di ripetere una richiesta. Non significa che l'AI possa riscrivere da sola il proprio codice, modificare i permessi, distribuire versioni o cambiare i dati senza controllo umano.

## Non ancora implementato
- Esecuzione autonoma di strumenti GitHub/Vercel/Supabase.
- Coda persistente di lavori lunghi e worker durevoli.
- Ricerca semantica della memoria: la colonna vector esiste ma non è ancora popolata né interrogata.
- Generazione nativa di immagini/video: richiede provider e credenziali separati.
- Progettazione CAD/3D e simulazione fisica effettiva: richiedono strumenti dedicati.
- Monitoraggio proattivo, allarmi, fallback tra provider e budget per agente.
- Test automatici end-to-end e verifica browser completa.

## Regole operative
- Non eseguire deploy in produzione, pagamenti, cancellazioni o modifiche di sicurezza senza approvazione esplicita.
- Ogni agente deve dichiarare quali dati ha letto, quali strumenti ha usato e quali test sono riusciti.
- Le operazioni fisiche/robotiche richiedono revisione umana e test di sicurezza.
- Il numero di agenti paralleli è limitato per contenere latenza e costi.

## Prossime fasi consigliate
1. Testare build e chat in Preview.
2. Aggiungere un pannello di stato/diagnostica per modello, memoria e servizi.
3. Implementare coda di attività con stati, retry e audit trail.
4. Implementare ricerca semantica della memoria con embeddings e retrieval.
5. Collegare provider per immagini e video con limiti di spesa.
6. Aggiungere strumenti operativi in sandbox con approvazione esplicita prima delle azioni esterne.
