const RIVERSPEND_WORKER_VERSION = '2026-11-24-unified-pwa-1';

// Activate the new worker immediately instead of waiting for every old tab to close.
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

// Take control of open browser/PWA windows after an update.
// The app shell listens for controllerchange and reloads once onto the new release.
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      client.postMessage({
        type: 'RIVERSPEND_APP_UPDATED',
        version: RIVERSPEND_WORKER_VERSION,
      });
    }
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'RIVERSPEND_SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {
    data = { title: 'RiverSpendShop', body: event.data ? event.data.text() : 'Hai una nuova notifica.' };
  }
  const title = data.title || 'RiverSpendShop';
  const options = {
    body: data.body || 'Scopri le novità su RiverSpendShop.',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
    data: { url: data.url || '/' },
    tag: data.tag || 'riverspend-notification',
    renotify: false
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data && event.notification.data.url || '/', self.location.origin).href;
  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientsList) {
      if (client.url.startsWith(self.location.origin) && 'focus' in client) {
        await client.focus();
        if ('navigate' in client) await client.navigate(target);
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});
