// Variables globales
let flashlightActive = false;
let browserInfo = {};

// 1. Función para detectar información del navegador
function detectBrowserInfo() {
    const userAgent = navigator.userAgent;
    let os = "Desconocido";
    if (/iPhone|iPad|iPod/.test(userAgent)) os = "iOS";
    else if (/Android/.test(userAgent)) os = "Android";
    else if (/Windows/.test(userAgent)) os = "Windows";
    else if (/Mac|Macintosh|Mac OS X/.test(userAgent)) os = "macOS";
    else if (/Linux/.test(userAgent)) os = "Linux";

    let browser = "Desconocido";
    if (/Firefox|FxiOS/.test(userAgent)) browser = "Firefox";
    else if (/Edg|EdgA|EdgiOS/.test(userAgent)) browser = "Edge";
    else if (/Chrome|CriOS/.test(userAgent)) browser = "Chrome";
    else if (/Safari/.test(userAgent)) browser = "Safari";

    browserInfo = {
        os,
        browser,
        isMobile: /iPhone|iPad|iPod|Android/i.test(userAgent)
    };
}

// 2. Crear el ícono de configuración
function createConfigIcon() {
    const configIcon = document.createElement('div');
    configIcon.id = 'config-icon';
    configIcon.className = 'config-icon';
    configIcon.innerHTML = '⚙️';
    document.body.appendChild(configIcon);
    configIcon.addEventListener('click', toggleConfigPanel);
}

// 3. Crear el panel de configuración
function createConfigPanel() {
    const panel = document.createElement('div');
    panel.id = 'config-panel';
    panel.className = 'config-panel';
    panel.innerHTML = `
        <div class="config-header">
            <h3>Configuración</h3>
            <button class="config-close-btn">✕</button>
        </div>
        <div class="config-content">
            <div id="sensors-result">
                <p><strong>Sensores del dispositivo</strong></p>
                <p id="arcore-status">AR: Comprobando...</p>
                <p id="gyroscope-status">Giroscopio: Comprobando...</p>
            </div>
        </div>
    `;
    document.body.appendChild(panel);
    document.querySelector('.config-close-btn').addEventListener('click', toggleConfigPanel);
}

// 4. Función para verificar sensores (versión simplificada)
function checkDeviceSensors() {
    checkARCapability();
    
    // Verificar giroscopio
    if ('DeviceOrientationEvent' in window) {
        document.getElementById('gyroscope-status').textContent = 'Giroscopio: ✓ Disponible';
    } else {
        document.getElementById('gyroscope-status').textContent = 'Giroscopio: ✗ No disponible';
    }
}

// 5. Función para alternar el panel de configuración
function toggleConfigPanel() {
    const panel = document.getElementById('config-panel');
    panel.classList.toggle('visible');
    panel.style.pointerEvents = panel.classList.contains('visible') ? 'auto' : 'none';
}

// 6. Inicialización (usando evento de MindAR)
document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.addEventListener('arReady', () => {
            initConfigPanel();
        });
    } else {
        // Fallback si no hay escena AR
        setTimeout(initConfigPanel, 1000);
    }
});

function initConfigPanel() {
    console.log("Inicializando panel de configuración...");
    detectBrowserInfo();
    createConfigIcon();
    createConfigPanel();
    checkDeviceSensors();
}

// 7. Función para verificar AR (versión mejorada)
function checkARCapability() {
    const arStatus = document.getElementById('arcore-status');
    const scene = document.querySelector('a-scene');
    
    if (scene && scene.systems['mindar-image']) {
        const mindarSystem = scene.systems['mindar-image'];
        arStatus.textContent = mindarSystem.isARSupported ? 
            'AR: ✓ Disponible (MindAR)' : 
            'AR: ✗ No disponible';
    } else {
        arStatus.textContent = 'AR: ✗ MindAR no inicializado';
    }
}