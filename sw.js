const CACHE_NAME = 'donadores-bcs-shell-v2';

const APP_SHELL = [
    '/',
    '/index.html',
    '/src/main.js',
    '/styles/main.css'
];

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando versión y precacheando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activando y limpiando cachés obsoletas...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});


self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== 'GET' || url.origin !== location.origin) {
        return; 
    }
    if (request.mode === 'navigate') {
        event.respondWith(
            caches.match('/index.html')
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(request);
                })
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                console.log(`[SW] HIT: ${request.url}`);
                return cachedResponse;
            }

            console.log(`[SW] MISS: ${request.url}`);
            return fetch(request).then((networkResponse) => {
                if (!networkResponse || !networkResponse.ok || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();

                event.waitUntil(
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    })
                );

                return networkResponse;
            }).catch(() => {
                if (request.headers.get('accept').includes('text/html')) {
                    return caches.match('/index.html');
                }
            });
        })
    );
});