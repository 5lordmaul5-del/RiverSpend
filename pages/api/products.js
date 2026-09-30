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
      .select('id, name, description, price, condition, image, seller_id, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    const ids = (products || []).map((product) => product.id);
    let media = [];

    if (ids.length) {
      const { data, error: mediaError } = await supabase
        .from('product_media')
        .select('product_id, media_url, media_type, sort_order')
        .in('product_id', ids)
        .in('media_type', ['image', 'video'])
        .order('sort_order', { ascending: true });

      if (mediaError) throw mediaError;
      media = data || [];
    }

    const mediaByProduct = new Map();
    for (const item of media) {
      if (!item.media_url) continue;
      const list = mediaByProduct.get(item.product_id) || [];
      list.push({ url: item.media_url, type: item.media_type });
      mediaByProduct.set(item.product_id, list);
    }

    return res.status(200).json((products || []).map((product) => {
      const productMedia = mediaByProduct.get(product.id) || [];
      const immagini = productMedia.filter((item) => item.type === 'image').map((item) => item.url);
      const video = productMedia.filter((item) => item.type === 'video').map((item) => item.url);
      if (!immagini.length && product.image) immagini.push(product.image);

      return {
        id: product.id,
        titolo: product.name,
        prezzo: Number(product.price || 0),
        condizione: product.condition || '',
        descrizione: product.description || '',
        immagini,
        video,
        seller_id: product.seller_id
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
