import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

const inputClass = 'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm';
const labelClass = 'block text-sm font-semibold text-slate-700';
const roles = [
  ['manufacturer','Produttore'],['raw_material_supplier','Fornitore materie prime'],['processor','Trasformatore'],['brand_owner','Titolare del marchio'],['importer','Importatore'],['eu_responsible_person','Persona responsabile UE'],['distributor','Distributore'],['wholesaler','Grossista'],['retailer','Rivenditore'],['warehouse','Magazzino'],['carrier','Trasportatore'],['other','Altro']
];
const docTypes = [
  ['eu_declaration_of_conformity','Dichiarazione UE di conformità'],['test_report','Rapporto di prova'],['certificate','Certificato'],['technical_file','Fascicolo tecnico'],['safety_data_sheet','Scheda di sicurezza'],['label','Etichetta'],['manual','Manuale / istruzioni'],['food_traceability','Documenti tracciabilità alimentare'],['ingredient_list','Ingredienti / composizione'],['cosmetic_information','Documentazione cosmetica'],['import_customs','Documenti doganali'],['supplier_invoice','Fattura fornitore'],['insurance','Assicurazione'],['warranty','Garanzia'],['recall_notice','Avviso richiamo'],['other','Altro']
];

export default function TracciabilitaProdotto() {
  const [user,setUser] = useState(null);
  const [products,setProducts] = useState([]);
  const [productId,setProductId] = useState('');
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const [profile,setProfile] = useState({gtin:'',manufacturer_name:'',manufacturer_country:'',responsible_person_name:'',responsible_person_address:'',batch_number:'',serial_number:'',expiry_date:'',safety_summary:'',recycling_instructions:'',warranty_information:'',intended_use:'',destination_markets:'IT,EU'});
  const [party,setParty] = useState({party_role:'manufacturer',legal_name:'',country_code:'',address:'',registration_reference:''});
  const [event,setEvent] = useState({event_type:'manufactured',event_time:new Date().toISOString().slice(0,16),location_name:'',country_code:'IT',lot_number:'',quantity:'',unit:'pezzi',transaction_reference:''});
  const [doc,setDoc] = useState({document_type:'eu_declaration_of_conformity',document_title:'',issuer_name:'',issuing_country:'',reference_number:'',issued_at:'',expires_at:''});
  const [file,setFile] = useState(null);
  const [quality,setQuality] = useState({check_type:'incoming_inspection',lot_number:'',result:'passed',findings:'',corrective_action:''});
  const [parties,setParties] = useState([]);
  const [events,setEvents] = useState([]);
  const [documents,setDocuments] = useState([]);
  const [checks,setChecks] = useState([]);

  async function refresh(product) {
    if (!product) return;
    const [p,e,d,q,productRow,compliance] = await Promise.all([
      supabase.from('product_supply_chain_parties').select('*').eq('product_id',product).order('created_at',{ascending:true}),
      supabase.from('product_supply_chain_events').select('*').eq('product_id',product).order('event_time',{ascending:false}).limit(50),
      supabase.from('product_compliance_documents').select('id,document_type,document_title,issuer_name,reference_number,expires_at,verification_status,created_at').eq('product_id',product).order('created_at',{ascending:false}),
      supabase.from('product_quality_checks').select('*').eq('product_id',product).order('checked_at',{ascending:false}).limit(30),
      supabase.from('products').select('gtin,manufacturer_name,manufacturer_country,responsible_person_name,responsible_person_address,batch_number,serial_number,expiry_date,safety_summary,recycling_instructions,warranty_information').eq('id',product).maybeSingle(),
      supabase.from('product_compliance_profiles').select('intended_use,destination_markets').eq('product_id',product).maybeSingle()
    ]);
    if(p.error || e.error || d.error || q.error || productRow.error || compliance.error) { setMessage('Alcuni registri non sono disponibili: '+(p.error||e.error||d.error||q.error||productRow.error||compliance.error).message); return; }
    setParties(p.data||[]); setEvents(e.data||[]); setDocuments(d.data||[]); setChecks(q.data||[]);
    const productData=productRow.data||{};
    const complianceData=compliance.data||{};
    setProfile(current=>({
      ...current,
      gtin:productData.gtin||'', manufacturer_name:productData.manufacturer_name||'',
      manufacturer_country:productData.manufacturer_country||'',
      responsible_person_name:productData.responsible_person_name||'',
      responsible_person_address:productData.responsible_person_address||'',
      batch_number:productData.batch_number||'', serial_number:productData.serial_number||'',
      expiry_date:productData.expiry_date||'', safety_summary:productData.safety_summary||'',
      recycling_instructions:productData.recycling_instructions||'',
      warranty_information:productData.warranty_information||'',
      intended_use:complianceData.intended_use||'',
      destination_markets:Array.isArray(complianceData.destination_markets)?complianceData.destination_markets.join(','):'IT,EU'
    }));
  }

  useEffect(() => {
    let live=true;
    (async()=>{
      const {data:{user:current}}=await supabase.auth.getUser();
      if(!live) return;
      setUser(current||null);
      if(current){
        const {data,error}=await supabase.from('products').select('id,name,category,status,trust_status').eq('seller_id',current.id).order('created_at',{ascending:false});
        if(error) setMessage(error.message);
        else {setProducts(data||[]); if(data?.length){setProductId(data[0].id);}}
      }
      setLoading(false);
    })();
    return()=>{live=false;};
  },[]);

  useEffect(()=>{ if(productId) refresh(productId); },[productId]);

  async function saveProfile(e) {
    e.preventDefault(); if(!user||!productId) return;
    setBusy(true); setMessage('');
    const payload={
      gtin:profile.gtin.trim()||null, manufacturer_name:profile.manufacturer_name.trim()||null,
      manufacturer_country:profile.manufacturer_country.trim().toUpperCase()||null,
      responsible_person_name:profile.responsible_person_name.trim()||null,
      responsible_person_address:profile.responsible_person_address.trim()||null,
      batch_number:profile.batch_number.trim()||null, serial_number:profile.serial_number.trim()||null,
      expiry_date:profile.expiry_date||null, safety_summary:profile.safety_summary.trim()||null,
      recycling_instructions:profile.recycling_instructions.trim()||null,
      warranty_information:profile.warranty_information.trim()||null
    };
    payload.trust_status='submitted';
    const {error:productError}=await supabase.from('products').update({...payload,trust_status:'submitted'}).eq('id',productId).eq('seller_id',user.id);
    const {error:profileError}=await supabase.from('product_compliance_profiles').upsert({
      product_id:productId,seller_id:user.id,intended_use:profile.intended_use.trim()||null,
      destination_markets:profile.destination_markets.split(',').map(x=>x.trim().toUpperCase()).filter(Boolean)
    },{onConflict:'product_id'});
    setBusy(false);
    setMessage(productError||profileError ? 'Salvataggio non completato: '+(productError||profileError).message : 'Dati prodotto salvati. La verifica RiverSpend è ancora da effettuare.');
  }

  async function addParty(e) {
    e.preventDefault(); if(!user||!productId) return; setBusy(true);
    const {error}=await supabase.from('product_supply_chain_parties').insert({...party,product_id:productId,seller_id:user.id,legal_name:party.legal_name.trim(),country_code:party.country_code.trim().toUpperCase()||null});
    setBusy(false); setMessage(error?'Errore filiera: '+error.message:'Operatore della filiera aggiunto. Stato: non verificato.');
    if(!error){setParty({...party,legal_name:'',country_code:'',address:'',registration_reference:''});refresh(productId);}
  }

  async function addEvent(e) {
    e.preventDefault(); if(!user||!productId) return; setBusy(true);
    const {error}=await supabase.from('product_supply_chain_events').insert({
      product_id:productId,seller_id:user.id,event_type:event.event_type,event_time:new Date(event.event_time).toISOString(),
      location_name:event.location_name||null,country_code:event.country_code.toUpperCase()||null,
      lot_number:event.lot_number||null,quantity:event.quantity?Number(event.quantity):null,
      unit:event.unit||null,transaction_reference:event.transaction_reference||null,created_by:user.id
    });
    setBusy(false);setMessage(error?'Errore evento: '+error.message:'Evento registrato nel registro cronologico.');if(!error)refresh(productId);
  }

  async function uploadDocument(e) {
    e.preventDefault(); if(!user||!productId||!file) return;
    if(file.size>25*1024*1024){setMessage('Il documento supera il limite di 25 MB.');return;}
    const allowed=['application/pdf','image/jpeg','image/png','image/webp'];
    if(!allowed.includes(file.type)){setMessage('Formato non ammesso. Usa PDF, JPG, PNG o WebP.');return;}
    setBusy(true);setMessage('');
    const safeName=file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g,'_');
    const path=user.id+'/'+productId+'/'+crypto.randomUUID()+'_'+safeName;
    const {error:uploadError}=await supabase.storage.from('rs-product-trust').upload(path,file,{contentType:file.type,upsert:false});
    if(uploadError){setBusy(false);setMessage('Caricamento documento non riuscito: '+uploadError.message);return;}
    const {error}=await supabase.from('product_compliance_documents').insert({
      product_id:productId,seller_id:user.id,document_type:doc.document_type,
      document_title:doc.document_title.trim()||file.name,storage_path:path,
      issuer_name:doc.issuer_name||null,issuing_country:doc.issuing_country.toUpperCase()||null,
      reference_number:doc.reference_number||null,issued_at:doc.issued_at||null,expires_at:doc.expires_at||null
    });
    if(error) await supabase.storage.from('rs-product-trust').remove([path]);
    setBusy(false);setMessage(error?'Documento caricato ma registrazione fallita: '+error.message:'Documento archiviato in area privata. Verifica ancora in attesa.');
    if(!error){setFile(null);refresh(productId);}
  }

  async function addQuality(e) {
    e.preventDefault();if(!user||!productId)return;setBusy(true);
    const {error}=await supabase.from('product_quality_checks').insert({...quality,product_id:productId,seller_id:user.id,checked_by:user.email||'venditore'});
    setBusy(false);setMessage(error?'Errore controllo qualità: '+error.message:'Controllo qualità registrato come dichiarazione del venditore, non come certificazione indipendente.');
    if(!error)refresh(productId);
  }

  if(loading) return <main className="min-h-screen p-6">Caricamento…</main>;
  if(!user) return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-xl rounded-2xl bg-white p-6"><h1 className="text-2xl font-bold">RiverSpend · Tracciabilità e conformità</h1><p className="mt-3">Accedi al tuo account venditore per gestire i dati del prodotto.</p><Link href="/vendi" className="mt-4 inline-block text-teal-700 underline">Torna a Vendi</Link></section></main>;

  return <main className="min-h-screen bg-[#f4fbfc] px-3 py-5 text-slate-900 sm:px-6">
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm">
        <Link href="/vendi" className="text-sm font-semibold text-teal-700">← Area venditore</Link>
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-teal-700">RiverSpend Product Trust</p>
        <h1 className="mt-1 text-2xl font-extrabold">Conformità, qualità e tracciabilità</h1>
        <p className="mt-2 text-sm text-slate-600">Registra filiera, lotti, documenti e controlli. L'invio non equivale a certificazione o approvazione normativa.</p>
        <label className={labelClass+' mt-4'}>Seleziona il tuo prodotto<select className={inputClass} value={productId} onChange={e=>setProductId(e.target.value)}>{products.map(p=><option key={p.id} value={p.id}>{p.name} · {p.category||'Altro'} · {p.trust_status||'da verificare'}</option>)}</select></label>
        {!products.length&&<p className="mt-3 text-sm text-amber-800">Non hai ancora prodotti associati al tuo account.</p>}
      </header>

      {productId&&<>
        <form onSubmit={saveProfile} className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">1 · Identità, origine e sicurezza</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[['gtin','GTIN / codice a barre'],['manufacturer_name','Produttore / fabbricante'],['manufacturer_country','Paese produttore (codice ISO, es. IT)'],['responsible_person_name','Persona responsabile nell’UE, se prevista'],['responsible_person_address','Indirizzo persona responsabile, se previsto'],['batch_number','Lotto'],['serial_number','Numero seriale'],['expiry_date','Scadenza / TMC, se applicabile']].map(([key,title])=><label key={key} className={labelClass}>{title}<input className={inputClass} type={key==='expiry_date'?'date':'text'} value={profile[key]} onChange={e=>setProfile({...profile,[key]:e.target.value})}/></label>)}
            <label className={labelClass}>Mercati di destinazione (codici separati da virgola)<input className={inputClass} value={profile.destination_markets} onChange={e=>setProfile({...profile,destination_markets:e.target.value})}/></label>
            <label className={labelClass}>Garanzia / condizioni<textarea className={inputClass} rows="2" value={profile.warranty_information} onChange={e=>setProfile({...profile,warranty_information:e.target.value})}/></label>
            <label className={labelClass+' sm:col-span-2'}>Uso previsto e descrizione<textarea className={inputClass} rows="2" value={profile.intended_use} onChange={e=>setProfile({...profile,intended_use:e.target.value})}/></label>
            <label className={labelClass+' sm:col-span-2'}>Informazioni e avvertenze di sicurezza<textarea className={inputClass} rows="3" value={profile.safety_summary} onChange={e=>setProfile({...profile,safety_summary:e.target.value})}/></label>
            <label className={labelClass+' sm:col-span-2'}>Istruzioni di riciclo / smaltimento<textarea className={inputClass} rows="2" value={profile.recycling_instructions} onChange={e=>setProfile({...profile,recycling_instructions:e.target.value})}/></label>
          </div>
          <button disabled={busy} className="mt-4 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white disabled:opacity-50">Salva informazioni</button>
        </form>

        <form onSubmit={addParty} className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">2 · Filiera e operatori</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>Ruolo<select className={inputClass} value={party.party_role} onChange={e=>setParty({...party,party_role:e.target.value})}>{roles.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
            <label className={labelClass}>Ragione sociale<input required className={inputClass} value={party.legal_name} onChange={e=>setParty({...party,legal_name:e.target.value})}/></label>
            <label className={labelClass}>Paese (ISO-2)<input maxLength="2" className={inputClass} value={party.country_code} onChange={e=>setParty({...party,country_code:e.target.value})}/></label>
            <label className={labelClass}>Indirizzo<input className={inputClass} value={party.address} onChange={e=>setParty({...party,address:e.target.value})}/></label>
            <label className={labelClass+' sm:col-span-2'}>Riferimento registrazione / partita IVA / identificativo<input className={inputClass} value={party.registration_reference} onChange={e=>setParty({...party,registration_reference:e.target.value})}/></label>
          </div>
          <button disabled={busy} className="mt-4 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">Aggiungi operatore</button>
          <div className="mt-4 space-y-2">{parties.map(p=><div key={p.id} className="rounded-xl bg-slate-50 p-3 text-sm"><b>{p.legal_name}</b> · {roles.find(x=>x[0]===p.party_role)?.[1]||p.party_role}<span className="ml-2 text-amber-700">· {p.verification_status}</span><p className="text-slate-500">{p.country_code||'Paese non indicato'} {p.address||''}</p></div>)}</div>
        </form>

        <form onSubmit={addEvent} className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">3 · Registro cronologico della filiera</h2>
          <p className="mt-1 text-xs text-slate-500">Gli eventi registrati non possono essere modificati dal venditore: per correggere un errore va aggiunto un nuovo evento esplicativo.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>Evento<select className={inputClass} value={event.event_type} onChange={e=>setEvent({...event,event_type:e.target.value})}>{['sourced','manufactured','processed','quality_checked','packed','labelled','exported','customs_cleared','received','stored','dispatched','shipped','delivered','returned','withdrawn','recalled','other'].map(v=><option key={v}>{v}</option>)}</select></label>
            <label className={labelClass}>Data e ora<input required type="datetime-local" className={inputClass} value={event.event_time} onChange={e=>setEvent({...event,event_time:e.target.value})}/></label>
            <label className={labelClass}>Luogo / stabilimento<input className={inputClass} value={event.location_name} onChange={e=>setEvent({...event,location_name:e.target.value})}/></label>
            <label className={labelClass}>Paese ISO-2<input maxLength="2" className={inputClass} value={event.country_code} onChange={e=>setEvent({...event,country_code:e.target.value})}/></label>
            <label className={labelClass}>Lotto<input className={inputClass} value={event.lot_number} onChange={e=>setEvent({...event,lot_number:e.target.value})}/></label>
            <label className={labelClass}>Quantità<input type="number" min="0" step="any" className={inputClass} value={event.quantity} onChange={e=>setEvent({...event,quantity:e.target.value})}/></label>
            <label className={labelClass}>Unità<input className={inputClass} value={event.unit} onChange={e=>setEvent({...event,unit:e.target.value})}/></label>
            <label className={labelClass}>Riferimento documento / spedizione<input className={inputClass} value={event.transaction_reference} onChange={e=>setEvent({...event,transaction_reference:e.target.value})}/></label>
          </div>
          <button disabled={busy} className="mt-4 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">Registra evento</button>
          <ol className="mt-4 space-y-2">{events.map(ev=><li key={ev.id} className="rounded-xl bg-slate-50 p-3 text-sm"><b>{ev.event_type}</b> · {new Date(ev.event_time).toLocaleString('it-IT')} · {ev.location_name||'Luogo non indicato'}<p className="text-slate-500">Lotto: {ev.lot_number||'—'} · {ev.country_code||'—'}</p></li>)}</ol>
        </form>

        <form onSubmit={uploadDocument} className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">4 · Documenti e certificazioni</h2>
          <p className="mt-1 text-xs text-slate-500">I file sono privati e accessibili al venditore e ai revisori autorizzati. Non caricare documenti che non sei autorizzato a condividere.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>Tipo documento<select className={inputClass} value={doc.document_type} onChange={e=>setDoc({...doc,document_type:e.target.value})}>{docTypes.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
            <label className={labelClass}>Titolo<input className={inputClass} value={doc.document_title} onChange={e=>setDoc({...doc,document_title:e.target.value})}/></label>
            <label className={labelClass}>Emittente<input className={inputClass} value={doc.issuer_name} onChange={e=>setDoc({...doc,issuer_name:e.target.value})}/></label>
            <label className={labelClass}>Paese emittente ISO-2<input maxLength="2" className={inputClass} value={doc.issuing_country} onChange={e=>setDoc({...doc,issuing_country:e.target.value})}/></label>
            <label className={labelClass}>Numero riferimento<input className={inputClass} value={doc.reference_number} onChange={e=>setDoc({...doc,reference_number:e.target.value})}/></label>
            <label className={labelClass}>Data emissione<input type="date" className={inputClass} value={doc.issued_at} onChange={e=>setDoc({...doc,issued_at:e.target.value})}/></label>
            <label className={labelClass}>Scadenza documento<input type="date" className={inputClass} value={doc.expires_at} onChange={e=>setDoc({...doc,expires_at:e.target.value})}/></label>
            <label className={labelClass}>File (PDF/JPG/PNG/WebP, max 25 MB)<input required type="file" accept=".pdf,image/jpeg,image/png,image/webp" className={inputClass} onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
          </div>
          <button disabled={busy||!file} className="mt-4 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white disabled:opacity-50">Carica documento privato</button>
          <div className="mt-4 space-y-2">{documents.map(d=><div key={d.id} className="rounded-xl bg-slate-50 p-3 text-sm"><b>{d.document_title}</b> · {docTypes.find(x=>x[0]===d.document_type)?.[1]||d.document_type}<p className="text-slate-500">Verifica: {d.verification_status} · Scadenza: {d.expires_at||'non indicata'}</p></div>)}</div>
        </form>

        <form onSubmit={addQuality} className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">5 · Controlli qualità</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>Tipo controllo<select className={inputClass} value={quality.check_type} onChange={e=>setQuality({...quality,check_type:e.target.value})}>{['incoming_inspection','sampling','laboratory_test','visual_inspection','packaging_check','label_check','temperature_check','shelf_life_check','other'].map(v=><option key={v}>{v}</option>)}</select></label>
            <label className={labelClass}>Lotto<input className={inputClass} value={quality.lot_number} onChange={e=>setQuality({...quality,lot_number:e.target.value})}/></label>
            <label className={labelClass}>Esito<select className={inputClass} value={quality.result} onChange={e=>setQuality({...quality,result:e.target.value})}><option value="passed">Superato (dichiarazione venditore)</option><option value="failed">Non superato</option><option value="conditional">Condizionato</option><option value="not_applicable">Non applicabile</option></select></label>
            <label className={labelClass}>Risultati / osservazioni<textarea className={inputClass} rows="2" value={quality.findings} onChange={e=>setQuality({...quality,findings:e.target.value})}/></label>
            <label className={labelClass+' sm:col-span-2'}>Azione correttiva<textarea className={inputClass} rows="2" value={quality.corrective_action} onChange={e=>setQuality({...quality,corrective_action:e.target.value})}/></label>
          </div>
          <button disabled={busy} className="mt-4 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">Registra controllo</button>
          <div className="mt-4 space-y-2">{checks.map(c=><div key={c.id} className="rounded-xl bg-slate-50 p-3 text-sm"><b>{c.check_type}</b> · {c.result} · {new Date(c.checked_at).toLocaleString('it-IT')}<p className="text-slate-500">{c.findings||'Nessuna nota'}</p></div>)}</div>
        </form>
      </>}

      {message&&<p role="status" className="rounded-xl border border-cyan-200 bg-white p-4 text-sm font-semibold">{message}</p>}
      <p className="rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">Importante: l'inserimento dei dati e dei documenti non costituisce una certificazione. Le dichiarazioni restano attribuite al soggetto che le fornisce. RiverSpend deve effettuare verifiche documentali e, quando richiesto, avvalersi di laboratori o organismi competenti prima di approvare la pubblicazione.</p>
    </div>
  </main>;
}
