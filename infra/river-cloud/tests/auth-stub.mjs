import http from 'node:http';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const API_KEY = 'ci-stub-key';
const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://auth-stub.internal');
  if (req.method !== 'GET' || url.pathname !== '/auth/v1/user' ||
      req.headers.apikey !== API_KEY || req.headers.authorization !== 'Bearer test-token') {
    res.writeHead(401, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'unauthorized' }));
    return;
  }
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ id: USER_ID }));
});

server.listen(8081, '0.0.0.0', () => {
  console.log('CI RiverAuth stub listening on 8081');
});
