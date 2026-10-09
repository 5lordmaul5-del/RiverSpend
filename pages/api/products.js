import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Configurazione Supabase mancante.' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metodo non consentito.' });
  }

  try {
    // Read products and media separately: product_media.product_id has no
    // declared foreign key to products, so PostgREST cannot reliably embed it.
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, description, price, condition, category, image, created_at, origin_country, seller_country, seller_type, locality, province, region, stock, promo, homepage_expires_at, sponsored_until, sponsored_label')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    const locality = typeof req.query.locality === 'string' ? req.query.locality.trim() : '';
    const province = typeof req.query.province === 'string' ? req.query.province.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const categorie18 = ['18🔞 ADULTI', '18🔞 Sex Toys'];
    const richiesta18 = categorie18.some((cat) => cat.toLowerCase() === category.toLowerCase());
    let filteredProducts = (products || []).filter((p) => {
      const prodotto18 = categorie18.some((cat) => cat.toLowerCase() === String(p.category || '').trim().toLowerCase());
      // Gli annunci 18+ non vengono mai restituiti al catalogo generale.
      // Sono restituiti solo quando viene richiesta esplicitamente una categoria 18+.
      return richiesta18 ? prodotto18 && String(p.category || '').trim().toLowerCase() === category.toLowerCase() : !prodotto18;
    });
    if (locality) filteredProducts = filteredProducts.filter((p) => (p.locality || '').toLocaleLowerCase('it').includes(locality.toLocaleLowerCase('it')));
    if (province) filteredProducts = filteredProducts.filter((p) => (p.province || '').toLocaleLowerCase('it').includes(province.toLocaleLowerCase('it')));

    const ids = filteredProducts.map((product) => product.id);
    let media = [];

    if (ids.length) {
      const { data, error: mediaError } = await supabase
        .from('product_media')
        .select('product_id, media_url, media_type, sort_order')
        .in('product_id', ids)
        .order('sort_order', { ascending: true });

      if (mediaError) {
        // Il catalogo deve restare visibile anche se product_media non è
        // disponibile temporaneamente o la tabella non è ancora configurata.
        // In quel caso usiamo il campo products.image come fallback.
        console.error('Products API: media secondari non disponibili, uso le immagini principali.', mediaError);
        media = [];
      } else {
        media = data || [];
      }
    }

    const mediaByProduct = new Map();
    for (const item of media) {
      if (!item.media_url) continue;
      const list = mediaByProduct.get(item.product_id) || [];
      list.push({ url: item.media_url, type: item.media_type || 'image', sortOrder: item.sort_order ?? 0 });
      mediaByProduct.set(item.product_id, list);
    }

    return res.status(200).json(filteredProducts.map((product) => {
      const productMedia = mediaByProduct.get(product.id) || [];
      const immagini = productMedia.filter((item) => item.type === 'image').map((item) => item.url);
      if (!immagini.length && product.image) immagini.push(product.image);

      return {
        id: product.id,
        titolo: product.name,
        prezzo: Number(product.price || 0),
        condizione: product.condition || '',
        categoria: product.category || '',
        descrizione: product.description || '',
        immagini,
        media: productMedia.map((item) => ({ url: item.url, type: item.type })),
        paeseOrigine: product.origin_country || '',
        paeseVenditore: product.seller_country || '',
        localita: product.locality || '',
        provincia: product.province || '',
        regione: product.region || '',
        venditoreTipo: product.seller_type || 'Privato',
        quantita: Number.isInteger(product.stock) ? product.stock : 1,
        sponsorizzato: Boolean(product.promo) || Boolean(product.sponsored_until && new Date(product.sponsored_until) > new Date()),
        etichettaSponsorizzata: product.sponsored_label || null,
        scadenzaVetrina: product.homepage_expires_at || null,
        sponsorizzatoFino: product.sponsored_until || null
      };
    }));
  } catch (error) {
    console.error('Products API:', error);
    return res.status(500).json({
      error: 'Errore nel caricamento dei prodotti.',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
