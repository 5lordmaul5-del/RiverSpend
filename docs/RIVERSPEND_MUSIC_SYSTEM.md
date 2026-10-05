# RiverSpend Music System — Fase 1

## Obiettivo
Costruire il nucleo di RiverSpend Music partendo esclusivamente da musica originale RiverSpend.

## Modello dati previsto
- works: opera musicale (titolo, versione, genere, durata, stato)
- recordings: registrazione/master collegato all'opera
- contributors: autori, compositori, performer e altri titolari
- rights: quote e ruolo dei titolari, con validità e note contrattuali
- releases: pubblicazioni/album/singoli
- usage_events: utilizzi nei prodotti RiverSpend, RS Spons, TV, Live e altri servizi
- royalty_statements: rendicontazioni future

## Regola fondamentale
Nella fase iniziale il catalogo accetta solo musica per cui RiverSpend dispone dei diritti necessari. Nessun brano commerciale di terzi viene autorizzato automaticamente.

## RS Spons
RS Spons Creator dovrà poter scegliere una traccia del catalogo RiverSpend autorizzata per lo spot. L'utilizzo deve essere registrato come usage_event.

## Futuro canale artisti
Quando RiverSpend aprirà agli artisti esterni, ogni caricamento dovrà passare da: accettazione dei termini → verifica titolarità/licenze → metadata → contratto → pubblicazione → contabilizzazione degli utilizzi → rendicontazione.

## Royalties
RiverSpend potrà applicare una commissione solo quando prevista dall'accordo con l'artista e dalla struttura del servizio. La proprietà dei diritti e la quota economica devono essere esplicitamente registrate.

## Soundreef
L'integrazione tecnica con Soundreef non viene simulata né dichiarata attiva finché non sono disponibili API/strumenti ufficiali e le autorizzazioni necessarie. La sezione è predisposta per collegare in seguito i metadati e i processi reali.

## Prossimo sviluppo
1. Tabelle Supabase per catalogo e titolari.
2. Area RSPC Music Control.
3. Selettore musica autorizzata dentro RS Spons Creator.
4. Registrazione automatica degli utilizzi.
5. Workflow di pubblicazione e rendicontazione.
