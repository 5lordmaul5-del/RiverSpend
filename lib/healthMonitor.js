// Modulo di Auto-Diagnosi e Monitoraggio - Fortezza RiverSpend
// Questo script controlla la salute del sistema e traccia eventuali anomalie operative.

class HealthMonitor {
  constructor() {
    this.metrics = {
      totalChecks: 0,
      anomaliesDetected: 0,
      lastCheckTimestamp: null,
      systemStatus: 'OPERATIONAL'
    };
    this.logs = [];
  }

  // Esegue un controllo di diagnostica rapido sull'ecosistema
  runDiagnostic(componentName, statusOk, details = '') {
    const timestamp = new Date().toISOString();
    this.metrics.totalChecks++;
    this.metrics.lastCheckTimestamp = timestamp;

    const logEntry = {
      component: componentName,
      status: statusOk ? 'OK' : 'WARNING',
      details,
      timestamp
    };

    this.logs.unshift(logEntry);
    
    // Mantiene solo gli ultimi 50 log per efficienza
    if (this.logs.length > 50) {
      this.logs.pop();
    }

    if (!statusOk) {
      this.metrics.anomaliesDetected++;
      this.metrics.systemStatus = 'DEGRADED_WARNING';
      console.warn(`[Auto-Diagnosi Fortezza] Anomalia rilevata in ${componentName}: ${details}`);
    } else {
      if (this.metrics.anomaliesDetected === 0) {
        this.metrics.systemStatus = 'OPERATIONAL';
      }
    }

    return logEntry;
  }

  // Restituisce il report completo della salute della Fortezza
  getSystemReport() {
    return {
      status: this.metrics.systemStatus,
      totalChecks: this.metrics.totalChecks,
      anomaliesDetected: this.metrics.anomaliesDetected,
      lastCheck: this.metrics.lastCheckTimestamp,
      recentLogs: this.logs.slice(0, 10)
    };
  }
}

module.exports = HealthMonitor;
