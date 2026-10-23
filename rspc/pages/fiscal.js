import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const euro = (n) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(Number(n || 0));

export default function RSPCFiscal() {
  const [session, setSession] = useState(null);
  const [access, setAccess] = useState("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({ documents: [], entries: [], exports: [], parties: 0, accounts: 0, rules: 0 });

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data: result }) => {
      if (alive) setSession(result.session);
    });
    const { data: auth } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (alive) setSession(nextSession);
    });
    return () => { alive = false; auth.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let alive = true;
    async function check() {
      if (!session) { setAccess("login"); return; }
      setAccess("checking");
      const { data: admin, error: roleError } = await supabase
        .from("rs_admin_roles").select("role").eq("user_id", session.user.id).maybeSingle();
      if (!alive) return;
      if (roleError || admin?.role !== "admin") {
        setAccess("denied");
        return;
      }
      setAccess("admin");
      const [docs, entries, exportsResult, parties, accounts, rules] = await Promise.all([
        supabase.from("rs_fiscal_documents").select("id,document_type,document_status,document_number,issue_date,tax_period,currency,net_amount,vat_amount,other_tax_amount,gross_amount,order_id,created_at").order("created_at", { ascending: false }).limit(100),
        supabase.from("rs_accounting_entries").select("id,entry_number,entry_date,period_key,description,status,currency,created_at").order("created_at", { ascending: false }).limit(100),
        supabase.from("rs_monthly_accounting_exports").select("id,period_key,export_status,document_count,storage_path,created_at").order("created_at", { ascending: false }).limit(24),
        supabase.from("rs_fiscal_parties").select("id", { count: "exact", head: true }),
        supabase.from("rs_accounting_accounts").select("id", { count: "exact", head: true }),
        supabase.from("rs_tax_rules").select("id", { count: "exact", head: true })
      ]);
      if (!alive) return;
      const firstError = docs.error || entries.error || exportsResult.error || parties.error || accounts.error || rules.error;
      if (firstError) setError("Lettura parziale dei dati fiscali: " + firstError.message);
      setData({
        documents: docs.data || [],
        entries: entries.data || [],
        exports: exportsResult.data || [],
        parties: parties.count || 0,
        accounts: accounts.count || 0,
        rules: rules.count || 0
      });
    }
    check();
    return () => { alive = false; };
  }, [session]);

  async function signIn(e) {
    e.preventDefault(); setBusy(true); setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) setError("Accesso non riuscito. Controlla email e password oppure usa il recupero account RSPC.");
    setBusy(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setData({ documents: [], entries: [], exports: [], parties: 0, accounts: 0, rules: 0 });
    setAccess("login");
  }

  if (access === "login") return <main className="container"><section className="panel"><h1>🧾 RSPC · Area fiscale</h1><p>Accesso riservato agli account RSPC autorizzati. Questa pagina non modifica ordini o pagamenti.</p><form onSubmit={signIn} className="grid"><label>Email amministratore<input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" /></label><label>Password<input type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /></label><button disabled={busy}>{busy ? "Accesso…" : "Accedi"}</button>{error && <p role="alert">{error}</p>}</form><p><a href="/">Torna a RSPC</a></p></section></main>;
  if (access === "checking") return <main className="container"><section className="panel"><h1>RSPC · Area fiscale</h1><p>Verifica delle autorizzazioni in corso…</p></section></main>;
  if (access === "denied") return <main className="container"><section className="panel"><h1>🔒 Accesso non autorizzato</h1><p>Questa area è riservata al CEO/amministratore. Il tuo accesso a RSPC non viene modificato.</p><button onClick={signOut}>Esci dall'account</button> <a href="/">Torna a RSPC</a></section></main>;

  return <main className="container">
    <section className="panel">
      <div className="row"><div><h1>🧾 RSPC · Archivio fiscale e contabilità</h1><p>Area amministrativa collegata al database RiverSpend. Modalità consultazione: nessuna fattura viene emessa automaticamente da questa schermata.</p></div><button onClick={signOut}>Esci</button></div>
      {error && <p role="status">{error}</p>}
      <div className="grid">
        <div className="metric"><span>Documenti fiscali</span><strong>{data.documents.length}</strong><small>ultimi 100 registrati</small></div>
        <div className="metric"><span>Registrazioni contabili</span><strong>{data.entries.length}</strong><small>ultime 100 registrate</small></div>
        <div className="metric"><span>Anagrafiche fiscali</span><strong>{data.parties}</strong></div>
        <div className="metric"><span>Conti predisposti</span><strong>{data.accounts}</strong></div>
        <div className="metric"><span>Regole fiscali</span><strong>{data.rules}</strong><small>nessuna regola attiva finché non validata</small></div>
      </div>
    </section>
    <section className="panel">
      <h2>📚 Documenti fiscali</h2>
      <p>I documenti si possono elencare qui; PDF, XML, numerazione ufficiale e invio/conservazione a norma devono essere collegati e testati prima dell'utilizzo reale.</p>
      {data.documents.length ? data.documents.map(doc => <div className="row" key={doc.id}><span><b>{doc.document_number || "Bozza senza numero"} · {doc.document_type}</b><small>Stato: {doc.document_status} · Data: {doc.issue_date || "non indicata"} · Periodo: {doc.tax_period || "n/d"}</small><small>Netto {euro(doc.net_amount)} · IVA {euro(doc.vat_amount)} · Altre imposte {euro(doc.other_tax_amount)} · Totale {euro(doc.gross_amount)}</small></span><span>{doc.currency || "EUR"}</span></div>) : <p>Nessun documento fiscale registrato. Non sono state create fatture di prova né numeri fiscali inventati.</p>}
    </section>
    <section className="panel">
      <h2>📒 Prima nota e registrazioni</h2>
      {data.entries.length ? data.entries.map(entry => <div className="row" key={entry.id}><span><b>Movimento #{entry.entry_number} · {entry.description}</b><small>{entry.entry_date} · periodo {entry.period_key} · {entry.status}</small></span><span>{entry.currency}</span></div>) : <p>Nessuna registrazione contabile inserita.</p>}
    </section>
    <section className="panel">
      <h2>🗓️ Archivio mensile per il commercialista</h2>
      {data.exports.length ? data.exports.map(item => <div className="row" key={item.id}><span><b>{item.period_key}</b><small>Stato: {item.export_status} · Documenti: {item.document_count}</small></span><span>{item.storage_path ? "File archiviato" : "File non ancora generato"}</span></div>) : <p>Nessun pacchetto mensile generato. Il PDF/ZIP/CSV scaricabile è un passaggio successivo: questa schermata non finge che i file esistano.</p>}
    </section>
    <section className="panel">
      <h2>⚠️ Regole di attivazione</h2>
      <ul>
        <li>Non applicare aliquote fiscali finché non sono state validate per il tipo di venditore, prodotto e destinazione.</li>
        <li>Un riepilogo PDF non sostituisce una fattura elettronica da trasmettere tramite SdI quando richiesta.</li>
        <li>Le registrazioni contabili definitive devono essere bilanciate, tracciate e corrette con storni, non cancellate.</li>
        <li>L'accesso al commercialista e ai collaboratori resta disattivato finché non viene completata la gestione dei ruoli.</li>
      </ul>
    </section>
    <p><a href="/">← Torna alla dashboard RSPC</a></p>
  </main>;
}
