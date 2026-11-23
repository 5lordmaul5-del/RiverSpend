const SOURCE_DOMAINS = {
  bbc: ['bbc.com', 'bbc.co.uk'],
  rai: ['rainews.it', 'rai.it'],
  mediaset: ['tgcom24.mediaset.it', 'mediaset.it'],
  nrk: ['nrk.no'],
  france24: ['france24.com'],
  dw: ['dw.com'],
  reuters: ['reuters.com'],
  ap: ['apnews.com'],
  aljazeera: ['aljazeera.com'],
  nhk: ['nhk.or.jp'],
  cbc: ['cbc.ca'],
  cnn: ['cnn.com'],
  guardian: ['theguardian.com'],
};

const COUNTRY_CODES = new Set(['it','no','gb','us','fr','de','es','pt','se','fi','nl','ch','pl','ua','ru','cn','jp','in','au','ca','br','za','eg','il']);

const TOPICS = {
  all: '(world OR international OR politics OR economy OR technology OR climate OR sports)',
  world: '(world OR international OR diplomacy OR conflict)',
  politics: '(politics OR election OR government OR parliament)',
  economy: '(economy OR business OR markets OR inflation)',
  technology: '(technology OR science OR artificial intelligence OR space)',
  sport: '(sports OR football OR tennis OR basketball)',
  environment: '(climate OR environment OR wildfire OR flood)',
  health: '(health OR medicine OR public health)',
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 120) : '';
  const topic = typeof req.query.topic === 'string' && TOPICS[req.query.topic] ? req.query.topic : 'all';
  const countryCode = typeof req.query.country === 'string' ? req.query.country.toLowerCase() : '';
  const sourceKey = typeof req.query.source === 'string' ? req.query.source.toLowerCase() : '';

  let search = q ? `"${q.replace(/["\\]/g, ' ').replace(/\s+/g, ' ')}"` : TOPICS[topic];
  if (countryCode && COUNTRY_NAMES[countryCode]) search += ` sourcecountry:${COUNTRY_NAMES[countryCode]}`;
  if (sourceKey && SOURCE_DOMAINS[sourceKey]) {
    const domains = SOURCE_DOMAINS[sourceKey];
    search += domains.length === 1
      ? ` domainis:${domains[0]}`
      : ` (${domains.map(domain => `domainis:${domain}`).join(' OR ')})`;
  }

  const endpoint = new URL('https://api.gdeltproject.org/api/v2/doc/doc');
  endpoint.searchParams.set('query', search);
  endpoint.searchParams.set('mode', 'ArtList');
  endpoint.searchParams.set('format', 'json');
  endpoint.searchParams.set('maxrecords', '50');
  endpoint.searchParams.set('timespan', '24h');
  endpoint.searchParams.set('sort', 'DateDesc');

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.setHeader('X-RiverWorld-Provider', 'GDELT DOC 2.0');

  try {
    const upstream = await fetch(endpoint.toString(), {
      headers: { Accept: 'application/json', 'User-Agent': 'RiverWorldLive/1.0 (news discovery)' },
    });
    const body = await upstream.text();
    if (!upstream.ok) {
      return res.status(upstream.status === 429 ? 503 : 502).json({
        error: upstream.status === 429
          ? 'La fonte globale sta limitando temporaneamente le richieste. Riprova tra poco.'
          : 'Il servizio di notizie non è momentaneamente disponibile.',
      });
    }

    let data;
    try { data = JSON.parse(body); } catch {
      return res.status(502).json({ error: 'Risposta non valida dal servizio di notizie.' });
    }

    const articles = Array.isArray(data.articles) ? data.articles : [];
    const normalized = articles.map(article => ({
      title: article.title || 'Titolo non disponibile',
      url: article.url || '',
      domain: article.domain || '',
      language: article.language || '',
      sourceCountry: article.sourcecountry || '',
      publishedAt: article.seendate || '',
      image: article.socialimage || '',
    })).filter(article => article.url && /^https?:\/\//i.test(article.url));

    return res.status(200).json({
      provider: 'GDELT Project',
      attribution: 'Dati di ricerca: The GDELT Project',
      updatedAt: new Date().toISOString(),
      count: normalized.length,
      articles: normalized,
    });
  } catch (error) {
    return res.status(502).json({ error: 'Impossibile raggiungere il servizio globale di notizie.' });
  }
}
