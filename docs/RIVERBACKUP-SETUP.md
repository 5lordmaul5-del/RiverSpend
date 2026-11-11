# RiverBackup — configurazione operativa

**Stato attuale: codice preparato nel branch; automazione NON ancora attiva.** Il workflow giornaliero parte soltanto dopo merge in `main`, configurazione dei valori GitHub e primo test manuale riuscito.

## Cosa salva il workflow

Ogni esecuzione crea un archivio cifrato con:
- dump logici Supabase di ruoli custom, schema applicativo e dati applicativi;
- oggetti di tutti i bucket Supabase Storage, compresi i bucket privati, cifrati singolarmente;
- bundle Git con la cronologia e i riferimenti del repository.

L'archivio finale è cifrato con age e caricato in un bucket Amazon S3 in regione UE. Il workflow verifica versioning, Object Lock, checksum e scarica nuovamente il file per confrontarlo byte per byte.

## Limiti da non nascondere

1. L'organizzazione Supabase RiverSpend è attualmente sul piano **Free**. La documentazione Supabase indica che i backup automatici giornalieri gestiti sono disponibili sui piani Pro, Team ed Enterprise; per il piano Free raccomanda export regolari off-site.
2. I dump `supabase db dump` escludono gli schemi gestiti da Supabase, tra cui `auth` e `storage`. Gli oggetti Storage vengono esportati separatamente da questo workflow, ma utenti Auth, password/sessioni, provider OAuth, impostazioni del progetto, segreti e configurazioni di deploy non sono ricreati integralmente da questi file.
3. La funzione Edge attualmente distribuita e le impostazioni Auth devono essere versionate/documentate separatamente prima di poter dichiarare un disaster recovery completo.
4. Questo backup logico non equivale a PITR e non garantisce un RPO di un minuto. Il valore effettivo va misurato; non è possibile prometterlo sul piano Free.
5. Il workflow trasferisce dati di RiverSpend dal servizio Supabase a GitHub Actions e poi ad Amazon S3. Prima dell'attivazione vanno approvati il trattamento, la regione UE, le policy di accesso e i costi.

## Prerequisiti AWS

Creare un account AWS intestato al titolare del progetto, nella regione `eu-west-1` (Irlanda), e configurare AWS CLI con un'identità amministrativa temporanea. Non inserire chiavi AWS nel repository o in chat.

Scegliere un nome bucket S3 globalmente univoco e creare il bucket protetto:

```bash
export RIVER_BACKUP_S3_BUCKET="nome-univoco-riverspend-backup"
export RIVER_BACKUP_AWS_REGION="eu-west-1"
bash scripts/backup/bootstrap-s3-bucket.sh
```

Lo script imposta:
- blocco completo dell'accesso pubblico;
- HTTPS obbligatorio;
- versioning;
- cifratura server-side AES-256;
- Object Lock in modalità GOVERNANCE con retention predefinita di 30 giorni.

La retention GOVERNANCE impedisce la cancellazione ordinaria durante il periodo, ma un amministratore con permesso di bypass può superarla. Il ruolo GitHub non deve ricevere permessi di cancellazione né di bypass.

## Identità GitHub Actions tramite OIDC

Creare un provider OIDC AWS per `token.actions.githubusercontent.com` (audience `sts.amazonaws.com`) e un ruolo dedicato al solo repository `5lordmaul5-del/RiverSpend`, branch `main`.

La trust policy del ruolo deve limitare `sub` a:
`repo:5lordmaul5-del/RiverSpend:ref:refs/heads/main`

La policy IAM del ruolo deve concedere solo:
- `s3:PutObject` e `s3:PutObjectRetention` sul prefisso `river-backups/*`;
- `s3:GetObject` sul prefisso `river-backups/*` per la verifica post-upload;
- `s3:GetBucketVersioning` e `s3:GetBucketObjectLockConfiguration` sul solo bucket.

Non concedere `s3:DeleteObject`, `s3:DeleteObjectVersion` o `s3:BypassGovernanceRetention` al ruolo di backup. Il ripristino deve usare un'identità separata, concessa solo quando serve.

## Variabili e segreti GitHub

Nel repository, in **Settings → Secrets and variables → Actions**, configurare:

Repository variables:
- `RIVER_BACKUP_AWS_ROLE_ARN`: ARN del ruolo OIDC dedicato.
- `RIVER_BACKUP_AWS_REGION`: `eu-west-1`.
- `RIVER_BACKUP_S3_BUCKET`: nome del bucket creato.
- `RIVER_BACKUP_AGE_RECIPIENT`: chiave pubblica age `age1...`. Conservare la chiave privata age offline, fuori da GitHub e fuori da AWS.

Repository variables:
- `RIVER_BACKUP_SUPABASE_URL`: URL del progetto Supabase.

Repository secrets:
- `RIVER_BACKUP_SUPABASE_DB_URL`: connection string PostgreSQL con password URL-encoded, ottenuta dal pulsante Connect del progetto.
- `RIVER_BACKUP_SUPABASE_SERVICE_ROLE_KEY`: chiave privilegiata usata esclusivamente per leggere tutti gli oggetti Storage. Non deve mai essere pubblica o usata nel browser.

Non inviare questi valori in chat e non inserirli in file versionati. Limitare chi può modificare workflow e secrets.

## Attivazione e collaudo

1. Verificare la trust policy OIDC e la policy IAM con il titolare AWS.
2. Inserire variabili e segreti GitHub.
3. Portare il workflow in `main` tramite la normale revisione della PR; il cron GitHub Actions non esegue workflow schedulati da branch non predefiniti.
4. Eseguire manualmente `RiverSpend encrypted offsite backup` su `main`.
5. Controllare che l'azione termini con successo e che l'oggetto S3 sia versionato, bloccato e scaricabile.
6. Scaricare il file, verificarne SHA-256 e decifrarlo con la chiave privata age custodita offline.
7. Eseguire il restore in un progetto/ambiente separato e verificare tabelle, conteggi, policy, funzioni e oggetti prima di approvare la protezione come operativa.

## Ripristino

Il file age esterno va prima decifrato con la chiave privata custodita offline, poi estratto. I tre dump SQL sono cifrati individualmente e vanno decifrati separatamente. Il bundle Git può essere importato con `git clone riverspend.bundle` dopo averlo decifrato.

Non ripristinare mai questi dump direttamente sul database live come test. Il primo restore deve essere eseguito in un ambiente isolato e con una procedura revisionata. Gli utenti Auth e le impostazioni non incluse richiedono la procedura dedicata descritta nei limiti sopra.

## Frequenza e retention

Il workflow è pianificato ogni giorno alle 02:17 UTC. La retention Object Lock predefinita è 30 giorni. I costi dipendono da volume, richieste, trasferimento e versioni conservate; verificare il preventivo AWS dell'account prima di attivare.
