/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  async headers() {
    const revalidateHeaders = [
      { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
      { key: 'CDN-Cache-Control', value: 'no-store' },
      { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },
    ];

    return [
      { source: '/sw.js', headers: revalidateHeaders },
      { source: '/manifest-:app.json', headers: revalidateHeaders },
      { source: '/manifest.json', headers: revalidateHeaders },
      { source: '/river-ai.webmanifest', headers: revalidateHeaders },
    ];
  },
};

module.exports = nextConfig;
