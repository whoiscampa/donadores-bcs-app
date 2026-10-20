import { matchRoute } from './router/router.js';
import { getLocal, setLocal, getCookie, setCookie } from './utils/storage.js';

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