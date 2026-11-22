# RiverSpaceGalaxyGames — App Games 1.0

## Scopo
App web integrata nell'ecosistema RiverSpendShop, con ingresso dedicato a RiverSpaceGalaxyGames e catalogo separato RiverSpendGamesShopS.

## Decisioni confermate
- Universo unico condiviso (architettura pronta a scalare su più istanze server).
- Visuale prevista: prima e terza persona.
- Primo comparto: Galaxy Explorer, Planet E-01.
- Agenti AI: assistenti e autonomi con permessi controllati.
- Accesso obiettivo: smartphone, PC e VR.
- Economia ibrida: crediti virtuali separati dai pagamenti reali.
- Marketplace centrale: RiverSpendGamesShopS sotto RiverSpendShop.

## Rotte
- /river-space-galaxy-games — hub dell'app e briefing Missione Zero.
- /river-space-galaxy-games-shop — catalogo dimostrativo dei prodotti digitali.

## Stato e limiti della prima consegna
Questa consegna crea l'interfaccia web/hub e il catalogo dimostrativo. Non contiene ancora motore 3D, multiplayer, account condiviso cablato, database del mondo, checkout o consegna automatica degli oggetti. I pulsanti di acquisto sono intenzionalmente disabilitati finché il flusso pagamenti e inventario non sarà implementato e testato.

## Prossime milestone
1. Verificare build Next.js e navigazione.
2. Integrare la voce App Games nella pagina app e nell'ecosistema.
3. Collegare RiverAuth senza introdurre login duplicati.
4. Implementare catalogo reale, ordini, webhook pagamento idempotenti e consegna server-side.
5. Realizzare il prototipo 3D Planet E-01 in Godot, con esportazione Android/PC e valutazione OpenXR.
6. Aggiungere server multiplayer autoritativo e persistenza PostgreSQL.

## Regola di sicurezza commerciale
Il client non determina mai prezzi, saldo, proprietà o consegne. Pagamento e grant degli oggetti devono essere convalidati lato server; nessuna conversione in denaro reale dei crediti virtuali è abilitata in questa fase.
