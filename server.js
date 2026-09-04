const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 - Pagina non trovata</h1>');
            } else {
                res.writeHead(500);
                res.end(`Errore del server: ${err.code}`);
            }
        } else {
            let extname = path.extname(filePath);
            let contentType = 'text/html';
            if (extname === '.js') contentType = 'text/javascript';
            if (extname === '.css') contentType = 'text/css';
            if (extname === '.json') contentType = 'application/json';
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🚀 Server avviato con successo!`);
    console.log(`👉 Apri il browser e vai su: http://localhost:${PORT}\n`);
});
