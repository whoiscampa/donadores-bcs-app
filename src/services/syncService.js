import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@8/+esm';

export async function sincronizarColaManual() {
    try {
        const db = await openDB('donadores-bcs-db', 2);
        
        // Usamos el método directo de la librería idb (maneja la transacción automáticamente)
        const items = await db.getAll('outbox');

        if (!items || items.length === 0) {
            console.log("No hay elementos pendientes en la cola local.");
            return true;
        }

        console.log(`Intentando sincronizar ${items.length} elementos (Modo Plan B / Manual)...`);

        for (const item of items) {
            console.log(`[Sync] Enviando al servidor donación de: ${item.nombreDonante}`);
            
            // Simulación de envío exitoso al servidor (aquí iría tu fetch POST real si lo deseas)
            // const response = await fetch('/api/donaciones', { method: 'POST', body: JSON.stringify(item) });

            // Eliminamos usando la API limpia de idb
            await db.delete('outbox', item.id);
            console.log(`Elemento ID ${item.id} enviado y eliminado del outbox con éxito.`);
        }

        return true;
    } catch (error) {
        console.error("Error en la sincronización manual:", error);
        return false;
    }
}