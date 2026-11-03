const DB_NAME = 'riverspace-signals-enigma';
const STORE = 'device-keys';
const PREFIX = 'ENIGMA1:';

function bytesToBase64(bytes) {
  let binary = '';
  new Uint8Array(bytes).forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}
function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}
function openKeyDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function readStoredKey(id) {
  const db = await openKeyDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
    request.onsuccess = () => { db.close(); resolve(request.result || null); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}
async function storeKey(id, value) {
  const db = await openKeyDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
function getDeviceId() {
  let id = localStorage.getItem('rs-signals-device-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('rs-signals-device-id', id);
  }
  return id;
}
export async function ensureEnigmaDevice(supabase, userId) {
  if (!globalThis.crypto?.subtle || !globalThis.indexedDB) throw new Error('Questo dispositivo non supporta la cifratura ENIGMA.');
  const deviceId = getDeviceId();
  let pair = await readStoredKey(userId + ':' + deviceId);
  if (!pair) {
    const generated = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey']);
    const publicKey = await crypto.subtle.exportKey('jwk', generated.publicKey);
    const privateJwk = await crypto.subtle.exportKey('jwk', generated.privateKey);
    const privateKey = await crypto.subtle.importKey('jwk', privateJwk, { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveKey']);
    pair = { privateKey, publicKey };
    await storeKey(userId + ':' + deviceId, pair);
  }
  const { error } = await supabase.from('rs_chat_device_keys').upsert({
    user_id: userId, device_id: deviceId, public_key: pair.publicKey, key_version: 1, updated_at: new Date().toISOString()
  }, { onConflict: 'user_id,device_id' });
  if (error) throw error;
  return { deviceId, publicKey: pair.publicKey };
}
async function getConversationKey(supabase, userId, conversationId, peerId, peerDeviceId) {
  const deviceId = getDeviceId();
  const own = await readStoredKey(userId + ':' + deviceId);
  if (!own) throw new Error('Chiave ENIGMA locale non trovata. Riapri Signals su questo dispositivo.');
  const query = supabase.from('rs_chat_device_keys').select('public_key,device_id').eq('user_id', peerId);
  const { data, error } = await query;
  if (error) throw error;
  const peer = (data || []).find(item => item.device_id === peerDeviceId) || (data || [])[0];
  if (!peer?.public_key) throw new Error('Il contatto non ha ancora configurato ENIGMA su un dispositivo.');
  const peerPublic = await crypto.subtle.importKey('jwk', peer.public_key, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: peerPublic }, own.privateKey, 256);
  const material = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveKey']);
  const salt = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('RiverSpaceSignals:' + conversationId));
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt, info: new TextEncoder().encode('CHRISTOPHER/ENIGMA/v1') },
    material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}
export async function encryptEnigmaText(supabase, userId, conversationId, peerId, peerDeviceId, text) {
  const key = await getConversationKey(supabase, userId, conversationId, peerId, peerDeviceId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text));
  return PREFIX + JSON.stringify({ v: 1, iv: bytesToBase64(iv), data: bytesToBase64(cipher) });
}
export async function decryptEnigmaText(supabase, userId, conversationId, peerId, senderDeviceId, body) {
  if (!body?.startsWith(PREFIX)) return body;
  const envelope = JSON.parse(body.slice(PREFIX.length));
  if (envelope.v !== 1) throw new Error('Versione ENIGMA non supportata.');
  const key = await getConversationKey(supabase, userId, conversationId, peerId, senderDeviceId);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(envelope.iv) }, key, base64ToBytes(envelope.data));
  return new TextDecoder().decode(plain);
}
export async function encryptEnigmaFile(supabase, userId, conversationId, peerId, peerDeviceId, file) {
  const key = await getConversationKey(supabase, userId, conversationId, peerId, peerDeviceId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, await file.arrayBuffer());
  return {
    blob: new Blob([cipher], { type: 'application/octet-stream' }),
    envelope: { v: 1, iv: bytesToBase64(iv), name: file.name, mime: file.type || 'application/octet-stream', size: file.size }
  };
}
export async function decryptEnigmaFile(supabase, userId, conversationId, peerId, senderDeviceId, blob, envelope) {
  const key = await getConversationKey(supabase, userId, conversationId, peerId, senderDeviceId);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(envelope.iv) }, key, await blob.arrayBuffer());
  return new Blob([plain], { type: envelope.mime || 'application/octet-stream' });
}
export function isEnigmaCiphertext(value) { return typeof value === 'string' && value.startsWith(PREFIX); }
