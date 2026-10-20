import { slugify } from '../utils/slugify.js';

export function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    const slug = slugify(item.nombre);

    card.innerHTML = `
        <h3>${item.nombre}</h3>
        <p><strong>Ciudad:</strong> ${item.ciudad}</p>
        <p><strong>Tipo:</strong> ${item.tipo}</p>
        <p><small class="slug-tag">Slug: ${slug}</small></p>
        <button class="btn-detail" data-id="${item.id}">Ver Detalles</button>
    `;

    card.querySelector('.btn-detail').addEventListener('click', () => {
        window.history.pushState({}, '', `/item/${item.id}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
    });

    return card;
}