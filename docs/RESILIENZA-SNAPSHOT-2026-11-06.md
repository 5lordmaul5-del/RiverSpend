# RiverSpend — snapshot di resilienza
Data verifica: 2026-11-06

## Copia del codice
- Repository: 5lordmaul5-del/RiverSpend
- Ramo sorgente: main
- Ramo di salvaguardia: backup/riverspend-resilience-2026-11-06
- Il ramo di salvaguardia è stato creato dal commit attuale di main.
- Questa copia protegge il codice Git; non equivale a un backup del database o dei file Storage.

## Stato del database Supabase verificato
- Progetto: Riverspend
- Ref: rkwqmteuxpdgdhgowbpn
- Regione: eu-west-1
- Stato al controllo: ACTIVE_HEALTHY
- PostgreSQL: 17.6.1.166
- Migrazioni registrate: 61
- Ultima migrazione: 20261104173427 river_ai_exclusive_owner_access
- Tabelle principali: products 24 righe; product_media 27; orders 35; order_items 55; profiles 2.
- Prodotti: 22 published e 2 sold (conteggio verificato in precedenza).
- Rami Supabase di sviluppo: nessuno presente al momento della verifica.

## Storage rilevato
Bucket: product-images, signals-private-media, signals-status-media.
Oggetti rilevati: 32 complessivi (27 product-images, 4 signals-private-media, 1 signals-status-media).

## Cosa NON è ancora salvato fuori dal provider
- Dump completo PostgreSQL (schema, dati, funzioni, policy, trigger e ruoli).
- Contenuti binari dei bucket Storage.
- Dati Auth e credenziali/chiavi di cifratura.
- Backup di ripristino verificato con prova di restore.

## Verifica del vecchio materiale nel repository
- products.json esiste ma è vuoto (zero byte).
- backup/ contiene una vecchia pagina statica e un server statico, non un clone del sito Next.js corrente.
- backups/ contiene un backup singolo di un file del Park, non un backup completo.
- riverspend_backup.tar.gz esiste (8.16 KB compresso circa), ma il contenuto non è stato validato; non considerarlo un backup completo.

## Restrizione di servizio
I log Vercel del 6 novembre 2026 riportano per /api/products:
exceed_cached_egress_quota.
Non modificare spend cap o piano senza approvazione esplicita del proprietario.

## Procedura successiva necessaria
1. Ottenere un export PostgreSQL completo usando Supabase CLI/pg_dump autenticato con credenziali DB custodite fuori da Git.
2. Esportare gli oggetti dei tre bucket Storage, inclusi i file privati, in un archivio cifrato.
3. Salvare gli archivi in una destinazione indipendente e privata (non in un repository pubblico).
4. Verificare checksum, conteggi e ripristino su un ambiente isolato prima di dichiarare il backup completo.

## Regole di sicurezza
Non committare dump, ordini, profili, messaggi, media privati, service-role key, password o chiavi Enigma in questo repository.
