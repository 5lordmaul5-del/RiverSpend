import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

const money = (amount, currency = "EUR") => {
  try { return new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(Number(amount || 0)); }
  catch { return String(amount || 0) + " " + currency; }
};
const statusNames = {
  pending_release: "In attesa di rilascio", eligible: "Pronto per il provider",
  submitted: "Inviato al provider", paid: "Pagato", held: "Sospeso",
  failed: "Fallito", cancelled: "Annullato", reversed: "Stornato"
};

export default function RiverPayControl() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (sessionError || !token) throw new Error("Accedi prima al tuo account amministratore RiverSpend.");
        const response = await fetch("/api/pay/admin/overview", {
          headers: { Authorization: "Bearer " + token },
          cache: "no-store"
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || "Accesso non disponibile.");
        if (active) setData(result);
      } catch (e) {
        if (active) setError(e?.message || "Errore nel caricamento.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link href="/servizi/pay" className="font-bold text-teal-700 underline">← RiverPay Global</Link>
        <header className="mt-6 rounded-3xl border border-teal-200 bg-gradient-to-br from-white to-cyan-50 p-6 sm:p-9">
          <p className="text-sm font-black uppercase tracking-[.2em] text-teal-700">RSPC · Area riservata</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">RiverPay Control</h1>
          <p className="mt-3 max-w-3xl text-slate-700">Controllo dei registri, delle quote e dei futuri regolamenti. Questa schermata non invia denaro e non avvia bonifici.</p>
          <span className="mt-4 inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-black text-amber-900">MODALITÀ PREPARAZIONE · TRASFERIMENTI DISATTIVATI</span>
        </header>

        {loading && <p className="mt-6 rounded-2xl bg-white p-5">Caricamento del registro finanziario…</p>}
        {error && <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950"><strong>Accesso non completato</strong><p className="mt-1 text-sm">{error}</p></div>}

        {data && <>
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-black">Stato delle quote</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(data.payoutCounts || {}).map(([status,count]) => <div key={status} className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-bold text-slate-500">{statusNames[status] || status}</div>
                <div className="mt-1 text-2xl font-black tabular-nums">{count}</div>
              </div>)}
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-black">Ultime quote registrate</h2>
            {data.payouts?.length ? <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm">
              <thead><tr className="border-b text-slate-500"><th className="p-2">Beneficiario</th><th className="p-2">Tipo</th><th className="p-2">Importo</th><th className="p-2">Stato</th><th className="p-2">Data</th></tr></thead>
              <tbody>{data.payouts.map(row => <tr key={row.id} className="border-b last:border-0"><td className="p-2 font-semibold">{row.beneficiary_label}</td><td className="p-2">{row.payout_kind}</td><td className="p-2 font-bold tabular-nums">{money(row.amount,row.currency)}</td><td className="p-2">{statusNames[row.status] || row.status}</td><td className="p-2">{new Date(row.created_at).toLocaleString("it-IT")}</td></tr>)}</tbody>
            </table></div> : <p className="mt-3 text-sm text-slate-500">Nessuna quota registrata. Il registro è pronto per i futuri flussi sandbox.</p>}
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-xl font-black">Lotti di regolamento</h2>
              {data.settlementBatches?.length ? <ul className="mt-3 space-y-3">{data.settlementBatches.map(row => <li key={row.id} className="rounded-xl bg-slate-50 p-3"><div className="font-bold">{row.settlement_kind} · {money(row.total_amount,row.currency)}</div><div className="mt-1 text-xs text-slate-500">{row.period_start} → {row.period_end} · {row.payout_count} quote · {row.status}</div></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">Nessun lotto creato.</p>}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-xl font-black">Movimenti Treasury</h2>
              {data.treasuryMovements?.length ? <ul className="mt-3 space-y-3">{data.treasuryMovements.map(row => <li key={row.id} className="rounded-xl bg-slate-50 p-3"><div className="font-bold">{money(row.gross_amount,row.currency)} · {row.status}</div><div className="mt-1 text-xs text-slate-500">{row.description || "Movimento RiverSpend"} · {new Date(row.created_at).toLocaleString("it-IT")}</div></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">Nessun movimento registrato.</p>}
            </div>
          </section>
        </>}
        <p className="mt-6 text-xs leading-5 text-slate-500">Accesso riservato al ruolo amministratore. I dati finanziari sono letti dal server dopo verifica della sessione. Non vengono mostrati IBAN, numeri di carta, CVV o credenziali dei provider.</p>
      </div>
    </main>
  );
}
