# Procedura operativa — bonifico BancoPosta con verifica manuale

## Stato attuale
Il checkout può indicare il bonifico come metodo scelto, ma non mostra coordinate bancarie e non certifica l'avvenuto pagamento. L'ordine deve restare non pagato finché non viene verificato l'accredito effettivo. Questa procedura è una checklist operativa, non un pannello amministrativo automatizzato.

## Prima di abilitare il metodo in produzione
- Confermare con il consulente fiscale e con Poste Italiane che il conto e il modello commerciale siano adatti agli incassi RiverSpend.
- Comunicare le coordinate bancarie solo attraverso un canale ufficiale autenticato e dopo averle verificate. Non inserirle nel codice pubblico, nei log o nei commit.
- Definire chi è autorizzato a verificare gli estratti conto e chi può aggiornare gli ordini.
- Creare e testare un'interfaccia amministrativa protetta con autenticazione e autorizzazioni server-side. Non usare una chiave segreta condivisa nel browser.

## Checklist per ogni ordine
1. Identificare l'ordine con il suo ID RiverSpend e leggere il totale atteso e la valuta dall'ordine salvato.
2. Verificare l'accredito effettivo nel conto bancario autorizzato, non solo una ricevuta, uno screenshot, una mail o una dichiarazione del cliente.
3. Confrontare importo, valuta, data e riferimento della transazione. In caso di importo parziale, incongruenza, pagamento duplicato o mittente non chiaro, lasciare l'ordine in attesa e chiedere chiarimenti.
4. Prima di confermare, verificare che la stessa transazione non sia già stata assegnata a un altro ordine e che l'ordine non sia già stato pagato o rimborsato.
5. Solo un operatore autenticato e autorizzato può registrare l'esito della verifica e cambiare lo stato. Registrare operatore, data/ora, importo verificato e riferimento bancario non sensibile in un audit log; non salvare credenziali bancarie.
6. Se l'accredito non è verificato, mantenere `payment_status = unpaid` (o lo stato pendente ammesso dallo schema) e non allocare fondi alla Treasury, non sbloccare la spedizione e non aggiungere fondi a PiggyBank.

## Requisiti tecnici prima del rilascio
- Il cliente non deve poter impostare `payment_status = paid` dal browser.
- La conferma deve passare da un endpoint server-side con sessione autenticata e controllo del ruolo amministrativo verificato lato server.
- L'endpoint deve validare ordine, importo, valuta, stato precedente e idempotenza; ogni modifica deve essere registrata in un audit log.
- Il ruolo amministrativo non va dedotto da campi del client né da un semplice parametro della richiesta.
- Testare i casi di pagamento assente, importo errato, doppio accredito, ordine già pagato, utente non autorizzato e servizio bancario non disponibile.

## Sandbox pagamenti
- L'endpoint sandbox è disabilitato in ambiente Vercel Production.
- In Preview richiede `RS_PAY_SANDBOX_ENABLED=true` e un progetto Supabase dedicato, separato da quello di produzione, configurato tramite `RS_PAY_SANDBOX_SUPABASE_URL` e `RS_PAY_SANDBOX_SERVICE_ROLE_KEY`.
- Il token di sessione e i ruoli `admin/ceo` devono appartenere al progetto sandbox isolato. Non riutilizzare token o credenziali del progetto di produzione.
- Se le variabili dedicate mancano, l'endpoint risponde senza modificare dati. Non configurare il sandbox sul database di produzione.

## Nota
La verifica manuale del bonifico deve essere eseguita da un operatore autorizzato che controlla l'accredito reale. La conferma bancaria aggiorna ordine e audit in modo atomico, ma l'integrazione automatica con Treasury/PiggyBank e il relativo collaudo devono essere verificati separatamente prima di dichiarare il flusso pronto.
