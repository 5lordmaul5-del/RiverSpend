const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Il file del database SQLite risiederà in modo persistente sul disco del VPS
const dbPath = path.resolve(__dirname, 'riverspend.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Errore nell apertura del database SQLite:', err.message);
  } else {
    console.log('Connesso al database locale SQLite di RiverSpend.');
  }
});

// Creazione della tabella prodotti
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;
