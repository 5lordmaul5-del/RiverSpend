import { createClient } from '@supabase/supabase-js';
import { createHash, timingSafeEqual } from 'node:crypto';

function safeEqualHex(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || !/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false;
  const a = Buffer.from(left, 'hex');
  const b = Buffer.from(right, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, code: 'method_not_allowed' });
  }

  // This endpoint stays disabled until separate server-only secrets are configured.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const staffToken = process.env.RS_PARK_STAFF_TOKEN;
  if (!url || !serviceKey || !staffToken) {
    return res.status(503).json({ ok: false, code: 'park_gift_redemption_not_configured' });
  }

  const authorization = req.headers.authorization || '';
  const suppliedToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!safeEqualHex(createHash('sha256').update(suppliedToken).digest('hex'), createHash('sha256').update(staffToken).digest('hex'))) {
    return res.status(401).json({ ok: false, code: 'staff_auth_required' });
  }

  const { publicCode, secret, admissionsUsed = 1, idempotencyKey } = req.body || {};
  if (typeof publicCode !== 'string' || !/^[A-Z0-9-]{6,48}$/.test(publicCode) ||
      typeof secret !== 'string' || secret.length < 24 || secret.length > 256 ||
      !Number.isInteger(admissionsUsed) || admissionsUsed < 1 || admissionsUsed > 20 ||
      typeof idempotencyKey !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(idempotencyKey)) {
    return res.status(400).json({ ok: false, code: 'invalid_request' });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  try {
    const { data: card, error: lookupError } = await supabase
      .from('rs_park_gift_cards')
      .select('id,secret_hash,status,remaining_admissions,expires_at')
      .eq('public_code', publicCode)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!card) return res.status(404).json({ ok: false, code: 'invalid_card' });

    // The client supplies the secret, never the stored hash. Hash algorithm must match issuance.
    const suppliedSecretHash = createHash('sha256').update(secret, 'utf8').digest('hex');
    if (!safeEqualHex(suppliedSecretHash, card.secret_hash)) {
      return res.status(404).json({ ok: false, code: 'invalid_card' });
    }

    const { data, error } = await supabase.rpc('redeem_rs_park_gift_card', {
      p_public_code: publicCode,
      p_secret_hash: card.secret_hash,
      p_admissions_used: admissionsUsed,
      p_idempotency_key: idempotencyKey,
      p_redeemed_by: null,
      p_note: 'Park staff scan endpoint',
    });
    if (error) throw error;
    const result = Array.isArray(data) ? data[0] : data;
    if (!result) return res.status(500).json({ ok: false, code: 'empty_redemption_result' });

    const status = result.ok ? 200 : ({
      invalid_card: 404,
      blocked: 409,
      expired: 409,
      exhausted: 409,
      insufficient_admissions: 409,
      already_processed: 409,
      pending_payment: 409,
    }[result.result_code] || 400);

    return res.status(status).json({
      ok: result.ok,
      code: result.result_code,
      remainingAdmissions: result.remaining,
    });
  } catch (error) {
    // Avoid returning database details or secrets to the scanner.
    console.error('Park gift redemption failed:', error?.message || 'unknown error');
    return res.status(500).json({ ok: false, code: 'redemption_failed' });
  }
}
