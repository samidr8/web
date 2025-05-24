document.addEventListener('DOMContentLoaded', function () {
    // Crear elementos del panel de configuración
    const configIcon = document.createElement('div');
    configIcon.className = 'ar-config-icon';
    configIcon.innerHTML = '⚙️';
    document.body.appendChild(configIcon);

    const configPanel = document.createElement('div');
    configPanel.className = 'ar-config-panel';
    configPanel.innerHTML = `
    <button class="close-panel-btn">×</button>
    <h3>Configuración AR</h3>
    <div class="ar-config-content">
      <div class="sensor-check">
        <span>Linterna:</span>
        <span class="sensor-status" id="flash-status">No verificado</span>
      </div>
      <button class="ar-config-btn" id="toggle-flash">Activar Linterna</button>
      <div id="flash-error" class="error-message"></div>
      
      <div class="sensor-check">
        <span>WebGL:</span>
        <span class="sensor-status" id="webgl-status">No verificado</span>
      </div>
      <a href="https://get.webgl.org" target="_blank" class="webgl-link">Probar WebGL</a>
      
      <div class="section-title">Sensores</div>
      
      <div class="sensor-check">
        <span>ARCore/ARKit:</span>
        <span class="sensor-status" id="arcore-status">No verificado</span>
      </div>
      
      <div class="sensor-check">
        <span>Giroscopio:</span>
        <span class="sensor-status" id="gyro-status">No verificado</span>
      </div>
      
      <div class="sensor-check">
        <span>Acelerómetro:</span>
        <span class="sensor-status" id="accel-status">No verificado</span>
      </div>
      
      <div class="sensor-check">
        <span>Magnetómetro:</span>
        <span class="sensor-status" id="mag-status">No verificado</span>
      </div>
      
      <div class="sensor-check">
        <span>Sensor de Proximidad:</span>
        <span class="sensor-status" id="prox-status">No verificado</span>
      </div>
      
      <div class="sensor-check">
        <span>Orientación del dispositivo:</span>
        <span class="sensor-status" id="orientation-status">No verificado</span>
      </div>
      
      <div class="sensor-check">
        <span>Movimiento del dispositivo:</span>
        <span class="sensor-status" id="motion-status">No verificado</span>
      </div>
      
      <div class="section-title">Información del dispositivo</div>
      <div class="device-info" id="device-info">
        <div><strong>Navegador:</strong> <span id="browser-info">Detectando...</span></div>
        <div><strong>SO:</strong> <span id="os-info">Detectando...</span></div>
        <div><strong>Dispositivo:</strong> <span id="device-type">Detectando...</span></div>
      </div>
    </div>
  `;
    document.body.appendChild(configPanel);

    // Variables de estado
    let flashOn = false;
    let flashSupported = false;
    let flashStream = null;
    let flashTrack = null;

    // Event listeners
    configIcon.addEventListener('click', function () {
        configPanel.style.display = 'block';
        checkSensors();
        checkFlashSupport();
        showDeviceInfo();
    });

    document.querySelector('.close-panel-btn').addEventListener('click', function () {
        configPanel.style.display = 'none';
        if (flashOn) {
            toggleFlash(); // Apagar linterna al cerrar panel
        }

        // Limpiar recursos cuando se cierra el panel
        if (flashStream && !flashOn) {
            flashStream.getTracks().forEach(track => track.stop());
            flashStream = null;
            flashTrack = null;
        }
    });

    document.getElementById('toggle-flash').addEventListener('click', toggleFlash);

    // Funciones de verificación de sensores
    function checkSensors() {
        checkWebGL();
        checkARCore();
        checkGyroscope();
        checkAccelerometer();
        checkMagnetometer();
        checkProximity();
        checkDeviceOrientation();
        checkDeviceMotion();
    }

    // Detección mejorada de dispositivos
    function getDeviceInfo() {
        const userAgent = navigator.userAgent;
        
        // Detección de SO
        let os = 'Desconocido';
        if (/Android/i.test(userAgent)) {
            const androidMatch = userAgent.match(/Android\s([\d\.]+)/);
            os = androidMatch ? `Android ${androidMatch[1]}` : 'Android';
        } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
            const iosMatch = userAgent.match(/OS\s([\d_]+)/);
            os = iosMatch ? `iOS ${iosMatch[1].replace(/_/g, '.')}` : 'iOS';
        } else if (/Windows/i.test(userAgent)) {
            os = 'Windows';
        } else if (/Mac/i.test(userAgent)) {
            os = 'macOS';
        } else if (/Linux/i.test(userAgent)) {
            os = 'Linux';
        }

        // Detección de navegador
        let browser = 'Desconocido';
        if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) {
            browser = 'Chrome';
        } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
            browser = 'Safari';
        } else if (/Firefox/i.test(userAgent)) {
            browser = 'Firefox';
        } else if (/Edg/i.test(userAgent)) {
            browser = 'Edge';
        } else if (/Samsung/i.test(userAgent)) {
            browser = 'Samsung Internet';
        }

        // Detección de tipo de dispositivo
        let deviceType = 'Escritorio';
        if (/iPhone/i.test(userAgent)) {
            deviceType = 'iPhone';
        } else if (/iPad/i.test(userAgent)) {
            deviceType = 'iPad';
        } else if (/Android/i.test(userAgent)) {
            // Detección mejorada para Android
            if (/Mobile/i.test(userAgent)) {
                deviceType = 'Android Móvil';
            } else {
                deviceType = 'Android Tablet';
            }
        } else if (/Mobile|Tablet/i.test(userAgent)) {
            deviceType = 'Dispositivo móvil';
        }

        return { os, browser, deviceType };
    }

    function showDeviceInfo() {
        const info = getDeviceInfo();
        document.getElementById('browser-info').textContent = info.browser;
        document.getElementById('os-info').textContent = info.os;
        document.getElementById('device-type').textContent = info.deviceType;
    }

    function checkFlashSupport() {
        const flashStatus = document.getElementById('flash-status');
        const flashButton = document.getElementById('toggle-flash');

        if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
            flashStatus.textContent = 'No soportado';
            flashStatus.className = 'sensor-status sensor-error';
            flashButton.disabled = true;
            return;
        }

        const deviceInfo = getDeviceInfo();
        
        // Mejorar detección para diferentes dispositivos
        const isMobile = /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent);
        const isAndroid = /Android/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (!isMobile) {
            flashStatus.textContent = 'Solo móviles';
            flashStatus.className = 'sensor-status sensor-error';
            flashButton.disabled = true;
        } else if (isIOS) {
            // iOS tiene limitaciones con la API de linterna
            flashStatus.textContent = 'Limitado en iOS';
            flashStatus.className = 'sensor-status sensor-warning';
            flashButton.disabled = false;
        } else if (isAndroid) {
            flashStatus.textContent = 'Listo';
            flashStatus.className = 'sensor-status sensor-ok';
            flashButton.disabled = false;
        } else {
            flashStatus.textContent = 'Desconocido';
            flashStatus.className = 'sensor-status sensor-warning';
            flashButton.disabled = false;
        }
    }

    function checkWebGL() {
        const webglStatus = document.getElementById('webgl-status');
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || 
                      canvas.getContext('experimental-webgl') ||
                      canvas.getContext('webgl2');
            
            if (gl && (gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext)) {
                webglStatus.textContent = 'Soportado';
                webglStatus.className = 'sensor-status sensor-ok';
            } else {
                webglStatus.textContent = 'No soportado';
                webglStatus.className = 'sensor-status sensor-error';
            }
        } catch (e) {
            webglStatus.textContent = 'Error';
            webglStatus.className = 'sensor-status sensor-error';
        }
    }

    function checkARCore() {
        const arcoreStatus = document.getElementById('arcore-status');
        
        // Verificación mejorada para WebXR
        if ('xr' in navigator && navigator.xr) {
            navigator.xr.isSessionSupported('immersive-ar')
                .then((supported) => {
                    arcoreStatus.textContent = supported ? 'Soportado' : 'No soportado';
                    arcoreStatus.className = supported ? 'sensor-status sensor-ok' : 'sensor-status sensor-error';
                })
                .catch(() => {
                    // Fallback: verificar disponibilidad básica
                    const isAndroid = /Android/i.test(navigator.userAgent);
                    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                    
                    if (isAndroid) {
                        arcoreStatus.textContent = 'ARCore posible';
                        arcoreStatus.className = 'sensor-status sensor-warning';
                    } else if (isIOS) {
                        arcoreStatus.textContent = 'ARKit posible';
                        arcoreStatus.className = 'sensor-status sensor-warning';
                    } else {
                        arcoreStatus.textContent = 'No disponible';
                        arcoreStatus.className = 'sensor-status sensor-error';
                    }
                });
        } else {
            // Sin WebXR, verificar compatibilidad básica
            const isAndroid = /Android/i.test(navigator.userAgent);
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            
            if (isAndroid) {
                arcoreStatus.textContent = 'ARCore posible';
                arcoreStatus.className = 'sensor-status sensor-warning';
            } else if (isIOS) {
                arcoreStatus.textContent = 'ARKit posible';
                arcoreStatus.className = 'sensor-status sensor-warning';
            } else {
                arcoreStatus.textContent = 'No soportado';
                arcoreStatus.className = 'sensor-status sensor-error';
            }
        }
    }

    function checkGyroscope() {
        const gyroStatus = document.getElementById('gyro-status');
        
        // Verificar múltiples APIs de giroscopio
        if ('Gyroscope' in window) {
            try {
                const gyro = new Gyroscope({ frequency: 60 });
                gyro.addEventListener('reading', () => {
                    gyroStatus.textContent = 'Soportado';
                    gyroStatus.className = 'sensor-status sensor-ok';
                    gyro.stop();
                });
                gyro.addEventListener('error', () => {
                    checkGyroscopeAlternative();
                });
                gyro.start();
            } catch (error) {
                checkGyroscopeAlternative();
            }
        } else {
            checkGyroscopeAlternative();
        }

        function checkGyroscopeAlternative() {
            // Verificar API alternativa de orientación del dispositivo
            if (typeof DeviceOrientationEvent !== 'undefined') {
                gyroStatus.textContent = 'Disponible (alternativo)';
                gyroStatus.className = 'sensor-status sensor-warning';
            } else {
                gyroStatus.textContent = 'No soportado';
                gyroStatus.className = 'sensor-status sensor-error';
            }
        }
    }

    function checkAccelerometer() {
        const accelStatus = document.getElementById('accel-status');
        
        if ('Accelerometer' in window) {
            try {
                const accel = new Accelerometer({ frequency: 60 });
                accel.addEventListener('reading', () => {
                    accelStatus.textContent = 'Soportado';
                    accelStatus.className = 'sensor-status sensor-ok';
                    accel.stop();
                });
                accel.addEventListener('error', () => {
                    checkAccelerometerAlternative();
                });
                accel.start();
            } catch (error) {
                checkAccelerometerAlternative();
            }
        } else {
            checkAccelerometerAlternative();
        }

        function checkAccelerometerAlternative() {
            // Verificar API alternativa de movimiento del dispositivo
            if (typeof DeviceMotionEvent !== 'undefined') {
                accelStatus.textContent = 'Disponible (alternativo)';
                accelStatus.className = 'sensor-status sensor-warning';
            } else {
                accelStatus.textContent = 'No soportado';
                accelStatus.className = 'sensor-status sensor-error';
            }
        }
    }

    function checkMagnetometer() {
        const magStatus = document.getElementById('mag-status');
        
        if ('Magnetometer' in window) {
            try {
                const mag = new Magnetometer({ frequency: 60 });
                mag.addEventListener('reading', () => {
                    magStatus.textContent = 'Soportado';
                    magStatus.className = 'sensor-status sensor-ok';
                    mag.stop();
                });
                mag.addEventListener('error', () => {
                    magStatus.textContent = 'No disponible';
                    magStatus.className = 'sensor-status sensor-error';
                });
                mag.start();
            } catch (error) {
                magStatus.textContent = 'No soportado';
                magStatus.className = 'sensor-status sensor-error';
            }
        } else {
            // En muchos dispositivos móviles, el magnetómetro está disponible pero no a través de la API web
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isMobile) {
                magStatus.textContent = 'Posiblemente disponible';
                magStatus.className = 'sensor-status sensor-warning';
            } else {
                magStatus.textContent = 'No soportado';
                magStatus.className = 'sensor-status sensor-error';
            }
        }
    }

    function checkProximity() {
        const proxStatus = document.getElementById('prox-status');
        
        if ('ondeviceproximity' in window || 
            'onuserproximity' in window || 
            'ProximitySensor' in window) {
            proxStatus.textContent = 'Soportado';
            proxStatus.className = 'sensor-status sensor-ok';
        } else {
            // La mayoría de dispositivos móviles tienen sensor de proximidad pero no API web
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isMobile) {
                proxStatus.textContent = 'Hardware disponible';
                proxStatus.className = 'sensor-status sensor-warning';
            } else {
                proxStatus.textContent = 'No soportado';
                proxStatus.className = 'sensor-status sensor-error';
            }
        }
    }

    function checkDeviceOrientation() {
        const orientationStatus = document.getElementById('orientation-status');
        
        if (typeof DeviceOrientationEvent !== 'undefined') {
            // Probar si el evento funciona
            const testListener = (event) => {
                if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
                    orientationStatus.textContent = 'Soportado';
                    orientationStatus.className = 'sensor-status sensor-ok';
                } else {
                    orientationStatus.textContent = 'Sin datos';
                    orientationStatus.className = 'sensor-status sensor-warning';
                }
                window.removeEventListener('deviceorientation', testListener);
            };
            
            window.addEventListener('deviceorientation', testListener);
            
            // Timeout por si no hay eventos
            setTimeout(() => {
                window.removeEventListener('deviceorientation', testListener);
                if (orientationStatus.textContent === 'No verificado') {
                    orientationStatus.textContent = 'Disponible';
                    orientationStatus.className = 'sensor-status sensor-warning';
                }
            }, 2000);
        } else {
            orientationStatus.textContent = 'No soportado';
            orientationStatus.className = 'sensor-status sensor-error';
        }
    }

    function checkDeviceMotion() {
        const motionStatus = document.getElementById('motion-status');
        
        if (typeof DeviceMotionEvent !== 'undefined') {
            // Probar si el evento funciona
            const testListener = (event) => {
                if (event.acceleration || event.accelerationIncludingGravity || event.rotationRate) {
                    motionStatus.textContent = 'Soportado';
                    motionStatus.className = 'sensor-status sensor-ok';
                } else {
                    motionStatus.textContent = 'Sin datos';
                    motionStatus.className = 'sensor-status sensor-warning';
                }
                window.removeEventListener('devicemotion', testListener);
            };
            
            window.addEventListener('devicemotion', testListener);
            
            // Timeout por si no hay eventos
            setTimeout(() => {
                window.removeEventListener('devicemotion', testListener);
                if (motionStatus.textContent === 'No verificado') {
                    motionStatus.textContent = 'Disponible';
                    motionStatus.className = 'sensor-status sensor-warning';
                }
            }, 2000);
        } else {
            motionStatus.textContent = 'No soportado';
            motionStatus.className = 'sensor-status sensor-error';
        }
    }

    // Control mejorado de la linterna
    function toggleFlash() {
        const flashStatus = document.getElementById('flash-status');
        const flashError = document.getElementById('flash-error');
        const flashButton = document.getElementById('toggle-flash');

        if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
            flashError.textContent = 'API de medios no soportada';
            return;
        }

        flashOn = !flashOn;

        if (flashOn) {
            // Activar linterna con múltiples estrategias
            const constraints = {
                video: {
                    facingMode: 'environment',
                    torch: true,
                    // Configuraciones adicionales para compatibilidad
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            navigator.mediaDevices.getUserMedia(constraints)
                .then(stream => {
                    flashStream = stream;
                    flashTrack = stream.getVideoTracks()[0];

                    // Intentar aplicar torch constraint
                    return flashTrack.applyConstraints({
                        advanced: [{ torch: true }]
                    });
                })
                .then(() => {
                    flashStatus.textContent = 'Activada';
                    flashStatus.className = 'sensor-status sensor-ok';
                    flashButton.textContent = 'Apagar Linterna';
                    flashError.textContent = '';
                    flashSupported = true;
                })
                .catch(err => {
                    console.error('Error al activar linterna:', err);
                    
                    // Estrategia alternativa para iOS y algunos Android
                    if (flashStream) {
                        tryAlternativeFlash();
                    } else {
                        flashError.textContent = getFlashErrorMessage(err);
                        flashOn = false;
                    }
                });
        } else {
            // Apagar linterna
            turnOffFlash();
        }
    }

    function tryAlternativeFlash() {
        const flashStatus = document.getElementById('flash-status');
        const flashError = document.getElementById('flash-error');
        const flashButton = document.getElementById('toggle-flash');

        if (flashTrack && 'getCapabilities' in flashTrack) {
            const capabilities = flashTrack.getCapabilities();
            
            if (capabilities.torch) {
                flashTrack.applyConstraints({
                    torch: true
                }).then(() => {
                    flashStatus.textContent = 'Activada (alternativo)';
                    flashStatus.className = 'sensor-status sensor-ok';
                    flashButton.textContent = 'Apagar Linterna';
                    flashError.textContent = '';
                }).catch(() => {
                    flashError.textContent = 'No se pudo activar la linterna en este dispositivo';
                    flashOn = false;
                    cleanupFlashStream();
                });
            } else {
                flashError.textContent = 'Este dispositivo no soporta control de linterna';
                flashOn = false;
                cleanupFlashStream();
            }
        } else {
            flashError.textContent = 'API de linterna no disponible en este navegador';
            flashOn = false;
            cleanupFlashStream();
        }
    }

    function turnOffFlash() {
        const flashStatus = document.getElementById('flash-status');
        const flashButton = document.getElementById('toggle-flash');
        const flashError = document.getElementById('flash-error');

        if (flashTrack) {
            flashTrack.applyConstraints({
                advanced: [{ torch: false }]
            }).then(() => {
                flashStatus.textContent = 'Apagada';
                flashStatus.className = 'sensor-status sensor-warning';
                flashButton.textContent = 'Activar Linterna';
                flashError.textContent = '';
            }).catch(err => {
                console.error('Error al apagar linterna:', err);
                flashError.textContent = 'Error al apagar linterna';
                // Intentar detener el stream completamente
                cleanupFlashStream();
            });
        } else {
            cleanupFlashStream();
        }
    }

    function cleanupFlashStream() {
        if (flashStream) {
            flashStream.getTracks().forEach(track => track.stop());
            flashStream = null;
            flashTrack = null;
        }
        
        const flashStatus = document.getElementById('flash-status');
        const flashButton = document.getElementById('toggle-flash');
        
        flashStatus.textContent = 'Listo';
        flashStatus.className = 'sensor-status sensor-ok';
        flashButton.textContent = 'Activar Linterna';
    }

    function getFlashErrorMessage(error) {
        if (error.name === 'NotAllowedError') {
            return 'Permiso denegado para acceder a la cámara';
        } else if (error.name === 'NotFoundError') {
            return 'No se encontró cámara trasera';
        } else if (error.name === 'NotSupportedError') {
            return 'Linterna no soportada en este dispositivo';
        } else if (error.name === 'OverconstrainedError') {
            return 'Configuración de linterna no soportada';
        } else {
            return 'Error desconocido al activar linterna';
        }
    }

    // Solicitar permisos en iOS 13+ si es necesario
    function requestDeviceMotionPermission() {
        if (typeof DeviceMotionEvent !== 'undefined' && 
            typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        console.log('Permiso de movimiento concedido');
                        checkDeviceMotion();
                    }
                })
                .catch(console.error);
        }
    }

    function requestDeviceOrientationPermission() {
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        console.log('Permiso de orientación concedido');
                        checkDeviceOrientation();
                    }
                })
                .catch(console.error);
        }
    }

    // Solicitar permisos automáticamente en iOS cuando se abre el panel
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        configIcon.addEventListener('click', () => {
            requestDeviceMotionPermission();
            requestDeviceOrientationPermission();
        });
    }
});