// Provider readiness only. Never returns or logs secret credentials.
export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const prodigiEnvironment = (process.env.PRODIGI_ENV || 'sandbox').toLowerCase();
  return res.status(200).json({
    prodigi: Boolean(process.env.PRODIGI_API_KEY) && prodigiEnvironment === 'sandbox',
    prodigiEnvironment: 'sandbox',
    printful: Boolean(process.env.PRINTFUL_API_TOKEN),
    liveOrdersEnabled: false
  });
}
