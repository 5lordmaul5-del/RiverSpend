import { createClient } from '@supabase/supabase-js';

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Metodo non consentito.' });
  }

  const apiKey = process.env.REMOVEBG_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Servizio foto non ancora configurato su Vercel.' });
  }

  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Accedi per elaborare le foto.' });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !anonKey) return res.status(503).json({ error: 'Configurazione Supabase mancante.' });

    const authClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: userData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !userData?.user) return res.status(401).json({ error: 'Sessione non valida. Accedi di nuovo.' });

    const dataUrl = req.body?.image;
    const match = typeof dataUrl === 'string' && dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) return res.status(400).json({ error: 'Formato immagine non valido.' });

    const input = Buffer.from(match[2], 'base64');
    if (!input.length || input.length > 10 * 1024 * 1024) {
      return res.status(413).json({ error: 'La foto deve essere inferiore a 10 MB.' });
    }

    const form = new FormData();
    form.append('image_file', new Blob([input], { type: match[1] }), 'riverspend-upload');
    form.append('size', 'auto');
    form.append('format', 'png');
    form.append('type', 'product');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: form
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('remove.bg error:', response.status, detail.slice(0, 500));
      return res.status(response.status === 402 ? 402 : 502).json({
        error: response.status === 402
          ? 'Crediti foto esauriti: controlla il piano remove.bg.'
          : 'Il servizio non è riuscito a rimuovere lo sfondo. Riprova con un’altra foto.'
      });
    }

    const output = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(output);
  } catch (error) {
    console.error('Rimozione sfondo:', error);
    return res.status(500).json({ error: 'Errore durante l’elaborazione della foto.' });
  }
}
