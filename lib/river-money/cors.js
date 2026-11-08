const SIGNALS_ORIGINS = new Set([
  'https://riversignals.vercel.app',
  'https://riversignals.com'
]);

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (SIGNALS_ORIGINS.has(origin)) return true;
  try {
    const url = new URL(origin);
    return url.protocol === 'https:' &&
      /^riversignals-[a-z0-9-]+-mauryle75-8055s-projects\.vercel\.app$/.test(url.hostname);
  } catch {
    return false;
  }
}

export function applyRiverCors(req, res, methods = ['GET']) {
  const origin = req.headers.origin || '';
  const allowed = isAllowedOrigin(origin);

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', [...methods, 'OPTIONS'].join(', '));
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');
    res.setHeader('Access-Control-Max-Age', '600');
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', [...methods, 'OPTIONS'].join(', '));
    if (!allowed) {
      res.status(403).end();
      return true;
    }
    res.status(204).end();
    return true;
  }

  return false;
}
