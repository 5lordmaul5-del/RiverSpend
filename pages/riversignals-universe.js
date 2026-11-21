import Head from 'next/head';
import Link from 'next/link';

const modules = [
  { icon: '🛡️', name: 'RiverShield', group: 'Sicurezza', description: 'Blocco chat, biometria, dispositivi autorizzati, avvisi anti-truffa e controllo delle sessioni.', phase: 'Fondamenta', status: 'Da implementare e verificare' },
  { icon: '👻', name: 'RiverGhost', group: 'Privacy', description: 'Messaggi con scadenza, contenuti che si eliminano dopo la visualizzazione e indicatori di apertura.', phase: 'Privacy', status: 'Da implementare e verificare' },
  { icon: '🎭', name: 'RiverMask', group: 'Video e identità', description: 'Effetti sul volto applicati al flusso video e ai video-messaggi prima dell’invio: sfocatura, maschere e avatar.', phase: 'Media', status: 'Da implementare e verificare' },
  { icon: '🎙️', name: 'RiverVoice', group: 'Audio e identità', description: 'Filtri vocali per messaggi registrati e, in una fase successiva, chiamate in tempo reale.', phase: 'Media', status: 'Da implementare e verificare' },
  { icon: '🤖', name: 'RiverSSAI Base', group: 'Intelligenza artificiale', description: 'Assistente essenziale nelle chat: aiuto semplice nella scrittura e risposte di base, solo quando richiesto e con il consenso dell’utente. Non include la versione completa RiverSSAI 10.0, la modalità CEO o i 90 specialisti.', phase: 'AI', status: 'Versione base prevista; collegamento da realizzare' },
  { icon: '🌍', name: 'RiverWorld', group: 'Comunicazione globale', description: 'Traduzione di chat e vocali, sottotitoli e supporto multilingue durante le chiamate.', phase: 'AI', status: 'Da implementare e verificare' },
  { icon: '💸', name: 'RiverPay', group: 'Pagamenti', description: 'Invio e richiesta di denaro, divisione spese, acquisti e donazioni tramite prestatore autorizzato.', phase: 'Pagamenti', status: 'Solo intenzioni in chat; pagamenti reali non attivi' },
  { icon: '📡', name: 'RiverLive', group: 'Live e streaming', description: 'Dirette, stanze tematiche, eventi, creator e collegamento con RiverStreaming.', phase: 'Community', status: 'Da implementare e verificare' },
  { icon: '👥', name: 'RiverCommunity', group: 'Community', description: 'Gruppi, canali, comunità locali e internazionali, eventi e spazi per associazioni e aziende.', phase: 'Community', status: 'Da implementare e verificare' },
  { icon: '🪪', name: 'RiverIdentity', group: 'Identità', description: 'Profilo personalizzabile, avatar, identità personale e professionale e accesso unico all’ecosistema RiverSpend.', phase: 'Fondamenta', status: 'Da implementare e verificare' },
  { icon: '🔐', name: 'River ENIGMA', group: 'Privacy avanzata', description: 'Cifratura e gestione delle chiavi per dispositivo, con consenso esplicito e verifica indipendente della sicurezza.', phase: 'Privacy', status: 'Versione beta: non presentarla come sicurezza certificata' },
  { icon: '🎲', name: 'Chat casuale', group: 'Scoperta', description: 'Abbinamento volontario tra persone, con uscita immediata, blocco, segnalazione e controlli anti-abuso.', phase: 'Community', status: 'Da implementare e verificare' },
  { icon: '📍', name: 'Chi c’è nelle vicinanze', group: 'Scoperta locale', description: 'Ricerca solo su consenso, distanza approssimativa e posizione mai pubblica per impostazione predefinita.', phase: 'Community', status: 'Da implementare con protezioni privacy' },
  { icon: '🚩', name: 'Local', group: 'Posizione', description: 'Condivisione volontaria e temporanea della posizione in chat, con anteprima, destinatari e revoca.', phase: 'Privacy', status: 'Invio coordinate in chat già presente; Local temporaneo da completare' },
  { icon: '🏫', name: 'Gruppi Scuola · Lavoro · Sport', group: 'Community', description: 'Gruppi tematici con ruoli, inviti, moderazione, segnalazioni e gestione membri.', phase: 'Community', status: 'Da implementare e verificare' },
  { icon: '🍕', name: 'Ordina da mangiare', group: 'Servizi locali', description: 'Pizza, hamburger, sushi e ristoranti aderenti: menu, carrello, consegna o ritiro e stato ordine.', phase: 'Community', status: 'Da collegare a ristoranti e ordini reali' },
  { icon: '🎨', name: 'Sticker & Effects Studio', group: 'Creatività', description: 'Sticker originali, emoji ampliati, effetti visuali e temi personalizzabili.', phase: 'Creatività', status: 'Catalogo base presente; studio avanzato da realizzare' },
  { icon: '🔠', name: 'Alfabeto NATO · Mimetica', group: 'Strumenti', description: 'Alfabeto fonetico internazionale ICAO per compitare nomi, codici e messaggi, con una scheda grafica a tema mimetico.', phase: 'Strumenti', status: 'Sezione informativa integrata' }
];

const phases = [
  { n: '01', title: 'Fondamenta affidabili', detail: 'Account persistente, chat, notifiche, gestione dispositivi, sicurezza, backup e test su due telefoni.' },
  { n: '02', title: 'Privacy e identità', detail: 'RiverGhost, RiverShield e consenso chiaro per ogni funzione di privacy.' },
  { n: '03', title: 'Chiamate e creatività', detail: 'Chiamate WebRTC con infrastruttura TURN, RiverMask, RiverVoice ed effetti.' },
  { n: '04', title: 'AI e mondo', detail: 'RiverSSAI Base con funzioni essenziali; traduzione, sottotitoli e assistenza multilingue saranno moduli separati.' },
  { n: '05', title: 'Economia e community', detail: 'Pagamenti tramite PSP autorizzato, dirette, gruppi, canali e creator.' }
];

export default function RiverSignalsUniverse() {
  return <>
    <Head>
      <title>RiverSignals Universe · RiverSpend</title>
      <meta name="description" content="L'ambiente RiverSignals: comunicazione, privacy, AI e community." />
      <meta name="theme-color" content="#073b4c" />
    </Head>
    <main className="min-h-screen bg-[#eaf7f7] text-slate-800">
      <header className="bg-[#073b4c] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-300/70 bg-white/10 text-2xl">🌊</div>
            <div><div className="font-bold tracking-wide">RiverSignals Universe</div><div className="text-[11px] text-teal-100">YOUR SPACE · YOUR SIGNAL</div></div>
          </div>
          <Link href="/riverspace-signals" className="rounded-full border border-white/40 px-4 py-2 text-sm font-semibold hover:bg-white/10">← Torna alle chat</Link>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-10 md:pt-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-bold text-[#8a641e]">✨ IL PROGETTO COMPLETO SIGNALS</div>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-[#073b4c] md:text-6xl">Non un’altra chat.<br/><span className="text-[#087e8b]">Un nuovo spazio digitale.</span></h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">Comunicazione, privacy, identità protetta, intelligenza artificiale, pagamenti e community riuniti in un unico ambiente RiverSpend.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#073b4c] px-3 py-2 text-xs font-semibold text-white">Chat e chiamate</span>
            <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#073b4c]">Privacy</span>
            <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#073b4c]">AI globale</span>
            <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#073b4c]">Pagamenti</span>
            <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#073b4c]">Community</span>
          </div>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => <article key={m.name} className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f6f5] text-2xl">{m.icon}</div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{m.group}</span></div>
            <h2 className="mt-4 text-lg font-extrabold text-[#073b4c]">{m.name}</h2>
            <p className="mt-2 min-h-[76px] text-sm leading-relaxed text-slate-600">{m.description}</p>
            <div className="mt-4 border-t border-slate-100 pt-3"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stato del progetto</div><div className="mt-1 text-xs font-semibold text-amber-800">{m.status}</div></div>
          </article>)}
        </div>
      </section>
      <section id="alfabeto-nato" className="border-y border-emerald-900/30 bg-[#e8eee2]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="overflow-hidden rounded-3xl border border-emerald-950/30 shadow-lg">
            <div className="bg-[linear-gradient(135deg,#263b2a_0%,#65734a_24%,#d0c7a0_25%,#8b9664_42%,#344b35_43%,#344b35_58%,#b0a77b_59%,#65734a_76%,#263b2a_100%)] p-6 text-white md:p-8">
              <div className="inline-flex rounded-full border border-white/40 bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-widest">Signals Field Tools</div>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">🔠 Alfabeto fonetico NATO · ICAO</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/90">Compita lettere, nomi e codici usando le parole standard internazionali. Sezione grafica a tema mimetico.</p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-emerald-950/15 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {[
                ['A','Alpha (Alfa)'],['B','Bravo'],['C','Charlie'],['D','Delta'],['E','Echo'],
                ['F','Foxtrot'],['G','Golf'],['H','Hotel'],['I','India'],['J','Juliett'],
                ['K','Kilo'],['L','Lima'],['M','Mike'],['N','November'],['O','Oscar'],
                ['P','Papa'],['Q','Quebec'],['R','Romeo'],['S','Sierra'],['T','Tango'],
                ['U','Uniform'],['V','Victor'],['W','Whiskey'],['X','X-Ray'],['Y','Yankee'],['Z','Zulu']
              ].map(([letter,word]) => <div key={letter} className="flex items-center gap-3 bg-[#f5f7ef] px-4 py-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-900/20 bg-[#dce5d3] text-lg font-black text-[#263b2a]">{letter}</span>
                <span className="text-sm font-bold text-[#263b2a]">{word}</span>
              </div>)}
            </div>
            <div className="bg-[#263b2a] px-5 py-3 text-xs text-emerald-50">Standard fonetico ICAO · 26 lettere · utile per comunicazioni chiare via voce o chat.</div>
          </div>
        </div>
      </section>
      <section className="border-y border-teal-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="max-w-2xl"><div className="text-xs font-bold uppercase tracking-widest text-[#087e8b]">Percorso di sviluppo</div><h2 className="mt-2 text-3xl font-black text-[#073b4c]">Costruiamo in ordine. Testiamo ogni passaggio.</h2><p className="mt-3 text-sm leading-relaxed text-slate-600">Questa pagina presenta l’ambiente e la roadmap. Le schede non indicano che le funzioni siano già operative: ogni modulo diventerà disponibile solo dopo sviluppo, test e verifica.</p></div>
          <div className="mt-7 grid gap-3 md:grid-cols-5">
            {phases.map(p => <div key={p.n} className="rounded-2xl bg-[#f1f9f8] p-4"><div className="text-xs font-black text-[#b18a3d]">{p.n}</div><h3 className="mt-2 font-bold text-[#073b4c]">{p.title}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{p.detail}</p></div>)}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 rounded-3xl bg-[#073b4c] p-6 text-white md:grid-cols-[1fr_auto] md:items-center md:p-9">
          <div><div className="text-xs font-bold uppercase tracking-widest text-amber-300">Politica commerciale proposta</div><h2 className="mt-2 text-3xl font-black">RiverSignals Lifetime · 1 € una tantum</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-teal-50">Un solo acquisto per account, senza rinnovo automatico. L’attivazione commerciale sarà mostrata soltanto quando checkout, verifica server-side, rimborsi e ripristino dell’acquisto saranno realmente integrati e testati.</p></div>
          <div className="rounded-2xl border border-amber-300/60 bg-white/10 px-6 py-5 text-center"><div className="text-4xl font-black text-amber-300">1 €</div><div className="mt-1 text-xs text-teal-50">una sola volta</div></div>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500"><span>RiverSignals · RiverSpend · Progetto in sviluppo</span><Link href="/" className="underline underline-offset-4">RiverSpendShop</Link></div>
      </section>
    </main>
  </>;
}
