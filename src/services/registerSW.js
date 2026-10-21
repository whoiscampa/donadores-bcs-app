export async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.warn('Los Service Workers no son compatibles con este navegador.');
        return;
    }

    try {
        const basePath = window.location.pathname.includes('/donadores-bcs-app') 
            ? '/donadores-bcs-app/' 
            : '/';

        const swUrl = `${basePath}sw.js`;
        const swScope = basePath;

        console.log(`Intentando registrar Service Worker desde: ${swUrl} con scope: ${swScope}`);
        const registration = await navigator.serviceWorker.register(swUrl, {
            scope: swScope
        });

        console.log('¡Service Worker registrado con éxito!', registration);
        console.log('Scope actual:', registration.scope);

    } catch (error) {
        console.error('Falla en el registro del Service Worker:', error);
    }
}