const CACHE_NAME = "qms-pro-v2";
const OFFLINE_URL = "/offline";
const CORE_ASSETS = [
  "/offline",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/manifest.webmanifest"
];

function isCacheableAsset(requestUrl) {
  if (requestUrl.origin !== self.location.origin) return false;
  if (requestUrl.pathname.startsWith("/_next/")) return false;
  if (requestUrl.pathname.startsWith("/api/")) return false;

  return CORE_ASSETS.includes(requestUrl.pathname) || /\.(?:css|js|png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(requestUrl.pathname);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return cache.match(OFFLINE_URL);
      })
    );
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (!isCacheableAsset(requestUrl)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => caches.match("/icons/icon-192.svg"));
    })
  );
});
