# RiverSpend SafePoint

## Scopo
Proteggere il progetto da regressioni, cancellazioni accidentali, modifiche incomplete e perdita di funzioni. Questo documento definisce il protocollo obbligatorio per ogni area RiverSpend, incluse RiverSignals, RiverSpendShop, RiverMoney/Pay, Park, Studio e gli altri moduli.

## Punto di ripristino iniziale
- Data: 2026-11-01
- Repository: https://github.com/5lordmaul5-del/RiverSpend
- Branch di lavoro protetta: `safepoint/2026-11-01`
- Branch di produzione: `main` (non modificare durante il lavoro SafePoint)
- Punto iniziale: commit di `main` dal quale è stata creata la branch SafePoint.

La branch SafePoint è una copia Git recuperabile, non una prova che ogni funzione del sito sia attualmente corretta. Prima di dichiarare stabile una versione occorre eseguire i test descritti sotto.

## Regola obbligatoria: salva, verifica, riapri
Per ogni modifica o idea:
1. Registrare area, obiettivo, file interessati e comportamento atteso.
2. Creare un punto di ripristino Git prima di modificare file già funzionanti.
3. Lavorare su una branch dedicata o su una copia di lavoro; mai direttamente su `main`.
4. Salvare con un commit descrittivo, senza sovrascrivere la storia.
5. Eseguire build e controlli automatici disponibili; non inventare test non eseguiti.
6. Aprire la preview e verificare la funzione sul dispositivo, inclusi collegamenti e navigazione.
7. Chiudere e riaprire l'app/sito e ripetere il controllo: la funzione deve rimanere presente.
8. Verificare che le funzioni già esistenti non siano sparite (test di regressione).
9. Solo dopo conferma esplicita, integrare la modifica in `main` e pubblicare.

## Scheda di collaudo per ogni rilascio
- [ ] Backup/punto Git creato prima della modifica
- [ ] Commit della modifica presente
- [ ] Build completata senza errori
- [ ] Preview raggiungibile
- [ ] Pagina iniziale corretta
- [ ] Navigazione e pulsanti principali funzionanti
- [ ] Funzione nuova verificata
- [ ] Funzioni precedenti verificate
- [ ] Chiusura e riapertura verificate
- [ ] Nessuna regressione nota
- [ ] Approvazione prima del rilascio in produzione

## Regole anti-perdita
- Non cancellare o sostituire una funzione esistente solo per aggiungerne una nuova.
- Non usare file demo come sostituti silenziosi delle funzioni reali.
- Non cambiare URL di avvio, pagina iniziale, manifest o routing senza testare l'apertura diretta e il riavvio.
- Non considerare un deploy riuscito come prova che l'app funzioni: serve il test reale.
- Conservare commit e branch; evitare force-push e riscrittura della cronologia.
- Annotare le dipendenze esterne e le variabili d'ambiente richieste, senza inserire segreti nel repository.
- Se un test fallisce, fermare il rilascio e ripristinare l'ultimo punto stabile.

## Backup indipendente
La cronologia Git e gli artifact GitHub proteggono dalle modifiche errate, ma risiedono nello stesso servizio/account. Per una vera seconda copia indipendente, esportare periodicamente l'archivio del repository in uno spazio separato controllato dal proprietario (ad esempio OneDrive) e verificare che l'archivio si apra. Non conservare password, token o chiavi API dentro gli archivi condivisi.

## Stato
SafePoint iniziale creato. I controlli automatici di archivio sono configurati dal workflow `.github/workflows/riverspend-safepoint.yml`. La verifica funzionale completa del sito e dei moduli resta da eseguire.
