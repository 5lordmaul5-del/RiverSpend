import { useCallback, useEffect, useState } from "react";
import Head from "next/head";

const CONTROLS = [
  { key: "shopActive", title: "RiverShop", description: "Sospende il catalogo e le nuove operazioni dello shop.", enabled: "SHOP ONLINE", disabled: "SHOP IN MANUTENZIONE", on: "Attiva Kill Switch", off: "Riattiva Shop" },
  { key: "stripeEnabled", title: "Stripe", description: "Blocca la creazione di nuovi checkout Stripe. I webhook restano attivi per riconciliare pagamenti già avviati.", enabled: "PAGAMENTI ATTIVI", disabled: "NUOVI CHECKOUT SOSPESI", on: "Sospendi Stripe", off: "Riattiva Stripe" },
  { key: "aiChatEnabled", title: "RiverSSAI · Nova", description: "Sospende le nuove richieste AI con una risposta di servizio non disponibile.", enabled: "AI OPERATIVA", disabled: "AI IN MANUTENZIONE", on: "Spegni AI", off: "Riattiva AI" }
];

export default function FortressDashboard() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchStatus = useCallback(async () => {
    const response = await fetch("/api/admin/killswitch", { credentials: "same-origin", cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.error || "Impossibile leggere lo stato della Fortezza.");
    setStatus(data.fortress);
    setAuthenticated(true);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { credentials: "same-origin", cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (active && data.success) fetchStatus().catch((err) => setError(err.message));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [fetchStatus]);

  useEffect(() => {
    if (!authenticated) return undefined;
    const timer = setInterval(() => fetchStatus().catch((err) => setError(err.message)), 15000);
    return () => clearInterval(timer);
  }, [authenticated, fetchStatus]);

  async function connect(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || "Accesso amministratore non riuscito.");
      setSecret("");
      await fetchStatus();
      setNotice("Sessione amministratore attiva.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggle(key, current) {
    const action = current ? "disattivare" : "riattivare";
    if (!window.confirm("Confermi di " + action + " questo modulo?")) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/killswitch", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flags: { [key]: !current } })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || "Comando non eseguito.");
      setStatus(data.fortress);
      setNotice("Stato aggiornato e salvato nel control plane Edge Config.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    setLoading(true);
    try {
      await fetch("/api/admin/session", { method: "DELETE", credentials: "same-origin" });
    } finally {
      setAuthenticated(false);
      setStatus(null);
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>RiverSpend · Fortress Control Room</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-cyan-400">RIVERSPEND SECURITY OPERATIONS</p>
              <h1 className="mt-2 text-2xl font-bold tracking-wide sm:text-3xl">FORTRESS CONTROL ROOM</h1>
              <p className="mt-2 text-sm text-slate-400">Pannello amministrativo di emergenza · Accesso riservato</p>
            </div>
            {authenticated && <button onClick={disconnect} disabled={loading} className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50">Disconnetti</button>}
          </header>

          {error && <div role="alert" className="mb-5 rounded-lg border border-rose-800 bg-rose-950/50 p-4 text-sm text-rose-200">{error}</div>}
          {notice && <div role="status" className="mb-5 rounded-lg border border-emerald-800 bg-emerald-950/40 p-4 text-sm text-emerald-200">{notice}</div>}

          {!authenticated ? (
            <form onSubmit={connect} className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <div className="mb-5 text-3xl" aria-hidden="true">🛡️</div>
              <h2 className="text-xl font-semibold">Autenticazione amministratore</h2>
              <p className="mt-2 text-sm text-slate-400">La credenziale viene usata solo per aprire una sessione HttpOnly e non viene salvata nel browser.</p>
              <label htmlFor="fortress-secret" className="mt-6 block text-sm text-slate-300">Chiave amministratore</label>
              <input id="fortress-secret" type="password" autoComplete="current-password" value={secret} onChange={(event) => setSecret(event.target.value)} required className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-cyan-500" />
              <button type="submit" disabled={loading || !secret} className="mt-4 w-full rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white hover:bg-cyan-500 disabled:opacity-50">{loading ? "Connessione..." : "Accedi alla Fortezza"}</button>
            </form>
          ) : (
            <>
              <section className="mb-6 rounded-xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-widest text-slate-500">STATO CONTROL PLANE</p>
                    <p className="mt-1 font-semibold text-emerald-300">EDGE CONFIG · CONNESSO</p>
                  </div>
                  <button onClick={() => fetchStatus().catch((err) => setError(err.message))} disabled={loading} className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800">Aggiorna stato</button>
                </div>
                <p className="mt-3 text-xs text-slate-500">Ultimo aggiornamento: {status?.lastUpdated ? new Date(status.lastUpdated).toLocaleString("it-IT") : "Stato iniziale"} · Autore: {status?.updatedBy || "system"}</p>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                {CONTROLS.map((control) => {
                  const active = Boolean(status?.[control.key]);
                  return (
                    <article key={control.key} className="flex min-h-52 flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-5">
                      <div>
                        <h2 className="text-lg font-semibold">{control.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{control.description}</p>
                      </div>
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                        <span className={"rounded-md border px-2.5 py-1 text-xs font-bold " + (active ? "border-emerald-800 bg-emerald-950 text-emerald-300" : "border-rose-800 bg-rose-950 text-rose-300")}>{active ? control.enabled : control.disabled}</span>
                        <button disabled={loading} onClick={() => toggle(control.key, active)} className={"rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50 " + (active ? "bg-rose-700 hover:bg-rose-600" : "bg-emerald-700 hover:bg-emerald-600")}>{active ? control.on : control.off}</button>
                      </div>
                    </article>
                  );
                })}
              </section>

              <section className="mt-4 rounded-2xl border border-amber-900/70 bg-amber-950/20 p-5">
                <h2 className="font-semibold text-amber-200">Fallback Static CDN · Non ancora attivabile</h2>
                <p className="mt-2 text-sm leading-6 text-amber-100/70">Il flag è riservato, ma il catalogo statico di emergenza e la sua sincronizzazione non sono ancora implementati. Non mostriamo un interruttore che fingerebbe di proteggere lo shop.</p>
              </section>
            </>
          )}
          <footer className="mt-10 border-t border-slate-800 pt-5 text-xs leading-5 text-slate-500">I comandi si applicano ai moduli integrati e dopo la propagazione della configurazione Edge. Le funzioni già avviate, i webhook di pagamento e i processi esterni possono completarsi separatamente.</footer>
        </div>
      </main>
    </>
  );
}
