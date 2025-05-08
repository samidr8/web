// Nombre de la caché y versión
const CACHE_NAME = 'ar-experience-v1';

// Recursos a almacenar en caché para funcionamiento offline
const RESOURCES_TO_CACHE = [
    '/',
    'index.html',
    'styles.css',
    'main.js',
    'markers/pattern-marker1.patt',
    'markers/pattern-marker2.patt',
    'markers/pattern-marker3.patt',
    'media/sonidos_animales.mp4',
    'media/volcano.glb',
    'media/matematicas.png',
    'https://aframe.io/releases/1.4.0/aframe.min.js',
    'https://raw.githack.com/AR-js-org/AR.js/3.4.2/aframe/build/aframe-ar.js'
];

// Evento de instalación - almacena en caché los recursos esenciales
self.addEventListener('install', event => {
    console.log('Service Worker: Instalando...');
    
    // Esperar hasta que la caché esté lista y todos los recursos añadidos
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caché abierta');
                return cache.addAll(RESOURCES_TO_CACHE);
            })
            .then(() => {
                console.log('Service Worker: Todos los recursos en caché');
                return self.skipWaiting(); // Forzar la activación inmediata
            })
    );
});

// Evento de activación - limpiar cachés antiguas
self.addEventListener('activate', event => {
    console.log('Service Worker: Activando...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Eliminar cachés antiguas que no coincidan con la versión actual
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Ahora está activo y controlando la página');
            return self.clients.claim(); // Tomar control de los clientes no controlados
        })
    );
});

// Estrategia de caché: primero caché, luego red
self.addEventListener('fetch', event => {
    // Solo interceptar solicitudes GET (evitar POST, etc.)
    if (event.request.method !== 'GET') return;
    
    // Evitar solicitudes a otros dominios (excepto las que específicamente cachearemos)
    const url = new URL(event.request.url);
    const shouldCache = 
        url.origin === self.location.origin || 
        RESOURCES_TO_CACHE.some(resource => event.request.url.includes(resource));
    
    if (!shouldCache) return;
    
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Si encontramos en caché, devolver respuesta cacheada
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Si no está en caché, intentar obtener de la red
                return fetch(event.request)
                    .then(response => {
                        // Si la respuesta no es válida, devolver directamente
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clonar la respuesta para poder almacenarla en caché y devolverla
                        const responseToCache = response.clone();
                        
                        // Almacenar en caché para uso futuro
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        console.log('Service Worker: Error de fetch:', error);
                        
                        // Intentar devolver una respuesta offline para HTML
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/');
                        }
                        
                        // Si no podemos recuperar ni ofrecer una alternativa, simplemente fallar
                        return new Response('Error de conexión. Por favor, vuelve a intentarlo cuando tengas conexión.', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Evento de mensaje - permite comunicación con la página principal
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});