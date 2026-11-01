/**
 * RiverMoney / River Pay shared frontend client.
 *
 * This module is intentionally transport-only: balances and payment states
 * must always be calculated and confirmed by the authenticated server.
 * Never place provider secret keys or ledger mutation logic in browser code.
 */
export class RiverSpendPayments {
  constructor({ apiBase = '/api/river', getAccessToken } = {}) {
    if (typeof getAccessToken !== 'function') {
      throw new Error('RiverSpendPayments requires getAccessToken().');
    }
    this.apiBase = String(apiBase).replace(/\/$/, '');
    this.getAccessToken = getAccessToken;
  }

  async request(path, { method = 'GET', body } = {}) {
    const token = await this.getAccessToken();
    if (!token) throw new Error('Accesso richiesto.');
    const response = await fetch(`${this.apiBase}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || data.error || `Errore RiverSpend (${response.status}).`);
    }
    return data;
  }

  getWallet() {
    return this.request('/wallet');
  }

  getTransactions({ limit = 20, cursor } = {}) {
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const query = new URLSearchParams({ limit: String(safeLimit) });
    if (cursor) query.set('cursor', cursor);
    return this.request(`/transactions?${query}`);
  }

  createPaymentIntent({ amountMinor, currency = 'EUR', orderId, returnUrl }) {
    if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
      throw new Error('Importo non valido: usare un intero in centesimi.');
    }
    if (!orderId) throw new Error('orderId obbligatorio.');
    return this.request('/payment-intents', {
      method: 'POST',
      body: { amountMinor, currency, orderId, returnUrl }
    });
  }
}
