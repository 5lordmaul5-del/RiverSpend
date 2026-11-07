// Modulo di Sicurezza e Cifratura - Fortezza RiverSpend
// Questo script genera chiavi dinamiche e firme HMAC per blindare i flussi di dati.

const crypto = require('crypto');

class FortezzaSecurity {
  constructor(secretKey) {
    this.secretKey = secretKey || process.env.FORTRESS_SECRET_KEY || 'chiave-segreta-default-fortezza';
  }

  // 1. Cifra i dati prima di inviarli (es. dai 4 fiumi alla PWA)
  encryptPayload(data) {
    const textData = JSON.stringify(data);
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.secretKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(textData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      iv: iv.toString('hex'),
      data: encrypted
    };
  }

  // 2. Decifra i dati in modo sicuro sullo smartphone / client
  decryptPayload(encryptedObj) {
    const key = crypto.scryptSync(this.secretKey, 'salt', 32);
    const iv = Buffer.from(encryptedObj.iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encryptedObj.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  // 3. Firma digitale HMAC per autenticare i comandi degli agenti
  generateHMAC(message) {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('hex');
  }

  verifyHMAC(message, signature) {
    const computedSignature = this.generateHMAC(message);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature));
  }
}

module.exports = FortezzaSecurity;
