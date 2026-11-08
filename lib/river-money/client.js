/**
 * RiverMoney / River Pay shared frontend client.
 *
 * This module only reads server-authoritative wallet information.
 * Balances and payment states are never calculated or mutated in browser code.
 */
export class RiverSpendPayments {
  constructor({ apiBase = '/api/river', getAccessToken } = {}) {
    if (typeof getAccessToken !== 'function') {
      throw new Error('RiverSpendPayments requires getAccessToken().');
    }
    this.apiBase = String(apiBase).replace(/\/$/, '');
    this.getAccessToken = getAccessToken;
  }

  async request(path) {
    const token = await this.getAccessToken();
    if (!token) throw new Error('Accesso richiesto.');

    const response = await fetch(`${this.apiBase}${path}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
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
    return this.request(`/transactions?${query.toString()}`);
  }
}
