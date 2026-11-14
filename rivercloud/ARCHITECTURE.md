# RiverCloud — architettura obiettivo

## 1. Modello di riferimento

RiverCloud parte da componenti standard e sostituibili. Il primo motore relazionale previsto è PostgreSQL; l'obiettivo non è riscrivere da zero un database, ma possedere e gestire la piattaforma, le procedure, le chiavi, i dati e il piano di continuità.

```text
River apps (RiverSpend / RiverSSAI / RiverSpace Signals / future apps)
                         |
                River API Gateway
                         |
       +-----------------+------------------+
       |                 |                  |
  RiverIdentity      RiverDB          RiverStorage
       |                 |                  |
       +----------- RiverSecurity ---------+
                         |
             RiverObservability
                         |
                RiverBackup
          (separate failure domain)
```

Questo schema è logico: non indica server già installati né collegamenti già attivi.

## 2. Separazione dei piani

- **Control plane:** configurazione, provisioning, inventario, policy e deploy.
- **Data plane:** database, file, code e traffico applicativo.
- **Security plane:** identità, autorizzazioni, segreti, audit e risposta agli incidenti.
- **Recovery plane:** backup e copie in un dominio amministrativo e di guasto separato.

Un guasto o una compromissione del control plane non deve consentire di cancellare tutte le copie di backup.

## 3. Regole dati e accesso

- Ogni record multi-tenant deve avere un proprietario/tenant esplicito e vincoli coerenti.
- Autorizzazione verificata sul server; mai fidarsi di ruoli o permessi passati dal browser.
- Negare per impostazione predefinita; concedere solo operazioni strettamente necessarie.
- Separare account amministrativi, applicativi e di backup.
- Non esporre credenziali privilegiate nel client, nei log o nel repository.
- Cifrare traffico in transito e supporti/backup a riposo; documentare gestione e rotazione chiavi.

## 4. Alta disponibilità

La ridondanza deve coprire domini di guasto distinti: processo, macchina, alimentazione, rete e sito/fornitore. Due copie sullo stesso server non sono alta disponibilità. La replica non sostituisce il backup: replica anche cancellazioni e corruzioni.

## 5. Portabilità e uscita dai fornitori

Per ogni dipendenza esterna mantenere: funzione utilizzata, dati coinvolti, formato di export, procedura di restore, costo, limiti, alternativa e tempo stimato di sostituzione. Preferire protocolli e formati standard. Conservare infrastruttura come codice e configurazioni versionate senza segreti.

## 6. Migrazione per fasi

1. **Inventario:** applicazioni, database, bucket, domini, segreti, integrazioni, costi e proprietari.
2. **Backup verificato:** export completo e restore isolato dell'attuale piattaforma; misurare tempi e integrità.
3. **Laboratorio RiverCloud:** ambiente non produttivo, autenticazione, database e storage; test di sicurezza e carico.
4. **Replica e confronto:** sincronizzazione controllata, controlli di consistenza e test applicativi.
5. **Canary:** traffico limitato e reversibile, solo dopo approvazione esplicita.
6. **Cutover:** finestra pianificata, backup pre-cutover, piano di rollback e monitoraggio.
7. **Uscita dal fornitore:** solo dopo un periodo concordato di stabilità e prove di recupero.

## 7. Criteri di accettazione

Nessun servizio è dichiarato pronto finché non esistono: test automatizzati, test di autorizzazione negativi, restore dimostrato, monitoraggio, allarmi, runbook, stima dei costi e rollback provato. RPO e RTO devono essere definiti per servizio e misurati durante esercitazioni, non inventati a tavolino.
