const CACHE = "river-ssai-shell-v10";
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([
    "/river-ai", "/river-ai.webmanifest", "/icons/river-ssai-10.svg", "/icons/river-ssai-192.png", "/icons/river-ssai-512.png",
    "/images/river-ssai-10-team.svg"
  ])));
  self.skipWaiting();
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
