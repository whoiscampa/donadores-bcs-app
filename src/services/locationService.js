/**
 * @returns {Promise<GeolocationPosition>} U
 */
export const obtenerUbicaciónPuntual = () => {
    return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
            reject("Tu navegador no soporta la Geolocalización API.");
            return;
        }
        const opciones = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        const exito = (posicion) => {
            console.log("Ubicación obtenida con éxito:", posicion);
            resolve(posicion);
        };

        const error = (error) => {
            console.error("Error en Geolocalización:", error);
            switch (error.code) {
                case error.PERMISSION_DENIED: 
                    reject("Permiso denegado por el usuario.");
                    break;
                case error.POSITION_UNAVAILABLE: 
                    reject("La información de ubicación no está disponible (puedes activarla en Sensors).");
                    break;
                case error.TIMEOUT: 
                    reject("Tiempo de espera agotado al obtener la ubicación.");
                    break;
                default:
                    reject("Ocurrió un error desconocido al obtener la ubicación.");
                    break;
            }
        };
        navigator.geolocation.getCurrentPosition(exito, error, opciones);
    });
};