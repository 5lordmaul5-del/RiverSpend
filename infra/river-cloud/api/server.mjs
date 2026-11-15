import http from 'node:http';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Pool } = pg;
const PORT = Number(process.env.PORT || 8080);
const SUPABASE_URL = process.env.RIVERAUTH_ISSUER_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.RIVERAUTH_PUBLISHABLE_KEY;
const DATABASE_URL = process.env.RIVER_CLOUD_API_DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !DATABASE_URL) {
  throw new Error('RIVERAUTH_ISSUER_URL, RIVERAUTH_PUBLISHABLE_KEY and RIVER_CLOUD_API_DATABASE_URL are required');
}

const identity = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 3_000,
  statement_timeout: 5_000,
  application_name: 'rivercloud-private-api',
});

const windows = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 60;
const MAX_BODY_BYTES = 4096;

function send(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
  });
  res.end(JSON.stringify(payload));
}

function rateLimited(req) {
  const key = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = windows.get(key);
  if (!entry || now - entry.start >= RATE_WINDOW_MS) {
    windows.set(key, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error('Request body too large');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('Invalid JSON');
    error.status = 400;
    throw error;
  }
}

async function authenticatedUser(req) {
  const header = req.headers.authorization || '';
  const match = /^Bearer ([A-Za-z0-9._~-]+)$/.exec(header);
  if (!match) return null;
  const { data, error } = await identity.auth.getUser(match[1]);
  if (error || !data?.user?.id) return null;
  return data.user;
}

async function withUserTransaction(userId, operation) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      "SELECT set_config('rivercloud.user_id', $1, true)",
      [userId],
    );
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (rateLimited(req)) return send(res, 429, { error: 'rate_limited' });

    const url = new URL(req.url || '/', 'http://rivercloud.internal');
    if (req.method === 'GET' && url.pathname === '/health') {
      return send(res, 200, { status: 'ok', service: 'rivercloud-private-api' });
    }

    if (url.pathname !== '/v1/me' || !['GET', 'PUT'].includes(req.method || '')) {
      return send(res, 404, { error: 'not_found' });
    }

    const user = await authenticatedUser(req);
    if (!user) return send(res, 401, { error: 'unauthorized' });

    if (req.method === 'GET') {
      const result = await withUserTransaction(user.id, (client) =>
        client.query(
          'SELECT user_id, display_name, updated_at FROM rivercloud.user_profiles WHERE user_id = $1',
          [user.id],
        ),
      );
      return send(res, 200, { profile: result.rows[0] || null });
    }

    const body = await readJson(req);
    if (!body || typeof body.display_name !== 'string') {
      return send(res, 400, { error: 'display_name_required' });
    }
    const displayName = body.display_name.trim();
    if (displayName.length < 1 || displayName.length > 80) {
      return send(res, 400, { error: 'display_name_must_be_1_to_80_characters' });
    }

    const result = await withUserTransaction(user.id, (client) =>
      client.query(
        `INSERT INTO rivercloud.user_profiles (user_id, display_name)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE
         SET display_name = EXCLUDED.display_name, updated_at = now()
         RETURNING user_id, display_name, updated_at`,
        [user.id, displayName],
      ),
    );
    return send(res, 200, { profile: result.rows[0] });
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 500;
    if (status === 500) console.error('RiverCloud API request failed:', error?.message || 'unknown error');
    return send(res, status, { error: status === 500 ? 'internal_error' : error.message });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`RiverCloud private API listening on internal port ${PORT}`);
});

async function shutdown() {
  server.close(async () => {
    await pool.end().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
