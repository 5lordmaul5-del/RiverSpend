import { useEffect, useMemo, useState } from 'react';
import { riverSpendCategorySections } from '../lib/riverSpendCategories';

const IMAGES = [
  { match: ['ALIMENTARI','DISPENSA','FRESCHI','CIBI DAL MONDO','SAPORI REGIONALI','SPECIALITÀ REGIONALI','GASTRONOMICHE','BEVANDE'], url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85' },
  { match: ['VINI','BIRRE','HOMEBREWING','VINO','BIRRA','SPUMANTI'], url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=85' },
  { match: ['DONNA','RAGAZZE','UOMO','RAGAZZI','BAMBINI','ABBIGLIAMENTO','SCARPE'], url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85' },
  { match: ['TECNOLOGIA','ELETTRONICA','SMARTPHONE','COMPUTER','GAMING'], url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=85' },
  { match: ['CASA','ARREDAMENTO','CUCINA','GIARDINO'], url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85' },
  { match: ['AUTO','VEICOLI','NAUTICA','TRASPORTI'], url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=85' },
  { match: ['ANIMALI','CANI','GATTI'], url: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=85' },
  { match: ['SPORT','BENESSERE','FITNESS'], url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85' },
  { match: ['CULTURA','LIBRI','COLLEZIONISMO','STRANEZZE','CURIOSITÀ','INVENZIONI','ALTRO'], url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=85' },
  { match: ['GIOCHI','TEMPO LIBERO','GADGET'], url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=85' },
  { match: ['LAVORO','IMPRESA','UFFICIO'], url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85' }
];

const PLACE_IMAGES = [
  // Regioni italiane: immagini dedicate alle categorie regionali.
  { match: ['PIEMONTESI', 'PIEMONTE', 'TORINO', 'MOLE ANTONELLIANA'], url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Torino%20Mole%20Antonelliana.jpg?width=900' },
  { match: ['VALDOSTANI', 'VALLE D’AOSTA', 'VALLE D AOSTA', 'AOSTA'], url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=85' },
  { match: ['LOMBARDI', 'LOMBARDIA', 'MILANO', 'DUOMO DI MILANO'], url: 'https://images.unsplash.com/photo-1579926626628-2e6c8f2b7f8a?auto=format&fit=crop&w=900&q=85' },
  { match: ['LIGURI', 'LIGURIA', 'CINQUE TERRE', 'GENOVA'], url: 'https://images.unsplash.com/photo-1498307833015-e7b400441eb8?auto=format&fit=crop&w=900&q=85' },
  { match: ['VENETI', 'VENETO', 'VENEZIA'], url: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=900&q=85' },
  { match: ['TRENTINI', 'TRENTINO', 'TRENTINO-ALTO ADIGE', 'DOLOMITI'], url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=85' },
  { match: ['ALTOATESINI', 'ALTO ADIGE', 'SUDTIROLO', 'BOLZANO'], url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85' },
  { match: ['FRIULANI', 'FRIULI', 'FRIULI-VENEZIA GIULIA', 'TRIESTE'], url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=85' },
  { match: ['EMILIANI', 'EMILIA', 'BOLOGNA'], url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=85' },
  { match: ['ROMAGNOLI', 'ROMAGNA', 'RIMINI'], url: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=85' },
  { match: ['TOSCANI', 'TOSCANA', 'FIRENZE', 'FLORENCE'], url: 'https://images.unsplash.com/photo-1515859005217-8a1f08870f59?auto=format&fit=crop&w=900&q=85' },
  { match: ['UMBRI', 'UMBRIA', 'ASSISI'], url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=85' },
  { match: ['MARCHIGIANI', 'MARCHE', 'URBINO'], url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85' },
  { match: ['LAZIALI', 'LAZIO', 'ROMA', 'COLOSSEO'], url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=85' },
  { match: ['ABRUZZESI', 'ABRUZZO', 'GRAN SASSO'], url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85' },
  { match: ['MOLISANI', 'MOLISE'], url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=85' },
  { match: ['CAMPANI', 'CAMPANIA', 'NAPOLI', 'NAPLES'], url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=85' },
  { match: ['PUGLIESI', 'PUGLIA', 'ALBEROBELLO', 'TRULLI'], url: 'https://images.unsplash.com/photo-1602088113235-229c19758e9f?auto=format&fit=crop&w=900&q=85' },
  { match: ['LUCANI', 'BASILICATA', 'MATERA'], url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=85' },
  { match: ['CALABRESI', 'CALABRIA'], url: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=85' },
  { match: ['SICILIANI', 'SICILIA', 'PALERMO', 'ETNA'], url: 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?auto=format&fit=crop&w=900&q=85' },
  { match: ['SARDI', 'SARDEGNA', 'COSTA SMERALDA'], url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=85' },
  // Paesi e cucine del mondo: in seguito potremo perfezionare ogni foto con immagini verificate.
  { match: ['INDIANA', 'INDIANI', 'INDIA', 'CUCINA INDIANA'], url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=85' },
  { match: ['CINESE', 'CINA', 'CUCINA CINESE'], url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=900&q=85' },
  { match: ['GIAPPONESE', 'GIAPPONE', 'CUCINA GIAPPONESE'], url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=85' },
  { match: ['COREANA', 'COREANI', 'COREA', 'CUCINA COREANA'], url: 'https://images.unsplash.com/photo-1498654896293-37a043fdc3b2?auto=format&fit=crop&w=900&q=85' },
  { match: ['ARABA', 'ARABI', 'MEDIORIENTALE', 'TURCHI', 'TURCHIA'], url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=900&q=85' },
  { match: ['AMERICANI', 'AMERICANE', 'STATI UNITI', 'USA', 'CUCINA AMERICANA'], url: 'https://images.unsplash.com/photo-1508697014387-db70aad34f4d?auto=format&fit=crop&w=900&q=85' },
  { match: ['MESSICANA', 'MESSICANI', 'MESSICO'], url: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=85' },
  { match: ['FRANCESI', 'FRANCIA', 'FRANCESE', 'PARIGI'], url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=85' },
  { match: ['SPAGNOLI', 'SPAGNA', 'SPAGNOLO'], url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=85' },
  { match: ['GRECI', 'GRECIA', 'GRECA'], url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=85' },
  { match: ['AFRICANI', 'AFRICANA', 'AFRICA'], url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=85' },
  { match: ['BRASILIANI', 'BRASILE', 'BRASILIANA'], url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=900&q=85' },
  { match: ['AUSTRALIANI', 'AUSTRALIA', 'SYDNEY'], url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=900&q=85' }
];

function imageFor(label) {
  const text = String(label || '').toLocaleUpperCase('it');
  return PLACE_IMAGES.find((item) => item.match.some((word) => text.includes(word)))?.url
    || IMAGES.find((item) => item.match.some((word) => text.includes(word)))?.url
    || IMAGES[0].url;
}

export default function CategoriePage() {
  const [sectionName, setSectionName] = useState('');
  const sections = useMemo(() => riverSpendCategorySections, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      setSectionName(params.get('section') || '');
    } catch {}
  }, []);

  const selected = sections.find(([name]) => name === sectionName);
  const visibleSections = selected ? [selected] : sections;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 px-4 py-7 text-white">
        <div className="mx-auto max-w-6xl">
          <a href="/" className="text-sm font-semibold text-teal-200 hover:text-white">← Torna a RiverSpendShop</a>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-amber-300">YOUR SHOP • YOUR FLOW</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">{selected ? selected[0] : 'Esplora tutte le categorie'}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-teal-50 sm:text-base">Entra nella categoria, scopri le sottocategorie illustrate e trova i prodotti pubblicati su RiverSpendShop.</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-7 px-4 py-6">
        <section className="overflow-hidden rounded-3xl border border-amber-300 bg-white shadow-sm">
          <div className="grid md:grid-cols-[1.2fr_1fr]">
            <div className="p-5 sm:p-7">
              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-900">RS Spons · Spazio aziende</span>
              <h2 className="mt-3 text-2xl font-black sm:text-3xl">Il tuo marchio in evidenza.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Un’azienda può richiedere uno spazio sponsorizzato nella categoria giusta: per esempio Levi’s nell’abbigliamento. Dopo l’accordo, la verifica dei diritti del marchio e l’attivazione del servizio pubblicitario, RiverSpend potrà pubblicare la campagna.</p>
              <a href="/rs-spons" className="mt-4 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white hover:bg-teal-800">Scopri RS Spons →</a>
              <p className="mt-2 text-xs text-slate-500">Gli spazi mostrati qui sono promozionali dimostrativi: la prenotazione e il pagamento pubblicitario non sono ancora automatizzati.</p>
            </div>
            <div className="relative min-h-[190px] bg-slate-100">
              <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85" alt="Abbigliamento in una vetrina moderna" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Esempio di campagna</p>
                <p className="text-xl font-black">Brand in vetrina</p>
              </div>
            </div>
          </div>
        </section>

        {selected && (
          <a href="/categorie" className="inline-flex rounded-xl border border-teal-200 bg-white px-4 py-2 text-sm font-bold text-teal-800 hover:bg-teal-50">← Tutte le categorie</a>
        )}

        {visibleSections.map(([name, items]) => (
          <section key={name} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid sm:grid-cols-[220px_1fr]">
              <div className="relative min-h-[150px] bg-slate-200 sm:min-h-full">
                <img src={imageFor(name)} alt={name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 to-transparent" />
                <h2 className="absolute bottom-4 left-4 right-4 text-xl font-black text-white">{name}</h2>
              </div>
              <div className="p-3 sm:p-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {items.map((item) => (
                    <a key={item} href={`/?category=${encodeURIComponent(item)}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md">
                      <div className="relative h-24 overflow-hidden bg-slate-200 sm:h-28">
                        <img src={imageFor(item)} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                        <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-transparent" />
                      </div>
                      <div className="flex min-h-[62px] items-center justify-between gap-2 p-3">
                        <span className="text-xs font-bold leading-4 text-slate-800 sm:text-sm">{item}</span>
                        <span className="shrink-0 text-teal-700" aria-hidden="true">↗</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}

        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
          <strong>Vuoi promuovere un marchio o un prodotto?</strong> RS Spons è il canale previsto per richiedere visibilità. La pubblicazione di campagne reali sarà attivata solo dopo aver configurato e verificato il relativo processo commerciale.
        </div>
      </div>
    </main>
  );
}
