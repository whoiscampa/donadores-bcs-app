import { getItems } from '../services/apiService.js';
import { createItemCard } from '../components/ItemCard.js';
import { getSession, setSession } from '../utils/storage.js'; 

export function HomeView() { 
    const container = document.createElement('div');
    container.className = 'home-view';
    container.innerHTML = `
        <h2>Centros de Donación de Sangre en BCS</h2>
        <p>Conoce los centros disponibles en Baja California Sur para donación de sangre.</p>
        
        <!-- Input de búsqueda con persistencia en sessionStorage -->
        <div style="margin-bottom: 1rem;">
            <input type="text" id="search-input" placeholder="Filtrar por nombre o ciudad..." 
                   style="padding: 8px; width: 100%; max-width: 300px; border: 1px solid #ccc; border-radius: 4px;">
        </div>

        <div class="items-grid" id="items-grid">
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        </div>
    `;

    const grid = container.querySelector('#items-grid');
    const searchInput = container.querySelector('#search-input');
    const filtroGuardado = getSession('lastSearch') || '';

    if (searchInput) {
        searchInput.value = filtroGuardado;
    }

    async function cargarDatos() {
        try {
            const items = await getItems();
            grid.innerHTML = '';
            const textoFiltro = searchInput.value.toLowerCase();
            const itemsFiltrados = items.filter(item => 
                item.nombre.toLowerCase().includes(textoFiltro) || 
                item.ciudad.toLowerCase().includes(textoFiltro)
            );

            if (itemsFiltrados.length === 0) {
                grid.innerHTML = `<p>No se encontraron centros que coincidan con la búsqueda.</p>`;
                return;
            }

            itemsFiltrados.forEach(item => {
                grid.appendChild(createItemCard(item));
            });

        } catch (error) {
            let mensajeError = "Ocurrió un error inesperado al conectar con el servidor.";

            if (error.type === 'TIMEOUT_ERROR') {
                mensajeError = "⏱️ El servidor está tardando demasiado en responder. Por favor, verifica tu conexión.";
            } else if (error.type === 'NETWORK_ERROR') {
                mensajeError = "📡 Error de red o CORS. No hay conexión con el servidor o el acceso está bloqueado.";
            } else if (error.type === 'SERVER_ERROR') {
                mensajeError = `🛠️ Error del servidor (Código ${error.status}). El servidor no pudo procesar la solicitud.`;
            }

            grid.innerHTML = `
                <div style="background: #ffebee; color: #b71c1c; padding: 1.5rem; border-radius: 8px; grid-column: 1 / -1; border-left: 5px solid #d32f2f;">
                    <p><strong>¡Atención!</strong></p>
                    <p>${mensajeError}</p>
                    <button onclick="location.reload()" style="margin-top: 10px; padding: 6px 12px; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer;">Reintentar manualmente</button>
                </div>
            `;
        }
    }

    searchInput?.addEventListener('input', (e) => {
        setSession('lastSearch', e.target.value);
        cargarDatos();
    });
    cargarDatos();

    return container; 
}