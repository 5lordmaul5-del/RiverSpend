import Link from 'next/link';
import { useMemo, useState } from 'react';

const commission = 0.10;

export default function BroadcastMusic() {
  const [kind, setKind] = useState('audio');
  const [price, setPrice] = useState(1);
  const [fileName, setFileName] = useState('');
  const [rights, setRights] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const net = useMemo(() => (price * (1 - commission)).toFixed(2).replace('.', ','), [price]);
  const fileAccept = kind === 'audio' ? 'audio/*' : 'video/*';

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#071a25] px-4 py-6 text-white sm:py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/servizi/broadcast" className="text-[#67e4d0] underline">← RiverSpend BroadCast TV · Audio · Video</Link>
        <header className="mt-5 border-b border-[#1d5960] pb-6">
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-[#67e4d0]">RiverSpend BroadCast</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-5xl">Pubblica e guadagna con i tuoi contenuti</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">Carica un brano, un video o un film. Dichiara i diritti, scegli il prezzo per ogni download e consulta la quota prevista dopo la commissione RiverSpend.</p>
        </header>
        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="border-l-4 border-[#67e4d0] bg-[#0c2a36] p-4"><p className="text-sm text-slate-300">Commissione RiverSpend</p><p className="mt-1 text-2xl font-bold">10%</p><p className="text-xs text-slate-400">sul prezzo di vendita</p></div>
          <div className="border-l-4 border-[#67e4d0] bg-[#0c2a36] p-4"><p className="text-sm text-slate-300">Prezzo per download</p><p className="mt-1 text-2xl font-bold">1 € o 2 €</p><p className="text-xs text-slate-400">scelto dal titolare</p></div>
          <div className="border-l-4 border-[#67e4d0] bg-[#0c2a36] p-4"><p className="text-sm text-slate-300">Quota prevista al titolare</p><p className="mt-1 text-2xl font-bold">0,90 € / 1,80 €</p><p className="text-xs text-slate-400">prima di eventuali costi e imposte</p></div>
        </section>
        <form onSubmit={handleSubmit} className="mt-7 space-y-6">
          <section className="border border-[#24606a] bg-[#0a2430] p-5 sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#67e4d0]">01 · Tipo di contenuto</p><h2 className="mt-1 text-2xl font-bold">Che cosa vuoi pubblicare?</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[{id:'audio',title:'Brano / Album',detail:'Singolo o più tracce'},{id:'video',title:'Video',detail:'Videoclip o contenuto video'},{id:'film',title:'Film',detail:'Cortometraggio o lungometraggio'}].map(item => <button key={item.id} type="button" onClick={() => {setKind(item.id);setFileName('');setSubmitted(false);}} className={`border p-4 text-left ${kind===item.id?'border-[#67e4d0] bg-[#12404a]':'border-[#28505a] bg-[#071a25]'}`}><span className="block font-bold">{item.title}</span><span className="mt-1 block text-sm text-slate-400">{item.detail}</span></button>)}
            </div>
          </section>
          <section className="border border-[#24606a] bg-[#0a2430] p-5 sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#67e4d0]">02 · Caricamento</p><h2 className="mt-1 text-2xl font-bold">Inserisci il tuo contenuto</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">Nome artista / autore / casa di produzione<input required className="mt-2 w-full border border-[#28505a] bg-[#071a25] px-4 py-3 text-white" placeholder="Nome o ragione sociale" /></label>
              <label className="block text-sm text-slate-300">Titolo dell'opera<input required className="mt-2 w-full border border-[#28505a] bg-[#071a25] px-4 py-3 text-white" placeholder={kind==='audio'?'Titolo del brano o album':kind==='video'?'Titolo del video':'Titolo del film'} /></label>
            </div>
            <label className="mt-5 block border border-dashed border-[#67e4d0] bg-[#071a25] p-5"><span className="block font-semibold text-[#8bf0df]">＋ Seleziona {kind==='audio'?'file audio':'file video'}</span><span className="mt-1 block text-sm text-slate-400">{kind==='audio'?'Seleziona il file del brano.':'Seleziona il file video del contenuto.'}</span><input required type="file" accept={fileAccept} onChange={e=>{const f=e.target.files&&e.target.files[0];setFileName(f?f.name:'');setSubmitted(false);}} className="mt-4 block w-full text-sm text-slate-300 file:mr-4 file:border-0 file:bg-[#67e4d0] file:px-4 file:py-2 file:font-semibold file:text-[#071a25]" />{fileName&&<span className="mt-3 block break-all text-sm text-[#8bf0df]">File selezionato: {fileName}</span>}</label>
            <p className="mt-3 text-xs leading-5 text-slate-400">La selezione del file è già visibile nell’interfaccia; trasferimento sicuro e archiviazione online devono ancora essere collegati.</p>
          </section>
          <section className="border border-[#24606a] bg-[#0a2430] p-5 sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#67e4d0]">03 · Diritti d'autore e verifica</p><h2 className="mt-1 text-2xl font-bold">Dichiara i tuoi diritti</h2>
            <p className="mt-3 leading-7 text-slate-300">Prima della pubblicazione, RiverSpend dovrà verificare la titolarità o l’autorizzazione alla distribuzione. La dichiarazione non sostituisce il controllo documentale.</p>
            <label className="mt-4 flex items-start gap-3 border border-[#28505a] bg-[#071a25] p-4 text-sm leading-6"><input required type="checkbox" checked={rights} onChange={e=>{setRights(e.target.checked);setSubmitted(false);}} className="mt-1 h-5 w-5 accent-teal-300" /><span>Dichiaro di essere titolare dei diritti necessari oppure di avere le autorizzazioni valide per caricare, distribuire e vendere quest'opera, inclusi musica, immagini, interpreti e materiali di terzi eventualmente presenti.</span></label>
            <div className="mt-4 border-l-4 border-amber-400 bg-[#302a1a] p-4 text-sm leading-6 text-amber-100"><strong>Stato previsto: da verificare.</strong> Il contenuto resta non pubblicato finché il controllo dei diritti non viene completato. Controllo automatico e revisione documentale devono ancora essere integrati.</div>
          </section>
          <section className="border border-[#24606a] bg-[#0a2430] p-5 sm:p-7">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#67e4d0]">04 · Prezzo e guadagno</p><h2 className="mt-1 text-2xl font-bold">Scegli il prezzo per ogni download</h2><p className="mt-2 text-sm text-slate-300">RiverSpend trattiene il 10%; la quota mostrata è quella prevista per te al netto della commissione.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">{[1,2].map(value=><button type="button" key={value} onClick={()=>{setPrice(value);setSubmitted(false);}} className={`border p-4 text-left ${price===value?'border-[#67e4d0] bg-[#12404a]':'border-[#28505a] bg-[#071a25]'}`}><span className="block text-xl font-bold">{value} € per download</span><span className="mt-1 block text-sm text-slate-300">A te: {(value*.9).toFixed(2).replace('.',',')} € · RiverSpend: {(value*.1).toFixed(2).replace('.',',')} €</span></button>)}</div>
            <div className="mt-4 bg-[#071a25] p-4"><p className="text-sm text-slate-400">Riepilogo per ogni download</p><p className="mt-1 text-2xl font-bold text-[#8bf0df]">A te spettano {net} €</p><p className="text-sm text-slate-400">Prezzo {price} € − commissione RiverSpend {(price*commission).toFixed(2).replace('.',',')} € (10%)</p></div>
          </section>
          <button type="submit" className="w-full bg-[#67e4d0] px-6 py-4 font-bold text-[#071a25]">Invia per verifica dei diritti</button>
          {submitted&&<div role="status" className="border border-amber-500 bg-[#302a1a] p-4 text-sm leading-6 text-amber-100">Modulo di prova compilato. Nessun file è stato caricato online e nessuna opera è stata pubblicata: servono archivio protetto, verifica dei diritti e collegamento ai pagamenti.</div>}
        </form>
        <footer className="mt-7 border-t border-[#1d5960] pt-5 text-sm leading-6 text-slate-400">Simulazione basata sulla commissione del 10% concordata per i download. Eventuali costi del gestore dei pagamenti, imposte e condizioni di liquidazione vanno definiti prima dell’attivazione commerciale.<div className="mt-5"><Link href="/servizi/broadcast" className="text-[#67e4d0] underline">← Torna a BroadCast TV · Audio · Video</Link></div></footer>
      </div>
    </main>
  );
}
