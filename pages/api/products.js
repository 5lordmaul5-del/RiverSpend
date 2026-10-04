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
      .select('id, name, description, price, condition, category, image, created_at, seller_type, stock, status, homepage_expires_at, sponsored_until, sponsored_label')
      .eq('status', 'published')
      .gt('stock', 0)
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    const ids = (products || []).map((product) => product.id);
    let media = [];

    if (ids.length) {
      const { data, error: mediaError } = await supabase
        .from('product_media')
        .select('product_id, media_url, media_type, sort_order')
        .in('product_id', ids)
        .eq('media_type', 'image')
        .order('sort_order', { ascending: true });

      if (mediaError) throw mediaError;
      media = data || [];
    }

    const mediaByProduct = new Map();
    for (const item of media) {
      if (!item.media_url) continue;
      const list = mediaByProduct.get(item.product_id) || [];
      list.push(item.media_url);
      mediaByProduct.set(item.product_id, list);
    }

    return res.status(200).json((products || []).map((product) => {
      const mediaImages = mediaByProduct.get(product.id) || [];
      const immagini = mediaImages.length
        ? mediaImages
        : product.image
          ? [product.image]
          : [];

      return {
        id: product.id,
        venditoreTipo: product.seller_type || 'Privato',
        disponibilita: Number(product.stock ?? 1),
        scadenzaVetrina: product.homepage_expires_at || null,
        sponsorizzatoFino: product.sponsored_until || null,
        etichettaSponsorizzata: product.sponsored_label || null,
        titolo: product.name,
        prezzo: Number(product.price || 0),
        condizione: product.condition || '',
        categoria: product.category || '',
        descrizione: product.description || '',
        immagini
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
