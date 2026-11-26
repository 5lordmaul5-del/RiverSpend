export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson', {
      headers: { Accept: 'application/geo+json' },
    });
    if (!response.ok) throw new Error('Feed sismico temporaneamente non disponibile.');
    const feed = await response.json();
    const events = (feed.features || []).map(item => {
      const p = item.properties || {};
      const coordinates = item.geometry?.coordinates || [];
      return {
        id: item.id,
        title: p.title || 'Evento sismico',
        magnitude: p.mag,
        place: p.place || 'Località non disponibile',
        time: p.time,
        url: p.url,
        tsunami: p.tsunami === 1,
        coordinates: coordinates.length >= 2 ? { longitude: coordinates[0], latitude: coordinates[1], depthKm: coordinates[2] } : null,
      };
    });
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      source: 'USGS Earthquake Hazards Program',
      updatedAt: new Date().toISOString(),
      events,
      note: 'Feed degli eventi sismici significativi nelle ultime 24 ore; non è un servizio completo di protezione civile né un sistema di allarme personale.',
    });
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Errore nel caricamento degli eventi sismici.' });
  }
}
