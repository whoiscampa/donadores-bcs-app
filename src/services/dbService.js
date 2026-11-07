import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@8/+esm';

const DB_NAME = 'donadores-bcs-db';
const STORE_FAV = 'favoritos';
const STORE_OUTBOX = 'outbox';
const DB_VERSION = 2; 

export async function initDB() {
    return await openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
            if (!db.objectStoreNames.contains(STORE_FAV)) {
                const store = db.createObjectStore(STORE_FAV, { keyPath: 'id' });
                store.createIndex('ciudad_idx', 'ciudad', { unique: false });
            }
            if (!db.objectStoreNames.contains(STORE_OUTBOX)) {
                db.createObjectStore(STORE_OUTBOX, { keyPath: 'id', autoIncrement: true });
            }
        },
    });
}

export async function addFavorito(item) {
    try {
        const db = await initDB();
        await db.put(STORE_FAV, item);
        return { success: true };
    } catch (error) {
        console.error("Error al guardar en IndexedDB:", error);
        throw new Error("No se pudo guardar el elemento en favoritos.");
    }
}

export async function getFavoritos() {
    try {
        const db = await initDB();
        return await db.getAll(STORE_FAV);
    } catch (error) {
        console.error("Error al leer favoritos:", error);
        return [];
    }
}

export async function getFavoritosByCiudad(ciudad) {
    try {
        const db = await initDB();
        return await db.getAllFromIndex(STORE_FAV, 'ciudad_idx', ciudad);
    } catch (error) {
        console.error("Error al filtrar por índice:", error);
        return [];
    }
}

export async function removeFavorito(id) {
    try {
        const db = await initDB();
        await db.delete(STORE_FAV, id);
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar favorito:", error);
        throw new Error("No se pudo eliminar el registro.");
    }
}

export async function addToOutbox(solicitud) {
    try {
        const db = await initDB();
        const id = await db.add(STORE_OUTBOX, {
            ...solicitud,
            timestamp: new Date().toISOString()
        });
        return { success: true, id };
    } catch (error) {
        console.error("Error al guardar en outbox:", error);
        throw new Error("No se pudo encolar la solicitud offline.");
    }
}

export async function getOutboxItems() {
    try {
        const db = await initDB();
        return await db.getAll(STORE_OUTBOX);
    } catch (error) {
        console.error("Error al leer la cola outbox:", error);
        return [];
    }
}

export async function removeFromOutbox(id) {
    try {
        const db = await initDB();
        await db.delete(STORE_OUTBOX, id);
        return { success: true };
    } catch (error) {
        console.error("Error al eliminar elemento de outbox:", error);
    }
}