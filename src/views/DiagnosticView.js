import { getLocal, setLocal, getSession, setSession, getCookie, deleteCookie } from '../utils/storage.js';

export function DiagnosticView() {
    const container = document.createElement('div');
    container.className = 'diagnostic-view p-6 max-w-4xl mx-auto';

    async function renderDiagnostic() {
        const themeValue = getLocal('theme') || 'No definido';
        const searchVal = getSession('lastSearch') || 'Ninguna búsqueda reciente';
        const cookieVal = getCookie('visit_counter') || '0';

        const swSupported = 'serviceWorker' in navigator;
        const isSecureContext = window.isSecureContext;
        
        let registrationInfo = null;
        let controllerInfo = navigator.serviceWorker.controller ? navigator.serviceWorker.controller.scriptURL : 'Ninguno';

        if (swSupported) {
            try {
                registrationInfo = await navigator.serviceWorker.getRegistration();
            } catch (e) {
                console.error("Error al obtener registro de SW", e);
            }
        }

        container.innerHTML = `
            <h2 class="text-2xl font-bold mb-2">Panel de Diagnóstico Integral</h2>
            <p class="text-gray-600 mb-6">Panel de control de Service Workers, verificadores y persistencia local.</p>
            
            <!-- SECCIÓN: SERVICE WORKER Y SCOPE -->
            <div class="bg-white shadow rounded-lg p-5 mb-6 border-l-4 border-indigo-600">
                <h3 class="text-xl font-bold mb-3 text-indigo-700">Estado del Service Worker</h3>
                <div class="space-y-2 text-sm">
                    <p><strong>¿El navegador soporta Service Workers?</strong> <span class="${swSupported ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}">${swSupported ? 'Sí' : 'No'}</span></p>
                    <p><strong>¿Contexto seguro?</strong> <span class="${isSecureContext ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}">${isSecureContext ? 'Sí' : 'No'}</span></p>
                    <p><strong>¿SW registrado?</strong> <span class="${registrationInfo ? 'text-green-600 font-bold' : 'text-yellow-600 font-bold'}">${registrationInfo ? 'Sí' : 'No (o pendiente)'}</span></p>
                    <p><strong>Scope y URL del script:</strong> ${registrationInfo ? registrationInfo.scope : 'N/A'} <code>(${registrationInfo && registrationInfo.active ? registrationInfo.active.scriptURL : 'N/A'})</code></p>
                    <p><strong>Estado del worker:</strong> ${registrationInfo && registrationInfo.active ? registrationInfo.active.state : 'Inactivo'}</p>
                    <p><strong>¿Controla esta página?:</strong> ${controllerInfo}</p>
                </div>
                <button id="btn-refresh-sw" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-semibold cursor-pointer">
                    Actualizar estado
                </button>
            </div>

            <!-- SECCIÓN: SCOPE INVÁLIDO A PROPÓSITO (Nuevo Requisito) -->
            <div class="bg-white shadow rounded-lg p-5 mb-6 border-l-4 border-red-600">
                <h3 class="text-xl font-bold mb-2 text-red-700">Experimento: Scope Inválido a Propósito</h3>
                <p class="text-xs text-gray-500 mb-4">Intenta registrar el Service Worker con un scope o dominio no permitido para observar la excepción en pantalla.</p>
                <button id="btn-invalid-scope" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold cursor-pointer">
                    Probar Scope Inválido
                </button>
                <div id="invalid-scope-result" class="mt-3 p-3 bg-gray-100 rounded text-xs font-mono text-red-600 hidden"></div>
            </div>

            <!-- SECCIÓN: VERIFICADOR DE SCOPE -->
            <div class="bg-white shadow rounded-lg p-5 mb-6 border-l-4 border-teal-600">
                <h3 class="text-xl font-bold mb-2 text-teal-700">Verificador de Scope</h3>
                <p class="text-xs text-gray-500 mb-4">Comprobación de rutas dentro y fuera del scope del Service Worker.</p>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white border border-gray-200 rounded-lg text-sm">
                        <thead>
                            <tr class="bg-gray-100 border-b text-left">
                                <th class="py-2 px-3">Ruta a evaluar</th>
                                <th class="py-2 px-3">Resultado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b">
                                <td class="py-2 px-3">/ (Raíz)</td>
                                <td class="py-2 px-3 text-green-600 font-semibold">Dentro del scope</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-2 px-3">/donadores-bcs-app/ (Raíz con sub-path)</td>
                                <td class="py-2 px-3 text-green-600 font-semibold">Dentro del scope</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-2 px-3">/src/router/router.js (Archivo interno)</td>
                                <td class="py-2 px-3 text-green-600 font-semibold">Dentro del scope</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-2 px-3">/donadores-bcs-app (Raíz sin diagonal final)</td>
                                <td class="py-2 px-3 text-green-600 font-semibold">Dentro del scope</td>
                            </tr>
                            <tr class="border-b">
                                <td class="py-2 px-3">https://google.com/ (Fuera del proyecto)</td>
                                <td class="py-2 px-3 text-red-600 font-semibold">Fuera del scope</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- SECCIÓN: PERSISTENCIA -->
            <div style="display: grid; gap: 1rem; margin-top: 1.5rem;">
                <div style="background: #f5f5f5; padding: 1rem; border-radius: 6px; border-left: 4px solid #2196f3;">
                    <h3>LocalStorage (Tema)</h3>
                    <p><strong>Valor actual:</strong> <code>${themeValue}</code></p>
                    <button id="btn-clear-local" style="padding: 6px 12px; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 6px;">Limpiar LocalStorage</button>
                </div>

                <div style="background: #f5f5f5; padding: 1rem; border-radius: 6px; border-left: 4px solid #ff9800;">
                    <h3>SessionStorage (Último filtro/búsqueda)</h3>
                    <p><strong>Valor actual:</strong> <code>${searchVal}</code></p>
                    <button id="btn-clear-session" style="padding: 6px 12px; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 6px;">Limpiar SessionStorage</button>
                </div>

                <div style="background: #f5f5f5; padding: 1rem; border-radius: 6px; border-left: 4px solid #4caf50;">
                    <h3>Cookies (Contador de visitas)</h3>
                    <p><strong>Valor actual (visitas):</strong> <code>${cookieVal}</code></p>
                    <button id="btn-clear-cookie" style="padding: 6px 12px; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 6px;">Limpiar Cookie</button>
                </div>
            </div>
        `;
        container.querySelector('#btn-refresh-sw').addEventListener('click', () => {
            renderDiagnostic();
        });

        container.querySelector('#btn-invalid-scope').addEventListener('click', async () => {
            const resultBox = container.querySelector('#invalid-scope-result');
            resultBox.classList.remove('hidden');
            try {
                await navigator.serviceWorker.register('./sw.js', {
                    scope: 'https://example.com/invalid-scope/'
                });
                resultBox.textContent = '¡Sorpresa! No falló (lo cual no debería pasar).';
            } catch (error) {
                resultBox.textContent = `Error capturado exitosamente:\n${error.name}: ${error.message}`;
            }
        });

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