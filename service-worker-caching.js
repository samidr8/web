// service-worker-caching.js
const CACHE_NAME = 'ar-experience-v1';
const PRECACHE_URLS = [
    // Agrega aquí archivos LOCALES pequeños que realmente existan, por ejemplo:
  'index.html',
  'index.css',
  'media/shiba/scene.gltf'
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
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
