import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = typeof window !== 'undefined' ? window.atob(base64) : '';
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

export default function RiverSpendPushNotifications() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const ok = typeof window !== 'undefined' && 'serviceWorker' in navigator &&
      'PushManager' in window && 'Notification' in window;
    setSupported(ok);
    if (ok) setPermission(Notification.permission);
  }, []);

  async function enableNotifications() {
    setBusy(true);
    setMessage('');
    try {
      const keyResponse = await fetch('/api/push/public-key');
      const keyData = await keyResponse.json();
      if (!keyResponse.ok || !keyData.publicKey) {
        throw new Error('Le notifiche non sono ancora configurate dal gestore RiverSpend.');
      }
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') throw new Error('Permesso notifiche non concesso.');

      // Registration may resolve before the worker reaches the activated state.
      // PushManager.subscribe requires an active service worker registration.
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await registration.update();
      const activeRegistration = await navigator.serviceWorker.ready;
      if (!activeRegistration.active) {
        throw new Error('Il servizio notifiche non è ancora attivo. Ricarica la pagina e riprova.');
      }

      const existingSubscription = await activeRegistration.pushManager.getSubscription();
      const subscription = existingSubscription || await activeRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey)
      });
      const saveResponse = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      });
      const saved = await saveResponse.json();
      if (!saveResponse.ok) throw new Error(saved.error || 'Impossibile salvare la registrazione.');
      setMessage('Notifiche RiverSpend attivate su questo dispositivo.');
    } catch (error) {
      setMessage(error && error.message ? error.message : 'Errore durante l’attivazione.');
    } finally {
      setBusy(false);
    }
  }

  async function disableNotifications() {
    setBusy(true);
    setMessage('');
    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      const subscription = registration && await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
        await subscription.unsubscribe();
      }
      setMessage('Notifiche disattivate su questo dispositivo.');
    } catch {
      setMessage('Non è stato possibile disattivare le notifiche.');
    } finally {
      setBusy(false);
    }
  }

  if (!supported) return null;
  return (
    <aside className="fixed bottom-4 right-4 z-[90] w-[min( calc(100vw - 2rem), 22rem)] rounded-2xl border border-cyan-200 bg-white p-4 shadow-xl">
      <p className="font-extrabold text-slate-900">🔔 Notifiche RiverSpend</p>
      <p className="mt-1 text-sm text-slate-600">Ricevi gli avvisi sulle offerte e le novità che scegli di seguire.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {permission === 'granted' ? (
          <button type="button" disabled={busy} onClick={disableNotifications} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-50">
            {busy ? 'Attendi…' : 'Disattiva'}
          </button>
        ) : (
          <button type="button" disabled={busy} onClick={enableNotifications} className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-extrabold text-white disabled:opacity-50">
            {busy ? 'Attendi…' : 'Attiva notifiche'}
          </button>
        )}
      </div>
      {message && <p role="status" className="mt-2 text-xs text-slate-600">{message}</p>}
    </aside>
  );
}
