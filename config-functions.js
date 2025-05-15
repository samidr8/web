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
                <label>Sensores del dispositivo</label>
                <button id="check-sensors-btn" class="config-button">Escanear</button>
            </div>
            <div id="sensors-result" class="sensors-result">
                <p id="arcore-status">ARCore: Comprobando...</p>
                <p id="gyroscope-status">Giroscopio: Comprobando...</p>
                <p id="accelerometer-status">Acelerómetro: Comprobando...</p>
                <p id="magnetometer-status">Magnetómetro: Comprobando...</p>
                <p id="proximity-status">Sensor de proximidad: Comprobando...</p>
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
        // Obtener acceso a la cámara si no lo tenemos ya
        if (!window.stream) {
            window.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
        }
        
        // Obtener todas las pistas de video
        const track = window.stream.getVideoTracks()[0];
        
        if (track) {
            // Verificar si la linterna es compatible
            const capabilities = track.getCapabilities();
            
            if (capabilities.torch) {
                // Activar/desactivar la linterna
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

// Comprobar sensores del dispositivo
function checkDeviceSensors() {
    console.log('Comprobando sensores del dispositivo...');
    
    // Reiniciar estados
    document.getElementById('arcore-status').textContent = 'ARCore: Comprobando...';
    document.getElementById('gyroscope-status').textContent = 'Giroscopio: Comprobando...';
    document.getElementById('accelerometer-status').textContent = 'Acelerómetro: Comprobando...';
    document.getElementById('magnetometer-status').textContent = 'Magnetómetro: Comprobando...';
    document.getElementById('proximity-status').textContent = 'Sensor de proximidad: Comprobando...';

    // Comprobar ARCore (indirectamente a través de la disponibilidad de WebXR)
    if ('xr' in navigator) {
        navigator.xr.isSessionSupported('immersive-ar')
            .then(supported => {
                document.getElementById('arcore-status').textContent = 
                    `ARCore: ${supported ? '✓ Disponible' : '✗ No disponible'}`;
            })
            .catch(err => {
                document.getElementById('arcore-status').textContent = 'ARCore: ✗ No disponible';
            });
    } else {
        document.getElementById('arcore-status').textContent = 'ARCore: ✗ No disponible';
    }

    // Comprobar giroscopio
    try {
        if ('Gyroscope' in window || ('DeviceMotionEvent' in window && window.DeviceMotionEvent.requestPermission)) {
            let gyroTest = false;
            
            // Función para manejar el evento de movimiento
            const handleMotion = (event) => {
                if (event.rotationRate && 
                    (event.rotationRate.alpha !== null || 
                     event.rotationRate.beta !== null || 
                     event.rotationRate.gamma !== null)) {
                    gyroTest = true;
                }
                
                // Actualizar estado después de un breve período
                setTimeout(() => {
                    document.getElementById('gyroscope-status').textContent = 
                        `Giroscopio: ${gyroTest ? '✓ Disponible' : '✗ No disponible'}`;
                    window.removeEventListener('devicemotion', handleMotion);
                }, 500);
            };
            
            // Agregar listener para evento de movimiento
            window.addEventListener('devicemotion', handleMotion);
            
            // Solicitar permiso en iOS 13+
            if (DeviceMotionEvent.requestPermission && typeof DeviceMotionEvent.requestPermission === 'function') {
                DeviceMotionEvent.requestPermission()
                    .catch(error => {
                        document.getElementById('gyroscope-status').textContent = 
                            'Giroscopio: ✗ Permiso denegado';
                    });
            }
        } else {
            document.getElementById('gyroscope-status').textContent = 'Giroscopio: ✗ No disponible';
        }
    } catch (e) {
        document.getElementById('gyroscope-status').textContent = 'Giroscopio: ✗ Error al detectar';
    }

    // Comprobar acelerómetro (similar al giroscopio)
    try {
        if ('Accelerometer' in window || 'DeviceMotionEvent' in window) {
            let accelTest = false;
            
            // Función para manejar el evento de movimiento
            const handleMotion = (event) => {
                if (event.accelerationIncludingGravity &&
                    (event.accelerationIncludingGravity.x !== null ||
                     event.accelerationIncludingGravity.y !== null ||
                     event.accelerationIncludingGravity.z !== null)) {
                    accelTest = true;
                }
                
                // Actualizar estado después de un breve período
                setTimeout(() => {
                    document.getElementById('accelerometer-status').textContent = 
                        `Acelerómetro: ${accelTest ? '✓ Disponible' : '✗ No disponible'}`;
                    window.removeEventListener('devicemotion', handleMotion);
                }, 500);
            };
            
            // Agregar listener para evento de movimiento
            window.addEventListener('devicemotion', handleMotion);
        } else {
            document.getElementById('accelerometer-status').textContent = 'Acelerómetro: ✗ No disponible';
        }
    } catch (e) {
        document.getElementById('accelerometer-status').textContent = 'Acelerómetro: ✗ Error al detectar';
    }

    // Comprobar magnetómetro (brújula)
    try {
        if ('DeviceOrientationEvent' in window) {
            let magTest = false;
            
            // Función para manejar el evento de orientación
            const handleOrientation = (event) => {
                if (event.absolute === true || typeof event.webkitCompassHeading !== 'undefined') {
                    magTest = true;
                }
                
                // Actualizar estado después de un breve período
                setTimeout(() => {
                    document.getElementById('magnetometer-status').textContent = 
                        `Magnetómetro: ${magTest ? '✓ Disponible' : '✗ No disponible'}`;
                    window.removeEventListener('deviceorientation', handleOrientation);
                }, 500);
            };
            
            // Agregar listener para evento de orientación
            window.addEventListener('deviceorientation', handleOrientation);
            
            // Solicitar permiso en iOS 13+
            if (DeviceOrientationEvent.requestPermission && typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .catch(error => {
                        document.getElementById('magnetometer-status').textContent = 
                            'Magnetómetro: ✗ Permiso denegado';
                    });
            }
        } else {
            document.getElementById('magnetometer-status').textContent = 'Magnetómetro: ✗ No disponible';
        }
    } catch (e) {
        document.getElementById('magnetometer-status').textContent = 'Magnetómetro: ✗ Error al detectar';
    }

    // Comprobar sensor de proximidad (menos común en navegadores)
    try {
        if ('ProximitySensor' in window || 'ondeviceproximity' in window) {
            document.getElementById('proximity-status').textContent = 'Sensor de proximidad: ✓ Disponible';
        } else {
            document.getElementById('proximity-status').textContent = 'Sensor de proximidad: ✗ No disponible';
        }
    } catch (e) {
        document.getElementById('proximity-status').textContent = 'Sensor de proximidad: ✗ Error al detectar';
    }
}

// Evento para inicializar cuando la página esté cargada
window.addEventListener('load', function() {
    // Esperar a que el sistema AR esté inicializado
    setTimeout(initConfigPanel, 3000);
});
