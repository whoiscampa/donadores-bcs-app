let deferredPrompt = null;

function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isRunningStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export function initInstallPrompt() {
    const installBtn = document.getElementById('install-btn');
    if (!installBtn) return;
    if (isRunningStandalone()) {
        console.log('[PWA] La aplicación ya se está ejecutando en modo instalado.');
        installBtn.style.display = 'none';
        return;
    }

    if (isIOS()) {
        console.log('[PWA] Dispositivo iOS detectado. Activando Plan B.');
        installBtn.style.display = 'inline-block'; 
        
        installBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Para instalar "DonadoresBCS" en tu dispositivo iOS:\n\n1. Toca el botón "Compartir" en tu navegador.\n2. Selecciona "Agregar a pantalla de inicio".');
        });
        return; 
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
    
        installBtn.style.display = 'inline-block';
        console.log('Evento beforeinstallprompt guardado correctamente.');
    });

    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Resultado de la instalación: ${outcome}`);
        deferredPrompt = null;
        installBtn.style.display = 'none';
    });

    window.addEventListener('appinstalled', () => {
        console.log('¡La aplicación fue instalada con éxito!');
        installBtn.style.display = 'none';
        deferredPrompt = null;
    });
}