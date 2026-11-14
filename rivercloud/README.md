# RiverCloud — fondazione infrastrutturale

RiverCloud è il programma per portare sotto controllo diretto dell'azienda dati, identità, archiviazione, backup, osservabilità e servizi condivisi dell'ecosistema River.

## Stato

Questa cartella documenta la fondazione e il percorso di implementazione. **Non è ancora un'infrastruttura operativa**: non sono stati creati server, cluster, database autonomi o backup eseguibili con questi documenti. I servizi esistenti restano in funzione finché ogni sostituzione non è stata collaudata e autorizzata.

## Principi non negoziabili

1. Proprietà e portabilità dei dati: formati standard, export verificabili, niente lock-in deliberato.
2. Sicurezza predefinita: minimo privilegio, isolamento dei tenant, RLS dove applicabile, segreti solo lato server.
3. Continuità: backup indipendenti, ripristini provati, ridondanza e procedure documentate.
4. Sostituzione graduale: migrazione reversibile, senza spegnere il servizio attuale prima dei test.
5. Verificabilità: ogni controllo deve produrre evidenze, log e risultati ripetibili.
6. Costi trasparenti: misurare hardware, rete, energia, manutenzione e personale; nessuna promessa di risorse illimitate.

## Componenti obiettivo

- **RiverDB** — PostgreSQL gestito direttamente, con backup e replica.
- **RiverIdentity** — autenticazione, sessioni, ruoli e gestione account.
- **RiverStorage** — oggetti e file con versioning e policy di accesso.
- **RiverBackup** — copie separate, cifrate e con protezione dalla cancellazione.
- **RiverSecurity** — gestione segreti, audit, vulnerabilità e incidenti.
- **RiverObservability** — metriche, log, allarmi e stato dei servizi.
- **RiverCompute** — esecuzione applicativa e capacità di calcolo, inclusa AI in una fase successiva.

I nomi sono domini progettuali, non prodotti già implementati.

## Documenti

- [Architettura obiettivo](ARCHITECTURE.md)
- [Baseline di sicurezza](SECURITY-BASELINE.md)
- [Continuità operativa e disaster recovery](DISASTER-RECOVERY.md)

## Primo criterio di successo

Prima di migrare un'applicazione, dobbiamo poter esportare i suoi dati, ripristinarli in un ambiente isolato, verificare integrità e permessi, e dimostrare un ritorno al servizio precedente. Nessun passaggio in produzione sulla sola base di una compilazione riuscita.
