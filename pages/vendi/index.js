'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { riverSpendCategories } from '../../lib/riverSpendCategories';

const MAX_PHOTOS = 20;
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const DELIVERY_METHODS = [
  ['home_delivery', '🚚 Consegna a domicilio'],
  ['seller_shop', '🏪 Ritiro al punto vendita / negozio'],
  ['river_hub', '📦 Ritiro al punto Hub RiverSpend'],
  ['pickup_point', '🏬 Punto di ritiro convenzionato'],
  ['locker', '🔐 Locker automatico'],
  ['seller_pickup', '🤝 Ritiro presso il venditore su appuntamento'],
  ['scheduled_delivery', '🗓️ Consegna programmata'],
  ['rs_local', '📍 RS Local · consegna a mano']
];

export default function Vendi() {
  const [prodotti, setProdotti] = useState([]);
  const [mieInserzioni, setMieInserzioni] = useState([]);
  const [venditeRicevute, setVenditeRicevute] = useState([]);
  const [caricamentoVendite, setCaricamentoVendite] = useState(false);
  const [erroreVendite, setErroreVendite] = useState('');
  const [aggiornamentoVendita, setAggiornamentoVendita] = useState('');
  const [modificaPrezzoId, setModificaPrezzoId] = useState('');
  const [nuovoNome, setNuovoNome] = useState('');
  const [nuovoPrezzo, setNuovoPrezzo] = useState('');
  const [salvataggioPrezzo, setSalvataggioPrezzo] = useState(false);
  const [titolo, setTitolo] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [quantita, setQuantita] = useState('1');
  const [usaVarianti, setUsaVarianti] = useState(false);
  const [varianti, setVarianti] = useState([{ name: 'Giallo', stock: '1' }]);
  const [descrizione, setDescrizione] = useState('');
  const [condizione, setCondizione] = useState('Nuovo');
  const [categoria, setCategoria] = useState('Altro');
  const [sellerCountry, setSellerCountry] = useState('Italia');
  const [originCountry, setOriginCountry] = useState('');
  const [locality, setLocality] = useState('');
  const [province, setProvince] = useState('');
  const [region, setRegion] = useState('');
  const [deliveryOptions, setDeliveryOptions] = useState(['home_delivery', 'seller_pickup', 'rs_local']);

  const [foto, setFoto] = useState([]);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  const [messaggio, setMessaggio] = useState('');

  async function loadProducts() {
    try {
      const res = await fetch('/api/products', {
        cache: 'no-store'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore caricamento prodotti.');
      }

      setProdotti(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMessaggio('❌ Errore caricamento prodotti.');
    }
  }

  async function loadMieInserzioni(userId) {
    if (!userId) { setMieInserzioni([]); return; }
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, status, locality, province, region, sold_at')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Caricamento annunci personali:', error);
      setMessaggio('❌ Non riesco a caricare i tuoi annunci.');
      return;
    }
    setMieInserzioni(data || []);
  }

  async function loadVenditeRicevute(userId) {
    if (!userId) { setVenditeRicevute([]); setErroreVendite(''); return; }
    setCaricamentoVendite(true);
    setErroreVendite('');
    try {
      const { data: products, error: productsError } = await supabase.from('products').select('id').eq('seller_id', userId);
      if (productsError) throw productsError;
      const productIds = (products || []).map((product) => product.id);
      if (!productIds.length) { setVenditeRicevute([]); return; }
      const { data: items, error: itemsError } = await supabase.from('order_items').select('id, order_id, product_id, product_name, quantity, unit_price, subtotal').in('product_id', productIds);
      if (itemsError) throw itemsError;
      const orderIds = [...new Set((items || []).map((item) => item.order_id).filter(Boolean))];
      if (!orderIds.length) { setVenditeRicevute([]); return; }
      const { data: orders, error: ordersError } = await supabase.from('orders').select('id, status, payment_status, created_at').in('id', orderIds);
      if (ordersError) throw ordersError;
      const orderById = new Map((orders || []).map((order) => [String(order.id), order]));
      setVenditeRicevute((items || []).filter((item) => orderById.has(String(item.order_id))).map((item) => ({ ...item, order: orderById.get(String(item.order_id)) })).sort((a, b) => new Date(b.order.created_at || 0).getTime() - new Date(a.order.created_at || 0).getTime()));
    } catch (error) {
      console.error('Caricamento vendite ricevute:', error);
      setVenditeRicevute([]);
      setErroreVendite('Non riesco a leggere le vendite registrate. Potrebbe essere necessario verificare i permessi Supabase per order_items e orders.');
    } finally { setCaricamentoVendite(false); }
  }

  useEffect(() => {
    if (session?.user?.id) {
      loadMieInserzioni(session.user.id);
      loadVenditeRicevute(session.user.id);
    } else {
      setMieInserzioni([]);
      setVenditeRicevute([]);
      setErroreVendite('');
    }
  }, [session?.user?.id]);

  async function salvaPrezzo(prodotto) {
    if (!session?.user?.id || !prodotto?.id || prodotto.status !== 'published' || salvataggioPrezzo) return;
    const nome = nuovoNome.trim();
    const valore = Number(String(nuovoPrezzo).replace(',', '.'));
    if (!nome || nome.length > 140) {
      setMessaggio('⚠️ Inserisci un nome prodotto da 1 a 140 caratteri.');
      return;
    }
    if (!Number.isFinite(valore) || valore <= 0 || valore > 10000000) {
      setMessaggio('⚠️ Inserisci un prezzo valido maggiore di zero.');
      return;
    }
    setSalvataggioPrezzo(true);
    setMessaggio('Salvo le modifiche dell’annuncio…');
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ name: nome, price: Number(valore.toFixed(2)) })
        .eq('id', prodotto.id)
        .eq('seller_id', session.user.id)
        .eq('status', 'published')
        .select('id, name, price')
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Modifiche non salvate: verifica di essere il venditore e che l’annuncio sia ancora pubblicato.');
      setMieInserzioni((current) => current.map((item) => String(item.id) === String(prodotto.id) ? { ...item, name: data.name, price: data.price } : item));
      setModificaPrezzoId('');
      setNuovoNome('');
      setNuovoPrezzo('');
      setMessaggio('✅ Nome e prezzo aggiornati. Verifica l’annuncio nello Shop.');
    } catch (error) {
      console.error('Aggiornamento prezzo annuncio:', error);
      setMessaggio('❌ Non sono riuscito ad aggiornare il prezzo. ' + (error?.message || 'Riprova.'));
    } finally {
      setSalvataggioPrezzo(false);
    }
  }

  async function segnaComeVenduto(prodotto) {
    if (!session?.user?.id || !prodotto?.id || prodotto.status !== 'published') return;
    const conferma = window.confirm(`Confermi che “${prodotto.name}” è stato venduto? L’annuncio sparirà da RiverSpendShop e RS Local, ma resterà nel tuo elenco come venduto.`);
    if (!conferma) return;
    setAggiornamentoVendita(prodotto.id);
    setMessaggio('Aggiorno lo stato dell’annuncio…');
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ status: 'sold', sold_at: new Date().toISOString() })
        .eq('id', prodotto.id)
        .eq('seller_id', session.user.id)
        .eq('status', 'published')
        .select('id, status, sold_at')
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Annuncio non aggiornato: verifica di essere il venditore e che sia ancora pubblicato.');
      setMieInserzioni((current) => current.map((item) => String(item.id) === String(prodotto.id) ? { ...item, status: 'sold', sold_at: data.sold_at } : item));
      setProdotti((current) => current.filter((item) => String(item.id) !== String(prodotto.id)));
      setMessaggio('✅ Annuncio segnato come venduto: non apparirà più tra quelli disponibili in Shop e Local.');
    } catch (error) {
      console.error('Aggiornamento vendita:', error);
      setMessaggio(`❌ ${error.message || 'Non è stato possibile aggiornare l’annuncio.'}`);
    } finally {
      setAggiornamentoVendita('');
    }
  }

  useEffect(() => {
    let attivo = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error(error);
      if (attivo) setSession(data?.session || null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nuovaSessione) => {
      setSession(nuovaSessione || null);
    });

    loadProducts();

    return () => {
      attivo = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handlePhotos(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    if (files.length > MAX_PHOTOS || foto.length + files.length > MAX_PHOTOS) {
      setMessaggio(`⚠️ Puoi avere al massimo ${MAX_PHOTOS} foto/video per annuncio.`);
      return;
    }

    const nonValido = files.find((file) =>
      (!file.type.startsWith('image/') && !file.type.startsWith('video/')) ||
      (file.type.startsWith('image/') && file.size > MAX_PHOTO_SIZE) ||
      (file.type.startsWith('video/') && file.size > MAX_VIDEO_SIZE)
    );

    if (nonValido) {
      setMessaggio('⚠️ Foto fino a 10 MB e video fino a 100 MB ciascuno.');
      return;
    }

    const elementi = files.map((file) => {
      const url = URL.createObjectURL(file);
      return {
        file,
        mediaType: file.type.startsWith('video/') ? 'video' : 'image',
        url,
        originalUrl: url,
        uploadFile: file,
        processed: false,
        processing: false,
        error: false
      };
    });

    setFoto((current) => [...current, ...elementi]);
    setMessaggio(files.some((file) => file.type.startsWith('video/'))
      ? '✅ Foto e video aggiunti. I file originali verranno caricati senza elaborazioni.'
      : '✅ Foto aggiunte. Le immagini originali verranno caricate senza attese PhotoAI.');
  }

  function removePhoto(index) {
    setFoto((current) => {
      const daRimuovere = current[index];
      if (daRimuovere?.url) URL.revokeObjectURL(daRimuovere.url);
      if (daRimuovere?.originalUrl && daRimuovere.originalUrl !== daRimuovere.url) URL.revokeObjectURL(daRimuovere.originalUrl);
      if (daRimuovere?.processedUrl) URL.revokeObjectURL(daRimuovere.processedUrl);
      return current.filter((_, i) => i !== index);
    });
  }

  async function inviaLinkAccesso(event) {
    event.preventDefault();

    if (!email.trim()) {
      setMessaggio('Inserisci la tua email.');
      return;
    }

    setCaricamento(true);
    setMessaggio('Invio del link di accesso...');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/vendi`
        }
      });

      if (error) throw error;

      setMessaggio('✅ Link inviato. Apri la tua email e clicca sul link per accedere.');
    } catch (error) {
      console.error(error);
      setMessaggio(`❌ ${error.message || 'Invio del link non riuscito.'}`);
    } finally {
      setCaricamento(false);
    }
  }

  async function esci() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessaggio(`❌ ${error.message}`);
      return;
    }

    setSession(null);
    setMessaggio('Sei uscito dal tuo account.');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!session?.user) {
      setMessaggio('⚠️ Accedi prima di pubblicare un prodotto.');
      return;
    }

    const prezzoNumero = Number(prezzo);

    if (!titolo.trim() || !prezzo || !Number.isFinite(prezzoNumero) || prezzoNumero <= 0) {
      setMessaggio('⚠️ Inserisci nome e prezzo valido.');
      return;
    }

    const righeVarianti = usaVarianti ? varianti.map((v) => ({ name: String(v.name || '').trim(), stock: Number(v.stock) })) : [];
    if (usaVarianti && (!righeVarianti.length || righeVarianti.some((v) => !v.name || !Number.isInteger(v.stock) || v.stock < 0) || new Set(righeVarianti.map((v) => v.name.toLocaleLowerCase('it'))).size !== righeVarianti.length || righeVarianti.every((v) => v.stock === 0))) {
      setMessaggio('⚠️ Inserisci colori diversi e quantità intere valide; almeno un colore deve avere scorte.');
      return;
    }
    const quantitaNumero = usaVarianti ? righeVarianti.reduce((totale, v) => totale + v.stock, 0) : Number(quantita);
    if (!Number.isInteger(quantitaNumero) || quantitaNumero < 1) {
      setMessaggio('⚠️ Inserisci una quantità disponibile di almeno 1.');
      return;
    }

    if (foto.length === 0) {
      setMessaggio('⚠️ Inserisci almeno una foto o un video.');
      return;
    }

    setCaricamento(true);
    setMessaggio('⏳ Caricamento foto e pubblicazione...');

    const productId = crypto.randomUUID();
    const percorsiCaricati = [];

    try {
      const immaginiCaricate = [];

      for (let i = 0; i < foto.length; i += 1) {
        const file = foto[i].uploadFile || foto[i].file;
        const estensione = file.name.includes('.')
          ? file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '')
          : 'jpg';

        const percorso = `${session.user.id}/${productId}/${i + 1}.${estensione || 'jpg'}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(percorso, file, {
            contentType: file.type || 'application/octet-stream',
            upsert: false
          });

        if (uploadError) throw uploadError;

        percorsiCaricati.push(percorso);

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(percorso);

        immaginiCaricate.push(urlData.publicUrl);
      }

      const { error: productError } = await supabase
        .from('products')
        .insert({
          id: productId,
          name: titolo.trim(),
          price: prezzoNumero,
          stock: quantitaNumero,
          variants: usaVarianti ? righeVarianti : [],
          delivery_options: deliveryOptions,
          condition: condizione,
          category: categoria,
          description: descrizione.trim(),
          image: immaginiCaricate[0],
          seller_id: session.user.id,
          seller_type: 'Privato',
          seller_country: sellerCountry.trim() || null,
          locality: locality.trim() || null,
          province: province.trim() || null,
          region: region.trim() || null,
          origin_country: originCountry.trim() || null,
          original_language: document.documentElement.lang || 'it',
          homepage_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'published'
        });

      if (productError) throw productError;

      const righeMedia = foto.map((item, index) => ({
        product_id: productId,
        media_type: item.mediaType || 'image',
        media_url: immaginiCaricate[index],
        sort_order: index,
        seller_id: session.user.id
      }));

      const { error: mediaError } = await supabase
        .from('product_media')
        .insert(righeMedia);

      if (mediaError) {
        await supabase
          .from('products')
          .delete()
          .eq('id', productId)
          .eq('seller_id', session.user.id);

        throw mediaError;
      }

      // Dopo la pubblicazione ricarichiamo dal vero endpoint Shop, così la lista
      // mostrata qui segue esattamente gli stessi dati usati dal Market.
      if (!categoria.startsWith('18🔞')) {
        await loadProducts();
      }

      setTitolo('');
      setPrezzo('');
      setQuantita('1');
      setUsaVarianti(false);
      setVarianti([{ name: 'Giallo', stock: '1' }]);
      setDescrizione('');
      setCondizione('Nuovo');
      setCategoria('Altro');
      setSellerCountry('Italia');
      setOriginCountry('');
      setLocality('');
      setProvince('');
      setRegion('');

      foto.forEach((item) => URL.revokeObjectURL(item.url));
      setFoto([]);

      await loadMieInserzioni(session.user.id);
      setMessaggio('✅ Prodotto pubblicato nel RiverSpendShop!');
    } catch (error) {
      console.error('Pubblicazione prodotto:', error);

      if (percorsiCaricati.length) {
        await supabase.storage
          .from('product-images')
          .remove(percorsiCaricati);
      }

      setMessaggio(`❌ ${error.message || 'Errore durante la pubblicazione.'}`);
    } finally {
      setCaricamento(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-4">
      <div className="max-w-5xl mx-auto">

        <header className="mb-6">
          <h1 className="text-3xl font-bold text-teal-700">
            RiverSpend
          </h1>
          <p className="text-slate-600">
            Vendi i tuoi prodotti
          </p>
        </header>

        <section role="status" className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
          <h2 className="font-extrabold">⚠️ RiverSpend è online in versione di test</h2>
          <p className="mt-1 text-sm leading-6">Il sito è ancora in sviluppo e collaudo. Funzioni, regole, disponibilità e procedure di pagamento possono essere modificate e alcune funzioni potrebbero non essere ancora operative. Prima del lancio definitivo pubblicheremo le condizioni aggiornate. Non promettiamo trattenuta o bonifico automatico finché il relativo sistema non sarà attivo e verificato.</p>
        </section>
        {session?.user && (
          <section className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
            <h2 className="text-xl font-extrabold text-amber-950">Importante: vendi sempre tramite RiverSpend</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-950">
              <li><strong>Shop e RS Local:</strong> anche per il ritiro a mano, l’acquirente deve effettuare l’acquisto su RiverSpend. Non concludere accordi esterni per evitare la commissione della piattaforma.</li>
              <li><strong>Privacy:</strong> non condividere pubblicamente nome completo, telefono, email o altri dati personali dell’acquirente. Condividi solo i dati strettamente necessari per consegna, ritiro e obblighi di legge, tramite procedure sicure.</li>
              <li><strong>Conferma della vendita:</strong> l’obiettivo è che acquirente e venditore premano entrambi “Vendita conclusa · Tutto OK”. Solo dopo le conferme e gli eventuali controlli su contestazioni, RiverSpend potrà autorizzare lo svincolo del saldo al beneficiario, al netto della commissione.</li>
            </ul>
            <p className="mt-3 text-xs leading-5 text-amber-900"><strong>Nota:</strong> la conferma doppia e lo svincolo automatico del saldo devono essere collegati e verificati nel sistema ordini/pagamenti prima di poter essere garantiti. Non considerare questa informativa come prova che la trattenuta o il bonifico automatico siano già attivi.</p>
          </section>
        )}

        {!session?.user ? (
          <form
            onSubmit={inviaLinkAccesso}
            className="bg-white rounded-2xl shadow p-5 mb-8"
          >
            <h2 className="text-2xl font-bold mb-3">
              Accedi per vendere
            </h2>

            <p className="text-slate-600 mb-4">
              Inserisci la tua email: ti invieremo un link per accedere senza password.
            </p>

            <input
              className="w-full border rounded-xl p-3 mb-3"
              type="email"
              placeholder="La tua email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={caricamento}
              className="w-full bg-teal-600 text-white font-bold rounded-xl p-3 disabled:opacity-50"
            >
              {caricamento ? 'Invio...' : '📩 INVIA LINK DI ACCESSO'}
            </button>

            {messaggio && (
              <p className="mt-4 font-semibold">{messaggio}</p>
            )}
          </form>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                Accesso effettuato: <strong>{session.user.email}</strong>
              </p>
              <button
                type="button"
                onClick={esci}
                className="border rounded-lg px-4 py-2"
              >
                Esci
              </button>
            </div>

            <section className="mb-6 rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-teal-800">I miei annunci · Gestione vendite</h2>
              <p className="mt-1 text-sm text-slate-600">Usa “Segna come venduto” solo per aggiornare la disponibilità di un annuncio non più vendibile: non sostituisce il checkout RiverSpend. Per le vendite concluse tramite RiverSpendShop o RS Local, l’acquisto deve essere registrato sulla piattaforma, così la commissione può essere calcolata e la transazione tracciata.</p>
              {mieInserzioni.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">Non hai ancora annunci associati a questo account.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {mieInserzioni.map((item) => (
                    <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-slate-600">€ {Number(item.price || 0).toFixed(2)}{item.locality ? ` · ${item.locality}` : ''}{item.province ? ` · ${item.province}` : ''}</p>
                        <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-bold ${item.status === 'sold' ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'}`}>{item.status === 'sold' ? '✓ Venduto' : item.status === 'published' ? '● Disponibile' : item.status}</span>
                      </div>
                      {item.status === 'published' && (
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => { setModificaPrezzoId(String(item.id)); setNuovoNome(item.name || ''); setNuovoPrezzo(String(Number(item.price || 0).toFixed(2))); }} className="rounded-xl border border-teal-700 px-4 py-2 text-sm font-bold text-teal-800">
                            Modifica prezzo
                          </button>
                          <button type="button" onClick={() => segnaComeVenduto(item)} disabled={Boolean(aggiornamentoVendita) || salvataggioPrezzo} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                            {aggiornamentoVendita === item.id ? 'Aggiorno…' : 'Segna come venduto'}
                          </button>
                        </div>
                      )}
                      {modificaPrezzoId === String(item.id) && item.status === 'published' && (
                        <div className="w-full rounded-xl border border-teal-200 bg-teal-50 p-3">
                          <label className="block text-sm font-bold text-slate-700" htmlFor={`nome-${item.id}`}>Nome prodotto</label>
                          <input id={`nome-${item.id}`} type="text" maxLength={140} value={nuovoNome} onChange={(event) => setNuovoNome(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2" />
                          <label className="mt-3 block text-sm font-bold text-slate-700" htmlFor={`prezzo-${item.id}`}>Nuovo prezzo (€)</label>
                          <input id={`prezzo-${item.id}`} type="number" min="0.01" max="10000000" step="0.01" inputMode="decimal" value={nuovoPrezzo} onChange={(event) => setNuovoPrezzo(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg" />
                          <div className="mt-3 flex gap-2">
                            <button type="button" onClick={() => salvaPrezzo(item)} disabled={salvataggioPrezzo} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{salvataggioPrezzo ? 'Salvo…' : 'Salva prezzo'}</button>
                            <button type="button" onClick={() => { setModificaPrezzoId(''); setNuovoNome(''); setNuovoPrezzo(''); }} disabled={salvataggioPrezzo} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700">Annulla</button>
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
              {messaggio && <p role="status" className="mt-3 text-sm font-semibold">{messaggio}</p>}
            </section>

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow p-5 mb-8"
            >
              <h2 className="text-2xl font-bold mb-4">
                Carica un prodotto
              </h2>

              <input
                className="w-full border rounded-xl p-3 mb-3"
                placeholder="Nome prodotto"
                value={titolo}
                onChange={(e) => setTitolo(e.target.value)}
                required
              />

              <input
                className="w-full border rounded-xl p-3 mb-3"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Prezzo €"
                value={prezzo}
                onChange={(e) => setPrezzo(e.target.value)}
                required
              />

              <label className="mb-2 block font-semibold">Quantità disponibile</label>
              {!usaVarianti && <input className="w-full border rounded-xl p-3 mb-3" type="number" min="1" step="1" value={quantita} onChange={(e) => setQuantita(e.target.value)} required />}
              <label className="mb-3 flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 p-3">
                <input type="checkbox" checked={usaVarianti} onChange={(e) => setUsaVarianti(e.target.checked)} />
                <span><strong>Questo prodotto ha colori o varianti</strong><span className="block text-sm text-slate-600">Esempio: collare antipulci giallo, rosso e blu con scorte separate.</span></span>
              </label>
              {usaVarianti && <div className="mb-4 rounded-xl border border-slate-200 p-3">
                <div className="mb-2 flex items-center justify-between gap-2"><strong>Colori e quantità per colore</strong><button type="button" onClick={() => setVarianti((old) => [...old, { name: '', stock: '0' }])} className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-bold text-white">+ Aggiungi colore</button></div>
                {varianti.map((v, index) => <div key={index} className="mb-2 grid grid-cols-[1fr_90px_auto] gap-2">
                  <input className="min-w-0 rounded-lg border p-2" placeholder="Colore (es. Rosso)" value={v.name} onChange={(e) => setVarianti((old) => old.map((row, i) => i === index ? { ...row, name: e.target.value } : row))} />
                  <input className="w-full rounded-lg border p-2" type="number" min="0" step="1" aria-label={"Quantità " + (v.name || "colore")} value={v.stock} onChange={(e) => setVarianti((old) => old.map((row, i) => i === index ? { ...row, stock: e.target.value } : row))} />
                  <button type="button" disabled={varianti.length === 1} onClick={() => setVarianti((old) => old.filter((_, i) => i !== index))} className="rounded-lg border px-2 disabled:opacity-30" aria-label="Rimuovi colore">✕</button>
                </div>)}
                <p className="mt-2 text-sm font-semibold text-teal-800">Pezzi totali: {varianti.reduce((sum, v) => sum + Math.max(0, Number(v.stock) || 0), 0)}</p>
              </div>}

              <select
                className="w-full border rounded-xl p-3 mb-3"
                value={condizione}
                onChange={(e) => setCondizione(e.target.value)}
              >
                <option>Nuovo</option>
                <option>Usato</option>
                <option>Come nuovo</option>
              </select>

              <label className="mb-2 block font-semibold">Paese del venditore</label>
              <input className="w-full border rounded-xl p-3 mb-3" value={sellerCountry} onChange={(e) => setSellerCountry(e.target.value)} placeholder="Es. Italia" required />
              <div className="mt-2 mb-4 rounded-xl border border-teal-200 bg-teal-50 p-3">
                <p className="font-semibold text-teal-900">📍 Presenza su RiverSpend Local</p>
                <p className="mt-1 mb-3 text-sm text-slate-600">Facoltativo: indica dove si trova il prodotto. Sarà visibile in Local solo come località, non come indirizzo preciso.</p>
                <label className="mb-1 block text-sm font-semibold">Comune / località</label>
                <input className="mb-3 w-full rounded-xl border p-3" value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="Es. Cannobio" />
                <label className="mb-1 block text-sm font-semibold">Provincia</label>
                <input className="mb-3 w-full rounded-xl border p-3" value={province} onChange={(e) => setProvince(e.target.value)} placeholder="Es. Verbano-Cusio-Ossola" />
                <label className="mb-1 block text-sm font-semibold">Regione</label>
                <input className="w-full rounded-xl border p-3" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Es. Piemonte" />
              </div>
              <label className="mb-2 block font-semibold">Paese di origine del prodotto (se conosciuto)</label>
              <input className="w-full border rounded-xl p-3 mb-3" value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} placeholder="Es. Italia, Giappone, Cina…" />
              <p className="mb-3 text-xs text-slate-500">Indica l’origine reale del prodotto, non il paese del sito o del fornitore.</p>
              <label className="mb-2 block font-semibold">Categoria</label>
              <select className="mb-3 w-full rounded-xl border p-3" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                 {riverSpendCategories.map((item) => <option key={item}>{item}</option>)}
              </select>

              {categoria === '18🔞 Sex Toys' && (
                <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4" role="note">
                  <p className="font-bold text-red-800">🔞 Categoria riservata agli adulti</p>
                  <p className="mt-1 text-sm text-red-700">Gli annunci in questa categoria sono destinati esclusivamente a persone maggiorenni. Pubblica solo articoli consentiti e conformi alle regole di RiverSpend.</p>
                </div>
              )}

              <label className="block font-bold mb-2">
                📸 Foto prodotto
              </label>

              <p className="text-sm text-slate-500 mb-3">
                Fino a 20 foto/video per annuncio · foto max 10 MB · video max 100 MB.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                <label className="flex cursor-pointer items-center justify-center rounded-xl bg-teal-600 px-4 py-3 text-center font-bold text-white shadow-sm hover:bg-teal-700">
                  📷 SCATTA FOTO
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotos}
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-center rounded-xl bg-cyan-600 px-4 py-3 text-center font-bold text-white shadow-sm hover:bg-cyan-700">
                  🎥 REGISTRA VIDEO
                  <input
                    className="sr-only"
                    type="file"
                    accept="video/*"
                    capture="environment"
                    onChange={handlePhotos}
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-center font-bold text-slate-800 shadow-sm hover:bg-slate-50">
                  📁 SCEGLI DAL DISPOSITIVO
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handlePhotos}
                  />
                </label>
              </div>

              {foto.length > 0 && (
                <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 mb-4">
                  <p className="font-semibold mb-1">✨ RiverSpend PhotoAI</p>
                  <p className="text-sm text-slate-600">PhotoAI rimuove lo sfondo, centra il prodotto e lo prepara su una tela bianca. Le foto restano sul tuo dispositivo durante l’elaborazione; l’originale viene conservato.</p>
                  {foto.some((item) => item.processing) && <p className="text-sm font-semibold mt-2">⏳ Elaborazione in corso… attendi prima di pubblicare.</p>}
                  {foto.some((item) => item.error) && <p className="text-sm text-red-700 mt-2">Alcune foto non sono state elaborate: puoi riprovare oppure pubblicare usando gli originali.</p>}
                  {foto[0]?.processed && <button type="button" onClick={ripristinaFotoPrincipale} disabled={caricamento} className="mt-2 rounded-lg border px-3 py-2">Ripristina originale della prima foto</button>}
                </div>
              )}
              {foto.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                  {foto.map((item, index) => (
                    <div
                      key={`${item.file.name}-${index}`}
                      className="relative overflow-hidden rounded-xl border"
                    >
                      {item.mediaType === 'video' ? (
                        <video
                          src={item.url}
                          controls
                          playsInline
                          className="w-full h-28 bg-black object-contain"
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-28 bg-white object-contain p-1"
                        />
                      )}
                      {item.mediaType !== 'video' && (
                        <div className="absolute inset-x-1 bottom-7 flex flex-wrap justify-center gap-1 pointer-events-none">
                          <span className="rounded-full border border-cyan-200 bg-white/95 px-1.5 py-1 text-[9px] font-extrabold text-cyan-950 shadow">♡ RS Desideri</span>
                          <span className="rounded-full border border-cyan-200 bg-white/95 px-1.5 py-1 text-[9px] font-extrabold text-cyan-950 shadow">🕸️ RS Rete</span>
                          <span className="rounded-full border border-amber-300 bg-amber-100/95 px-1.5 py-1 text-[9px] font-extrabold text-amber-950 shadow">✦ RS Simili</span>
                        </div>
                      )}
                      <span className="block text-center text-xs py-1">{item.mediaType === 'video' ? '🎥 Video originale' : 'Originale'}</span>
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full px-2 py-1"
                      >
                        ×
                      </button>

                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center">
                        Foto {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <section className="mb-4 rounded-2xl border border-teal-200 bg-teal-50/50 p-4">
                <h3 className="font-extrabold text-slate-900">📦 Modalità di ritiro e consegna offerte</h3>
                <p className="mt-1 text-sm text-slate-600">Seleziona solo le modalità che puoi davvero offrire per questo articolo. Hub, locker e punti convenzionati richiedono un servizio disponibile; la scelta sarà confermata prima dell’ordine definitivo.</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {DELIVERY_METHODS.map(([value, label]) => (
                    <label key={value} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
                      <input type="checkbox" checked={deliveryOptions.includes(value)} onChange={(event) => setDeliveryOptions((current) => event.target.checked ? [...current, value] : current.filter((option) => option !== value))} className="mt-1 accent-teal-600" />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                {deliveryOptions.length === 0 && <p className="mt-2 text-sm font-semibold text-red-700">Seleziona almeno una modalità di consegna o ritiro.</p>}
              </section>
              <textarea
                className="w-full border rounded-xl p-3 mb-4"
                rows="4"
                placeholder="Descrizione prodotto"
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
              />

              <button
                type="submit"
                disabled={caricamento || deliveryOptions.length === 0}
                className="w-full bg-teal-600 text-white font-bold rounded-xl p-3 disabled:opacity-50"
              >
                {caricamento ? '⏳ Pubblicazione...' : '🚀 PUBBLICA PRODOTTO'}
              </button>

              {messaggio && (
                <p className="mt-4 font-semibold">{messaggio}</p>
              )}
            </form>
          </>
        )}

        {session?.user && (
          <section className="mb-6 rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-indigo-900">📈 Le mie vendite</h2>
            <p className="mt-1 text-sm text-slate-600">Ordini che contengono i tuoi prodotti, quantità acquistate e stato del pagamento.</p>
            {caricamentoVendite ? <p className="mt-4 text-sm text-slate-500">Caricamento vendite…</p> : erroreVendite ? <p role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{erroreVendite}</p> : venditeRicevute.length === 0 ? <p className="mt-4 text-sm text-slate-500">Non risultano ordini registrati per i tuoi prodotti. Gli articoli segnati manualmente come venduti non sono ordini RiverSpend.</p> : (
              <div className="mt-4 space-y-3">
                {venditeRicevute.map((item, index) => <article key={item.id || String(item.order_id) + '-' + String(item.product_id) + '-' + index} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><p className="font-semibold">{item.product_name || 'Prodotto'}</p><p className="text-sm text-slate-600">Quantità: {Number(item.quantity || 0)} · € {Number(item.unit_price || 0).toFixed(2)} cad.</p><p className="text-sm font-bold text-slate-800">Totale riga: € {Number(item.subtotal ?? Number(item.unit_price || 0) * Number(item.quantity || 0)).toFixed(2)}</p></div><div className="text-sm sm:text-right"><p className="font-semibold">Ordine #{String(item.order_id).slice(0, 8)}</p><p className="text-slate-600">{item.order.created_at ? new Date(item.order.created_at).toLocaleDateString('it-IT') : 'Data non disponibile'}</p></div></div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">Ordine: {item.order.status || 'da verificare'}</span><span className={`rounded-full px-2 py-1 ${item.order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>Pagamento: {item.order.payment_status || 'da verificare'}</span></div>
                </article>)}
              </div>
            )}
            <button type="button" onClick={() => session?.user?.id && loadVenditeRicevute(session.user.id)} disabled={caricamentoVendite} className="mt-4 rounded-xl border border-indigo-700 px-4 py-2 text-sm font-bold text-indigo-800 disabled:opacity-50">Aggiorna vendite</button>
          </section>
        )}

        <section className="mb-8 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-bold text-cyan-800">RS Nova AI</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">RS Booster</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Prendi tu il controllo del tuo prodotto!</h2>
          <p className="mt-2 text-slate-700">Scegli tu come valorizzare la tua vendita: lascia prezzo e visibilità invariati, segui i consigli di RS Nova AI per rendere il prodotto più appetibile oppure attiva RS Booster per dare maggiore visibilità al tuo annuncio.</p>
          <p className="mt-3 font-semibold text-slate-900">Con RS Nova AI e RS Booster ti aiutiamo a raggiungere più acquirenti e a concludere la vendita!</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-cyan-200 bg-white p-3">
              <p className="font-bold text-cyan-800">✨ RS Nova AI · Consiglio prezzo</p>
              <p className="mt-1 text-sm text-slate-600">Suggerimenti per rendere l’offerta più interessante. Il prezzo lo decidi sempre tu.</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-white p-3">
              <p className="font-bold text-amber-800">🚀 RS Booster · Più visibilità</p>
              <p className="mt-1 text-sm text-slate-600">In futuro potrai scegliere la promozione locale, regionale, nazionale o internazionale.</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Le funzioni di suggerimento automatico e acquisto Booster sono in fase di attivazione. La maggiore visibilità non garantisce la vendita.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">
            Prodotti in vendita
          </h2>

          {prodotti.length === 0 ? (
            <p>Nessun prodotto disponibile.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {prodotti.map((prodotto) => (
                <article
                  key={prodotto.id}
                  className="bg-white rounded-2xl shadow overflow-hidden"
                >
                  {prodotto.immagini?.length > 0 && (
                    <img
                      src={prodotto.immagini[0]}
                      alt={prodotto.titolo}
                      className="w-full h-48 object-cover"
                    />
                  )}

                  <div className="p-4">
                    <h3 className="font-bold text-lg">
                      {prodotto.titolo}
                    </h3>

                    <p className="text-teal-700 text-xl font-bold mt-2">
                      € {Number(prodotto.prezzo).toFixed(2)}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      {prodotto.condizione}
                    </p>

                    <p className="text-slate-600 mt-2">
                      {prodotto.descrizione}
                    </p>

                    {prodotto.immagini?.length > 1 && (
                      <p className="text-sm text-slate-500 mt-2">
                        📸 {prodotto.immagini.length} foto
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
