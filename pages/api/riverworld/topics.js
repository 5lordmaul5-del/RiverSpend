const TOPICS = {
  documentari: '(documentary OR documentaries OR ancient Egypt OR pharaohs OR pyramids OR archaeology OR ancient civilizations OR East Asia OR China history OR Japanese history OR Korean history OR India history OR African history OR Maya OR Aztec OR nature documentary OR science documentary OR space documentary)',
  scuola: '(education OR school OR learning OR mathematics OR geometry OR history OR geography OR science OR biology OR chemistry OR physics OR university OR education research)',
  cinema: '(film OR cinema OR movie OR movies OR actor OR actress OR director OR filmfestival OR boxoffice)',
  moda: '(fashion OR fashionweek OR runway OR designer OR couture OR streetwear OR beauty)',
  sport: '(sports OR football OR soccer OR basketball OR tennis OR formula1 OR motogp OR rugby OR olympics OR baseball OR softball OR swimming OR diving OR cycling OR mountainbike OR climbing OR athletics OR volleyball OR badminton OR gymnastics OR skiing OR rowing OR sailing)',
  'arti-marziali': '(taekwondo OR taekwon-do OR judo OR karate OR kickboxing OR muaythai OR muay-thai OR mixedmartialarts OR MMA OR sumo OR savate OR wrestling OR kungfu OR wushu OR aikido OR kendo OR samurai OR martialarts)',
  spettacolo: '(entertainment OR celebrity OR television OR tvshow OR music OR awards OR showbusiness)',
};
export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow','GET'); return res.status(405).json({error:'Method not allowed'}); }
  const section = typeof req.query.section === 'string' ? req.query.section.toLowerCase() : '';
  if (!TOPICS[section]) return res.status(400).json({error:'Sezione non valida.'});
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0,100) : '';
  const country = typeof req.query.country === 'string' ? req.query.country.toUpperCase() : '';
  const safeQuery = q.replace(/["\\]/g, ' ').replace(/\s+/g, ' ').trim();
  let query = q ? TOPICS[section] + ' "' + safeQuery + '"' : TOPICS[section];
  if (country && /^[A-Z]{2}$/.test(country)) query += ` sourcecountry:${country}`;
  const endpoint = new URL('https://api.gdeltproject.org/api/v2/doc/doc');
  endpoint.searchParams.set('query',query);
  endpoint.searchParams.set('mode','ArtList');
  endpoint.searchParams.set('format','json');
  endpoint.searchParams.set('maxrecords','40');
  endpoint.searchParams.set('timespan','7d');
  endpoint.searchParams.set('sort','DateDesc');
  res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=900');
  try {
    let response = await fetch(endpoint.toString(),{headers:{Accept:'application/json','User-Agent':'RiverWorldLive/1.0 (https://www.riverspend.com/)'}});
    let searchFallback = false;
    if (!response.ok && q) {
      endpoint.searchParams.set('query', TOPICS[section]);
      response = await fetch(endpoint.toString(),{headers:{Accept:'application/json','User-Agent':'RiverWorldLive/1.0 (https://www.riverspend.com/)'}});
      searchFallback = true;
    }
    if (!response.ok) return res.status(response.status===429?503:502).json({error:'Il servizio di ricerca è temporaneamente occupato.'});
    const data = await response.json();
    const articles = (Array.isArray(data.articles)?data.articles:[]).filter(a=>a.url && /^https?:\/\//i.test(a.url)).map(a=>({
      title:a.title || 'Titolo non disponibile',url:a.url,domain:a.domain || '',language:a.language || '',
      country:a.sourcecountry || '',publishedAt:a.seendate || '',image:a.socialimage || ''
    }));
    return res.status(200).json({section,provider:'GDELT Project',updatedAt:new Date().toISOString(),count:articles.length,searchFallback,articles});
  } catch { return res.status(502).json({error:'Ricerca non disponibile in questo momento.'}); }
}
