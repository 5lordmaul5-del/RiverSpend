# RiverSpend Apps

Questo spazio contiene le due app mobili dell'ecosistema RiverSpend:

- `riverspendshop` — app clienti/venditori RiverSpendShop per Android e iOS.
- `riverspend-panel-control` — app amministrativa RSPC per CEO e collaboratori autorizzati.

Le app sono separate dal progetto Web Next.js esistente per non modificare la build Vercel del RiverSpendShop.

Architettura prevista:
- RiverSpendShop Web + RiverSpendShop App + RSPC
- stesso backend Supabase
- autenticazione e autorizzazioni centralizzate
- media prodotti condivisi
- notifiche e funzioni native nelle app
