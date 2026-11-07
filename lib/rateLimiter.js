// Modulo di Protezione Anti-Sovraccarico (Rate Limiting) - Fortezza RiverSpend
// Questo script controlla e limita le richieste in arrivo per proteggere l'architettura.

class RateLimiter {
  constructor(maxRequests = 50, timeWindowMs = 60000) {
    this.maxRequests = maxRequests;       // Numero massimo di richieste consentite
    this.timeWindowMs = timeWindowMs;     // Finestra temporale (es. 1 minuto = 60000ms)
    this.clients = new Map();
  }

  // Verifica se un utente/dispositivo ha superato il limite
  checkLimit(clientId) {
    const now = Date.now();
    
    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, { count: 1, startTime: now });
      return true; // Richiesta consentita
    }

    const clientData = this.clients.get(clientId);

    // Se la finestra temporale è scaduta, resetta il contatore
    if (now - clientData.startTime > this.timeWindowMs) {
      clientData.count = 1;
      clientData.startTime = now;
      return true; // Richiesta consentita
    }

    // Se è ancora nel tempo stabilito, controlla il numero di richieste
    if (clientData.count < this.maxRequests) {
      clientData.count++;
      return true; // Richiesta consentita
    }

    // Limite superato! Blocco temporaneo anti-sovraccarico
    return false;
  }
}

module.exports = RateLimiter;
