import http from 'node:http';
import { createRiverAuth } from './river-auth.mjs';
import { spawn } from 'node:child_process';

const PORT = Number(process.env.PORT || 8080);
const SUPABASE_URL = process.env.RIVERAUTH_ISSUER_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.RIVERAUTH_PUBLISHABLE_KEY;
const DATABASE_PASSWORD = process.env.RIVER_CLOUD_API_DB_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !DATABASE_PASSWORD) {
  throw new Error('RIVERAUTH_ISSUER_URL, RIVERAUTH_PUBLISHABLE_KEY and RIVER_CLOUD_API_DB_PASSWORD are required');
}

const riverAuth = createRiverAuth({
  issuerUrl: SUPABASE_URL,
  publishableKey: SUPABASE_PUBLISHABLE_KEY,
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
  return riverAuth.verifyBearerToken(req.headers.authorization || '');
}

function runProfileSql(sql, variables) {
  return new Promise((resolve, reject) => {
    const args = [
      '-X', '-qAt', '-v', 'ON_ERROR_STOP=1',
      '-h', 'rivercloud-db', '-p', '5432',
      '-U', 'rivercloud_api', '-d', 'rivercloud',
    ];
    for (const [key, value] of Object.entries(variables)) {
      args.push('-v', `${key}=${value}`);
    }

    const child = spawn('psql', args, {
      env: { ...process.env, PGPASSWORD: DATABASE_PASSWORD, PGOPTIONS: '-c statement_timeout=5000' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    const timeout = setTimeout(() => child.kill('SIGKILL'), 8000);
    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        const error = new Error('RiverCloud database operation failed');
        error.status = 503;
        reject(error);
        return;
      }
      const jsonLine = stdout.split(/\r?\n/).map((line) => line.trim())
        .filter((line) => line === 'null' || line.startsWith('{')).at(-1);
      if (!jsonLine) {
        reject(new Error(`RiverCloud database returned no profile result: ${stderr.slice(0, 300)}`));
        return;
      }
      try {
        resolve(JSON.parse(jsonLine));
      } catch {
        reject(new Error('RiverCloud database returned invalid JSON'));
      }
    });
    child.stdin.end(sql);
  });
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
      const profile = await runProfileSql(
        `BEGIN;
         WITH subject_context AS (
           SELECT set_config('rivercloud.user_id', :'subject', true)
         )
         SELECT COALESCE(
           (SELECT row_to_json(profile)::text
            FROM rivercloud.user_profiles AS profile
            WHERE profile.user_id = :'subject'::uuid),
           'null'
         )
         FROM subject_context;
         COMMIT;`,
        { subject: user.subject },
      );
      return send(res, 200, { profile });
    }

    const body = await readJson(req);
    if (!body || typeof body.display_name !== 'string') {
      return send(res, 400, { error: 'display_name_required' });
    }
    const displayName = body.display_name.trim();
    if (displayName.length < 1 || displayName.length > 80) {
      return send(res, 400, { error: 'display_name_must_be_1_to_80_characters' });
    }

    const profile = await runProfileSql(
      `BEGIN;
       WITH subject_context AS (
         SELECT set_config('rivercloud.user_id', :'subject', true)
       )
       INSERT INTO rivercloud.user_profiles (user_id, display_name)
       SELECT :'subject'::uuid, :'display_name'
       FROM subject_context
       ON CONFLICT (user_id) DO UPDATE
       SET display_name = EXCLUDED.display_name, updated_at = now()
       RETURNING json_build_object('user_id', user_id, 'display_name', display_name, 'updated_at', updated_at)::text;
       COMMIT;`,
      { subject: user.subject, display_name: displayName },
    );
    return send(res, 200, { profile });
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
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
