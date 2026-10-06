'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const MAX_PHOTOS = 20;
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

export default function Vendi() {
  const [prodotti, setProdotti] = useState([]);
  const [mieInserzioni, setMieInserzioni] = useState([]);
  const [aggiornamentoVendita, setAggiornamentoVendita] = useState('');
  const [titolo, setTitolo] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [condizione, setCondizione] = useState('Nuovo');
  const [categoria, setCategoria] = useState('Altro');
  const [sellerCountry, setSellerCountry] = useState('Italia');
  const [originCountry, setOriginCountry] = useState('');
  const [locality, setLocality] = useState('');
  const [province, setProvince] = useState('');
  const [region, setRegion] = useState('');

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

  useEffect(() => {
    if (session?.user?.id) loadMieInserzioni(session.user.id);
    else setMieInserzioni([]);
  }, [session?.user?.id]);

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

    const immagini = files.filter((file) => file.type.startsWith('image/'));
    const video = files.filter((file) => file.type.startsWith('video/'));

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
        uploadFile: file.type.startsWith('video/') ? file : null,
        processed: false,
        processing: file.type.startsWith('image/'),
        error: false
      };
    });

    setFoto((current) => [...current, ...elementi]);

    if (video.length && immagini.length) {
      setMessaggio('🎥 Video acquisito e 📷 foto ricevute. RiverSpend PhotoAI preparerà le foto; il video resterà originale.');
    } else if (video.length) {
      setMessaggio('🎥 Video acquisito. Controlla l’anteprima prima di pubblicare.');
    } else {
      setMessaggio('✨ RiverSpend PhotoAI sta preparando automaticamente le tue foto…');
    }

    const elementiImmagine = elementi.filter((item) => item.mediaType === 'image');
    if (!elementiImmagine.length) return;

    try {
      const { removeBackground } = await import('@bg0/browser');

      for (let index = 0; index < elementiImmagine.length; index += 1) {
        const item = elementiImmagine[index];
        try {
          const result = await removeBackground(item.file, {
            quality: 'fast',
            onProgress: ({ stage, progress, message }) => {
              const fase = stage === 'downloading' ? 'Download del modello (prima volta)' :
                stage === 'processing' ? 'Rimozione sfondo' :
                stage === 'finishing' ? 'Preparazione foto' :
                message || 'Avvio';
              setMessaggio(`✨ RiverSpend PhotoAI — foto ${index + 1}/${elementiImmagine.length}: ${fase} ${Number.isFinite(progress) ? Math.round(progress * 100) + '%' : ''}`);
            }
          });

          const cutout = await createImageBitmap(result.blob);
          const original = await createImageBitmap(item.file);
          const ratioOriginale = original.width / original.height;
          const ratioRisultato = cutout.width / cutout.height;

          if (Math.abs(ratioOriginale - ratioRisultato) / ratioOriginale > 0.02) {
            cutout.close();
            original.close();
            throw new Error('L’inquadratura elaborata non corrisponde all’originale.');
          }

          const boundsCanvas = document.createElement('canvas');
          boundsCanvas.width = cutout.width;
          boundsCanvas.height = cutout.height;
          const boundsCtx = boundsCanvas.getContext('2d', { willReadFrequently: true });
          boundsCtx.drawImage(cutout, 0, 0);
          const pixels = boundsCtx.getImageData(0, 0, cutout.width, cutout.height).data;
          let minX = cutout.width, minY = cutout.height, maxX = -1, maxY = -1;

          for (let y = 0; y < cutout.height; y += 2) {
            for (let x = 0; x < cutout.width; x += 2) {
              if (pixels[(y * cutout.width + x) * 4 + 3] > 24) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }

          const foundSubject = maxX >= minX && maxY >= minY;
          let sx = foundSubject ? minX : 0;
          let sy = foundSubject ? minY : 0;
          let sw = foundSubject ? maxX - minX + 1 : cutout.width;
          let sh = foundSubject ? maxY - minY + 1 : cutout.height;
          const padding = Math.round(Math.max(sw, sh) * 0.07);
          sx = Math.max(0, sx - padding);
          sy = Math.max(0, sy - padding);
          sw = Math.min(cutout.width - sx, sw + padding * 2);
          sh = Math.min(cutout.height - sy, sh + padding * 2);

          const canvas = document.createElement('canvas');
          canvas.width = 1200;
          canvas.height = 1200;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 1200, 1200);

          const scale = Math.min(936 / sw, 936 / sh);
          const width = sw * scale;
          const height = sh * scale;
          ctx.drawImage(cutout, sx, sy, sw, sh, (1200 - width) / 2, (1200 - height) / 2, width, height);

          cutout.close();
          original.close();

          const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
          if (!blob) throw new Error('Impossibile preparare la foto finale.');

          const processedFile = new File([blob], `riverspend-photoai-${index + 1}.jpg`, { type: 'image/jpeg' });
          const processedUrl = URL.createObjectURL(blob);

          setFoto((current) => current.map((photo) => photo.file === item.file
            ? { ...photo, url: processedUrl, processedUrl, uploadFile: processedFile, processed: true, processing: false, error: false }
            : photo));
        } catch (error) {
          console.error('RiverSpend PhotoAI:', error);
          setFoto((current) => current.map((photo) => photo.file === item.file
            ? { ...photo, uploadFile: photo.file, processing: false, error: true }
            : photo));
          setMessaggio(`⚠️ PhotoAI non ha elaborato la foto ${index + 1}. L’originale è conservato e potrai comunque pubblicarlo.`);
        }
      }
    } catch (error) {
      console.error('RiverSpend PhotoAI import:', error);
      setFoto((current) => current.map((photo) => photo.processing ? { ...photo, processing: false, uploadFile: photo.file, error: true } : photo));
      setMessaggio('⚠️ PhotoAI non è disponibile: le foto originali restano utilizzabili.');
    }

    setFoto((current) => current.map((photo) => photo.processing
      ? { ...photo, processing: false, uploadFile: photo.uploadFile || photo.file }
      : photo));
    setMessaggio('Elaborazione terminata. Controlla foto e video prima di pubblicare.');
  }

  function ripristinaFotoPrincipale() {
    setFoto((current) => current.map((p, i) => i === 0
      ? { ...p, uploadFile: p.file, url: p.originalUrl, processed: false, error: false }
      : p));
    setMessaggio('Foto originale ripristinata.');
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

    if (foto.length === 0) {
      setMessaggio('⚠️ Inserisci almeno una foto o un video.');
      return;
    }

    if (foto.some((item) => item.processing)) {
      setMessaggio('⚠️ Attendi che PhotoAI termini prima di pubblicare.');
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
              <p className="mt-1 text-sm text-slate-600">Quando concludi una vendita fuori dal checkout RiverSpend, segna qui l’annuncio come venduto: verrà tolto dagli annunci disponibili in Shop e Local e resterà nel tuo elenco.</p>
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
                        <button type="button" onClick={() => segnaComeVenduto(item)} disabled={Boolean(aggiornamentoVendita)} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                          {aggiornamentoVendita === item.id ? 'Aggiorno…' : 'Segna come venduto'}
                        </button>
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
                {["Auto","Moto","Scooter","Harley & Custom","Camion & Veicoli commerciali","Trattori & Agricoltura","Edilizia & Macchine da lavoro","Ricambi & Accessori auto","Ricambi & Accessori moto","Nautica","Navale","Barche & Gommoni","Motori marini","Aeronautica","Militaria & Storia","Sport","Arti marziali & Combattimento","Fitness & Palestra","Outdoor & Avventura","Pesca","Caccia & Accessori consentiti","Integratori","Elettronica & Informatica","Smartphone & Telefonia","Computer & Notebook","Gaming","Console & Videogiochi","Fotografia & Video","Musica & Audio","TV & Home cinema","Abbigliamento","Scarpe","Borse & Accessori","Gioielli & Orologi","Bellezza & Cura personale","18🔞 ADULTI","18🔞 Sex Toys","Casa & Arredamento","Cucina","Elettrodomestici","Fai da te & Ferramenta","Giardino","Illuminazione","Tessile casa","Animali","Bambini & Giocattoli","Prima infanzia","Libri & Cultura","Arte","Antiquariato","Collezionismo","Hobby & Modellismo","Viaggi & Valigeria","Ufficio & Professionale","Industria","Attrezzature professionali","Energia & Smart Home","Servizi digitali","Gadget & Regali","Vintage & Second hand","Altro"].map((item) => <option key={item}>{item}</option>)}
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
                      <span className="block text-center text-xs py-1">{item.mediaType === 'video' ? '🎥 Video originale' : item.processing ? 'Elaborazione…' : item.processed ? '✓ Sfondo rimosso' : item.error ? 'Originale · PhotoAI non riuscita' : 'Originale'}</span>
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

              <textarea
                className="w-full border rounded-xl p-3 mb-4"
                rows="4"
                placeholder="Descrizione prodotto"
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
              />

              <button
                type="submit"
                disabled={caricamento}
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
