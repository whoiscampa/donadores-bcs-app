export async function ItemDetailView(params) {
    const container = document.createElement('div');
    container.className = 'item-detail-view';

    container.innerHTML = `<h2>Cargando información del centro...</h2>`;

    try {
        // Importación dinámica exigida en el ejercicio
        const { getItemById } = await import('../services/itemsService.js');
        const item = getItemById(params.id);

        if (!item) {
            container.innerHTML = `
                <h2>Centro no encontrado</h2>
                <a href="/" data-link>Volver al inicio</a>
            `;
            return container;
        }

        container.innerHTML = `
            <h2>${item.nombre}</h2>
            <p><strong>Ciudad:</strong> ${item.ciudad}</p>
            <p><strong>Tipo:</strong> ${item.tipo}</p>
            <p><strong>Horario:</strong> ${item.horario}</p>
            <br>
            <button id="back-btn" class="btn-back">Volver al listado</button>
        `;

        container.querySelector('#back-btn').addEventListener('click', () => {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
        });

    } catch (error) {
        container.innerHTML = `<h2>Error al cargar el detalle.</h2>`;
    }

    return container;
}