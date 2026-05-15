const CACHE_NAME = "boyington-remix-v5";
const CORE = ["./","./index.html","./styles.css","./work.js","./manifest.json"];
const OPTIONAL = ["./boyington-official-logo.png","./cover%20principal.jpg","./studio-boyington%20a%20virer.png"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    for (const url of CORE.concat(OPTIONAL)) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) await cache.put(url, res.clone());
      } catch {}
    }
    self.skipWaiting();
  })());
});
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => key === CACHE_NAME ? null : caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone()).catch(() => {});
      }
      return response;
    } catch {
      return cached || new Response("", { status: 503, statusText: "Offline" });
    }
  })());
});
