import { createClient } from '@supabase/supabase-js';

const ADULT_CATEGORIES = ['18🔞 ADULTI', '18🔞 Sex Toys'];
const SOLD_WINDOW_MS = 60 * 60 * 1000;
const PAGE_SIZE_DEFAULT = 12;
const PAGE_SIZE_MAX = 48;
const IDS_MAX = 100;

function isRecentlySold(product) {
  if (product.status !== 'sold') return product.status === 'published';
  const soldAt = product.sold_at ? new Date(product.sold_at).getTime() : NaN;
  return Number.isFinite(soldAt) && soldAt > Date.now() - SOLD_WINDOW_MS;
}

function isAdultProduct(product) {
  return ADULT_CATEGORIES.some((category) => category.toLowerCase() === String(product.category || '').trim().toLowerCase());
}

function mapProducts(products, media) {
  const mediaByProduct = new Map();
  for (const item of media || []) {
    if (!item.media_url) continue;
    const list = mediaByProduct.get(item.product_id) || [];
    list.push({ url: item.media_url, type: item.media_type || 'image', sortOrder: item.sort_order ?? 0 });
    mediaByProduct.set(item.product_id, list);
  }

  return (products || []).map((product) => {
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
}

export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Configurazione Supabase mancante.' });
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metodo non consentito.' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const mode = typeof req.query.mode === 'string' ? req.query.mode : 'legacy';
  const columns = 'id, name, description, price, condition, category, image, created_at, origin_country, seller_country, seller_type, locality, province, region, stock, variants, delivery_options, promo, homepage_expires_at, sponsored_until, sponsored_label, status, sold_at';

  try {
    if (mode === 'sold-ids') {
      const cutoff = new Date(Date.now() - SOLD_WINDOW_MS).toISOString();
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('status', 'sold')
        .gt('sold_at', cutoff);
      if (error) throw error;
      return res.status(200).json((data || []).map((item) => String(item.id)));
    }

    const soldCutoff = new Date(Date.now() - SOLD_WINDOW_MS).toISOString();
    let query = supabase
      .from('products')
      .select(columns)
      .in('status', ['published', 'sold'])
      .or(`status.eq.published,and(status.eq.sold,sold_at.gt.${soldCutoff})`)
      .order('created_at', { ascending: false });

    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const locality = typeof req.query.locality === 'string' ? req.query.locality.trim() : '';
    const province = typeof req.query.province === 'string' ? req.query.province.trim() : '';

    if (mode === 'single') {
      const id = typeof req.query.id === 'string' ? req.query.id.trim() : '';
      if (!id || id.length > 200) return res.status(400).json({ error: 'ID prodotto non valido.' });
      query = query.eq('id', id);
    } else if (mode === 'ids') {
      const rawIds = typeof req.query.ids === 'string' ? req.query.ids : '';
      const ids = [...new Set(rawIds.split(',').map((id) => id.trim()).filter(Boolean))];
      if (!ids.length) return res.status(200).json([]);
      if (ids.length > IDS_MAX || ids.some((id) => id.length > 200)) {
        return res.status(400).json({ error: 'Elenco ID non valido o troppo grande.' });
      }
      query = query.in('id', ids);
    } else if (mode === 'page') {
      const parsedLimit = Number.parseInt(String(req.query.limit || PAGE_SIZE_DEFAULT), 10);
      const parsedOffset = Number.parseInt(String(req.query.offset || '0'), 10);
      const limit = Number.isFinite(parsedLimit) ? Math.min(PAGE_SIZE_MAX, Math.max(1, parsedLimit)) : PAGE_SIZE_DEFAULT;
      const offset = Number.isFinite(parsedOffset) ? Math.max(0, parsedOffset) : 0;
      if (category) query = query.eq('category', category);
      if (locality) query = query.ilike('locality', '%' + locality.replace(/[%,]/g, '') + '%');
      if (province) query = query.ilike('province', '%' + province.replace(/[%,]/g, '') + '%');
      if (category && ADULT_CATEGORIES.some((item) => item.toLowerCase() === category.toLowerCase())) {
        query = query.eq('category', category);
      } else {
        query = query.not('category', 'in', '(' + ADULT_CATEGORIES.map((item) => '"' + item.replace(/"/g, '') + '"').join(',') + ')');
      }
      query = query.range(offset, offset + limit - 1);
    } else if (mode !== 'legacy') {
      return res.status(400).json({ error: 'Modalità di catalogo non riconosciuta.' });
    }

    const { data: rows, error: productsError } = await query;
    if (productsError) throw productsError;

    let products = rows || [];
    if (mode === 'legacy') {
      const requestedAdultCategory = ADULT_CATEGORIES.some((item) => item.toLowerCase() === category.toLowerCase());
      products = products.filter((product) => requestedAdultCategory
        ? isAdultProduct(product) && String(product.category || '').trim().toLowerCase() === category.toLowerCase()
        : !isAdultProduct(product));
      if (locality) products = products.filter((product) => (product.locality || '').toLocaleLowerCase('it').includes(locality.toLocaleLowerCase('it')));
      if (province) products = products.filter((product) => (product.province || '').toLocaleLowerCase('it').includes(province.toLocaleLowerCase('it')));
    }

    const ids = products.map((product) => product.id);
    let media = [];
    if (ids.length) {
      const { data, error: mediaError } = await supabase
        .from('product_media')
        .select('product_id, media_url, media_type, sort_order')
        .in('product_id', ids)
        .order('sort_order', { ascending: true });
      if (mediaError) {
        console.error('Products API: media secondari non disponibili, uso le immagini principali.', mediaError);
      } else {
        media = data || [];
      }
    }

    const mapped = mapProducts(products, media);
    if (mode === 'single') return res.status(200).json(mapped[0] || null);
    if (mode === 'page') {
      return res.status(200).json({
        items: mapped,
        limit: Math.min(PAGE_SIZE_MAX, Math.max(1, Number.parseInt(String(req.query.limit || PAGE_SIZE_DEFAULT), 10) || PAGE_SIZE_DEFAULT)),
        offset: Math.max(0, Number.parseInt(String(req.query.offset || '0'), 10) || 0),
        hasMore: mapped.length === Math.min(PAGE_SIZE_MAX, Math.max(1, Number.parseInt(String(req.query.limit || PAGE_SIZE_DEFAULT), 10) || PAGE_SIZE_DEFAULT))
      });
    }
    return res.status(200).json(mapped);
  } catch (error) {
    console.error('Products API:', error);
    return res.status(500).json({
      error: 'Errore nel caricamento dei prodotti.',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
