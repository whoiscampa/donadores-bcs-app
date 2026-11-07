import { getLocal, setLocal, getSession, setSession, getCookie, deleteCookie } from '../utils/storage.js';
import { addToOutbox, getOutboxItems } from '../services/dbService.js';
import { sincronizarColaManual } from '../services/syncService.js';

export function DiagnosticView() {
    const container = document.createElement('div');
    container.className = 'diagnostic-view p-6 max-w-4xl mx-auto';

    async function renderDiagnostic() {
        const themeValue = getLocal('theme') || 'No definido';
        const searchVal = getSession('lastSearch') || 'Ninguna búsqueda reciente';
        const cookieVal = getCookie('visit_counter') || '0';

        const swSupported = 'serviceWorker' in navigator;
        const isSecureContext = window.isSecureContext;
        const hasSyncManager = 'serviceWorker' in navigator && 'SyncManager' in window;
        // (para forzar que se muestre el Plan B y su botón):
        //const hasSyncManager = false;
        
        let registrationInfo = null;
        let controllerInfo = navigator.serviceWorker.controller ? navigator.serviceWorker.controller.scriptURL : 'Ninguno';
        let outboxItems = [];

        if (swSupported) {
            try {
                registrationInfo = await navigator.serviceWorker.getRegistration();
            } catch (e) {
                console.error("Error al obtener registro de SW", e);
            }
        }

        try {
            outboxItems = await getOutboxItems();
        } catch (e) {
            console.error("Error al leer outbox", e);
        }
        if (!hasSyncManager && navigator.onLine && outboxItems.length > 0) {
            sincronizarColaManual().then(() => renderDiagnostic());
        }

        container.innerHTML = `
            <h2 class="text-2xl font-bold mb-2">Panel de Diagnóstico Integral</h2>
            <p class="text-gray-600 mb-6">Panel de control de Service Workers, verificadores y persistencia local.</p>
            
            <!-- SECCIÓN FORMULARIO COLA OFFLINE (CON SOPORTE PLAN B) -->
            <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); padding: 1.5rem; margin-bottom: 1.5rem; border-left: 5px solid #b91c1c;">
                <h3 style="font-size: 1.25rem; font-weight: 700; color: #b91c1c; margin-bottom: 0.25rem;">Cola Offline (Outbox & Background Sync)</h3>
                <p style="font-size: 0.85rem; color: #6b7280; margin-bottom: 1rem;">Registra una solicitud de donación para guardarla primero en IndexedDB antes de enviarla.</p>
                
                <!-- ESTADO DEL MODO Y PLAN B -->
                <div style="background: ${hasSyncManager ? '#f0fdf4' : '#fff7ed'}; border: 1px solid ${hasSyncManager ? '#bbf7d0' : '#fed7aa'}; border-radius: 6px; padding: 0.85rem; margin-bottom: 1.25rem;">
                    <p style="font-weight: 700; color: ${hasSyncManager ? '#166534' : '#9a3412'}; font-size: 0.85rem; margin-bottom: 0.2rem;">
                        Modo: ${hasSyncManager ? 'Background Sync Nativo (Automático)' : 'Plan B (Manual / Evento Online)'}
                    </p>
                    <p style="font-size: 0.8rem; color: ${hasSyncManager ? '#15803d' : '#7c2d12'}; margin-bottom: ${hasSyncManager ? '0' : '0.65rem'};">
                        ${hasSyncManager 
                            ? 'Tu navegador soporta sincronización nativa en segundo plano.' 
                            : 'SyncManager no disponible. Se usará el Plan B automático (evento online) y manual.'}
                    </p>
                    ${!hasSyncManager ? `
                        <button id="btn-reintentar-manual" style="background: #ea580c; color: white; border: none; padding: 0.45rem 0.9rem; border-radius: 4px; font-weight: 600; font-size: 0.8rem; cursor: pointer;">
                            Reintentar ahora (Plan B)
                        </button>
                    ` : ''}
                </div>

                <form id="form-solicitud-offline" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem;">
                    <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #374151; margin-bottom: 0.3rem;">Nombre del Donante</label>
                        <input type="text" id="nombreDonante" required placeholder="Ej. Juan Pérez" style="width: 100%; padding: 0.65rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; outline: none;">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #374151; margin-bottom: 0.3rem;">Tipo de Sangre</label>
                            <input type="text" id="tipoSangre" required placeholder="Ej. O+" style="width: 100%; padding: 0.65rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; outline: none;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #374151; margin-bottom: 0.3rem;">Hospital de Destino</label>
                            <input type="text" id="hospitalDestino" required placeholder="Ej. Hospital Salvatierra" style="width: 100%; padding: 0.65rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; outline: none;">
                        </div>
                    </div>

                    <div>
                        <button type="submit" style="background: #b91c1c; color: white; border: none; padding: 0.7rem 1.25rem; border-radius: 6px; font-weight: 600; font-size: 0.9rem; cursor: pointer;">
                            Guardar Solicitud Offline (Outbox)
                        </button>
                    </div>
                </form>

                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-weight: 700; color: #374151; font-size: 0.85rem;">Elementos pendientes en la cola:</span>
                        <span style="background: #fee2e2; color: #991b1b; padding: 0.1rem 0.5rem; border-radius: 9999px; font-weight: 700; font-size: 0.8rem;">${outboxItems.length}</span>
                    </div>
                    <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.85rem; color: #4b5563;">
                        ${outboxItems.length > 0 
                            ? outboxItems.map(item => `<li style="margin-bottom: 0.25rem;"><strong>${item.nombreDonante}</strong> (${item.tipoSangre}) — ${item.hospitalDestino}</li>`).join('') 
                            : '<li style="list-style: none; margin-left: -1.2rem; font-style: italic; color: #9ca3af;">No hay solicitudes pendientes en la cola.</li>'}
                    </ul>
                </div>
            </div>

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

            <!-- SECCIÓN: SCOPE INVÁLIDO A PROPÓSITO -->
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

        const formOffline = container.querySelector('#form-solicitud-offline');
        if (formOffline) {
            formOffline.addEventListener('submit', async (e) => {
                e.preventDefault();
                const solicitud = {
                    nombreDonante: container.querySelector('#nombreDonante').value,
                    tipoSangre: container.querySelector('#tipoSangre').value,
                    hospitalDestino: container.querySelector('#hospitalDestino').value
                };

                try {
                    await addToOutbox(solicitud);
                    alert("¡Solicitud guardada en el Outbox de IndexedDB con éxito!");

                    if (hasSyncManager) {
                        const registration = await navigator.serviceWorker.ready;
                        await registration.sync.register('sync-donaciones-pendientes');
                        console.log("Background Sync registrado correctamente.");
                    } else {
                        console.log("SyncManager no disponible. Usando flujo Plan B.");
                    }

                    renderDiagnostic();
                } catch (error) {
                    console.error("Error al encolar la solicitud:", error);
                    alert("Hubo un error al guardar localmente.");
                }
            });
        }

        const btnReintentar = container.querySelector('#btn-reintentar-manual');
        if (btnReintentar) {
            btnReintentar.addEventListener('click', async () => {
                btnReintentar.textContent = 'Sincronizando...';
                const exito = await sincronizarColaManual();
                if (exito) {
                    alert("¡Sincronización manual (Plan B) completada con éxito!");
                    renderDiagnostic();
                } else {
                    alert("Hubo un error al sincronizar.");
                    btnReintentar.textContent = 'Reintentar ahora (Plan B)';
                }
            });
        }

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