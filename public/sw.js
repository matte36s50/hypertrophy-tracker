// Simple, dependency-free service worker for offline support.
// Strategy:
//  - Immutable static files (/_next/static, icons, exercise images, fonts):
//    cache-first for speed. Their URLs change whenever their content does.
//  - Everything else — HTML navigations AND Next's page-data (RSC) requests
//    used for in-app navigation: network-first, falling back to the cache
//    offline. Serving those cache-first pinned old page data that referenced
//    code from a previous deploy, which broke tab switches after an update.
// Bump CACHE_VERSION whenever you want to force clients to refetch everything.

const CACHE_VERSION = "v4";
const CACHE_NAME = `hypertrophy-${CACHE_VERSION}`;

// App shell URLs to pre-cache on install so the app opens offline.
const PRECACHE_URLS = [
  "/",
  "/progression",
  "/history",
  "/library",
  "/plan",
  "/ski",
  "/ski/progress",
  "/ski/images",
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

  const immutable =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/exercise-images/");

  if (!immutable) {
    // Network-first; keep a copy for offline use.
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then(
              (cached) =>
                cached ||
                (request.mode === "navigate"
                  ? caches.match("/").then((shell) => shell || Response.error())
                  : Response.error()),
            ),
        ),
    );
    return;
  }

  // Immutable assets: cache-first.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
