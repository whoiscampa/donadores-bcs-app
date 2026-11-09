import { obtenerUbicaciónPuntual } from '../services/locationService.js';
import { compartirCentro } from '../services/shareService.js';

export function CentrosView() {
    const container = document.createElement('div');
    container.className = 'centros-view p-6 max-w-7xl mx-auto';

    let ubicacionObtenida = false;
    let cargandoUbicacion = false;
    let mensajeError = '';
    let permisoEstado = 'unknown';
    let radioKm = 100;
    let ultimaCoordenada = null;

    const centrosOficialesBCS = [
        // --- LA PAZ ---
        { id: 1, nombre: 'Centro Estatal de Transfusión Sanguínea (CETS)', lat: 24.1442, lng: -110.3128, direccion: 'Nicolás Bravo esq. Josefa Ortiz, La Paz', tipo: 'Banco de Sangre Central', zona: 'La Paz' },
        { id: 2, nombre: 'Hospital General Salvatierra', lat: 24.1165, lng: -110.3158, direccion: 'Av. De los Deportistas, La Paz', tipo: 'Hospital General', zona: 'La Paz' },
        { id: 3, nombre: 'IMSS HGZ No. 1 (La Paz)', lat: 24.1422, lng: -110.3115, direccion: 'Calle 5 de Febrero e Héroes de Independencia, La Paz', tipo: 'IMSS', zona: 'La Paz' },
        { id: 4, nombre: 'IMSS UMF No. 34', lat: 24.1290, lng: -110.3080, direccion: 'Av. J. M. Morelos, La Paz', tipo: 'IMSS', zona: 'La Paz' },
        { id: 5, nombre: 'Hospital General ISSSTE La Paz', lat: 24.1385, lng: -110.3180, direccion: 'Bravo y México, La Paz', tipo: 'ISSSTE', zona: 'La Paz' },

        // --- LOS CABOS ---
        { id: 6, nombre: 'Hospital General Cabo San Lucas', lat: 22.8945, lng: -109.9192, direccion: 'Calle Aguajito, Cabo San Lucas', tipo: 'Hospital General', zona: 'Los Cabos' },
        { id: 7, nombre: 'IMSS UMF / HGSZ No. 38 (San José del Cabo)', lat: 23.0611, lng: -109.7025, direccion: 'Blvd. Mijares, San José del Cabo', tipo: 'IMSS', zona: 'Los Cabos' },
        { id: 8, nombre: 'IMSS UMF No. 26 (Cabo San Lucas)', lat: 22.8980, lng: -109.9150, direccion: 'Carretera a Todos Santos, Cabo San Lucas', tipo: 'IMSS', zona: 'Los Cabos' },
        { id: 9, nombre: 'Hospital General San José del Cabo', lat: 23.0550, lng: -109.7080, direccion: 'Col. Guaymitas, San José del Cabo', tipo: 'Hospital General', zona: 'Los Cabos' },
        { id: 10, nombre: 'Clínica Hospital ISSSTE Cabo San Lucas', lat: 22.9010, lng: -109.9210, direccion: 'Prol. Leona Vicario, Cabo San Lucas', tipo: 'ISSSTE', zona: 'Los Cabos' },

        // --- COMONDÚ ---
        { id: 11, nombre: 'Hospital General Ciudad Constitución', lat: 25.0312, lng: -111.6701, direccion: 'Comondú, Cd. Constitución', tipo: 'Hospital General', zona: 'Comondú' },
        { id: 12, nombre: 'IMSS HGSZ No. 2 (Cd. Constitución)', lat: 25.0340, lng: -111.6680, direccion: 'Blvd. Agustín Olachea, Cd. Constitución', tipo: 'IMSS', zona: 'Comondú' },

        // --- MULEGÉ ---
        { id: 13, nombre: 'Hospital General Santa Rosalía', lat: 27.3305, lng: -112.2711, direccion: 'Mulegé, Santa Rosalía', tipo: 'Hospital General', zona: 'Mulegé' },
        { id: 14, nombre: 'IMSS HGSZ No. 5 (Guerrero Negro)', lat: 27.9680, lng: -114.0320, direccion: 'Av. División del Norte, Guerrero Negro', tipo: 'IMSS', zona: 'Mulegé' },

        // --- LORETO ---
        { id: 15, nombre: 'Hospital Comunitario de Loreto', lat: 26.0124, lng: -111.3431, direccion: 'Loreto, BCS', tipo: 'Hospital Comunitario', zona: 'Loreto' },
        { id: 16, nombre: 'IMSS UMF No. 11 (Loreto)', lat: 26.0150, lng: -111.3460, direccion: 'Calle Salvatierra, Loreto', tipo: 'IMSS', zona: 'Loreto' }
    ];

    let centrosFiltradosPorRadio = [];

    function calcularDistancia(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    async function consultarPermiso() {
        if (!("permissions" in navigator)) return;
        try {
            const status = await navigator.permissions.query({ name: 'geolocation' });
            permisoEstado = status.state;
            render(); 

            status.onchange = () => {
                permisoEstado = status.state;
                render();
            };
        } catch (error) {
            console.error("Error al consultar permisos:", error);
        }
    }

    async function procesarUbicacion(lat, lng, kmLimite) {
        ultimaCoordenada = { lat, lng };
        
        const conDistancia = centrosOficialesBCS.map(centro => ({
            ...centro,
            distancia: calcularDistancia(lat, lng, centro.lat, centro.lng)
        })).sort((a, b) => a.distancia - b.distancia);

        centrosFiltradosPorRadio = conDistancia.filter(c => c.distancia <= kmLimite);
        ubicacionObtenida = true;
        render();
    }

    async function handleObtenerUbicacion() {
        if (cargandoUbicacion) return;

        cargandoUbicacion = true;
        mensajeError = '';
        radioKm = 100;
        render();

        try {
            const posicion = await obtenerUbicaciónPuntual();
            const { latitude, longitude } = posicion.coords;
            await procesarUbicacion(latitude, longitude, radioKm);
        } catch (error) {
            console.error("Error en geolocalización:", error);
            mensajeError = error;
            ubicacionObtenida = false;
            centrosFiltradosPorRadio = [];

            if (error.includes("denegado")) {
                await consultarPermiso();
            }
            render();
        } finally {
            cargandoUbicacion = false;
        }
    }

    function expandirRadar() {
        if (!ultimaCoordenada) return;
        radioKm += 10;
        procesarUbicacion(ultimaCoordenada.lat, ultimaCoordenada.lng, radioKm);
    }

    function render() {
        container.innerHTML = `
            <h2 class="text-3xl font-bold mb-6 text-indigo-900">Centros de Donación en BCS</h2>
            
            <div class="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
                <div class="flex items-start gap-4">
                    <div class="p-3 bg-indigo-100 rounded-full text-indigo-700 flex-shrink-0">
                        <svg width="32" height="32" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    
                    <div class="flex-grow">
                        <h3 class="text-xl font-semibold text-gray-800">Radar de Proximidad</h3>
                        
                        <div style="display: ${ubicacionObtenida ? 'none' : 'block'};" class="mt-2">
                            <p class="text-gray-600 mb-4 text-sm leading-relaxed">
                                La vista se encuentra vacía por privacidad. Haz clic en el botón para detectar tu ubicación y mostrar únicamente los hospitales (IMSS, ISSSTE, CETS y Salud Pública) en un radio inicial de 100 km.
                            </p>
                            
                            <button id="btn-geolocalizar" 
                                class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition bg-indigo-600 hover:bg-indigo-700 text-white
                                ${cargandoUbicacion ? 'opacity-70 cursor-not-allowed' : ''} 
                                ${permisoEstado === 'denied' ? 'bg-gray-400 hover:bg-gray-500' : ''}"
                                ${cargandoUbicacion ? 'disabled' : ''}>
                                ${cargandoUbicacion ? `
                                    <svg width="20" height="20" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Escaneando radar...
                                ` : 'Ver mi ubicación y centros cercanos'}
                            </button>

                            ${permisoEstado === 'denied' ? `
                                <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center gap-2">
                                    <svg width="20" height="20" class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
                                    Acceso a ubicación bloqueado en el navegador. Permítelo para usar el radar.
                                </div>
                            ` : ''}

                            ${mensajeError ? `
                                <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs font-mono flex items-center gap-2">
                                    Error: ${mensajeError}
                                </div>
                            ` : ''}
                        </div>

                        <div style="display: ${ubicacionObtenida ? 'block' : 'none'};" class="mt-2 text-sm text-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <span class="font-semibold text-green-700 flex items-center gap-1.5">
                                    <svg width="20" height="20" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Ubicación activa — Mostrando radar de <strong>${radioKm} km</strong> (${centrosFiltradosPorRadio.length} centros encontrados)
                                </span>
                            </div>
                            <button id="btn-expandir-radar" 
                                class="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition flex items-center gap-1.5 self-start">
                                📡 Expandir radar (+10 km)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CONTENEDOR DE LA LISTA DE CENTROS -->
            <div id="lista-centros" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${!ubicacionObtenida ? `
                    <div class="col-span-full bg-gray-50 border border-dashed border-gray-300 rounded-lg p-12 text-center">
                        <svg width="48" height="48" class="mx-auto text-gray-400 mb-3 w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 11c0 3.517-3 7.5-3 7.5s-3-3.983-3-7.5a3 3 0 116 0z"></path><circle cx="12" cy="11" r="1" stroke="currentColor" stroke-width="1.5"></circle></svg>
                        <h4 class="text-lg font-medium text-gray-700">Vista vacía por seguridad</h4>
                        <p class="text-sm text-gray-500 mt-1">Presiona <strong>"Ver mi ubicación y centros cercanos"</strong> para activar el radar de proximidad.</p>
                    </div>
                ` : centrosFiltradosPorRadio.length === 0 ? `
                    <div class="col-span-full bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center text-yellow-800">
                        <h4 class="text-base font-semibold">No hay centros en este radio de ${radioKm} km</h4>
                        <p class="text-xs mt-1">Prueba haciendo clic en el botón superior <strong>"Expandir radar (+10 km)"</strong> para buscar más lejos.</p>
                    </div>
                ` : centrosFiltradosPorRadio.map(centro => `
                    <div class="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative hover:border-indigo-200 transition">
                        <span class="absolute top-4 right-4 bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <svg width="14" height="14" class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-1-7.59L7.71 9.71a1 1 0 0 1 1.42-1.42L10 9.17l.88-.88a1 1 0 0 1 1.42 1.42L11.41 11.41l.88.88a1 1 0 0 1-1.42 1.42L10 12.83l-.88.88a1 1 0 0 1-1.42-1.42L8.59 10.41Z"/></svg>
                            ${centro.distancia.toFixed(1)} km
                        </span>
                        
                        <div class="flex items-center gap-2 mb-1.5">
                            <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">${centro.tipo}</span>
                            <span class="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">📍 ${centro.zona}</span>
                        </div>
                        
                        <h4 class="text-lg font-semibold text-indigo-900 pr-16">${centro.nombre}</h4>
                        
                        <p class="text-gray-600 text-sm mt-2 flex items-start gap-1.5">
                            <svg width="16" height="16" class="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span>${centro.direccion}</span>
                        </p>
                        
                        <button class="btn-share mt-4 px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition" 
                            data-id="${centro.id}">
                            <svg width="16" height="16" class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-3.316l6.632-3.316m0 0a3 3 0 100-3 3 3 0 000 3m0 0l6.632-3.316m-6.632 3.316l6.632 3.316m0 0a3 3 0 100-3 3 3 0 000 3z"></path></svg>
                            Compartir ficha
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        const btnGeo = container.querySelector('#btn-geolocalizar');
        if (btnGeo) {
            btnGeo.addEventListener('click', handleObtenerUbicacion);
        }

        const btnExpandir = container.querySelector('#btn-expandir-radar');
        if (btnExpandir) {
            btnExpandir.addEventListener('click', expandirRadar);
        }

        const buttonsShare = container.querySelectorAll('.btn-share');
        buttonsShare.forEach(btn => {
            const centroId = Number(btn.dataset.id);
            btn.addEventListener('click', () => {
                const centroEncontrado = centrosOficialesBCS.find(c => c.id === centroId);
                if (centroEncontrado) {
                    compartirCentro(centroEncontrado);
                }
            });
        });
    }

    consultarPermiso();
    render();

    return container;
}