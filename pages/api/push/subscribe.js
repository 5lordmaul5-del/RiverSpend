import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export default async function handler(req, res) {
  const supabase = getAdminClient();
  if (!supabase) return res.status(503).json({ error: 'Servizio notifiche non configurato.' });

  if (req.method === 'POST') {
    const subscription = req.body && req.body.subscription;
    const endpoint = subscription && subscription.endpoint;
    if (typeof endpoint !== 'string' || !endpoint.startsWith('https://') ||
        !subscription.keys || typeof subscription.keys.p256dh !== 'string' ||
        typeof subscription.keys.auth !== 'string') {
      return res.status(400).json({ error: 'Sottoscrizione non valida.' });
    }
    const { error } = await supabase.from('web_push_subscriptions').upsert({
      endpoint,
      subscription,
      updated_at: new Date().toISOString()
    }, { onConflict: 'endpoint' });
    if (error) return res.status(500).json({ error: 'Non è stato possibile salvare la sottoscrizione.' });
    return res.status(201).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const endpoint = req.body && req.body.endpoint;
    if (typeof endpoint !== 'string' || !endpoint.startsWith('https://')) {
      return res.status(400).json({ error: 'Endpoint non valido.' });
    }
    const { error } = await supabase.from('web_push_subscriptions').delete().eq('endpoint', endpoint);
    if (error) return res.status(500).json({ error: 'Non è stato possibile eliminare la sottoscrizione.' });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'POST, DELETE');
  return res.status(405).json({ error: 'Metodo non consentito' });
}
