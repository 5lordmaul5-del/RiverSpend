# RiverCloud — continuità operativa e disaster recovery

## Obiettivo

Ridurre la probabilità di perdita dati e il tempo di indisponibilità. Le copie devono sopravvivere a errori applicativi, cancellazioni accidentali, credenziali compromesse e indisponibilità di un singolo provider o sito.

## Strategia di backup

Adottare il principio 3-2-1-1-0, adattato al rischio e ai costi:

- almeno 3 copie dei dati;
- almeno 2 supporti o sistemi differenti;
- almeno 1 copia fuori dal sito/ambiente primario;
- almeno 1 copia offline o immutabile, non cancellabile dagli account ordinari;
- 0 errori non verificati nei controlli di integrità e nei test di ripristino.

La replica in tempo reale non conta come copia di backup indipendente. Le credenziali per cancellare i backup devono essere separate da quelle di produzione.

## Inventario obbligatorio per ogni servizio

- nome, responsabile e criticità;
- origine e destinazione delle copie;
- frequenza, retention e cifratura;
- chi può leggere, ripristinare o cancellare;
- ultima esecuzione riuscita e ultimo restore testato;
- RPO e RTO concordati e misurati;
- dipendenze necessarie al ripristino.

## Procedura di ripristino

1. Dichiarare l'incidente e nominare il responsabile operativo.
2. Mettere in sicurezza account e sistemi compromessi; evitare che il ripristino reintroduca l'attacco.
3. Selezionare una copia nota e verificare firma/hash e integrità.
4. Ripristinare in ambiente isolato, senza sovrascrivere subito la produzione.
5. Verificare schema, conteggi, campioni, permessi, file e coerenza applicativa.
6. Eseguire test funzionali e di sicurezza.
7. Autorizzare il rientro in servizio e monitorare intensivamente.
8. Registrare tempi, perdita dati, causa e azioni correttive.

## Esercitazioni

- Test automatico di integrità a ogni backup.
- Ripristino isolato periodico di database e file.
- Simulazione di perdita credenziali e indisponibilità del provider.
- Verifica che l'account di produzione non possa eliminare la copia immutabile.
- Conservazione dei risultati e delle anomalie.

## Regola di rilascio

Non dichiarare un backup affidabile perché il job risulta verde: è affidabile solo dopo un ripristino riuscito e verificato. Non rimuovere il provider attuale prima che la nuova piattaforma abbia superato esercitazioni documentate e il rollback sia praticabile.
