# RiverSpend — RS ALERTS & LIVE NEWS FEEDS

## Stato
Funzionalità richiesta e registrata nella roadmap. Non ancora collegata a feed live e non deve essere presentata come servizio di allerta operativo finché non è integrata e collaudata.

## Obiettivo
Aggiungere a RiverSpend Experience un centro informativo che raccolga notizie e allerte su terremoti, tsunami/maremoti, eruzioni vulcaniche, uragani/cicloni, alluvioni, incendi, eventi meteo estremi e altri rischi naturali.

## Fonti
Usare esclusivamente fonti ufficiali o istituzionali, preferendo API e feed RSS ufficiali:
- INGV per attività sismica e informazioni geologiche in Italia.
- Dipartimento della Protezione Civile e sistemi regionali per allerte e avvisi in Italia.
- Meteoalarm per avvisi meteorologici europei, dove disponibili.
- USGS per dati sismici globali.
- NOAA / National Hurricane Center per cicloni tropicali e uragani nelle aree di competenza.
- Tsunami warning centres ufficiali e UNESCO-IOC per avvisi tsunami.
- GDACS come fonte internazionale di coordinamento e panoramica dei grandi disastri.

Prima dell'integrazione verificare documentazione, licenze, disponibilità, limiti e modalità di aggiornamento di ciascun feed/API. Non inventare URL o endpoint.

## Scheda di ogni avviso
Mostrare sempre:
- tipo di evento e area geografica interessata;
- livello/severità così come fornito dalla fonte, senza reinterpretarlo;
- data e ora di emissione e ultimo aggiornamento;
- fonte ufficiale e collegamento alla comunicazione originale;
- stato dell'avviso (attivo, aggiornato, terminato) solo se fornito dalla fonte;
- indicazione chiara quando i dati sono ritardati, incompleti o non disponibili.

## Comportamento
- Aggiornare i feed con frequenza rispettosa dei limiti delle fonti e mostrare l'ora dell'ultimo controllo.
- Deduplicare gli avvisi e conservare la cronologia degli aggiornamenti.
- Filtrare per Paese/regione e tipo di evento.
- Dare priorità agli avvisi ufficiali che riguardano l'area selezionata dall'utente.
- Prevedere notifiche solo dopo aver definito consenso, preferenze e regole di sicurezza.
- Se una fonte non risponde, mostrare l'ultimo aggiornamento con un avviso di possibile ritardo; mai fingere che sia in tempo reale.
- Separare le notizie giornalistiche dagli avvisi ufficiali di protezione civile.

## Sicurezza e responsabilità
- RiverSpend è un canale informativo aggiuntivo, non sostituisce Protezione Civile, autorità locali, servizi di emergenza o istruzioni ufficiali.
- In caso di rischio, invitare a seguire immediatamente le istruzioni delle autorità competenti.
- Non generare autonomamente allerte o livelli di pericolo.
- Non pubblicare indicazioni operative non validate.
- Prima del lancio effettuare test con dati storici e scenari simulati, verificare ritardi, errori, duplicati e indisponibilità delle fonti.

## Interfaccia proposta
Sezione: **RS ALERTS • NEWS LIVE**
Categorie: Terremoti, Tsunami/Maremoti, Vulcani, Uragani/Cicloni, Alluvioni, Incendi, Meteo estremo, Altri eventi.
Visualizzazione: elenco cronologico con badge di severità proveniente dalla fonte, area, orario, fonte e link al bollettino ufficiale.

## Fasi di realizzazione
1. Mappare e verificare i feed/API ufficiali.
2. Creare un livello server per raccolta, normalizzazione e deduplicazione.
3. Realizzare la pagina RS ALERTS con filtri e timestamp.
4. Aggiungere notifiche opt-in solo dopo test affidabili.
5. Collaudare e verificare la correttezza prima di dichiarare il servizio attivo.
