/**
 * @param {object} centro 
 */
export async function compartirCentro(centro) {
    const datosCompartir = {
        title: `Centro de Donación: ${centro.nombre}`,
        text: `Te comparto la información de este centro en Baja California Sur:\n- Nombre: ${centro.nombre}\n- Dirección: ${centro.direccion}\n- Tipo: ${centro.tipo || 'Hospital / Centro'}\n`,
        url: window.location.href
    };
    if (navigator.share && navigator.canShare && navigator.canShare(datosCompartir)) {
        try {
            await navigator.share(datosCompartir);
            console.log("Contenido compartido exitosamente.");
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log("El usuario canceló la acción de compartir.");
            } else {
                console.error("Error al intentar compartir:", error);
                fallbackPortapapeles(datosCompartir);
            }
        }
    } else {
        fallbackPortapapeles(datosCompartir);
    }
}

function fallbackPortapapeles(datos) {
    const textoCompleto = `${datos.title}\n${datos.text}\nMás info en: ${datos.url}`;
    
    navigator.clipboard.writeText(textoCompleto)
        .then(() => {
            alert("📋 Enlace y datos copiados al portapapeles (Tu navegador no soporta el menú de compartir nativo).");
        })
        .catch(err => {
            console.error("Error al copiar al portapapeles:", err);
            alert("No fue posible compartir ni copiar el contenido.");
        });
}