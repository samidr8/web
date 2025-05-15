// Funciones para el panel de configuración
let flashlightActive = false;

// Inicializar panel de configuración
function initConfigPanel() {
    console.log("Inicializando panel de configuración...");

    // Crear el icono de configuración
    createConfigIcon();

    // Crear el panel de configuración (inicialmente oculto)
    createConfigPanel();

    // Comprobar compatibilidad inicial de sensores
    checkDeviceSensors();
}

// Crear icono de configuración
function createConfigIcon() {
    const configIcon = document.createElement('div');
    configIcon.id = 'config-icon';
    configIcon.className = 'config-icon';
    configIcon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"></path></svg>';
    document.body.appendChild(configIcon);

    // Agregar evento de clic
    configIcon.addEventListener('click', toggleConfigPanel);
    
    console.log('Icono de configuración creado');
}

// Crear panel de configuración
function createConfigPanel() {
    // Crear contenedor principal
    const configPanel = document.createElement('div');
    configPanel.id = 'config-panel';
    configPanel.className = 'config-panel';
    
    // Crear contenido del panel
    configPanel.innerHTML = `
        <div class="config-header">
            <h3>Configuración</h3>
            <button class="config-close-btn">✕</button>
        </div>
        <div class="config-content">
            <div class="config-option">
                <label for="flashlight-toggle">Linterna</label>
                <label class="switch">
                    <input type="checkbox" id="flashlight-toggle">
                    <span class="slider round"></span>
                </label>
            </div>
            <div class="config-option">
                <label>Verificar WebGL</label>
                <a href="https://get.webgl.org/" target="_blank" class="config-button">Comprobar</a>
            </div>
            <div class="config-option">
                <label>Información del navegador</label>
                <button id="browser-info-btn" class="config-button">Mostrar</button>
            </div>
            <div class="config-option">
                <label>Sensores del dispositivo</label>
                <button id="check-sensors-btn" class="config-button">Escanear</button>
            </div>
            <div id="sensors-result" class="sensors-result">
                <p id="browser-info">Navegador: Comprobando...</p>
                <p id="accelerometer-status">Acelerómetro: Comprobando...</p>
                <p id="gyroscope-status">Giroscopio: Comprobando...</p>
                <p id="magnetometer-status">Magnetómetro: Comprobando...</p>
                <p id="proximity-status">Sensor de proximidad: Comprobando...</p>
                <p id="light-status">Luz ambiental: Comprobando...</p>
                <p id="gpu-status">GPU: Comprobando...</p>
                <p id="memory-status">Memoria: Comprobando...</p>
                <p id="arcore-status">ARCore: Comprobando...</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(configPanel);
    
    // Agregar eventos
    document.querySelector('.config-close-btn').addEventListener('click', toggleConfigPanel);
    document.getElementById('flashlight-toggle').addEventListener('change', toggleFlashlight);
    document.getElementById('check-sensors-btn').addEventListener('click', checkDeviceSensors);
    document.getElementById('browser-info-btn').addEventListener('click', showBrowserInfo);
    
    console.log('Panel de configuración creado');
}

// Mostrar/Ocultar panel de configuración
function toggleConfigPanel() {
    const configPanel = document.getElementById('config-panel');
    const isVisible = configPanel.classList.contains('visible');
    
    if (isVisible) {
        configPanel.classList.remove('visible');
    } else {
        configPanel.classList.add('visible');
    }
    
    console.log(`Panel de configuración ${isVisible ? 'ocultado' : 'mostrado'}`);
}

// Activar/Desactivar linterna
async function toggleFlashlight() {
    const toggle = document.getElementById('flashlight-toggle');
    
    try {
        if (!window.stream) {
            window.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
        }
        
        const track = window.stream.getVideoTracks()[0];
        
        if (track) {
            const capabilities = track.getCapabilities();
            
            if (capabilities.torch) {
                flashlightActive = !flashlightActive;
                await track.applyConstraints({
                    advanced: [{ torch: flashlightActive }]
                });
                
                toggle.checked = flashlightActive;
                console.log(`Linterna ${flashlightActive ? 'activada' : 'desactivada'}`);
            } else {
                showErrorMessage('Tu dispositivo no soporta el control de la linterna');
                toggle.checked = false;
            }
        } else {
            showErrorMessage('No se pudo acceder a la cámara');
            toggle.checked = false;
        }
    } catch (error) {
        console.error('Error al controlar la linterna:', error);
        showErrorMessage('Error al controlar la linterna. Asegúrate de haber concedido permisos de cámara.');
        toggle.checked = false;
    }
}

// Función auxiliar para mostrar mensajes de error
function showErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    
    setTimeout(() => {
        errorElement.remove();
    }, 3000);
}

// ==================== DETECCIÓN DE NAVEGADOR ====================

function showBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName;
    
    if (userAgent.includes("Firefox")) {
        browserName = "Mozilla Firefox";
    } else if (userAgent.includes("SamsungBrowser")) {
        browserName = "Samsung Browser";
    } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
        browserName = "Opera";
    } else if (userAgent.includes("Trident")) {
        browserName = "Microsoft Internet Explorer";
    } else if (userAgent.includes("Edge")) {
        browserName = "Microsoft Edge";
    } else if (userAgent.includes("Chrome")) {
        browserName = "Google Chrome";
    } else if (userAgent.includes("Safari")) {
        browserName = "Apple Safari";
    } else {
        browserName = "Navegador desconocido";
    }
    
    const platform = navigator.platform;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    document.getElementById('browser-info').textContent = 
        `Navegador: ${browserName} (${isMobile ? 'Móvil' : 'Escritorio'}) - ${platform}`;
}

// ==================== DETECCIÓN DE SENSORES ====================

async function checkAccelerometer() {
    try {
        if ('Accelerometer' in window && typeof Accelerometer === 'function') {
            const accelerometer = new Accelerometer({ frequency: 60 });
            accelerometer.addEventListener('reading', () => {
                document.getElementById('accelerometer-status').textContent = 
                    `Acelerómetro: ✓ Disponible (x: ${accelerometer.x?.toFixed(2) || 'N/A'}, y: ${accelerometer.y?.toFixed(2) || 'N/A'}, z: ${accelerometer.z?.toFixed(2) || 'N/A'})`;
                accelerometer.stop();
            });
            accelerometer.addEventListener('error', (error) => {
                document.getElementById('accelerometer-status').textContent = 
                    'Acelerómetro: ✗ Error (' + error.error.message + ')';
            });
            accelerometer.start();
        } else if ('DeviceMotionEvent' in window) {
            let timeout;
            
            const handleMotion = (event) => {
                if (event.accelerationIncludingGravity) {
                    clearTimeout(timeout);
                    const { x, y, z } = event.accelerationIncludingGravity;
                    document.getElementById('accelerometer-status').textContent = 
                        `Acelerómetro: ✓ Disponible (x: ${x?.toFixed(2) || 'N/A'}, y: ${y?.toFixed(2) || 'N/A'}, z: ${z?.toFixed(2) || 'N/A'})`;
                    window.removeEventListener('devicemotion', handleMotion);
                }
            };
            
            window.addEventListener('devicemotion', handleMotion);
            
            // Timeout para navegadores que no disparan el evento
            timeout = setTimeout(() => {
                document.getElementById('accelerometer-status').textContent = 'Acelerómetro: ✗ No disponible (timeout)';
                window.removeEventListener('devicemotion', handleMotion);
            }, 3000);

            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                try {
                    const permission = await DeviceMotionEvent.requestPermission();
                    if (permission !== 'granted') {
                        document.getElementById('accelerometer-status').textContent = 'Acelerómetro: ✗ Permiso denegado';
                        clearTimeout(timeout);
                        return;
                    }
                } catch (error) {
                    document.getElementById('accelerometer-status').textContent = 'Acelerómetro: ✗ Error de permiso (' + error.message + ')';
                    clearTimeout(timeout);
                    return;
                }
            }
        } else {
            document.getElementById('accelerometer-status').textContent = 'Acelerómetro: ✗ No disponible';
        }
    } catch (error) {
        document.getElementById('accelerometer-status').textContent = 'Acelerómetro: ✗ Error (' + error.message + ')';
    }
}

async function checkGyroscope() {
    try {
        if ('Gyroscope' in window && typeof Gyroscope === 'function') {
            const gyroscope = new Gyroscope({ frequency: 60 });
            gyroscope.addEventListener('reading', () => {
                document.getElementById('gyroscope-status').textContent = 
                    `Giroscopio: ✓ Disponible (x: ${gyroscope.x?.toFixed(2) || 'N/A'}, y: ${gyroscope.y?.toFixed(2) || 'N/A'}, z: ${gyroscope.z?.toFixed(2) || 'N/A'})`;
                gyroscope.stop();
            });
            gyroscope.addEventListener('error', (error) => {
                document.getElementById('gyroscope-status').textContent = 
                    'Giroscopio: ✗ Error (' + error.error.message + ')';
            });
            gyroscope.start();
        } else if ('DeviceMotionEvent' in window) {
            let timeout;
            
            const handleMotion = (event) => {
                if (event.rotationRate) {
                    clearTimeout(timeout);
                    const { alpha, beta, gamma } = event.rotationRate;
                    document.getElementById('gyroscope-status').textContent = 
                        `Giroscopio: ✓ Disponible (α: ${alpha?.toFixed(2) || 'N/A'}, β: ${beta?.toFixed(2) || 'N/A'}, γ: ${gamma?.toFixed(2) || 'N/A'})`;
                    window.removeEventListener('devicemotion', handleMotion);
                }
            };
            
            window.addEventListener('devicemotion', handleMotion);
            
            // Timeout para navegadores que no disparan el evento
            timeout = setTimeout(() => {
                document.getElementById('gyroscope-status').textContent = 'Giroscopio: ✗ No disponible (timeout)';
                window.removeEventListener('devicemotion', handleMotion);
            }, 3000);

            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                try {
                    const permission = await DeviceMotionEvent.requestPermission();
                    if (permission !== 'granted') {
                        document.getElementById('gyroscope-status').textContent = 'Giroscopio: ✗ Permiso denegado';
                        clearTimeout(timeout);
                        return;
                    }
                } catch (error) {
                    document.getElementById('gyroscope-status').textContent = 'Giroscopio: ✗ Error de permiso (' + error.message + ')';
                    clearTimeout(timeout);
                    return;
                }
            }
        } else {
            document.getElementById('gyroscope-status').textContent = 'Giroscopio: ✗ No disponible';
        }
    } catch (error) {
        document.getElementById('gyroscope-status').textContent = 'Giroscopio: ✗ Error (' + error.message + ')';
    }
}

async function checkMagnetometer() {
    try {
        if ('Magnetometer' in window && typeof Magnetometer === 'function') {
            const magnetometer = new Magnetometer({ frequency: 60 });
            magnetometer.addEventListener('reading', () => {
                document.getElementById('magnetometer-status').textContent = 
                    `Magnetómetro: ✓ Disponible (x: ${magnetometer.x?.toFixed(2) || 'N/A'}, y: ${magnetometer.y?.toFixed(2) || 'N/A'}, z: ${magnetometer.z?.toFixed(2) || 'N/A'})`;
                magnetometer.stop();
            });
            magnetometer.addEventListener('error', (error) => {
                document.getElementById('magnetometer-status').textContent = 
                    'Magnetómetro: ✗ Error (' + error.error.message + ')';
            });
            magnetometer.start();
        } else if ('DeviceOrientationEvent' in window) {
            let timeout;
            
            const handleOrientation = (event) => {
                clearTimeout(timeout);
                const heading = event.webkitCompassHeading || event.alpha;
                document.getElementById('magnetometer-status').textContent = 
                    `Magnetómetro: ✓ Disponible (heading: ${heading?.toFixed(2) || 'N/A'}°)`;
                window.removeEventListener('deviceorientation', handleOrientation);
            };
            
            window.addEventListener('deviceorientation', handleOrientation);
            
            // Timeout para navegadores que no disparan el evento
            timeout = setTimeout(() => {
                document.getElementById('magnetometer-status').textContent = 'Magnetómetro: ✗ No disponible (timeout)';
                window.removeEventListener('deviceorientation', handleOrientation);
            }, 3000);

            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const permission = await DeviceOrientationEvent.requestPermission();
                    if (permission !== 'granted') {
                        document.getElementById('magnetometer-status').textContent = 'Magnetómetro: ✗ Permiso denegado';
                        clearTimeout(timeout);
                        return;
                    }
                } catch (error) {
                    document.getElementById('magnetometer-status').textContent = 'Magnetómetro: ✗ Error de permiso (' + error.message + ')';
                    clearTimeout(timeout);
                    return;
                }
            }
        } else {
            document.getElementById('magnetometer-status').textContent = 'Magnetómetro: ✗ No disponible';
        }
    } catch (error) {
        document.getElementById('magnetometer-status').textContent = 'Magnetómetro: ✗ Error (' + error.message + ')';
    }
}

function checkProximitySensor() {
    try {
        if ('ProximitySensor' in window && typeof ProximitySensor === 'function') {
            const proximitySensor = new ProximitySensor();
            proximitySensor.addEventListener('reading', () => {
                document.getElementById('proximity-status').textContent = 
                    `Proximidad: ✓ Disponible (${proximitySensor.near ? 'Cerca' : 'Lejos'})`;
                proximitySensor.stop();
            });
            proximitySensor.addEventListener('error', (error) => {
                document.getElementById('proximity-status').textContent = 
                    'Proximidad: ✗ Error (' + error.error.message + ')';
            });
            proximitySensor.start();
        } else if ('ondeviceproximity' in window) {
            window.addEventListener('deviceproximity', (event) => {
                document.getElementById('proximity-status').textContent = 
                    `Proximidad: ✓ Disponible (${event.near ? 'Cerca' : 'Lejos'})`;
            });
            
            // Timeout para navegadores que no disparan el evento
            setTimeout(() => {
                if (document.getElementById('proximity-status').textContent.includes('Comprobando')) {
                    document.getElementById('proximity-status').textContent = 'Proximidad: ✗ No disponible (timeout)';
                }
            }, 3000);
        } else {
            document.getElementById('proximity-status').textContent = 'Proximidad: ✗ No disponible';
        }
    } catch (error) {
        document.getElementById('proximity-status').textContent = 'Proximidad: ✗ Error (' + error.message + ')';
    }
}

function checkAmbientLight() {
    try {
        if ('AmbientLightSensor' in window && typeof AmbientLightSensor === 'function') {
            const lightSensor = new AmbientLightSensor();
            lightSensor.addEventListener('reading', () => {
                document.getElementById('light-status').textContent = 
                    `Luz ambiental: ✓ Disponible (${lightSensor.illuminance} lux)`;
                lightSensor.stop();
            });
            lightSensor.addEventListener('error', (error) => {
                document.getElementById('light-status').textContent = 
                    'Luz ambiental: ✗ Error (' + error.error.message + ')';
            });
            lightSensor.start();
        } else {
            document.getElementById('light-status').textContent = 'Luz ambiental: ✗ No disponible';
        }
    } catch (error) {
        document.getElementById('light-status').textContent = 'Luz ambiental: ✗ Error (' + error.message + ')';
    }
}

function checkGPU() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            let gpuInfo = 'No detectada';
            
            if (debugInfo) {
                try {
                    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    gpuInfo = `${vendor} - ${renderer}`;
                } catch (e) {
                    // Algunos navegadores bloquean esta información
                    gpuInfo = 'Información restringida';
                }
            }
            
            document.getElementById('gpu-status').textContent = `GPU: ${gpuInfo}`;
        } else {
            document.getElementById('gpu-status').textContent = 'WebGL: ✗ No disponible';
        }
    } catch (error) {
        document.getElementById('gpu-status').textContent = 'GPU: ✗ Error (' + error.message + ')';
    }
}

function checkDeviceMemory() {
    try {
        if ('deviceMemory' in navigator) {
            // Algunos navegadores reportan incorrectamente la memoria
            const reportedMemory = navigator.deviceMemory;
            let memoryText;
            
            if (reportedMemory < 0.5) {
                memoryText = 'Menos de 0.5 GB (posible error)';
            } else if (reportedMemory >= 0.5 && reportedMemory < 2) {
                memoryText = `${reportedMemory} GB (baja capacidad)`;
            } else if (reportedMemory >= 2 && reportedMemory < 4) {
                memoryText = `${reportedMemory} GB (capacidad media)`;
            } else {
                memoryText = `${reportedMemory} GB (alta capacidad)`;
            }
            
            document.getElementById('memory-status').textContent = `Memoria: ${memoryText}`;
        } else {
            // Intentar detectar memoria de otras formas
            if (window.performance && window.performance.memory) {
                const jsHeapSizeLimit = window.performance.memory.jsHeapSizeLimit;
                const memoryInGB = (jsHeapSizeLimit / (1024 * 1024 * 1024)).toFixed(1);
                document.getElementById('memory-status').textContent = `Memoria JS: ~${memoryInGB} GB (estimado)`;
            } else {
                document.getElementById('memory-status').textContent = 'Memoria: ✗ No disponible';
            }
        }
    } catch (error) {
        document.getElementById('memory-status').textContent = 'Memoria: ✗ Error (' + error.message + ')';
    }
}

// Función principal para verificar todos los sensores
async function checkDeviceSensors() {
    console.log('Comprobando sensores y hardware...');
    
    // Mostrar información del navegador primero
    showBrowserInfo();
    
    // Sensores
    await checkAccelerometer();
    await checkGyroscope();
    await checkMagnetometer();
    checkProximitySensor();
    checkAmbientLight();
    
    // Hardware
    checkGPU();
    checkDeviceMemory();
    
    // ARCore/WebXR
    checkARSupport();
}

// Función mejorada para verificar soporte AR
function checkARSupport() {
    const arcoreStatus = document.getElementById('arcore-status');
    
    if ('xr' in navigator) {
        navigator.xr.isSessionSupported('immersive-ar')
            .then(supported => {
                arcoreStatus.textContent = `ARCore/WebXR: ${supported ? '✓ Disponible' : '✗ No disponible'}`;
            })
            .catch(err => {
                console.error('Error al verificar soporte AR:', err);
                arcoreStatus.textContent = 'ARCore/WebXR: ✗ Error al verificar';
            });
    } else {
        // Verificar si es Firefox que tiene implementación diferente
        if (navigator.userAgent.includes('Firefox')) {
            arcoreStatus.textContent = 'ARCore: ✗ No soportado en Firefox (usa Chrome/Edge)';
        } else {
            arcoreStatus.textContent = 'ARCore/WebXR: ✗ No disponible';
        }
    }
}

// Evento para inicializar cuando la página esté cargada
window.addEventListener('load', function() {
    setTimeout(initConfigPanel, 3000);
});