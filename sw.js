const CACHE_NAME = "stundenzettel-v9";
const ASSETS = ["./", "./index.html", "./anleitung.html", "./Benutzeranleitung-Stundenzettel.docx", "./app.js", "./styles.css", "./xlsx.full.min.js", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;

  // Online immer die aktuelle Datei holen und fuer Offline-Nutzung aktualisieren.
  // So bleiben auch JavaScript und Gestaltung nicht dauerhaft auf einem alten Cache-Stand.
  event.respondWith(
    fetch(event.request, { cache: "no-cache" }).then((res) => {
      if (res.ok) {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
      }
      return res;
    }).catch(() => caches.match(event.request))
  );
});
