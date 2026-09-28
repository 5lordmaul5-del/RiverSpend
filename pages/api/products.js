import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      error: 'Configurazione Supabase mancante.'
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Metodo non consentito.'
    });
  }

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        condition,
        image,
        created_at,
        product_media (
          media_url,
          media_type,
          sort_order
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase products GET:', error);
      return res.status(500).json({
        error: 'Errore nel caricamento dei prodotti.'
      });
    }

    const result = (products || []).map((product) => {
      const media = (product.product_media || [])
        .filter((item) => item.media_type === 'image')
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((item) => item.media_url)
        .filter(Boolean);

      const immagini = media.length
        ? media
        : product.image
          ? [product.image]
          : [];

      return {
        id: product.id,
        titolo: product.name,
        prezzo: Number(product.price || 0),
        condizione: product.condition || '',
        descrizione: product.description || '',
        immagini
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Products API:', error);
    return res.status(500).json({
      error: 'Errore interno nel caricamento dei prodotti.'
    });
  }
}
