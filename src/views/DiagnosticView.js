import { getLocal, setLocal, getSession, setSession, getCookie, deleteCookie } from '../utils/storage.js';

export function DiagnosticView() {
    const container = document.createElement('div');
    container.className = 'diagnostic-view';

    function renderDiagnostic() {
        const themeValue = getLocal('theme') || 'No definido';
        const searchVal = getSession('lastSearch') || 'Ninguna búsqueda reciente';
        const cookieVal = getCookie('visit_counter') || '0';

        container.innerHTML = `
            <h2>Panel de Diagnóstico de Persistencia</h2>
            <p>Visualiza y administra el estado actual de los almacenes del cliente (` + `localStorage, sessionStorage y Cookies` + `).</p>
            
            <div style="display: grid; gap: 1rem; margin-top: 1.5rem;">
                <!-- LocalStorage -->
                <div style="background: #f5f5f5; padding: 1rem; border-radius: 6px; border-left: 4px solid #2196f3;">
                    <h3>LocalStorage (Tema)</h3>
                    <p><strong>Valor actual:</strong> <code>${themeValue}</code></p>
                    <button id="btn-clear-local" style="padding: 6px 12px; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer;">Limpiar LocalStorage</button>
                </div>

                <!-- SessionStorage -->
                <div style="background: #f5f5f5; padding: 1rem; border-radius: 6px; border-left: 4px solid #ff9800;">
                    <h3>SessionStorage (Último filtro/búsqueda)</h3>
                    <p><strong>Valor actual:</strong> <code>${searchVal}</code></p>
                    <button id="btn-clear-session" style="padding: 6px 12px; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer;">Limpiar SessionStorage</button>
                </div>

                <!-- Cookies -->
                <div style="background: #f5f5f5; padding: 1rem; border-radius: 6px; border-left: 4px solid #4caf50;">
                    <h3>Cookies (Contador de visitas)</h3>
                    <p><strong>Valor actual (visitas):</strong> <code>${cookieVal}</code></p>
                    <button id="btn-clear-cookie" style="padding: 6px 12px; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer;">Limpiar Cookie</button>
                </div>
            </div>
        `;

        // Eventos para limpiar de forma independiente
        container.querySelector('#btn-clear-local').addEventListener('click', () => {
            localStorage.removeItem('theme');
            renderDiagnostic();
        });

        container.querySelector('#btn-clear-session').addEventListener('click', () => {
            sessionStorage.removeItem('lastSearch');
            renderDiagnostic();
        });

        container.querySelector('#btn-clear-cookie').addEventListener('click', () => {
            deleteCookie('visit_counter');
            renderDiagnostic();
        });
    }

    renderDiagnostic();
    return container;
}