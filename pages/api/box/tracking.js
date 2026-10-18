const TRACKING_URL_TEMPLATE = process.env.SPEEDITALIA_TRACKING_URL_TEMPLATE;
const API_TOKEN = process.env.SPEEDITALIA_API_TOKEN;

function extractTracking(data) {
  const source = data?.data ?? data?.shipment ?? data?.tracking ?? data;
  const status = source?.status ?? source?.tracking_status ?? source?.state ?? source?.message;
  const rawEvents = source?.events ?? source?.history ?? source?.checkpoints ?? [];
  const events = Array.isArray(rawEvents)
    ? rawEvents.slice(0, 30).map((event) => ({
        status: event?.status ?? event?.description ?? event?.message ?? 'Aggiornamento',
        date: event?.date ?? event?.datetime ?? event?.timestamp ?? null,
        location: event?.location ?? event?.city ?? null
      }))
    : [];
  return { status: typeof status === 'string' ? status : null, events };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Metodo non consentito.' });
  }

  const number = typeof req.query.number === 'string' ? req.query.number.trim() : '';
  if (!number || number.length > 120 || !/^[a-zA-Z0-9._/-]+$/.test(number)) {
    return res.status(400).json({ error: 'Inserisci un numero di tracking valido.' });
  }

  if (!TRACKING_URL_TEMPLATE) {
    return res.status(503).json({
      code: 'TRACKING_NOT_CONFIGURED',
      error: 'Tracking reale non ancora configurato: manca la URL API ufficiale del corriere in Vercel.'
    });
  }

  let target;
  try {
    target = new URL(TRACKING_URL_TEMPLATE.replace('{tracking}', encodeURIComponent(number)));
    if (target.protocol !== 'https:') throw new Error('HTTPS richiesto');
  } catch {
    return res.status(503).json({ error: 'Configurazione API tracking non valida. Verificare la URL ufficiale del corriere.' });
  }

  try {
    const headers = { Accept: 'application/json' };
    if (API_TOKEN) headers.Authorization = 'Bearer ' + API_TOKEN;
    const response = await fetch(target.toString(), { method: 'GET', headers, signal: AbortSignal.timeout(10000) });
    if (response.status === 404) return res.status(404).json({ error: 'Nessuna spedizione trovata con questo codice.' });
    if (!response.ok) {
      return res.status(502).json({ error: 'Il servizio del corriere non ha restituito una risposta valida. Riprova più tardi.' });
    }
    const data = await response.json();
    const tracking = extractTracking(data);
    if (!tracking.status && tracking.events.length === 0) {
      return res.status(502).json({ error: 'Risposta del corriere non riconosciuta. Serve adattare il formato alla documentazione ufficiale.' });
    }
    return res.status(200).json({ trackingNumber: number, ...tracking });
  } catch {
    return res.status(502).json({ error: 'Impossibile contattare il servizio tracking del corriere.' });
  }
}
