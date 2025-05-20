// service-worker-caching.js
const CACHE_NAME = 'ar-experience-v1';
// Solo incluye archivos locales que realmente EXISTAN en tu servidor/proyecto
const PRECACHE_URLS = [
  'index.html',
  'index.css',
  'tarjetas/targets.mind',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Solo responde del cache si está en PRECACHE_URLS, sino fetch normal
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
