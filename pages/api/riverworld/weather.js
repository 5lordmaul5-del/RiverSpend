export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const place = typeof req.query.place === 'string' ? req.query.place.trim().slice(0, 100) : '';
  if (!place) return res.status(400).json({ error: 'Inserisci una città o una località.' });

  try {
    const geoUrl = new URL('https://nominatim.openstreetmap.org/search');
    geoUrl.searchParams.set('q', place);
    geoUrl.searchParams.set('format', 'jsonv2');
    geoUrl.searchParams.set('limit', '1');
    const geoResponse = await fetch(geoUrl.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'RiverWorldLive/1.0 (https://www.riverspend.com/)',
        Referer: 'https://www.riverspend.com/',
      },
    });
    if (!geoResponse.ok) throw new Error('Servizio di ricerca località non disponibile.');
    const locations = await geoResponse.json();
    if (!Array.isArray(locations) || !locations.length) {
      return res.status(404).json({ error: 'Località non trovata. Prova con città e Paese.' });
    }
    const location = locations[0];
    const lat = Number(Number(location.lat).toFixed(4));
    const lon = Number(Number(location.lon).toFixed(4));
    const weatherUrl = new URL('https://api.met.no/weatherapi/locationforecast/2.0/compact');
    weatherUrl.searchParams.set('lat', String(lat));
    weatherUrl.searchParams.set('lon', String(lon));
    const weatherResponse = await fetch(weatherUrl.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'RiverWorldLive/1.0 (https://www.riverspend.com/)',
      },
    });
    if (!weatherResponse.ok) throw new Error('Servizio meteo non disponibile in questo momento.');
    const weather = await weatherResponse.json();
    const series = weather.properties?.timeseries || [];
    const current = series[0];
    if (!current) throw new Error('Previsioni non disponibili per questa località.');
    const nextHours = series.slice(0, 25).map(item => ({
      time: item.time,
      temperature: item.data?.instant?.details?.air_temperature ?? null,
      precipitation: item.data?.next_1_hours?.details?.precipitation_amount ?? item.data?.next_6_hours?.details?.precipitation_amount ?? null,
      symbol: item.data?.next_1_hours?.summary?.symbol_code || item.data?.next_6_hours?.summary?.symbol_code || item.data?.next_12_hours?.summary?.symbol_code || null,
    }));
    const details = current.data?.instant?.details || {};
    return res.status(200).json({
      location: {
        name: location.name || place,
        displayName: location.display_name || place,
        latitude: lat,
        longitude: lon,
      },
      current: {
        time: current.time,
        temperature: details.air_temperature ?? null,
        feelsLike: details.wind_speed ?? null,
        humidity: details.relative_humidity ?? null,
        wind: details.wind_speed ?? null,
        windDirection: details.wind_from_direction ?? null,
        pressure: details.air_pressure_at_sea_level ?? null,
        cloud: details.cloud_area_fraction ?? null,
        symbol: current.data?.next_1_hours?.summary?.symbol_code || current.data?.next_6_hours?.summary?.symbol_code || current.data?.next_12_hours?.summary?.symbol_code || null,
        precipitation: current.data?.next_1_hours?.details?.precipitation_amount ?? null,
      },
      hourly: nextHours,
      updatedAt: new Date().toISOString(),
      source: 'MET Norway Locationforecast 2.0',
      attribution: 'Dati meteorologici MET Norway, licenza CC BY 4.0. Geocodifica © OpenStreetMap contributors.',
    });
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Errore nel caricamento del meteo.' });
  }
}
