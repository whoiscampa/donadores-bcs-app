import { addFavorito, getFavoritos, getFavoritosByCiudad, removeFavorito } from '../services/dbService.js';

export async function FavoritesView() {
    const container = document.createElement('div');
    container.className = 'favorites-view';
    container.style.padding = '1.5rem';

    container.innerHTML = `
        <h2>Mis Centros de Donación Guardados</h2>
        <p>Administra tus centros favoritos. Los datos se almacenan localmente y sobreviven a recargas (F5).</p>

        <!-- Feedback visual no bloqueante -->
        <div id="db-feedback" style="display: none; margin-bottom: 1rem; padding: 10px; border-radius: 4px;"></div>

        <!-- Formulario para agregar un registro -->
        <div style="background: #f9f9f9; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid #ddd;">
            <h3>Agregar Centro a Favoritos</h3>
            <form id="fav-form" style="display: grid; gap: 0.8rem; max-width: 400px; margin-top: 0.5rem;">
                <input type="text" id="fav-nombre" placeholder="Nombre del Centro" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                <select id="fav-ciudad" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    <option value="">Selecciona una ciudad</option>
                    <option value="La Paz">La Paz</option>
                    <option value="San José del Cabo">San José del Cabo</option>
                    <option value="Cabo San Lucas">Cabo San Lucas</option>
                    <option value="Santa Rosalía">Santa Rosalía</option>
                </select>
                <input type="text" id="fav-tipo" placeholder="Tipo (ej. Banco de Sangre)" required style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                <button type="submit" style="padding: 8px 16px; background: #b71c1c; color: white; border: none; border-radius: 4px; cursor: pointer;">Guardar</button>
            </form>
        </div>

        <!-- Control de filtrado usando el índice -->
        <div style="margin-bottom: 1rem; display: flex; gap: 1rem; align-items: center;">
            <label for="filter-ciudad"><strong>Filtrar por Ciudad (Índice):</strong></label>
            <select id="filter-ciudad" style="padding: 6px; border: 1px solid #ccc; border-radius: 4px;">
                <option value="TODOS">Todos los registros</option>
                <option value="La Paz">La Paz</option>
                <option value="San José del Cabo">San José del Cabo</option>
                <option value="Cabo San Lucas">Cabo San Lucas</option>
                <option value="Santa Rosalía">Santa Rosalía</option>
            </select>
        </div>

        <!-- Listado -->
        <div id="fav-list" style="display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
            <p>Cargando favoritos...</p>
        </div>
    `;

    const form = container.querySelector('#fav-form');
    const listContainer = container.querySelector('#fav-list');
    const filterSelect = container.querySelector('#filter-ciudad');
    const feedback = container.querySelector('#db-feedback');

    function mostrarFeedback(mensaje, esError = false) {
        feedback.style.display = 'block';
        feedback.style.background = esError ? '#ffebee' : '#e8f5e9';
        feedback.style.color = esError ? '#b71c1c' : '#2e7d32';
        feedback.style.border = esError ? '1px solid #f44336' : '1px solid #4caf50';
        feedback.textContent = mensaje;
        setTimeout(() => { feedback.style.display = 'none'; }, 4000);
    }

    async function renderList(ciudadFiltro = 'TODOS') {
        try {
            let items = [];
            if (ciudadFiltro === 'TODOS') {
                items = await getFavoritos();
            } else {
                items = await getFavoritosByCiudad(ciudadFiltro);
            }

            listContainer.innerHTML = '';

            if (items.length === 0) {
                listContainer.innerHTML = `<p style="grid-column: 1/-1; color: #666;">No hay registros guardados.</p>`;
                return;
            }

            items.forEach(item => {
                const card = document.createElement('div');
                card.style.cssText = "background: #fff; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #b71c1c;";
                card.innerHTML = `
                    <h4 style="margin: 0 0 0.5rem 0;">${item.nombre}</h4>
                    <p style="margin: 0.3rem 0;"><strong>Ciudad:</strong> ${item.ciudad}</p>
                    <p style="margin: 0.3rem 0;"><strong>Tipo:</strong> ${item.tipo}</p>
                    <button data-id="${item.id}" class="btn-delete" style="margin-top: 0.8rem; padding: 6px 12px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">Eliminar</button>
                `;
                listContainer.appendChild(card);
            });

            container.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = Number(e.target.getAttribute('data-id'));
                    try {
                        await removeFavorito(id);
                        mostrarFeedback("Registro eliminado correctamente.");
                        renderList(filterSelect.value);
                    } catch (err) {
                        mostrarFeedback("Error al eliminar el registro.", true);
                    }
                });
            });

        } catch (error) {
            listContainer.innerHTML = `<p style="color: red;">Error al cargar los datos de IndexedDB.</p>`;
        }
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nuevoItem = {
            id: Date.now(),
            nombre: container.querySelector('#fav-nombre').value,
            ciudad: container.querySelector('#fav-ciudad').value,
            tipo: container.querySelector('#fav-tipo').value
        };

        try {
            await addFavorito(nuevoItem);
            mostrarFeedback("¡Centro guardado exitosamente en IndexedDB!");
            form.reset();
            renderList(filterSelect.value);
        } catch (error) {
            mostrarFeedback(error.message, true);
        }
    });

    filterSelect.addEventListener('change', (e) => {
        renderList(e.target.value);
    });

    renderList();

    return container;
}