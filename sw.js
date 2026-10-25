const CACHE_NAME = 'donadores-bcs-shell-v3';
const APP_SHELL = [
    '/',
    '/index.html',
    '/manifest.json', 
    '/icons/icon-192.png', 
    '/icons/icon-512.png',
    '/icons/icon-512-maskable.png',
    '/icons/apple-touch-icon.png',
    '/icons/favicon-32x32.ico',
    '/styles/main.css',
    '/styles/shell.css',
    '/src/main.js',
    '/src/router/router.js',
    '/src/utils/storage.js',
    '/src/utils/slugify.js',
    '/src/services/registerSW.js',
    '/src/services/apiService.js',
    '/src/services/dbService.js',
    '/src/components/ItemCard.js',
    '/src/views/HomeView.js',
    '/src/views/AboutView.js',
    '/src/views/ItemDetailView.js',
    '/src/views/DiagnosticView.js',
    '/src/views/FavoritesView.js',
    '/src/views/NotFoundView.js'
];

self.addEventListener('install', (event) => {
    console.log('[Service Worker v3] Instalando y precacheando App Shell...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker v3] Activando y purgando cachés obsoletas...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker v3] Borrando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});


async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        console.log(`[SW Cache First] HIT: ${request.url}`);
        return cachedResponse;
    }
    console.log(`[SW Cache First] MISS, buscando en red: ${request.url}`);
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return emergencyResponse();
    }
}

async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            console.log(`[SW Network First] Red exitosa y actualizada en caché: ${request.url}`);
            return networkResponse;
        }
        throw new Error('Respuesta de red no válida');
    } catch (error) {
        console.log(`[SW Network First] Sin red o error. Buscando en caché: ${request.url}`);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return emergencyResponse();
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
            console.log(`[SW SWR] Caché actualizada en segundo plano para: ${request.url}`);
        }
        return networkResponse;
    }).catch(() => {
        console.log(`[SW SWR] Fallo de red en segundo plano para: ${request.url}`);
    });

    if (cachedResponse) {
        console.log(`[SW SWR] Sirviendo desde caché inmediatamente: ${request.url}`);
        return cachedResponse;
    }

    return await fetchPromise || emergencyResponse();
}

function emergencyResponse() {
    return new Response(
        JSON.stringify({ error: 'Estás sin conexión y el recurso no está disponible en caché.' }),
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json;charset=utf-8' }
        }
    );
}


self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== 'GET') {
        return; 
    }

   if (request.mode === 'navigate') {
        event.respondWith(
            caches.match('/index.html')
                .then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    return caches.match('/');
                })
                .then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    return caches.match('./index.html'); 
                })
                .then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    return fetch(request).catch(() => caches.match('/index.html'));
                })
        );
        return;
    }

    if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
        event.respondWith(staleWhileRevalidate(request));
    } else if (url.pathname.includes('/api/') || url.pathname.endsWith('.json')) {
        event.respondWith(networkFirst(request));
    } else {
        event.respondWith(cacheFirst(request));
    }
});