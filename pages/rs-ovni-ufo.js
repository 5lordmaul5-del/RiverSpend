import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

const sections = [
  { id: 'crop', code: '01', title: 'CROPCIRCLES', subtitle: 'Cerchi nel Grano', icon: '◎', intro: 'Geometrie comparse nei campi, simboli, fotografie e racconti. Un atlante per osservare forme, luoghi e date senza confondere documentazione, ipotesi e folklore.', items: ['Atlante dei cerchi e delle geometrie', 'Cronologia delle apparizioni segnalate', 'Analisi di forme, proporzioni e fotografie'] },
  { id: 'ufo', code: '02', title: 'RS OVNI UFO', subtitle: 'Fenomeni aerei non identificati', icon: '🛸', intro: 'Un osservatorio divulgativo per avvistamenti, testimonianze, video e rapporti pubblici. “Non identificato” non significa automaticamente extraterrestre.', items: ['Archivio degli avvistamenti', 'Casi documentati e rapporti ufficiali', 'Segnalazioni con data, luogo e fonte'] },
  { id: 'secret', code: '03', title: 'TOP SECRET', subtitle: 'Dossier e archivi', icon: '▣', intro: 'Un archivio tematico ispirato ai dossier riservati: documenti declassificati, progetti storici, misteri e materiali da verificare.', items: ['Documenti declassificati e fonti pubbliche', 'Progetti aerospaziali storici', 'Schede caso con livello di attendibilità'] },
  { id: 'danger', code: '04', title: 'DANGER ZONE', subtitle: 'Area di attenzione', icon: '⚠', intro: 'Una sezione per luoghi interdetti, fenomeni rischiosi, bufale pericolose e casi che richiedono prudenza. Si esplora attraverso fonti e ricostruzioni: niente accessi abusivi o prove sul campo.', items: ['Avvisi di sicurezza e aree vietate', 'Fenomeni naturali e spiegazioni scientifiche', 'Miti, rischi reali e verifiche delle fonti'] }
];

const levels = [
  ['DOCUMENTATO', 'Fonte primaria o documento verificabile', 'border-emerald-400/40 text-emerald-200'],
  ['DA VERIFICARE', 'Testimonianza o materiale incompleto', 'border-amber-300/40 text-amber-200'],
  ['IPOTESI / LEGGENDA', 'Interpretazione, folklore o racconto', 'border-fuchsia-300/40 text-fuchsia-200']
];


function SightingSubmissionForm() {
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [success, setSuccess] = useState(false);

  async function submitSighting(event) {
    event.preventDefault();
    setSending(true);
    setFeedback('');
    setSuccess(false);
    const form = event.currentTarget;
    const data = new FormData(form);
    const observed = data.get('observed_at');
    const payload = {
      category: data.get('category'),
      title: String(data.get('title') || '').trim(),
      description: String(data.get('description') || '').trim(),
      observed_at: observed ? new Date(String(observed) + 'T12:00:00').toISOString() : null,
      location_label: String(data.get('location_label') || '').trim() || null,
      display_name: String(data.get('display_name') || '').trim() || null,
      media_url: String(data.get('media_url') || '').trim() || null,
      consent_public: data.get('consent_public') === 'on',
      status: 'pending'
    };
    const { error } = await supabase.from('rs_sightings').insert(payload);
    setSending(false);
    if (error) {
      setFeedback('Non siamo riusciti a inviare la testimonianza. Riprova più tardi.');
      return;
    }
    setSuccess(true);
    setFeedback('Testimonianza ricevuta. Sarà controllata da una persona prima di essere eventualmente pubblicata.');
    form.reset();
  }

  return (
    <form onSubmit={submitSighting} className="mt-7 grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-200">Categoria
          <select name="category" required className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white">
            <option value="ufo_ovni">UFO / OVNI / luci insolite</option>
            <option value="crop_circle">CropCircles / cerchi nel grano</option>
            <option value="mandala_geometry">Mandala / figure geometriche / simboli</option>
            <option value="comet_meteor">Comete / meteoriti / stelle cadenti</option>
            <option value="stars_sky">Stelle / volta celeste / fenomeni atmosferici</option>
            <option value="religious_apparition">Apparizioni religiose / santi / fenomeni spirituali</option>
            <option value="ancient_civilization">Tradizioni e testimonianze di Egizi, Maya e popoli indigeni</option>
            <option value="other">Altro fenomeno</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-200">Quando è accaduto?
          <input name="observed_at" type="date" className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-slate-200">Titolo della testimonianza
        <input name="title" required minLength="5" maxLength="160" placeholder="Es. Tre luci ferme sopra le montagne" className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500" />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-200">Racconta cosa hai visto
        <textarea name="description" required minLength="20" maxLength="5000" rows="5" placeholder="Descrivi quello che hai osservato, senza bisogno di interpretarlo..." className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-200">Luogo approssimativo (facoltativo)
          <input name="location_label" maxLength="160" placeholder="Es. provincia di Torino, Italia" className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-200">Nome o pseudonimo (facoltativo)
          <input name="display_name" maxLength="80" placeholder="Come vuoi apparire nell’archivio" className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-slate-200">Link a foto o video (facoltativo)
        <input name="media_url" type="url" maxLength="1000" placeholder="https://..." className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500" />
        <span className="text-xs font-normal text-slate-400">Per ora è possibile allegare un collegamento esterno; il caricamento diretto di file sarà aggiunto in una fase successiva.</span>
      </label>
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-300">
        <input name="consent_public" type="checkbox" required className="mt-1 h-4 w-4 accent-emerald-400" />
        <span>Acconsento che la testimonianza, dopo la revisione umana, possa essere pubblicata nell’archivio. Non inserisco indirizzi privati, dati personali di altre persone o informazioni riservate.</span>
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={sending} className="rounded-full border border-emerald-200/50 bg-emerald-300/15 px-7 py-3 font-bold text-emerald-100 hover:bg-emerald-300/25 disabled:opacity-50">{sending ? 'Invio in corso…' : 'Invia la testimonianza'}</button>
        {feedback && <p role="status" className={success ? 'text-sm text-emerald-200' : 'text-sm text-rose-200'}>{feedback}</p>}
      </div>
      <p className="text-xs leading-5 text-slate-500">Non inserire coordinate precise di abitazioni o luoghi sensibili. La segnalazione viene archiviata come “in attesa di revisione” e non appare pubblicamente finché non viene approvata da un responsabile.</p>
    </form>
  );
}

export default function RsOvniUfo() {
  const [active, setActive] = useState('crop');
  const current = sections.find((section) => section.id === active) || sections[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[#050711] text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-60" style={{backgroundImage:'radial-gradient(circle at 15% 15%, #17436a 0, transparent 28%), radial-gradient(circle at 85% 25%, #49234f 0, transparent 25%), radial-gradient(circle at 50% 90%, #153d46 0, transparent 35%)'}} />
      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Link href="/ecosistema" className="text-cyan-200 underline">← Ecosistema RiverSpend</Link>
        <header className="py-12 text-center sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[.4em] text-amber-300">RiverSpend Experience • archivio misteri</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl">RS OVNI UFO</h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-300">CropCircles, fenomeni aerei non identificati, dossier riservati e zone di attenzione. Un viaggio tra cielo, terra e mistero.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-2 text-xs font-bold tracking-[.2em] text-cyan-100">
            <span className="rounded-full border border-cyan-200/30 px-4 py-2">OBSERVATION</span>
            <span className="rounded-full border border-cyan-200/30 px-4 py-2">ARCHIVE</span>
            <span className="rounded-full border border-cyan-200/30 px-4 py-2">UNKNOWN</span>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-950/30 sm:p-8">
          <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full border border-cyan-100/10" />
          <div className="absolute -right-2 -top-8 h-48 w-48 rounded-full border border-cyan-100/10" />
          <div className="relative grid items-center gap-6 md:grid-cols-[1.2fr_.8fr]">
            <div>
              <p className="text-xs font-bold tracking-[.3em] text-cyan-200">THE UNKNOWN FILES</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">La verità si cerca. Non si presume.</h2>
              <p className="mt-4 max-w-2xl leading-7 text-slate-300">Ogni caso può contenere fatti, testimonianze e interpretazioni. RiverSpend li separa in modo trasparente, indicando sempre la provenienza delle informazioni.</p>
            </div>
            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full border border-cyan-200/30 bg-cyan-300/5 shadow-[0_0_70px_rgba(34,211,238,.12)]">
              <div className="flex h-36 w-36 items-center justify-center rounded-full border border-cyan-100/30 text-7xl text-cyan-100">🛸</div>
            </div>
          </div>
        </section>


        <section id="rs-eyewitness" className="my-8 rounded-3xl border border-emerald-300/30 bg-gradient-to-br from-emerald-950/50 to-slate-950/80 p-6 shadow-xl sm:p-8">
          <p className="text-xs font-black tracking-[.35em] text-emerald-200">RS EYEWITNESS • ARCHIVIO DELLE TESTIMONIANZE</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Hai visto qualcosa di inspiegabile?</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">Raccontalo con le tue parole. Nessuna IA scrive, modifica o interpreta la tua testimonianza: sarà conservata come l’hai inviata e sottoposta a verifica umana prima di un’eventuale pubblicazione.</p>
          <SightingSubmissionForm />
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Sezioni RS OVNI UFO">
          {sections.map((section) => (
            <button key={section.id} type="button" onClick={() => setActive(section.id)} aria-pressed={active === section.id} className={`rounded-2xl border p-5 text-left transition ${active === section.id ? 'border-amber-300 bg-amber-300/10 shadow-lg shadow-amber-950/20' : 'border-cyan-100/15 bg-slate-900/80 hover:border-cyan-200/60'}`}>
              <span className="text-3xl">{section.icon}</span>
              <p className="mt-4 text-xs font-bold tracking-[.25em] text-amber-300">{section.code} / FILE</p>
              <h3 className="mt-2 text-xl font-black">{section.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{section.subtitle}</p>
            </button>
          ))}
        </section>

        <section className="mt-5 rounded-3xl border border-cyan-100/15 bg-gradient-to-br from-slate-900 to-[#111b30] p-6 sm:p-9" aria-live="polite">
          <p className="text-xs font-bold tracking-[.3em] text-cyan-200">DOSSIER {current.code}</p>
          <h2 className="mt-3 text-3xl font-black">{current.title}</h2>
          <p className="mt-1 text-lg text-amber-200">{current.subtitle}</p>
          <p className="mt-5 max-w-4xl leading-8 text-slate-300">{current.intro}</p>
          <ul className="mt-6 grid gap-3 md:grid-cols-3">
            {current.items.map((item) => <li key={item} className="rounded-xl border border-cyan-100/10 bg-black/20 p-4 text-sm text-slate-200">◈ {item}</li>)}
          </ul>
        </section>


        <section className="my-8 rounded-3xl border border-violet-300/30 bg-gradient-to-r from-violet-950/70 via-slate-900 to-cyan-950/70 p-6 shadow-xl sm:p-8">
          <p className="text-xs font-black tracking-[.35em] text-violet-200">IL PONTE VERSO LE CIVILTÀ ANTICHE</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">THE ALIEN BRIDGE</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">Dai CropCircles e dagli avvistamenti torniamo alle stelle che hanno ispirato miti e osservazioni del passato. Esplora il percorso Orione • Giza • Maya: archeologia, astronomia e racconto extraterrestre, senza confondere le ipotesi con i fatti.</p>
          <Link href="/orion-giza-maya" className="mt-6 inline-flex rounded-full border border-cyan-200/50 bg-cyan-300/10 px-6 py-3 font-bold text-cyan-100 hover:bg-cyan-300/20">Attraversa THE ALIEN BRIDGE → ORIONE • GIZA • MAYA</Link>
        </section>

        <section className="my-8 rounded-3xl border border-slate-700 bg-black/30 p-6">
          <h2 className="text-xl font-black">CLASSIFICAZIONE DELLE INFORMAZIONI</h2>
          <p className="mt-2 text-sm text-slate-400">Ogni scheda futura mostrerà chiaramente a quale livello appartiene il materiale.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {levels.map(([name, description, style]) => <article key={name} className={`rounded-xl border bg-slate-900/70 p-4 ${style}`}><h3 className="font-black tracking-wider">{name}</h3><p className="mt-2 text-sm text-slate-300">{description}</p></article>)}
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-rose-400/30 bg-rose-950/20 p-5">
          <h2 className="font-black tracking-widest text-rose-200">⚠ DANGER ZONE • REGOLA DI SICUREZZA</h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">Non entrare in proprietà private, installazioni militari, grotte, edifici abbandonati o aree interdette. Non avvicinarsi a oggetti sconosciuti o a presunti siti di impatto. Le segnalazioni devono rispettare la legge e la sicurezza delle persone.</p>
        </section>

        <div className="mb-10 flex flex-wrap gap-5">
          <Link href="/orion-giza-maya" className="text-cyan-200 underline">← Esplora Orione • Giza • Maya</Link>
          <Link href="/park" className="text-cyan-200 underline">RiverSpend Park</Link>
        </div>
      </div>
    </main>
  );
}
