import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@8/+esm';

const DB_NAME = 'donadores-bcs-db';
const STORE_NAME = 'favoritos';
const DB_VERSION = 1;

export async function initDB() {
    return await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                // Clave primaria 'id' y un índice 'ciudad' para filtrado secundario
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('ciudad_idx', 'ciudad', { unique: false });
            }
        },
    });
}

export async function addFavorito(item) {
    try {
        const db = await initDB();
        await db.put(STORE_NAME, item);
        return { success: true };
    } catch (error) {
        console.error("Error al guardar en IndexedDB:", error);
        throw new Error("No se pudo guardar el elemento en favoritos (error de almacenamiento local).");
    }
}

export async function getFavoritos() {
    try {
        const db = await initDB();
        return await db.getAll(STORE_NAME);
    } catch (error) {
        console.error("Error al leer favoritos:", error);
        return [];
    }
}

export async function getFavoritosByCiudad(ciudad) {
    try {
        const db = await initDB();
        return await db.getAllFromIndex(STORE_NAME, 'ciudad_idx', ciudad);
    } catch (error) {
        console.error("Error al filtrar por índice:", error);
        return [];
    }
}

export async function removeFavorito(id) {
    try {
        const db = await initDB();
        await db.delete(STORE_NAME, id);
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar favorito:", error);
        throw new Error("No se pudo eliminar el registro.");
    }
}