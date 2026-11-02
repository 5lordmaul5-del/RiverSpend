const CACHE = "river-ssai-shell-v2";
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(["/river-ai","/river-ai.webmanifest","/icons/river-ssai.svg"]))); self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", event => { if (event.request.method !== "GET") return; const url = new URL(event.request.url); if (url.origin !== self.location.origin) return; event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(hit => hit || caches.match("/river-ai")))); });
