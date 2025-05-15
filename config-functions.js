// Funciones para el panel de configuración
let flashlightActive = false;
let sensorCheckInProgress = false;

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
                <label>Sensores del dispositivo</label>
                <button id="check-sensors-btn" class="config-button">Escanear</button>
            </div>
            <div id="sensors-result" class="sensors-result">
                <p id="accelerometer-status">Acelerómetro: No verificado</p>
                <p id="gyroscope-status">Giroscopio: No verificado</p>
                <p id="magnetometer-status">Magnetómetro: No verificado</p>
                <p id="proximity-status">Sensor de proximidad: No verificado</p>
                <p id="light-status">Luz ambiental: No verificado</p>
                <p id="gpu-status">GPU: No verificado</p>
                <p id="memory-status">Memoria RAM: No verificado</p>
                <p id="arcore-status">ARCore: No verificado</p>
                <p id="browser-info">Navegador: Detectando...</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(configPanel);
    
    // Agregar eventos
    document.querySelector('.config-close-btn').addEventListener('click', toggleConfigPanel);
    document.getElementById('flashlight-toggle').addEventListener('change', toggleFlashlight);
    document.getElementById('check-sensors-btn').addEventListener('click', checkDeviceSensors);
    
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

// ==================== DETECCIÓN MEJORADA DE SENSORES ====================

// Función para detectar el navegador
function detectBrowser() {
    const userAgent = navigator.userAgent;
    let browserName;
    
    if (userAgent.match(/chrome|chromium|crios/i)) {
        browserName = "Chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
        browserName = "Firefox";
    } else if (userAgent.match(/safari/i)) {
        browserName = "Safari";
    } else if (userAgent.match(/opr\//i)) {
        browserName = "Opera";
    } else if (userAgent.match(/edg/i)) {
        browserName = "Edge";
    } else if (userAgent.match(/brave/i)) {
        browserName = "Brave";
    } else {
        browserName = "Otro navegador";
    }
    
    document.getElementById('browser-info').textContent = `Navegador: ${browserName} ${navigator.userAgent.match(/\b(MSIE|rv:|Firefox|Chrome|Safari|Opera|Brave)\b\/\d+\.\d+/i)?.[0] || ''}`;
}

// Función mejorada para detectar acelerómetro
async function checkAccelerometer() {
    document.getElementById('accelerometer-status').textContent = 'Acelerómetro: Comprobando...';
    
    try {
        // Primero intentamos con la API genérica de sensores
        if ('Accelerometer' in window && window.Accelerometer) {
            const accelerometer = new Accelerometer({ frequency: 60 });
            
            return new Promise((resolve) => {
                accelerometer.addEventListener('reading', () => {
                    document.getElementById('accelerometer-status').textContent = 
                        `Acelerómetro: ✓ Disponible (x: ${accelerometer.x?.toFixed(2) || 'N/A'}, y: ${accelerometer.y?.toFixed(2) || 'N/A'}, z: ${accelerometer.z?.toFixed(2) || 'N/A'})`;
                    accelerometer.stop();
                    resolve();
                });
                
                accelerometer.addEventListener('error', (error) => {
                    console.error('Error en acelerómetro:', error);
                    fallbackAccelerometerCheck();
                    resolve();
                });
                
                accelerometer.start();
            });
        } else {
            fallbackAccelerometerCheck();
        }
    } catch (error) {
        console.error('Error en checkAccelerometer:', error);
        fallbackAccelerometerCheck();
    }
}

function fallbackAccelerometerCheck() {
    if ('DeviceMotionEvent' in window) {
        let timeout;
        const handleMotion = (event) => {
            clearTimeout(timeout);
            if (event.accelerationIncludingGravity) {
                const { x, y, z } = event.accelerationIncludingGravity;
                document.getElementById('accelerometer-status').textContent = 
                    `Acelerómetro: ✓ Disponible (x: ${x?.toFixed(2) || 'N/A'}, y: ${y?.toFixed(2) || 'N/A'}, z: ${z?.toFixed(2) || 'N/A'})`;
                window.removeEventListener('devicemotion', handleMotion);
            }
        };
        
        window.addEventListener('devicemotion', handleMotion);
        
        // Timeout por si no llegan datos
        timeout = setTimeout(() => {
            window.removeEventListener('devicemotion', handleMotion);
            document.getElementById('accelerometer-status').textContent = 
                'Acelerómetro: ✗ No disponible (sin datos)';
        }, 2000);
        
        // En iOS necesitamos solicitar permiso
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('devicemotion', handleMotion);
                    } else {
                        document.getElementById('accelerometer-status').textContent = 
                            'Acelerómetro: ✗ Permiso denegado';
                    }
                })
                .catch(error => {
                    document.getElementById('accelerometer-status').textContent = 
                        'Acelerómetro: ✗ Error de permiso';
                });
        }
    } else {
        document.getElementById('accelerometer-status').textContent = 'Acelerómetro: ✗ No disponible';
    }
}

// Función mejorada para detectar giroscopio
async function checkGyroscope() {
    document.getElementById('gyroscope-status').textContent = 'Giroscopio: Comprobando...';
    
    try {
        if ('Gyroscope' in window && window.Gyroscope) {
            const gyroscope = new Gyroscope({ frequency: 60 });
            
            return new Promise((resolve) => {
                gyroscope.addEventListener('reading', () => {
                    document.getElementById('gyroscope-status').textContent = 
                        `Giroscopio: ✓ Disponible (x: ${gyroscope.x?.toFixed(2) || 'N/A'}, y: ${gyroscope.y?.toFixed(2) || 'N/A'}, z: ${gyroscope.z?.toFixed(2) || 'N/A'})`;
                    gyroscope.stop();
                    resolve();
                });
                
                gyroscope.addEventListener('error', (error) => {
                    console.error('Error en giroscopio:', error);
                    fallbackGyroscopeCheck();
                    resolve();
                });
                
                gyroscope.start();
            });
        } else {
            fallbackGyroscopeCheck();
        }
    } catch (error) {
        console.error('Error en checkGyroscope:', error);
        fallbackGyroscopeCheck();
    }
}

function fallbackGyroscopeCheck() {
    if ('DeviceMotionEvent' in window) {
        let timeout;
        const handleMotion = (event) => {
            clearTimeout(timeout);
            if (event.rotationRate) {
                const { alpha, beta, gamma } = event.rotationRate;
                document.getElementById('gyroscope-status').textContent = 
                    `Giroscopio: ✓ Disponible (α: ${alpha?.toFixed(2) || 'N/A'}, β: ${beta?.toFixed(2) || 'N/A'}, γ: ${gamma?.toFixed(2) || 'N/A'})`;
                window.removeEventListener('devicemotion', handleMotion);
            }
        };
        
        window.addEventListener('devicemotion', handleMotion);
        
        timeout = setTimeout(() => {
            window.removeEventListener('devicemotion', handleMotion);
            document.getElementById('gyroscope-status').textContent = 
                'Giroscopio: ✗ No disponible (sin datos)';
        }, 2000);
        
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('devicemotion', handleMotion);
                    } else {
                        document.getElementById('gyroscope-status').textContent = 
                            'Giroscopio: ✗ Permiso denegado';
                    }
                })
                .catch(error => {
                    document.getElementById('gyroscope-status').textContent = 
                        'Giroscopio: ✗ Error de permiso';
                });
        }
    } else {
        document.getElementById('gyroscope-status').textContent = 'Giroscopio: ✗ No disponible';
    }
}

// Función mejorada para detectar magnetómetro
async function checkMagnetometer() {
    document.getElementById('magnetometer-status').textContent = 'Magnetómetro: Comprobando...';
    
    try {
        if ('Magnetometer' in window && window.Magnetometer) {
            const magnetometer = new Magnetometer({ frequency: 60 });
            
            return new Promise((resolve) => {
                magnetometer.addEventListener('reading', () => {
                    document.getElementById('magnetometer-status').textContent = 
                        `Magnetómetro: ✓ Disponible (x: ${magnetometer.x?.toFixed(2) || 'N/A'}, y: ${magnetometer.y?.toFixed(2) || 'N/A'}, z: ${magnetometer.z?.toFixed(2) || 'N/A'})`;
                    magnetometer.stop();
                    resolve();
                });
                
                magnetometer.addEventListener('error', (error) => {
                    console.error('Error en magnetómetro:', error);
                    fallbackMagnetometerCheck();
                    resolve();
                });
                
                magnetometer.start();
            });
        } else {
            fallbackMagnetometerCheck();
        }
    } catch (error) {
        console.error('Error en checkMagnetometer:', error);
        fallbackMagnetometerCheck();
    }
}

function fallbackMagnetometerCheck() {
    if ('DeviceOrientationEvent' in window) {
        let timeout;
        const handleOrientation = (event) => {
            clearTimeout(timeout);
            const heading = event.webkitCompassHeading || event.alpha;
            if (heading !== undefined) {
                document.getElementById('magnetometer-status').textContent = 
                    `Magnetómetro: ✓ Disponible (heading: ${heading?.toFixed(2) || 'N/A'}°)`;
                window.removeEventListener('deviceorientation', handleOrientation);
            }
        };
        
        window.addEventListener('deviceorientation', handleOrientation);
        
        timeout = setTimeout(() => {
            window.removeEventListener('deviceorientation', handleOrientation);
            document.getElementById('magnetometer-status').textContent = 
                'Magnetómetro: ✗ No disponible (sin datos)';
        }, 2000);
        
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    } else {
                        document.getElementById('magnetometer-status').textContent = 
                            'Magnetómetro: ✗ Permiso denegado';
                    }
                })
                .catch(error => {
                    document.getElementById('magnetometer-status').textContent = 
                        'Magnetómetro: ✗ Error de permiso';
                });
        }
    } else {
        document.getElementById('magnetometer-status').textContent = 'Magnetómetro: ✗ No disponible';
    }
}

// Función mejorada para detectar sensor de proximidad
function checkProximitySensor() {
    document.getElementById('proximity-status').textContent = 'Sensor de proximidad: Comprobando...';
    
    try {
        if ('ProximitySensor' in window) {
            const proximitySensor = new ProximitySensor();
            
            proximitySensor.addEventListener('reading', () => {
                document.getElementById('proximity-status').textContent = 
                    `Proximidad: ✓ Disponible (${proximitySensor.near ? 'Cerca' : 'Lejos'})`;
                proximitySensor.stop();
            });
            
            proximitySensor.addEventListener('error', (error) => {
                console.error('Error en sensor de proximidad:', error);
                document.getElementById('proximity-status').textContent = 
                    'Proximidad: ✗ No disponible';
            });
            
            proximitySensor.start();
        } else if ('ondeviceproximity' in window) {
            window.addEventListener('deviceproximity', (event) => {
                document.getElementById('proximity-status').textContent = 
                    `Proximidad: ✓ Disponible (${event.near ? 'Cerca' : 'Lejos'})`;
            });
        } else {
            document.getElementById('proximity-status').textContent = 'Proximidad: ✗ No disponible';
        }
    } catch (error) {
        console.error('Error en checkProximitySensor:', error);
        document.getElementById('proximity-status').textContent = 'Proximidad: ✗ Error';
    }
}

// Función para detectar luz ambiental
function checkAmbientLight() {
    document.getElementById('light-status').textContent = 'Luz ambiental: Comprobando...';
    
    try {
        if ('AmbientLightSensor' in window) {
            const lightSensor = new AmbientLightSensor();
            
            lightSensor.addEventListener('reading', () => {
                document.getElementById('light-status').textContent = 
                    `Luz ambiental: ✓ Disponible (${lightSensor.illuminance} lux)`;
                lightSensor.stop();
            });
            
            lightSensor.addEventListener('error', (error) => {
                console.error('Error en sensor de luz ambiental:', error);
                document.getElementById('light-status').textContent = 
                    'Luz ambiental: ✗ No disponible';
            });
            
            lightSensor.start();
        } else {
            document.getElementById('light-status').textContent = 'Luz ambiental: ✗ No disponible';
        }
    } catch (error) {
        console.error('Error en checkAmbientLight:', error);
        document.getElementById('light-status').textContent = 'Luz ambiental: ✗ Error';
    }
}

// Función mejorada para detectar GPU
function checkGPU() {
    document.getElementById('gpu-status').textContent = 'GPU: Comprobando...';
    
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            let gpuInfo = 'No detectada';
            
            if (debugInfo) {
                // Algunos navegadores (como Firefox) pueden no reportar esta información
                try {
                    gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'No detectada';
                } catch (e) {
                    console.error('Error al obtener info de GPU:', e);
                    gpuInfo = 'Información restringida';
                }
            }
            
            document.getElementById('gpu-status').textContent = `GPU: ${gpuInfo}`;
        } else {
            document.getElementById('gpu-status').textContent = 'WebGL: ✗ No disponible';
        }
    } catch (error) {
        console.error('Error en checkGPU:', error);
        document.getElementById('gpu-status').textContent = 'GPU: ✗ Error al detectar';
    }
}

// Función mejorada para detectar memoria RAM
function checkDeviceMemory() {
    document.getElementById('memory-status').textContent = 'Memoria RAM: Comprobando...';
    
    try {
        if ('deviceMemory' in navigator) {
            // Algunos navegadores reportan valores incorrectos (como Brave reportando 1GB)
            // Podemos intentar hacer una estimación mejor
            const reportedMemory = navigator.deviceMemory;
            let estimatedMemory = reportedMemory;
            
            // Si el navegador reporta 1GB pero sabemos que es incorrecto
            if (reportedMemory === 1 && performance.memory && performance.memory.jsHeapSizeLimit) {
                // Estimación basada en el límite de heap de JS (aproximado)
                const heapLimitGB = performance.memory.jsHeapSizeLimit / (1024 * 1024 * 1024);
                if (heapLimitGB > 2) {
                    estimatedMemory = Math.round(heapLimitGB);
                }
            }
            
            document.getElementById('memory-status').textContent = 
                `Memoria RAM: ${estimatedMemory >= 8 ? '8+' : estimatedMemory >= 4 ? '4+' : estimatedMemory} GB`;
        } else {
            // Fallback para navegadores que no soportan deviceMemory
            document.getElementById('memory-status').textContent = 'Memoria RAM: No disponible';
        }
    } catch (error) {
        console.error('Error en checkDeviceMemory:', error);
        document.getElementById('memory-status').textContent = 'Memoria RAM: Error al detectar';
    }
}

// Función mejorada para detectar ARCore/WebXR
function checkARSupport() {
    document.getElementById('arcore-status').textContent = 'ARCore: Comprobando...';
    
    try {
        if ('xr' in navigator) {
            navigator.xr.isSessionSupported('immersive-ar')
                .then(supported => {
                    document.getElementById('arcore-status').textContent = 
                        `ARCore: ${supported ? '✓ Disponible' : '✗ No disponible'}`;
                })
                .catch(err => {
                    console.error('Error al verificar ARCore:', err);
                    // Fallback para Firefox que no implementa correctamente esta API
                    if (navigator.userAgent.includes('Firefox')) {
                        document.getElementById('arcore-status').textContent = 
                            'ARCore: ✗ No soportado en Firefox';
                    } else {
                        document.getElementById('arcore-status').textContent = 
                            'ARCore: ✗ No disponible';
                    }
                });
        } else {
            document.getElementById('arcore-status').textContent = 'ARCore: ✗ No disponible';
        }
    } catch (error) {
        console.error('Error en checkARSupport:', error);
        document.getElementById('arcore-status').textContent = 'ARCore: ✗ Error al detectar';
    }
}

// Función principal para verificar todos los sensores y hardware
async function checkDeviceSensors() {
    if (sensorCheckInProgress) return;
    sensorCheckInProgress = true;
    
    console.log('Iniciando escaneo completo de sensores y hardware...');
    
    // Primero detectamos el navegador
    detectBrowser();
    
    // Verificamos sensores en paralelo cuando sea posible
    await Promise.all([
        checkAccelerometer(),
        checkGyroscope(),
        checkMagnetometer()
    ]);
    
    // Verificamos otros sensores y hardware
    checkProximitySensor();
    checkAmbientLight();
    checkGPU();
    checkDeviceMemory();
    checkARSupport();
    
    sensorCheckInProgress = false;
}

// Evento para inicializar cuando la página esté cargada
window.addEventListener('load', function() {
    setTimeout(() => {
        initConfigPanel();
        // Iniciar una verificación inicial suave
        setTimeout(checkDeviceSensors, 1000);
    }, 1000);
});