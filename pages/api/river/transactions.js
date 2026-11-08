import { createClient } from '@supabase/supabase-js';
import { applyRiverCors } from '../../../lib/river-money/cors';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function bearerToken(req) {
  const value = req.headers.authorization || '';
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

function decodeCursor(value) {
  if (!value) return null;
  try {
    const decoded = Buffer.from(value, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded);
    if (!parsed || typeof parsed.createdAt !== 'string' || Number.isNaN(Date.parse(parsed.createdAt))) return null;
    return parsed.createdAt;
  } catch {
    return null;
  }
}

function encodeCursor(createdAt) {
  return Buffer.from(JSON.stringify({ createdAt }), 'utf8').toString('base64url');
}

export default async function handler(req, res) {
  if (applyRiverCors(req, res, ['GET'])) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Metodo non consentito.' });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(503).json({ error: 'Servizio movimenti non configurato sul server.' });
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

  const requestedLimit = Number.parseInt(String(req.query.limit || '20'), 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 20;
  const cursorValue = Array.isArray(req.query.cursor) ? req.query.cursor[0] : req.query.cursor;
  const cursor = decodeCursor(cursorValue);

  let query = supabase
    .from('rs_wallet_transactions')
    .select('id,currency,amount,balance_after,reason,source,reference_id,metadata,created_at')
    .eq('user_id', authData.user.id)
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (cursor) query = query.lt('created_at', cursor);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: 'Impossibile leggere i movimenti del wallet.' });

  const rows = data || [];
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  return res.status(200).json({
    ok: true,
    transactions: page.map((row) => ({
      id: row.id,
      currency: row.currency,
      amount: String(row.amount),
      balanceAfter: String(row.balance_after),
      reason: row.reason,
      source: row.source,
      referenceId: row.reference_id,
      metadata: row.metadata,
      createdAt: row.created_at
    })),
    nextCursor: hasMore && page.length ? encodeCursor(page[page.length - 1].created_at) : null
  });
}
