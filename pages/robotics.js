import Head from 'next/head';

const droids = [
  { code: 'A1A1', name: 'Nova', role: 'Assistente virtuale', status: 'Primo progetto', description: 'Il volto digitale di RiverSpend: accoglienza, guida nel sito e assistenza vocale.', kind: 'VIRTUALE', accent: '#67e8f9' },
  { code: 'A2B2', name: 'Nova Home', role: 'Compagno domestico', status: 'Concept futuro', description: 'Pensato per conversazione, promemoria e interazione con dispositivi domestici compatibili.', kind: 'CASA', accent: '#5eead4' },
  { code: 'B2B2', name: 'Nova Universal', role: 'Assistente universale', status: 'Concept futuro', description: 'Una piattaforma modulare per casa, ufficio e ambienti pubblici.', kind: 'UNIVERSALE', accent: '#93c5fd' },
  { code: 'B2C3', name: 'Nova Service', role: 'Servizio e accoglienza', status: 'Concept futuro', description: 'Per orientamento e assistenza ai visitatori in negozi, hotel e aziende.', kind: 'SERVIZI', accent: '#fcd34d' },
  { code: 'C3C3', name: 'Nova Advanced', role: 'Robot avanzato', status: 'Ricerca futura', description: 'Un progetto per integrare percezione dell’ambiente, dialogo e attività autorizzate.', kind: 'AVANZATO', accent: '#c4b5fd' },
  { code: 'D4D4', name: 'Nova Logistics', role: 'Logistica e movimentazione', status: 'Concept futuro', description: 'Per supportare piccoli trasporti e movimentazione in ambienti controllati.', kind: 'LOGISTICA', accent: '#fdba74' },
  { code: 'E4E4', name: 'Nova Care', role: 'Compagnia quotidiana', status: 'Concept futuro', description: 'Compagnia, promemoria e supporto non medico, con attenzione a privacy e sicurezza.', kind: 'CARE', accent: '#f9a8d4' },
  { code: 'F5F5', name: 'Nova Professional', role: 'Supporto professionale', status: 'Ricerca futura', description: 'Per assistere nelle attività ripetitive, secondo capacità sviluppate e verificate.', kind: 'PRO', accent: '#a7f3d0' },
  { code: 'G5G5', name: 'Nova Future', role: 'Ricerca e innovazione', status: 'Laboratorio futuro', description: 'La linea sperimentale per nuove interfacce, movimenti e tecnologie robotiche.', kind: 'R&D', accent: '#fde68a' },
];

function DroidAvatar({ accent }) {
  return (
    <div className="droid-stage" style={{ '--droid-accent': accent }}>
      <div className="droid-halo" />
      <div className="droid-robot" aria-label="Illustrazione concept di un droide RiverSpend" role="img">
        <div className="droid-ear droid-ear-left" /><div className="droid-ear droid-ear-right" />
        <div className="droid-head">
          <div className="droid-forehead">R</div>
          <div className="droid-eyes"><span /><span /></div>
          <div className="droid-mouth" />
          <div className="droid-chin" />
        </div>
        <div className="droid-neck" />
        <div className="droid-shoulders"><span className="droid-shoulder-left" /><span className="droid-shoulder-right" /></div>
        <div className="droid-torso"><div className="droid-core">RS</div><div className="droid-torso-line" /><div className="droid-torso-mark" /></div>
      </div>
      <span className="droid-orbit droid-orbit-one" /><span className="droid-orbit droid-orbit-two" />
    </div>
  );
}

export default function RiverSpendRobotics() {
  return (
    <>
      <Head>
        <title>RiverSpend Robotics | La famiglia dei droidi</title>
        <meta name="description" content="Scopri i concept della famiglia RiverSpend Robotics: Nova A1A1 e le future serie di droidi." />
      </Head>
      <main className="min-h-screen bg-[#06111d] text-white">
        <header className="sticky top-0 z-20 border-b border-cyan-200/20 bg-[#06111d]/90 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <a href="/" className="font-black tracking-tight text-white"><span className="text-cyan-300">RiverSpend</span><span className="ml-2 text-amber-300">Robotics</span></a>
            <a href="/" className="rounded-full border border-cyan-200/30 px-4 py-2 text-sm font-bold hover:bg-cyan-200/10">← Torna allo Shop</a>
          </div>
        </header>
        <section className="relative overflow-hidden border-b border-cyan-100/10 px-4 py-14 sm:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(8,145,178,.24),transparent_60%),radial-gradient(ellipse_at_100%_100%,rgba(217,119,6,.10),transparent_45%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-[1.1fr_.9fr]">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[.2em] text-cyan-200">Nuova divisione progettuale</p>
              <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">RiverSpend <span className="text-cyan-300">Robotics</span></h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Una famiglia di droidi virtuali e robot umanoidi, progettati per accompagnare le persone a casa, nei negozi e negli ambienti di lavoro.</p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">La nostra visione parte da Nova A1A1, il droide virtuale, e guarda allo sviluppo futuro di prototipi fisici.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#gamma-droidi" className="rounded-full bg-gradient-to-r from-cyan-300 to-teal-300 px-5 py-3 font-extrabold text-slate-950 shadow-lg shadow-cyan-900/30">Esplora i droidi ↓</a>
                <a href="#roadmap" className="rounded-full border border-amber-300/50 px-5 py-3 font-bold text-amber-200 hover:bg-amber-300/10">La nostra visione</a>
              </div>
            </div>
            <div className="mx-auto w-full max-w-md"><DroidAvatar accent="#67e8f9" /></div>
          </div>
        </section>
        <section id="gamma-droidi" className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-extrabold uppercase tracking-[.22em] text-amber-300">La famiglia RiverSpend</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">La gamma dei droidi</h2><p className="mt-3 max-w-2xl text-slate-400">Ogni modello ha una missione e una personalità. Le versioni fisiche sono concept per il futuro.</p></div>
            <span className="rounded-full border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300">9 modelli progettuali</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {droids.map((droid, index) => (
              <article key={droid.code} className="group overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-[#091522] shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-200/40">
                <div className="relative border-b border-white/10 bg-[radial-gradient(ellipse_at_50%_70%,rgba(8,145,178,.16),transparent_65%)] px-5 pt-3">
                  <div className="absolute left-5 top-5 z-10 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-extrabold tracking-[.18em] text-slate-300">{droid.kind}</div>
                  <DroidAvatar accent={droid.accent} />
                  <span className="absolute bottom-4 right-5 text-xs font-black tracking-[.2em] text-white/40">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3"><span className="text-xs font-black tracking-[.22em] text-cyan-200">{droid.code}</span><span className="rounded-full border border-amber-200/20 bg-amber-100/5 px-2 py-1 text-[10px] font-bold text-amber-200">{droid.status}</span></div>
                  <h3 className="mt-2 text-2xl font-extrabold">{droid.name}</h3>
                  <p className="mt-1 text-sm font-bold text-slate-300">{droid.role}</p>
                  <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-400">{droid.description}</p>
                  <p className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-500">Concept RiverSpend Robotics · Non in vendita</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="roadmap" className="border-y border-white/10 bg-slate-900/50 px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-amber-300">Dalla visione al progetto</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Il percorso RiverSpend Robotics</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-cyan-200/20 bg-cyan-200/5 p-5"><span className="text-sm font-black text-cyan-200">FASE 1</span><h3 className="mt-2 text-xl font-extrabold">Nova virtuale</h3><p className="mt-2 text-sm leading-6 text-slate-400">Sviluppare il droide digitale con animazioni, voce e guida nel sito.</p></div>
              <div className="rounded-2xl border border-amber-200/20 bg-amber-200/5 p-5"><span className="text-sm font-black text-amber-200">FASE 2</span><h3 className="mt-2 text-xl font-extrabold">Studio dei prototipi</h3><p className="mt-2 text-sm leading-6 text-slate-400">Definire requisiti, costi, componenti, partner e prove di sicurezza.</p></div>
              <div className="rounded-2xl border border-teal-200/20 bg-teal-200/5 p-5"><span className="text-sm font-black text-teal-200">FASE 3</span><h3 className="mt-2 text-xl font-extrabold">Ricerca e produzione</h3><p className="mt-2 text-sm leading-6 text-slate-400">Valutare prototipi fisici e produzione solo quando sostenibili e verificati.</p></div>
            </div>
            <p className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-400">Trasparenza: questa vetrina presenta concept e obiettivi futuri. I robot fisici non sono attualmente in produzione e i modelli non sono in vendita.</p>
          </div>
        </section>
        <footer className="px-4 py-8 text-center text-xs text-slate-500">RiverSpend Robotics · YOUR SHOP • YOUR FLOW · <a className="text-cyan-200 hover:underline" href="/">RiverSpendShop</a></footer>
      </main>
      <style jsx global>{`
        .droid-stage{position:relative;isolation:isolate;display:flex;align-items:flex-end;justify-content:center;height:260px;overflow:hidden}
        .droid-halo{position:absolute;bottom:5%;width:76%;height:72%;border-radius:50%;background:radial-gradient(ellipse, color-mix(in srgb,var(--droid-accent) 20%,transparent),transparent 70%);filter:blur(8px)}
        .droid-robot{position:relative;display:flex;flex-direction:column;align-items:center;width:180px;height:235px;animation:droid-float 4.2s ease-in-out infinite;transform-origin:50% 100%}
        .droid-head{position:relative;z-index:3;width:116px;height:105px;border:2px solid #b6d3df;border-radius:42% 42% 38% 38%;background:linear-gradient(135deg,#fff 0%,#dbe7ec 38%,#8397a6 70%,#f8fafc 100%);box-shadow:inset -8px -5px 12px #64748b55,0 0 24px color-mix(in srgb,var(--droid-accent) 22%,transparent)}
        .droid-forehead{position:absolute;top:8px;left:50%;transform:translateX(-50%);font-size:13px;font-weight:1000;color:#b7791f;text-shadow:0 0 8px #fbbf24aa}
        .droid-eyes{position:absolute;top:43px;left:0;right:0;display:flex;justify-content:center;gap:24px}
        .droid-eyes span{display:block;width:17px;height:9px;border-radius:100%;background:var(--droid-accent);box-shadow:0 0 12px var(--droid-accent);animation:droid-blink 5s infinite}
        .droid-eyes span:nth-child(2){animation-delay:.12s}
        .droid-mouth{position:absolute;left:50%;top:68px;transform:translateX(-50%);width:28px;height:4px;border-radius:9px;background:#334155;box-shadow:0 0 5px var(--droid-accent);animation:droid-talk 2.5s infinite}
        .droid-chin{position:absolute;bottom:8px;left:33%;width:34%;height:5px;border-radius:9px;background:#9ca3af}
        .droid-ear{position:absolute;z-index:4;top:40px;width:13px;height:27px;border:2px solid #b6d3df;background:#64748b;border-radius:5px;box-shadow:0 0 9px var(--droid-accent)}
        .droid-ear-left{left:27px}.droid-ear-right{right:27px}
        .droid-neck{z-index:2;width:30px;height:21px;margin-top:-2px;background:linear-gradient(90deg,#64748b,#f8fafc,#64748b);border-radius:4px}
        .droid-shoulders{position:relative;z-index:1;width:170px;height:42px;margin-top:-2px}
        .droid-shoulder-left,.droid-shoulder-right{position:absolute;top:0;width:55px;height:37px;background:linear-gradient(140deg,#f8fafc,#94a3b8 65%,#475569);border:1px solid #cbd5e1;border-radius:24px 24px 8px 8px}
        .droid-shoulder-left{left:0;transform:rotate(-12deg)}.droid-shoulder-right{right:0;transform:rotate(12deg)}
        .droid-torso{position:relative;width:146px;height:88px;margin-top:-9px;border:2px solid #b6d3df;border-radius:26px 26px 12px 12px;background:linear-gradient(120deg,#f8fafc,#cbd5e1 42%,#64748b 72%,#e2e8f0);box-shadow:inset 0 -10px 15px #33415555}
        .droid-core{position:absolute;top:15px;left:50%;transform:translateX(-50%);display:grid;place-items:center;width:42px;height:28px;border:1px solid #fbbf24;border-radius:9px;color:#b7791f;font-size:12px;font-weight:1000;background:#0f172a;box-shadow:0 0 12px #22d3ee44}
        .droid-torso-line{position:absolute;left:15px;right:15px;bottom:16px;height:2px;background:var(--droid-accent);opacity:.8;box-shadow:0 0 8px var(--droid-accent)}
        .droid-torso-mark{position:absolute;left:50%;bottom:5px;transform:translateX(-50%);width:7px;height:7px;border-radius:50%;background:#fbbf24;box-shadow:0 0 8px #fbbf24}
        .droid-orbit{position:absolute;border:1px solid color-mix(in srgb,var(--droid-accent) 45%,transparent);border-radius:50%;transform:rotate(-18deg)}
        .droid-orbit-one{width:210px;height:70px;bottom:8%;animation:droid-orbit 12s linear infinite}
        .droid-orbit-two{width:230px;height:95px;bottom:7%;animation:droid-orbit 16s linear infinite reverse}
        @keyframes droid-float{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-7px) rotate(1deg)}}
        @keyframes droid-blink{0%,44%,48%,100%{transform:scaleY(1)}46%{transform:scaleY(.12)}}
        @keyframes droid-talk{0%,100%{height:3px;width:22px}50%{height:8px;width:17px}}
        @keyframes droid-orbit{to{transform:rotate(342deg)}}
        @media(prefers-reduced-motion:reduce){.droid-robot,.droid-eyes span,.droid-mouth,.droid-orbit-one,.droid-orbit-two{animation:none}}
      `}</style>
    </>
  );
}
