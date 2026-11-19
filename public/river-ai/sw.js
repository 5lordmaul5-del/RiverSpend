const CACHE = "river-ssai-shell-v6";
const APP_ASSETS = [
  "/river-ai",
  "/river-ai.webmanifest",
  "/icons/river-ssai-app.svg",
  "/icons/river-ssai-180.png",
  "/icons/river-ssai-192.png",
  "/icons/river-ssai-512.png",
  "/images/river-ssai-10-team.svg"
];
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(APP_ASSETS.map(async path => {
      try { await cache.add(path); } catch (error) { console.warn("RiverSSAI asset not cached:", path); }
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("river-ssai-shell-") && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(hit => hit || caches.match("/river-ai"))));
});
