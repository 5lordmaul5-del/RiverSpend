# RiverSpend Games — Hub e calendario mensile

## Obiettivo
Un comparto Games centrale nel sito RiverSpendShop. Ogni gioco avrà scheda, pagina di ingresso, stato, versione e collegamento al marketplace RiverSpendGamesShopS.

## Regola di pianificazione
Obiettivo editoriale: una nuova uscita ogni mese. Una data viene presentata come uscita confermata solo dopo build, test su dispositivi supportati, verifica di accessibilità e approvazione del rilascio. Il calendario web attuale è una pianificazione, non una promessa di pubblicazione automatica.

## Rotte
- /games — hub Games, catalogo e calendario mensile.
- /river-space-galaxy-games — hub del primo universo.
- /galaxy-explorer-playtest — prototipo 2D giocabile Planet E-01.
- /river-space-galaxy-games-shop — catalogo dimostrativo comune.

## Prototipo Planet E-01
La pagina playtest offre movimento su griglia, raccolta di cinque cristalli, controlli touch e tastiera, salvataggio locale del progresso. È una prova funzionale 2D nel browser; non è il motore 3D, non è multiplayer e non usa ancora account cloud.

## Marketplace
Il catalogo è dimostrativo. Checkout e consegna restano disattivati finché non esiste un flusso server-side con verifica pagamento, gestione ordini e assegnazione idempotente degli oggetti.

## Pipeline mensile suggerita
1. Scelta concept e scheda prodotto.
2. Prototipo giocabile.
3. Test funzionali e dispositivi.
4. Controllo sicurezza, performance e accessibilità.
5. Pubblicazione e scheda nel catalogo Games.
6. Supporto, correzioni e pianificazione del titolo successivo.
