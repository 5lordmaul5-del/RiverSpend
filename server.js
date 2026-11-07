const http = require('http');
const fs = require('fs');
const path = require('path');

// Importazione dei moduli della Fortezza RiverSpend
const FortezzaSecurity = require('./lib/security');
const RateLimiter = require('./lib/rateLimiter');
const FailoverManager = require('./lib/failoverManager');
const HealthMonitor = require('./lib/healthMonitor');

// Inizializzazione delle istanze della Fortezza
const fortressSecurity = new FortezzaSecurity();
const rateLimiter = new RateLimiter(50, 60000); // Max 50 richieste al minuto per client
const failoverManager = new FailoverManager();
const healthMonitor = new HealthMonitor();

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Identificativo del client
  const clientId = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local-client';

  // 1. Controllo Rate Limit in ingresso (Protezione Anti-Sovraccarico)
  if (!rateLimiter.checkLimit(clientId)) {
    healthMonitor.runDiagnostic('RateLimiter', false, `Traffico anomalo bloccato per: ${clientId}`);
    res.writeHead(429, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('429 Too Many Requests - Fortezza RiverSpend: Troppe richieste.');
    return;
  }

  healthMonitor.runDiagnostic('RateLimiter', true, 'Traffico regolare');

  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        healthMonitor.runDiagnostic('ServerFile', false, `File non trovato: ${req.url}`);
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - Pagina non trovata</h1>');
      } else {
        healthMonitor.runDiagnostic('ServerFile', false, `Errore server: ${err.code}`);
        res.writeHead(500);
        res.end(`Errore del server: ${err.code}`);
      }
    } else {
      let extname = path.extname(filePath);
      let contentType = 'text/html';
      if (extname === '.js') contentType = 'text/javascript';
      if (extname === '.css') contentType = 'text/css';
      if (extname === '.json') contentType = 'application/json';

      healthMonitor.runDiagnostic('ServerFile', true, `Servito con successo: ${req.url}`);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  healthMonitor.runDiagnostic('ServerCore', true, `Server avviato sulla porta ${PORT}`);
  console.log(`\n🚀 Server avviato con successo!`);
  console.log(`🛡️ Fortezza RiverSpend attiva e integrata.`);
  console.log(`👉 Apri il browser e vai su: http://localhost:${PORT}\n`);
});
