// ===== Funciones modificadas =====

// 1. Reemplazar la inicialización con evento de MindAR
function initConfigPanel() {
    console.log("Inicializando panel de configuración...");
    detectBrowserInfo();
    createConfigIcon();
    createConfigPanel();
    checkDeviceSensors();

    // Escuchar eventos de MindAR
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.addEventListener('targetFound', () => {
            console.log("Objetivo detectado");
            // Opcional: Pausar sensores cuando se detecta un objetivo
        });
        scene.addEventListener('targetLost', () => {
            console.log("Objetivo perdido");
        });
    }
}

// 2. Simplificar la verificación de AR
function checkARCapability() {
    const arStatus = document.getElementById('arcore-status');
    const scene = document.querySelector('a-scene');
    
    if (scene && scene.systems['mindar-image']) {
        const mindarSystem = scene.systems['mindar-image'];
        if (mindarSystem.isARSupported) {
            arStatus.textContent = browserInfo.isIOS ? 
                'ARKit: ✓ Disponible (MindAR)' : 
                'ARCore: ✓ Disponible (MindAR)';
        } else {
            arStatus.textContent = browserInfo.isIOS ? 
                'ARKit: ✗ No disponible' : 
                'ARCore: ✗ No disponible';
        }
    } else {
        arStatus.textContent = 'AR: ✗ MindAR no inicializado';
    }
}

// 3. Asegurar que el panel no bloquee los eventos de MindAR
function toggleConfigPanel() {
    const configPanel = document.getElementById('config-panel');
    if (configPanel) {
        configPanel.classList.toggle('visible');
        // Asegurar que el panel no intercepte eventos de AR
        configPanel.style.pointerEvents = configPanel.classList.contains('visible') ? 'auto' : 'none';
    }
}

// ===== Inicialización final =====
// Reemplazar el evento 'load' con el evento 'arReady' de MindAR
document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.addEventListener('arReady', () => {
            console.log("MindAR listo - Inicializando panel de configuración");
            initConfigPanel();
        });
    } else {
        console.error("No se encontró la escena de A-Frame");
    }
});