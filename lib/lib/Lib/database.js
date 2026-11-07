const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Definiamo il percorso del file di database locale per RiverSpendShop
// Verrà creato automaticamente un file chiamato "riverspendshop.db" nella cartella del progetto
const dbPath = path.resolve(__dirname, 'riverspendshop.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Errore durante l\'apertura del database SQLite:', err.message);
    } else {
        console.log('Connesso al database locale SQLite di RiverSpendShop.');
    }
});

// Creazione automatica della tabella prodotti se non esiste già
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Errore nella creazione della tabella products:', err.message);
        } else {
            console.log('Tabella "products" pronta e protetta.');
        }
    });
});

module.exports = db;
