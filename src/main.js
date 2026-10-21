import { matchRoute } from './router/router.js';
import { getLocal, setLocal, getCookie, setCookie } from './utils/storage.js';
import { registerServiceWorker } from './services/registerSW.js';

const temaGuardado = getLocal('theme') || 'light';
document.documentElement.setAttribute('data-theme', temaGuardado);
let visitas = parseInt(getCookie('visit_counter') || '0');
visitas++;
setCookie('visit_counter', visitas, 30);

async function navigateTo(url) {
    window.history.pushState({}, '', url);
    await handleRender();
}

async function handleRender() {
    const path = window.location.pathname; 
    const { component, params } = matchRoute(path);
    const app = document.getElementById('app');
    app.innerHTML = '';
    const viewElement = await component(params);
    app.appendChild(viewElement);
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', e => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });

    window.addEventListener('popstate', handleRender);
    handleRender();
});

window.addEventListener('load', () => {
    registerServiceWorker();
});

window.verCache = async () => {
    const names = await caches.keys();
    console.log("Cachés existentes:", names);
    for (const name of names) {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        console.log(`--- Contenido de la caché: ${name} ---`);
        requests.forEach(req => console.log(req.url));
    }
};

window.borrarRecursoCache = async (urlRecurso) => {
    const names = await caches.keys();
    for (const name of names) {
        const cache = await caches.open(name);
        const deleted = await cache.delete(urlRecurso);
        if (deleted) {
            console.log(`[Depuración] ¡Eliminado con éxito de ${name}: ${urlRecurso}`);
            return true;
        }
    }
    console.log(`[Depuración] No se encontró el recurso: ${urlRecurso}`);
    return false;
};