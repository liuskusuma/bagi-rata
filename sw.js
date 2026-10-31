// Offline support: app files are cached on install; Google Fonts are cached the first time they load.
const CACHE = "bagi-rata-v28";
const FILES = ["./", "index.html", "langkah.html", "manifest.webmanifest", "manifest-langkah.webmanifest", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" }))))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    // Network first so updates arrive; own files skip the browser's HTTP cache (GitHub Pages keeps them 10 minutes).
    // Falls back to the cache when offline.
    fetch(new URL(e.request.url).origin === location.origin ? e.request.url : e.request, { cache: "no-cache" }).then(res => {
      if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});
