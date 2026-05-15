const SW_VERSION = "oa-pwa-v1";
const STATIC_CACHE = `${SW_VERSION}-static`;

const CORE_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/icons/apple-touch-icon.svg",
];

const SENSITIVE_PATHS = [
  "/api",
  "/admin",
  "/auth",
  "/login",
  "/registro",
  "/checkout",
  "/carrito",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== STATIC_CACHE)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isSensitiveRequest(url, request) {
  if (request.method !== "GET") {
    return true;
  }

  if (url.origin !== self.location.origin) {
    return true;
  }

  if (request.mode === "navigate" || request.destination === "document") {
    return true;
  }

  return SENSITIVE_PATHS.some(
    (path) => url.pathname === path || url.pathname.startsWith(`${path}/`),
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(STATIC_CACHE);
        return (await cache.match("/offline")) || Response.error();
      }),
    );
    return;
  }

  if (isSensitiveRequest(url, request)) {
    return;
  }

  event.respondWith(
    caches.open(STATIC_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }

      try {
        const response = await fetch(request);
        if (response && response.ok && response.type === "basic") {
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        return cached || Response.error();
      }
    }),
  );
});
