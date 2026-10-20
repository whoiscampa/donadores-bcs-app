export function NotFoundView() {
    const container = document.createElement('div');
    container.className = 'not-found-view';
    container.innerHTML = `
        <h2>Error 404</h2>
        <p>Página no encontrada.</p>
        <a href="/" data-link>Volver al inicio</a>
    `;
    return container;
}