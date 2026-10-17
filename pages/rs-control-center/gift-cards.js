"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

const OPTIONS = [
  { label: "5 €", value: 500 }, { label: "10 €", value: 1000 },
  { label: "25 €", value: 2500 }, { label: "50 €", value: 5000 },
  { label: "100 €", value: 10000 }, { label: "200 €", value: 20000 },
  { label: "500 €", value: 50000 }, { label: "1.000 €", value: 100000 }
];
const csvCell = (value) => '"' + String(value ?? "").replace(/"/g, '""') + '"';

export default function GiftCardControl() {
  const router = useRouter();
  const [status, setStatus] = useState("Verifica accesso…");
  const [count, setCount] = useState("100");
  const [denominationCents, setDenominationCents] = useState("1000");
  const [label, setLabel] = useState("Lotto prova RiverSpendShop");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [batch, setBatch] = useState(null);

  useEffect(() => {
    let active = true;
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) { setStatus("login"); return; }
      const { data: role, error: roleError } = await supabase
        .from("rs_admin_roles").select("role").eq("user_id", session.user.id).maybeSingle();
      if (!active) return;
      if (roleError || role?.role !== "admin") { setStatus("denied"); return; }
      setStatus("admin");
    }
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => check());
    return () => { active = false; subscription?.unsubscribe(); };
  }, []);

  async function generate(e) {
    e.preventDefault();
    setError(""); setMessage(""); setBatch(null); setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("La sessione è scaduta. Accedi di nuovo.");
      const response = await fetch("/api/gift-cards/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ count: Number(count), denominationCents: Number(denominationCents), label })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generazione non riuscita.");
      setBatch(data);
      setMessage("Lotto creato. Scarica subito il CSV protetto: i codici segreti sono mostrati una sola volta.");
    } catch (err) {
      setError(err.message || "Errore durante la generazione.");
    } finally { setBusy(false); }
  }

  function downloadCsv() {
    if (!batch?.cards?.length) return;
    const headers = ["batch_id", "public_code", "barcode_value", "denomination_eur", "secret_code", "status"];
    const lines = [headers.map(csvCell).join(","), ...batch.cards.map((card) => headers.map((key) => csvCell(card[key])).join(","))];
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "RiverSpendShop-GiftCard-" + batch.batchId + ".csv";
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    URL.revokeObjectURL(url);
  }

  if (status === "login") return <main className="min-h-screen bg-slate-950 p-6 text-white"><div className="mx-auto max-w-xl rounded-2xl border border-cyan-800 p-6"><h1 className="text-2xl font-black">RiverSpend Gift Card Control</h1><p className="mt-3 text-slate-300">Accedi con il tuo account amministratore RiverSpend per continuare.</p><button onClick={() => router.push("/login")} className="mt-5 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">Vai al login</button></div></main>;
  if (status === "denied") return <main className="min-h-screen bg-slate-950 p-6 text-white"><div className="mx-auto max-w-xl rounded-2xl border border-red-800 p-6"><h1 className="text-2xl font-black">Accesso non autorizzato</h1><p className="mt-3 text-slate-300">Questo pannello è riservato agli amministratori.</p><button onClick={() => router.push("/")} className="mt-5 rounded-xl border border-slate-600 px-5 py-3 font-bold">Torna al sito</button></div></main>;
  if (status !== "admin") return <main className="min-h-screen bg-slate-950 p-6 text-white">Verifica accesso amministratore…</main>;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <a href="/rs-control-center" className="text-sm font-bold text-cyan-200">← Torna al pannello RSPC</a>
        <p className="mt-6 text-xs font-black uppercase tracking-[.25em] text-amber-300">YOUR SHOP • YOUR FLOW</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">RiverSpendShop Gift Card Control</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-300">Genera lotti di carte fisiche o digitali con codici univoci, importo e saldo iniziale. Ogni lotto può contenere al massimo 1.000 carte; crea più lotti per arrivare a 100.000.</p>

        <form onSubmit={generate} className="mt-8 grid gap-5 rounded-2xl border border-cyan-800/70 bg-slate-900 p-5 sm:grid-cols-2 sm:p-7">
          <label className="grid gap-2 text-sm font-bold">Nome lotto
            <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={100} required className="rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <label className="grid gap-2 text-sm font-bold">Importo per carta
            <select value={denominationCents} onChange={(e) => setDenominationCents(e.target.value)} className="rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white">
              {OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold sm:col-span-2">Numero carte nel lotto (1–1.000)
            <input type="number" min="1" max="1000" step="1" value={count} onChange={(e) => setCount(e.target.value)} required className="rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white" />
          </label>
          <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100 sm:col-span-2">
            Per sicurezza il codice segreto viene mostrato una sola volta nella risposta e nel CSV scaricabile. Conserva il file in un luogo protetto e consegnalo alla tipografia con una procedura sicura. Le carte create restano in attesa di attivazione e non sono spendibili.
          </div>
          {error && <p role="alert" className="sm:col-span-2 rounded-xl border border-red-700 bg-red-950/50 p-3 text-red-200">{error}</p>}
          {message && <p role="status" className="sm:col-span-2 rounded-xl border border-emerald-700 bg-emerald-950/50 p-3 text-emerald-200">{message}</p>}
          <button disabled={busy} className="rounded-xl bg-gradient-to-r from-cyan-300 to-blue-400 px-5 py-3 font-black text-slate-950 disabled:opacity-50 sm:col-span-2">{busy ? "Genero il lotto…" : "Genera lotto Gift Card"}</button>
        </form>

        {batch && <section className="mt-6 rounded-2xl border border-emerald-700 bg-slate-900 p-5 sm:p-7">
          <h2 className="text-xl font-black text-emerald-300">Lotto creato</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-950 p-3"><p className="text-xs text-slate-400">Carte</p><p className="text-2xl font-black">{batch.count}</p></div>
            <div className="rounded-xl bg-slate-950 p-3"><p className="text-xs text-slate-400">Valore singolo</p><p className="text-2xl font-black">{batch.denominationEur.toLocaleString("it-IT")} €</p></div>
            <div className="rounded-xl bg-slate-950 p-3"><p className="text-xs text-slate-400">Valore lotto</p><p className="text-2xl font-black">{batch.totalValueEur.toLocaleString("it-IT")} €</p></div>
          </div>
          <p className="mt-3 break-all text-xs text-slate-400">ID lotto: {batch.batchId}</p>
          <button onClick={downloadCsv} className="mt-5 w-full rounded-xl bg-amber-300 px-5 py-3 font-black text-slate-950">Scarica CSV per produzione (codici segreti inclusi)</button>
          <p className="mt-3 text-sm leading-6 text-amber-100">Dopo aver chiuso o aggiornato la pagina, il codice segreto non sarà più recuperabile da questo pannello. Se il download viene perso, annulla il lotto con procedura amministrativa e genera un nuovo lotto.</p>
          <div className="mt-5 max-h-72 overflow-auto rounded-xl border border-slate-700">
            <table className="w-full text-left text-xs"><thead className="sticky top-0 bg-slate-800"><tr><th className="p-2">Codice pubblico</th><th className="p-2">Barcode ID</th><th className="p-2">Importo</th></tr></thead><tbody>{batch.cards.slice(0, 25).map((card) => <tr key={card.public_code} className="border-t border-slate-800"><td className="p-2">{card.public_code}</td><td className="p-2">{card.barcode_value}</td><td className="p-2">{card.denomination_eur} €</td></tr>)}</tbody></table>
            {batch.cards.length > 25 && <p className="p-2 text-slate-400">Anteprima delle prime 25 carte; il CSV contiene tutte le {batch.cards.length} carte.</p>}
          </div>
        </section>}
      </div>
    </main>
  );
}
