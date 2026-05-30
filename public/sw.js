// Simple, dependency-free service worker for offline support.
// Strategy:
//  - Navigations (HTML pages): network-first, fall back to cache, then to a
//    cached shell. This keeps content fresh online but works offline.
//  - Static assets (JS/CSS/images/fonts): cache-first for speed.
// Bump CACHE_VERSION whenever you want to force clients to refetch everything.

const CACHE_VERSION = "v2";
const CACHE_NAME = `hypertrophy-${CACHE_VERSION}`;

// App shell URLs to pre-cache on install so the app opens offline.
const PRECACHE_URLS = [
  "/",
  "/progression",
  "/history",
  "/library",
  "/plan",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Don't try to cache cross-origin requests.
  if (url.origin !== self.location.origin) return;

  // HTML navigations: network-first.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/")),
        ),
    );
    return;
  }

  // Other same-origin GETs (assets): cache-first.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Only cache successful, basic responses.
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
