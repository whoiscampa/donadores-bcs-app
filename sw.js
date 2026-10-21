self.addEventListener('install', (event) => {
    console.log('Service Worker: Se ejecutó el evento install');
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Se ejecutó el evento activate');
});

// Imprimir los requerimientos solicitados en el contexto global del SW
console.log('--- Service Worker Ejecutado ---');
console.log('Contexto global (self.constructor.name):', self.constructor.name);
console.log('typeof window:', typeof window);
console.log('typeof document:', typeof document);
console.log('typeof localStorage:', typeof localStorage);

if (self.registration) {
    console.log('self.registration.scope:', self.registration.scope);
} else {
    console.log('self.registration.scope: Aún no disponible en eleval global inicial');
}