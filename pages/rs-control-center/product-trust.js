import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function ProductTrustReview() {
  const [user,setUser]=useState(null),[allowed,setAllowed]=useState(false),[loading,setLoading]=useState(true);
  const [queue,setQueue]=useState([]),[selected,setSelected]=useState(''),[profile,setProfile]=useState(null),[docs,setDocs]=useState([]),[parties,setParties]=useState([]),[events,setEvents]=useState([]),[checks,setChecks]=useState([]);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[notes,setNotes]=useState('');
  async function loadQueue(){
    const {data,error}=await supabase.from('products').select('id,name,category,status,trust_status,seller_id,origin_country,manufacturer_name,gtin,batch_number').in('status',['pending','published','rejected']).neq('trust_status','approved').order('created_at',{ascending:false});
    if(error){setMessage(error.message);return;}
    setQueue(data||[]);
    if(!selected&&data?.length)setSelected(data[0].id);
  }
  async function loadDetail(id){
    if(!id)return;
    const [p,d,s,e,q]=await Promise.all([
      supabase.from('product_compliance_profiles').select('*').eq('product_id',id).maybeSingle(),
      supabase.from('product_compliance_documents').select('*').eq('product_id',id).order('created_at',{ascending:false}),
      supabase.from('product_supply_chain_parties').select('*').eq('product_id',id).order('created_at'),
      supabase.from('product_supply_chain_events').select('*').eq('product_id',id).order('event_time',{ascending:false}).limit(50),
      supabase.from('product_quality_checks').select('*').eq('product_id',id).order('checked_at',{ascending:false})
    ]);
    const err=p.error||d.error||s.error||e.error||q.error;
    if(err){setMessage(err.message);return;}
    setProfile(p.data||null);setDocs(d.data||[]);setParties(s.data||[]);setEvents(e.data||[]);setChecks(q.data||[]);
    setNotes(p.data?.internal_review_notes||'');
  }
  useEffect(()=>{(async()=>{
    const {data:{user:u}}=await supabase.auth.getUser();setUser(u||null);
    if(u){const {data:role}=await supabase.from('rs_admin_roles').select('user_id').eq('user_id',u.id).maybeSingle();if(role){setAllowed(true);await loadQueue();}}
    setLoading(false);
  })();},[]);
  useEffect(()=>{if(selected)loadDetail(selected);},[selected]);
  async function openDocument(doc){
    const {data,error}=await supabase.storage.from('rs-product-trust').createSignedUrl(doc.storage_path,300);
    if(error){setMessage('Documento non apribile: '+error.message);return;}
    window.open(data.signedUrl,'_blank','noopener,noreferrer');
  }
  async function verifyDocument(doc,status){
    setBusy(true);const now=new Date().toISOString();
    const {error}=await supabase.from('product_compliance_documents').update({verification_status:status,verified_at:status==='verified'?now:null,verified_by:user.id}).eq('id',doc.id);
    setBusy(false);setMessage(error?'Aggiornamento documento fallito: '+error.message:'Stato documento aggiornato.');if(!error)loadDetail(selected);
  }
  async function decide(outcome){
    if(!selected||!user)return;
    if(outcome==='approved'&&!queue.find(p=>p.id===selected)?.seller_id){setMessage('Impossibile approvare: manca un venditore identificabile.');return;}
    if(outcome==='approved'&&!profile){setMessage('Impossibile approvare: il venditore non ha ancora inviato il profilo di conformità.');return;}
    if(outcome==='approved'&&docs.length===0){setMessage('Impossibile approvare: non è stato caricato alcun documento o evidenza.');return;}
    if(outcome==='approved'&&docs.some(d=>d.verification_status!=='verified')){setMessage('Prima di approvare, verifica ogni documento caricato oppure registra perché non è applicabile.');return;}
    setBusy(true);setMessage('');
    const now=new Date().toISOString();
    const {error:profileError}=await supabase.from('product_compliance_profiles').upsert({
      product_id:selected,seller_id:queue.find(p=>p.id===selected)?.seller_id,
      review_outcome:outcome,reviewed_at:now,reviewed_by:user.id,internal_review_notes:notes
    },{onConflict:'product_id'});
    if(profileError){setBusy(false);setMessage('Aggiornamento revisione non riuscito: '+profileError.message);return;}
    const trust=outcome==='approved'?'approved':outcome==='rejected'?'rejected':'submitted';
    const status=outcome==='approved'?'published':outcome==='rejected'?'rejected':'pending';
    const {error}=await supabase.from('products').update({trust_status:trust,status}).eq('id',selected);
    setBusy(false);setMessage(error?'Revisione registrata ma stato prodotto non aggiornato: '+error.message:'Esito registrato. '+(outcome==='approved'?'Il prodotto è stato autorizzato alla pubblicazione.':outcome==='rejected'?'Il prodotto è stato respinto.':'Sono necessarie integrazioni.'));
    await loadQueue();await loadDetail(selected);
  }
  if(loading)return <main className="min-h-screen p-6">Caricamento revisione…</main>;
  if(!allowed)return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-xl rounded-2xl bg-white p-6"><h1 className="text-xl font-bold">Area riservata ai revisori RiverSpend</h1><p className="mt-2 text-sm text-slate-600">È necessario un ruolo amministratore autorizzato.</p><Link href="/" className="mt-4 inline-block text-teal-700 underline">Torna allo Shop</Link></section></main>;
  const product=queue.find(p=>p.id===selected);
  return <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6"><div className="mx-auto max-w-5xl space-y-4">
    <header className="rounded-2xl bg-white p-5 shadow-sm"><Link href="/rs-control-center" className="text-sm text-teal-700 underline">← RSPC</Link><p className="mt-3 text-xs font-bold uppercase tracking-widest text-teal-700">RiverSpend Product Trust</p><h1 className="text-2xl font-extrabold">Coda di verifica conformità</h1><p className="mt-2 text-sm text-slate-600">Controlla identità, documenti, filiera e prove. L'approvazione è una revisione documentale interna, non una certificazione di laboratorio né un parere legale.</p>
    <label className="mt-4 block text-sm font-bold">Prodotto da esaminare<select className="mt-1 w-full rounded-xl border p-3" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Seleziona…</option>{queue.map(p=><option key={p.id} value={p.id}>{p.name} · {p.trust_status} · {p.status}</option>)}</select></label></header>
    {product&&<><section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">{product.name}</h2><p className="text-sm text-slate-600">{product.category||'Categoria non indicata'} · Origine dichiarata: {product.origin_country||'non indicata'} · GTIN: {product.gtin||'non indicato'} · Lotto: {product.batch_number||'non indicato'}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{parties.map(p=><div key={p.id} className="rounded-xl bg-slate-50 p-3 text-sm"><b>{p.legal_name}</b> · {p.party_role}<p>{p.country_code||'--'} · verifica: {p.verification_status}</p></div>)}</div></section>
    <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-bold">Documenti caricati ({docs.length})</h2>{!docs.length&&<p className="mt-2 text-sm text-amber-800">Nessun documento caricato.</p>}{docs.map(d=><div key={d.id} className="mt-3 rounded-xl border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><b>{d.document_title}</b><p className="text-xs text-slate-500">{d.document_type} · {d.issuer_name||'Emittente non indicato'} · {d.reference_number||'Riferimento assente'} · stato: {d.verification_status}</p></div><button onClick={()=>openDocument(d)} className="rounded-lg border px-3 py-2 text-sm font-semibold">Apri documento</button></div><div className="mt-2 flex flex-wrap gap-2"><button disabled={busy} onClick={()=>verifyDocument(d,'verified')} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Verificato</button><button disabled={busy} onClick={()=>verifyDocument(d,'rejected')} className="rounded-lg bg-rose-700 px-3 py-2 text-xs font-bold text-white">Non valido</button><button disabled={busy} onClick={()=>verifyDocument(d,'pending')} className="rounded-lg border px-3 py-2 text-xs font-bold">Da verificare</button></div></div>)}</section>
    <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-bold">Eventi filiera ({events.length})</h2>{events.map(e=><p key={e.id} className="mt-2 rounded-lg bg-slate-50 p-3 text-sm"><b>{e.event_type}</b> · {new Date(e.event_time).toLocaleString('it-IT')} · {e.location_name||'luogo non indicato'} · lotto {e.lot_number||'--'}</p>)}</section>
    <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-bold">Controlli qualità ({checks.length})</h2>{checks.map(q=><p key={q.id} className="mt-2 rounded-lg bg-slate-50 p-3 text-sm"><b>{q.check_type}</b> · {q.result} · {q.findings||'Nessuna nota'}</p>)}</section>
    <section className="rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm"><h2 className="font-bold">Esito della revisione</h2><label className="mt-3 block text-sm font-semibold">Note interne<textarea rows="4" className="mt-1 w-full rounded-xl border p-3" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Documenti controllati, lacune, verifiche richieste…"/></label><div className="mt-4 flex flex-wrap gap-2"><button disabled={busy} onClick={()=>decide('approved')} className="rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white disabled:opacity-50">Approva pubblicazione</button><button disabled={busy} onClick={()=>decide('needs_changes')} className="rounded-xl bg-amber-600 px-4 py-3 font-bold text-white disabled:opacity-50">Richiedi integrazioni</button><button disabled={busy} onClick={()=>decide('rejected')} className="rounded-xl bg-rose-700 px-4 py-3 font-bold text-white disabled:opacity-50">Respingi</button></div></section></>}
    {message&&<p role="status" className="rounded-xl border bg-white p-4 text-sm font-semibold">{message}</p>}
  </div></main>;
}
