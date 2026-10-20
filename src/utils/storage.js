export function setLocal(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn("localStorage no disponible o lleno:", e);
        mostrarAvisoNoBloqueante("Advertencia: No se pudieron guardar las preferencias (almacenamiento lleno o bloqueado).");
    }
}

export function getLocal(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        return null;
    }
}

export function setSession(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn("sessionStorage no disponible:", e);
    }
}

export function getSession(key) {
    try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        return null;
    }
}

export function setCookie(name, value, days) {
    try {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
    } catch (e) {
        console.warn("Error al escribir cookie:", e);
    }
}

export function getCookie(name) {
    try {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
        return null;
    } catch (e) {
        return null;
    }
}

export function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function mostrarAvisoNoBloqueante(mensaje) {
    let aviso = document.getElementById('storage-warning');
    if (!aviso) {
        aviso = document.createElement('div');
        aviso.id = 'storage-warning';
        aviso.style.cssText = "position: fixed; bottom: 10px; right: 10px; background: #ff9800; color: white; padding: 10px 15px; border-radius: 5px; z-index: 9999; font-size: 14px;";
        document.body.appendChild(aviso);
    }
    aviso.textContent = mensaje;
    setTimeout(() => aviso.remove(), 5000);
}