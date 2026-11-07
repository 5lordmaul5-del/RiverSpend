import { createClient } from '@supabase/supabase-js';

// Best-effort cache scoped to a warm serverless instance. It never invents
// products and is refreshed only after a complete successful catalog read.
let lastKnownGoodProducts = null;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metodo non consentito.' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (Array.isArray(lastKnownGoodProducts)) {
      res.setHeader('X-Catalog-Fallback', 'warm-instance-cache');
      return res.status(200).json(lastKnownGoodProducts);
    }
    return res.status(503).json({
      error: 'Catalogo temporaneamente non disponibile.',
      warning: 'Non è stato possibile collegarsi al catalogo. Riprova più tardi.',
      products: []
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Read products and media separately: product_media.product_id has no
    // declared foreign key to products, so PostgREST cannot reliably embed it.
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, description, price, condition, category, image, created_at, origin_country, seller_country, seller_type, locality, province, region, stock, variants, delivery_options, promo, homepage_expires_at, sponsored_until, sponsored_label, status, sold_at')
      .in('status', ['published', 'sold'])
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    const soldCutoff = Date.now() - 60 * 60 * 1000;
    const visibleProducts = (products || []).filter((product) => {
      if (product.status !== 'sold') return product.status === 'published';
      const soldAt = product.sold_at ? new Date(product.sold_at).getTime() : NaN;
      return Number.isFinite(soldAt) && soldAt > soldCutoff;
    });

    const locality = typeof req.query.locality === 'string' ? req.query.locality.trim() : '';
    const province = typeof req.query.province === 'string' ? req.query.province.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const categorie18 = ['18🔞 ADULTI', '18🔞 Sex Toys'];
    const richiesta18 = categorie18.some((cat) => cat.toLowerCase() === category.toLowerCase());
    let filteredProducts = visibleProducts.filter((p) => {
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
        // Keep the catalog visible with its primary product.image when
        // secondary media are unavailable.
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

    const responseProducts = filteredProducts.map((product) => {
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
        varianti: Array.isArray(product.variants) ? product.variants : [],
        modalitaConsegna: Array.isArray(product.delivery_options) ? product.delivery_options : ['home_delivery', 'seller_pickup', 'rs_local'],
        sponsorizzato: Boolean(product.promo) || Boolean(product.sponsored_until && new Date(product.sponsored_until) > new Date()),
        etichettaSponsorizzata: product.sponsored_label || null,
        scadenzaVetrina: product.homepage_expires_at || null,
        sponsorizzatoFino: product.sponsored_until || null,
        statoAnnuncio: product.status || 'published',
        venduto: product.status === 'sold',
        vendutoAlle: product.sold_at || null
      };
    });

    // Cache only a complete successful result, including the current filters.
    lastKnownGoodProducts = responseProducts;
    return res.status(200).json(responseProducts);
  } catch (error) {
    console.error('Products API:', error);

    if (Array.isArray(lastKnownGoodProducts)) {
      res.setHeader('X-Catalog-Fallback', 'warm-instance-cache');
      res.setHeader('Warning', '110 - "Catalogo temporaneamente servito dalla cache locale"');
      return res.status(200).json(lastKnownGoodProducts);
    }

    return res.status(503).json({
      error: 'Errore temporaneo nel caricamento dei prodotti.',
      warning: 'Il catalogo non è raggiungibile in questo momento. I prodotti non sono stati cancellati: riprova più tardi.',
      products: []
    });
  }
}
