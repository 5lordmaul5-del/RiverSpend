'use client';

import { useEffect, useState } from 'react';

const MAX_PHOTOS = 20;

export default function Vendi() {
  const [prodotti, setProdotti] = useState([]);
  const [titolo, setTitolo] = useState('');
  const [prezzo, setPrezzo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [condizione, setCondizione] = useState('Nuovo');

  const [immagini, setImmagini] = useState([]);
  const [caricamento, setCaricamento] = useState(false);
  const [messaggio, setMessaggio] = useState('');

  async function loadProducts() {
    try {
      const res = await fetch('/api/products', {
        cache: 'no-store'
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setProdotti(data);
      }
    } catch (error) {
      console.error(error);
      setMessaggio('❌ Errore caricamento prodotti');
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handlePhotos(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    if (files.length > MAX_PHOTOS) {
      setMessaggio(`⚠️ Massimo ${MAX_PHOTOS} foto per prodotto.`);
    }

    const selectedFiles = files.slice(0, MAX_PHOTOS);

    const readers = selectedFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;

        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then((results) => {
        setImmagini(results);
        setMessaggio(`📸 ${results.length} foto selezionate.`);
      })
      .catch((error) => {
        console.error(error);
        setMessaggio('❌ Errore lettura foto.');
      });

    event.target.value = '';
  }

  function removePhoto(index) {
    setImmagini((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!titolo.trim() || !prezzo) {
      setMessaggio('⚠️ Inserisci nome e prezzo.');
      return;
    }

    if (immagini.length === 0) {
      setMessaggio('⚠️ Inserisci almeno una foto.');
      return;
    }

    setCaricamento(true);
    setMessaggio('⏳ Pubblicazione prodotto...');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titolo: titolo.trim(),
          prezzo: Number(prezzo),
          descrizione,
          condizione,
          immagini
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || 'Errore pubblicazione prodotto'
        );
      }

      setProdotti((current) => [
        data,
        ...current
      ]);

      setTitolo('');
      setPrezzo('');
      setDescrizione('');
      setCondizione('Nuovo');
      setImmagini([]);

      setMessaggio(
        '✅ Prodotto pubblicato nel RiverSpendShop!'
      );

    } catch (error) {
      console.error(error);

      setMessaggio(
        '❌ ' + error.message
      );
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
            onChange={(e) =>
              setTitolo(e.target.value)
            }
          />

          <input
            className="w-full border rounded-xl p-3 mb-3"
            type="number"
            step="0.01"
            placeholder="Prezzo €"
            value={prezzo}
            onChange={(e) =>
              setPrezzo(e.target.value)
            }
          />

          <select
            className="w-full border rounded-xl p-3 mb-3"
            value={condizione}
            onChange={(e) =>
              setCondizione(e.target.value)
            }
          >
            <option>Nuovo</option>
            <option>Usato</option>
            <option>Come nuovo</option>
          </select>

          <label className="block font-bold mb-2">
            📸 Foto prodotto
          </label>

          <p className="text-sm text-slate-500 mb-2">
            Puoi selezionare fino a 20 foto.
          </p>

          <input
            className="w-full border rounded-xl p-3 mb-4"
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotos}
          />

          {immagini.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">

              {immagini.map((image, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-xl border"
                >

                  <img
                    src={image}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-28 object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removePhoto(index)
                    }
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
            onChange={(e) =>
              setDescrizione(e.target.value)
            }
          />

          <button
            type="submit"
            disabled={caricamento}
            className="w-full bg-teal-600 text-white font-bold rounded-xl p-3 disabled:opacity-50"
          >
            {caricamento
              ? '⏳ Pubblicazione...'
              : '🚀 PUBBLICA PRODOTTO'}
          </button>

          {messaggio && (
            <p className="mt-4 font-semibold">
              {messaggio}
            </p>
          )}

        </form>

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
