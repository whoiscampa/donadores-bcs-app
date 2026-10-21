const CACHE_NAME = 'donadores-bcs-shell-v2';

const APP_SHELL = [
    '/',
    '/index.html',
    '/src/main.js',
    '/styles/main.css' 
];

console.log('Contexto global:', self.constructor.name);
console.log('typeof window:', typeof window);
console.log('typeof document:', typeof document);
console.log('typeof localStorage:', typeof localStorage);

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando nueva versión y precacheados...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Recursos añadidos a la caché:', CACHE_NAME);
                return cache.addAll(APP_SHELL);
            })
            .catch((error) => {
                console.error('[Service Worker] Falló el precaching del App Shell:', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activando nueva versión y limpiando cachés antiguas...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Eliminando caché obsoleta:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});