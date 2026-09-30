export default function NovaShield() {
  const checks = [
    { title: 'Caricamento immagini', status: 'Protetto', detail: 'Upload consentito solo ad account autenticati nella propria cartella.' },
    { title: 'Pubblicazione prodotti', status: 'Da collaudare', detail: 'Il flusso completo va verificato con un account venditore reale.' },
    { title: 'Accessi e profili', status: 'Da verificare', detail: 'Controllo delle autorizzazioni e dei dati personali.' },
    { title: 'Ordini e pagamenti', status: 'Non attivati', detail: 'Nessuna transazione reale dichiarata come operativa.' }
  ];
  return <main className="min-h-screen bg-slate-950 text-white px-4 py-8"><div className="mx-auto max-w-4xl">
    <a href="/" className="text-teal-300 underline">← RiverSpendShop</a>
    <header className="my-8 rounded-3xl border border-teal-700 bg-gradient-to-br from-slate-900 to-sky-950 p-6 sm:p-10">
      <p className="text-sm uppercase tracking-widest text-teal-300">RiverSpend • Sicurezza</p>
      <h1 className="mt-2 text-4xl font-black">🛡️ RS Nova Shield</h1>
      <p className="mt-4 text-slate-300">Il presidio di sicurezza di RiverSpend: proteggere account, prodotti, immagini e transazioni, rendendo visibili anche le verifiche ancora da completare.</p>
    </header>
    <h2 className="mb-4 text-2xl font-bold">Stato delle protezioni</h2>
    <div className="grid gap-4 sm:grid-cols-2">{checks.map((item) => <section key={item.title} className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">{item.title}</h3><span className={item.status === 'Protetto' ? 'rounded-full bg-emerald-900 px-3 py-1 text-xs text-emerald-200' : 'rounded-full bg-amber-900 px-3 py-1 text-xs text-amber-200'}>{item.status}</span></div>
      <p className="mt-3 text-sm text-slate-300">{item.detail}</p>
    </section>)}</div>
    <p className="mt-6 rounded-xl border border-amber-800 bg-amber-950/40 p-4 text-sm text-amber-100">Trasparenza Nova Shield: questa pagina riporta lo stato noto delle verifiche, non è una scansione automatica continua e non certifica la sicurezza complessiva del sito.</p>
  </div></main>;
}
