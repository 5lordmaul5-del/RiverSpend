'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const MAX_PHOTOS = 20;
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;

export default function Vendi() {
  const [prodotti, setProdotti] = useState([]);
  const [titolo, setTitolo] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [condizione, setCondizione] = useState('Nuovo');

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

  function handlePhotos(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (!files.length) return;

    if (files.length > MAX_PHOTOS) {
      setMessaggio(`⚠️ Puoi selezionare al massimo ${MAX_PHOTOS} foto.`);
      return;
    }

    const nonValide = files.find((file) => {
      return (
        !file.type.startsWith('image/') ||
        file.size > MAX_PHOTO_SIZE
      );
    });

    if (nonValide) {
      setMessaggio('⚠️ Seleziona solo immagini fino a 10 MB ciascuna.');
      return;
    }

    setFoto(files.map((file) => ({
      file,
      url: URL.createObjectURL(file)
    })));

    setMessaggio(`📸 ${files.length} foto selezionate.`);
  }

  function removePhoto(index) {
    setFoto((current) => {
      const daRimuovere = current[index];
      if (daRimuovere?.url) URL.revokeObjectURL(daRimuovere.url);
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
      setMessaggio('⚠️ Inserisci almeno una foto.');
      return;
    }

    setCaricamento(true);
    setMessaggio('⏳ Caricamento foto e pubblicazione...');

    const productId = crypto.randomUUID();
    const percorsiCaricati = [];

    try {
      const immaginiCaricate = [];

      for (let i = 0; i < foto.length; i += 1) {
        const file = foto[i].file;
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
          description: descrizione.trim(),
          image: immaginiCaricate[0],
          seller_id: session.user.id,
          seller_type: 'Privato',
          status: 'published'
        });

      if (productError) throw productError;

      const righeMedia = immaginiCaricate.map((url, index) => ({
        product_id: productId,
        media_type: 'image',
        media_url: url,
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

      setProdotti((current) => [
        {
          id: productId,
          titolo: titolo.trim(),
          prezzo: prezzoNumero,
          condizione,
          descrizione: descrizione.trim(),
          immagini: immaginiCaricate
        },
        ...current
      ]);

      setTitolo('');
      setPrezzo('');
      setDescrizione('');
      setCondizione('Nuovo');

      foto.forEach((item) => URL.revokeObjectURL(item.url));
      setFoto([]);

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

              <label className="block font-bold mb-2">
                📸 Foto prodotto
              </label>

              <p className="text-sm text-slate-500 mb-2">
                Puoi selezionare fino a 20 foto (massimo 10 MB ciascuna).
              </p>

              <input
                className="w-full border rounded-xl p-3 mb-4"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotos}
              />

              {foto.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                  {foto.map((item, index) => (
                    <div
                      key={`${item.file.name}-${index}`}
                      className="relative overflow-hidden rounded-xl border"
                    >
                      <img
                        src={item.url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-28 object-cover"
                      />

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
