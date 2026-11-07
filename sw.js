const CACHE_NAME = 'donadores-bcs-shell-v4';
const APP_SHELL = [
    './',
    './index.html',
    './manifest.json',
    './install.js',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-512-maskable.png',
    './icons/apple-touch-icon.png',
    './icons/favicon-32x32.ico',
    './styles/main.css',
    './styles/shell.css',
    './src/main.js',
    './src/router/router.js',
    './src/utils/storage.js',
    './src/utils/slugify.js',
    './src/services/registerSW.js',
    './src/services/apiService.js',
    './src/services/dbService.js',
    './src/components/ItemCard.js',
    './src/views/HomeView.js',
    './src/views/AboutView.js',
    './src/views/ItemDetailView.js',
    './src/views/DiagnosticView.js',
    './src/views/FavoritesView.js',
    './src/views/NotFoundView.js'
];

self.addEventListener('install', (event) => {
    console.log('[Service Worker v4] Instalando y precacheando App Shell...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker v4] Activando y purgando cachés obsoletas...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker v4] Borrando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('donadores-bcs-db', 2);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getAllOutboxItems(db) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('outbox', 'readonly');
        const store = tx.objectStore('outbox');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function deleteOutboxItem(db, id) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('outbox', 'readwrite');
        const store = tx.objectStore('outbox');
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-donaciones-pendientes') {
        console.log('[SW Background Sync] Evento disparado: procesando outbox...');
        event.waitUntil(sincronizarDonaciones());
    }
});

async function sincronizarDonaciones() {
    try {
        const db = await openDatabase();
        const items = await getAllOutboxItems(db);

        if (items.length === 0) {
            console.log('[SW Sync] No hay registros pendientes en outbox.');
            return;
        }

        for (const item of items) {
            console.log('[SW Sync] Procesando solicitud:', item);
            await deleteOutboxItem(db, item.id);
            console.log(`[SW Sync] Registro ID ${item.id} sincronizado y eliminado del outbox.`);
        }
    } catch (error) {
        console.error('[SW Sync] Error durante la sincronización:', error);
        throw error;
    }
}
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
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
            return networkResponse;
        }
        throw new Error('Respuesta de red no válida');
    } catch (error) {
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
        }
        return networkResponse;
    }).catch(() => {});

    if (cachedResponse) {
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
            caches.match('./index.html')
                .then((res) => res || caches.match('index.html'))
                .then((res) => res || caches.match('/index.html'))
                .then((res) => res || fetch(request))
                .catch(() => caches.match('./index.html'))
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