import { HomeView } from '../views/HomeView.js';
import { AboutView } from '../views/AboutView.js';
import { ItemDetailView } from '../views/ItemDetailView.js';
import { DiagnosticView } from '../views/DiagnosticView.js';
import { FavoritesView } from '../views/FavoritesView.js'; // <-- Importar la vista

const routes = {
    '/': HomeView,
    '/about': AboutView,
    '/detalle': ItemDetailView,
    '/diagnostico': DiagnosticView,
    '/favoritos': FavoritesView 
};

export function matchRoute(path) {
    if (routes[path]) {
        return { component: routes[path], params: {} };
    }

    const pathSegments = path.split('/').filter(Boolean);

    for (const routePath in routes) {
        const routeSegments = routePath.split('/').filter(Boolean);

        if (routeSegments.length === pathSegments.length) {
            let params = {};
            let match = true;

            for (let i = 0; i < routeSegments.length; i++) {
                if (routeSegments[i].startsWith(':')) {
                    const paramName = routeSegments[i].slice(1);
                    params[paramName] = pathSegments[i];
                } else if (routeSegments[i] !== pathSegments[i]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                return { component: routes[routePath], params };
            }
        }
    }

    return { component: NotFoundView, params: {} };
}