// Modulo di Gestione Failover e Agenti di Riserva - Fortezza RiverSpend
// Questo script garantisce la continuità operativa attivando cloni di riserva in caso di anomalie.

class FailoverManager {
  constructor() {
    this.primaryAgents = new Map();
    this.backupAgents = new Map();
  }

  // Registra una coppia di agente principale e il suo rispettivo riserva
  registerAgentPair(id, primaryTaskFunction, backupTaskFunction) {
    this.primaryAgents.set(id, primaryTaskFunction);
    this.backupAgents.set(id, backupTaskFunction);
  }

  // Esegue il task dell'agente con failover automatico in millisecondi
  async executeWithFailover(id, ...args) {
    const primary = this.primaryAgents.get(id);
    const backup = this.backupAgents.get(id);

    if (!primary) {
      throw new Error(`Agente principale con ID ${id} non trovato nella Fortezza.`);
    }

    try {
      // Tenta l'esecuzione con l'agente principale
      const result = await primary(...args);
      return { success: true, source: 'primary', data: result };
    } catch (primaryError) {
      console.warn(`Anomalia rilevata sull'agente principale ${id}. Intervento dell'agente di riserva in corso...`);
      
      if (!backup) {
        throw new Error(`Fallimento dell'agente principale ${id} e nessun agente di riserva disponibile.`);
      }

      try {
        // Intervento immediato dell'agente di riserva (failover)
        const backupResult = await backup(...args);
        return { success: true, source: 'backup', data: backupResult };
      } catch (backupError) {
        throw new Error(`Criticità totale sulla Fortezza: sia l'agente principale che la riserva ${id} hanno fallito.`);
      }
    }
  }
}

module.exports = FailoverManager;
