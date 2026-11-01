import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function bearerToken(req) {
  const value = req.headers.authorization || '';
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Metodo non consentito.' });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(503).json({ error: 'Servizio wallet non configurato sul server.' });
  }

  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: 'Autenticazione richiesta.' });

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) {
    return res.status(401).json({ error: 'Sessione RiverSpend non valida.' });
  }

  const { data, error } = await supabase
    .from('rs_wallets')
    .select('user_id,rivermoney,rsp,updated_at')
    .eq('user_id', authData.user.id)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: 'Impossibile leggere il wallet.' });
  }

  // No wallet row means "not yet initialized", not a fabricated balance.
  return res.status(200).json({
    ok: true,
    initialized: Boolean(data),
    wallet: data ? {
      rivermoney: String(data.rivermoney),
      rsp: String(data.rsp),
      updatedAt: data.updated_at
    } : null
  });
}
