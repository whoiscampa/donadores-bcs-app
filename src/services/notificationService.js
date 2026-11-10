// src/services/notificationService.js

export async function solicitarPermisoNotificaciones() {
    if (!("Notification" in window)) {
        alert("Este navegador no soporta notificaciones de escritorio.");
        return 'unsupported';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission;
    }

    return Notification.permission;
}

export function obtenerEstadoPermiso() {
    if (!("Notification" in window)) return 'unsupported';
    return Notification.permission;
}

export async function mostrarNotificacionSincronizacion(cantidadRegistros = 1) {
    if (Notification.permission !== 'granted') {
        console.warn("No hay permisos para mostrar notificaciones.");
        return;
    }

    const title = "DonadoresBCS — Sincronización Exitosa";
    const options = {
        body: `¡Se han sincronizado ${cantidadRegistros} registro(s) pendiente(s) desde el modo offline!`,
        icon: './icons/icon-192.png',
        badge: './icons/icon-192.png',
        tag: 'sync-exitoso-tag',
        data: {
            url: './'
        }
    };

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.active) {
            await registration.showNotification(title, options);
        } else {
            // Plan B nativo por si el Service Worker no está disponible en localhost
            new Notification(title, options);
        }
    } catch (error) {
        console.error("Error al mostrar notificación, usando fallback nativo:", error);
        try {
            new Notification(title, options);
        } catch (err) {
            alert("No se pudo desplegar la notificación: " + err.message);
        }
    }
}