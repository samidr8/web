
// Manejo específico para Firefox
async function handleFirefoxTorch() {
    const toggle = document.getElementById('flashlight-toggle');
    
    try {
        // Si ya existe un stream, cerrarlo para evitar conflictos
        if (window.stream) {
            window.stream.getTracks().forEach(track => track.stop());
            window.stream = null;
        }
        
        // Firefox requiere configuraciones específicas para la cámara
        const constraints = {
            video: {
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                // Especificar torch directamente en las constraints principales
                advanced: [
                    { torch: true }
                ]
            }
        };
        
        // Solicitar acceso a la cámara con configuraciones específicas
        window.stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Obtener pista de video
        const track = window.stream.getVideoTracks()[0];
        
        if (track) {
            // Intentar diferentes métodos para activar la linterna en Firefox
            try {
                // Método 1: Verificar capacidades
                const capabilities = track.getCapabilities();
                
                if (capabilities && capabilities.torch) {
                    // Activar/desactivar la linterna
                    flashlightActive = !flashlightActive;
                    
                    // En Firefox, a veces funciona mejor sin el 'advanced'
                    const constraints = {
                        torch: flashlightActive
                    };
                    
                    await track.applyConstraints(constraints);
                    
                    // También intentar con advanced por si acaso
                    try {
                        await track.applyConstraints({
                            advanced: [{ torch: flashlightActive }]
                        });
                    } catch (e) {
                        console.log("Error en segundo método, pero continuamos:", e);
                    }
                    
                    toggle.checked = flashlightActive;
                    console.log(`Linterna en Firefox ${flashlightActive ? 'activada' : 'desactivada'}`);
                } else {
                    // Método 2: Intentar configuración alternativa si no se detecta torch
                    flashlightActive = !flashlightActive;
                    
                    try {
                        // Intentar con ImageCapture API (disponible en algunos Firefox)
                        const imageCapture = new ImageCapture(track);
                        const photoCapabilities = await imageCapture.getPhotoCapabilities();
                        
                        if (photoCapabilities && photoCapabilities.fillLightMode && 
                            photoCapabilities.fillLightMode.includes('flash')) {
                            
                            // Configurar el modo de flash
                            const photoSettings = {
                                fillLightMode: flashlightActive ? 'flash' : 'off'
                            };
                            
                            await imageCapture.setOptions({ photoSettings });
                            toggle.checked = flashlightActive;
                            console.log(`Linterna en Firefox (método alternativo) ${flashlightActive ? 'activada' : 'desactivada'}`);
                        } else {
                            throw new Error("No se encontró soporte para flash");
                        }
                    } catch (e) {
                        console.error("Error en método alternativo de linterna:", e);
                        throw new Error("Tu dispositivo Firefox no soporta el control de la linterna");
                    }
                }
            } catch (e) {
                showErrorMessage('Firefox en tu dispositivo no soporta el control de la linterna');
                toggle.checked = false;
            }
        } else {
            showErrorMessage('No se pudo acceder a la cámara en Firefox');
            toggle.checked = false;
        }
    } catch (error) {
        console.error('Error Firefox al controlar la linterna:', error);
        showErrorMessage('Error al controlar la linterna en Firefox. Verifica los permisos de cámara.');
        toggle.checked = false;
    }
}// Funciones para el panel de configuración
let flashlightActive = false;
let browserInfo = {};

// Inicializar panel de configuración
function initConfigPanel() {
    console.log("Inicializando panel de configuración...");

    // Detectar información del navegador
    detectBrowserInfo();

    // Crear el icono de configuración
    createConfigIcon();

    // Crear el panel de configuración (inicialmente oculto)
    createConfigPanel();

    // Comprobar compatibilidad inicial de sensores
    checkDeviceSensors();
}

// Función para detectar el navegador y sistema operativo
function detectBrowserInfo() {
    const userAgent = navigator.userAgent;
    
    // Detectar sistema operativo
    let os = "Desconocido";
    if (/iPhone|iPad|iPod/.test(userAgent)) {
        os = "iOS";
    } else if (/Android/.test(userAgent)) {
        os = "Android";
    } else if (/Windows/.test(userAgent)) {
        os = "Windows";
    } else if (/Mac/.test(userAgent)) {
        os = "macOS";
    } else if (/Linux/.test(userAgent)) {
        os = "Linux";
    }
    
    // Detectar navegador - Método más confiable
    let browser = "Desconocido";
    let version = "";
    
    // Usar detect-browser cuando esté disponible
    if (typeof window.detectBrowser === 'function') {
        const result = window.detectBrowser();
        if (result && result.name) {
            browser = result.name.charAt(0).toUpperCase() + result.name.slice(1); // Capitalizar
            version = result.version;
        }
    } else {
        // Método de respaldo usando el User-Agent
        // Primero detectar navegadores móviles iOS que tienen nombres específicos
        if (/CriOS/.test(userAgent)) {
            browser = "Chrome iOS";
            version = userAgent.match(/CriOS\/(\d+)/)?.[1] || "";
        } else if (/FxiOS/.test(userAgent)) {
            browser = "Firefox iOS";
            version = userAgent.match(/FxiOS\/(\d+)/)?.[1] || "";
        } else if (/EdgiOS/.test(userAgent)) {
            browser = "Edge iOS";
            version = userAgent.match(/EdgiOS\/(\d+)/)?.[1] || "";
        } else if (/OPiOS/.test(userAgent)) {
            browser = "Opera iOS";
            version = userAgent.match(/OPiOS\/(\d+)/)?.[1] || "";
        } 
        // Firefox debe verificarse antes de Chrome ya que incluye "Chrome" en su UA
        else if (/Firefox/i.test(userAgent)) {
            browser = "Firefox";
            version = userAgent.match(/Firefox\/(\d+)/)?.[1] || "";
        }
        // Edge debe verificarse antes de Chrome ya que incluye "Chrome" en su UA
        else if (/Edg\/|Edge\//.test(userAgent)) {
            browser = "Edge";
            version = userAgent.match(/Edge\/(\d+)/)?.[1] || userAgent.match(/Edg\/(\d+)/)?.[1] || "";
        } 
        // Opera debe verificarse antes de Chrome ya que incluye "Chrome" en su UA
        else if (/OPR\/|Opera\//.test(userAgent)) {
            browser = "Opera";
            version = userAgent.match(/OPR\/(\d+)/)?.[1] || userAgent.match(/Opera\/(\d+)/)?.[1] || "";
        } 
        // Chrome debe verificarse antes de Safari para los navegadores basados en Chrome
        else if (/Chrome/.test(userAgent)) {
            browser = "Chrome";
            version = userAgent.match(/Chrome\/(\d+)/)?.[1] || "";
        } 
        // Safari (solo para macOS e iOS)
        else if (/Safari/.test(userAgent) && (os === "macOS" || os === "iOS")) {
            browser = "Safari";
            version = userAgent.match(/Version\/(\d+)/)?.[1] || "";
        } 
        // Samsung Internet
        else if (/SamsungBrowser/.test(userAgent)) {
            browser = "Samsung Internet";
            version = userAgent.match(/SamsungBrowser\/(\d+)/)?.[1] || "";
        }
    }
    
    // Métodos alternativos para la detección
    if (browser === "Desconocido") {
        // Tratar de usar características específicas del navegador
        if (window.chrome) {
            browser = "Chrome o compatible";
        } else if (typeof InstallTrigger !== 'undefined') {
            browser = "Firefox o compatible";
        } else if (/*@cc_on!@*/false || !!document.documentMode) {
            browser = "Internet Explorer";
            version = document.documentMode || "";
        } else if (window.StyleMedia) {
            browser = "Edge";
        } else if (window.safari) {
            browser = "Safari";
        }
    }
    
    // Guardar información
    browserInfo = {
        os: os,
        browser: browser,
        version: version,
        userAgent: userAgent,
        isIOS: os === "iOS",
        isAndroid: os === "Android",
        isFirefox: browser.includes("Firefox"),
        isMobile: /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    };
    
    console.log("Información del navegador:", browserInfo);
    return browserInfo;
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
            <div id="browser-info" class="sensors-result">
                <p><strong>Información del dispositivo</strong></p>
                <p id="device-os">Sistema: ${browserInfo.os || "Desconocido"}</p>
                <p id="device-browser">Navegador: ${browserInfo.browser || "Desconocido"} ${browserInfo.version || ""}</p>
                <p id="device-type">Tipo: ${browserInfo.isMobile ? "Móvil" : "Escritorio"}</p>
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

// Función para mostrar mensaje de error
function showErrorMessage(message) {
    // Verificar si la función ya existe en el contexto global
    if (typeof window.showErrorMessage === 'function') {
        window.showErrorMessage(message);
        return;
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<p>${message}</p>`;
    document.body.appendChild(errorDiv);

    // Eliminar mensaje después de 5 segundos
    setTimeout(() => {
        if (errorDiv && errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Activar/Desactivar linterna con mejor compatibilidad con iOS y Firefox
async function toggleFlashlight() {
    const toggle = document.getElementById('flashlight-toggle');
    
    try {
        // Verificar si estamos en iOS para manejo especial
        if (browserInfo.isIOS) {
            // En iOS, necesitamos enfoques especiales ya que la API torch es limitada
            if (browserInfo.browser === "Safari" && parseInt(browserInfo.version) >= 15) {
                // Safari 15+ en iOS tiene soporte limitado para torch
                await handleIOSTorch();
            } else {
                // Otros navegadores iOS no soportan torch directamente
                showErrorMessage('La linterna solo funciona en Safari en iOS 15+. Por favor, cambia de navegador.');
                toggle.checked = false;
                return;
            }
        } 
        // Manejo especial para Firefox
        else if (browserInfo.isFirefox) {
            await handleFirefoxTorch();
        } 
        else {
            // Otros navegadores estándar
            if (!window.stream) {
                try {
                    // Primer intento con configuración de torch
                    window.stream = await navigator.mediaDevices.getUserMedia({ 
                        video: { 
                            facingMode: 'environment',
                            advanced: [{ torch: true }]
                        } 
                    });
                } catch (err) {
                    console.log("Error en primer intento de acceso a cámara:", err);
                    // Segundo intento con configuración básica
                    window.stream = await navigator.mediaDevices.getUserMedia({ 
                        video: { facingMode: 'environment' } 
                    });
                }
            }
            
            // Obtener todas las pistas de video
            const track = window.stream.getVideoTracks()[0];
            
            if (track) {
                // Verificar si la linterna es compatible
                const capabilities = track.getCapabilities();
                
                if (capabilities && capabilities.torch) {
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
        }
    } catch (error) {
        console.error('Error al controlar la linterna:', error);
        showErrorMessage('Error al controlar la linterna. Asegúrate de haber concedido permisos de cámara.');
        toggle.checked = false;
    }
}

// Manejo específico para iOS Safari
async function handleIOSTorch() {
    try {
        // En iOS Safari 15+, usamos una estrategia diferente
        if (!window.stream) {
            // Solicitar acceso a la cámara con configuración específica para iOS
            window.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    // Algunas veces, iOS necesita estas configuraciones específicas
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
        }
        
        const track = window.stream.getVideoTracks()[0];
        
        if (track) {
            // Verificar soporte
            const capabilities = track.getCapabilities();
            const settings = track.getSettings();
            
            // En iOS Safari, la propiedad torch puede estar disponible en settings
            if (capabilities && capabilities.torch) {
                flashlightActive = !flashlightActive;
                
                // Intentar aplicar la configuración
                await track.applyConstraints({
                    advanced: [{ torch: flashlightActive }]
                });
                
                document.getElementById('flashlight-toggle').checked = flashlightActive;
                console.log(`Linterna en iOS ${flashlightActive ? 'activada' : 'desactivada'}`);
            } else {
                showErrorMessage('Tu dispositivo iOS no soporta el control de la linterna desde el navegador');
                document.getElementById('flashlight-toggle').checked = false;
            }
        } else {
            showErrorMessage('No se pudo acceder a la cámara en tu dispositivo iOS');
            document.getElementById('flashlight-toggle').checked = false;
        }
    } catch (error) {
        console.error('Error iOS al controlar la linterna:', error);
        showErrorMessage('Error al controlar la linterna en iOS. Verifica los permisos de cámara.');
        document.getElementById('flashlight-toggle').checked = false;
    }
}

// Comprobar sensores del dispositivo con mejor compatibilidad iOS
function checkDeviceSensors() {
    console.log('Comprobando sensores del dispositivo...');
    
    // Actualizar información del navegador primero
    detectBrowserInfo();
    
    // Actualizar la información del navegador en el panel
    document.getElementById('device-os').textContent = `Sistema: ${browserInfo.os}`;
    document.getElementById('device-browser').textContent = `Navegador: ${browserInfo.browser} ${browserInfo.version}`;
    document.getElementById('device-type').textContent = `Tipo: ${browserInfo.isMobile ? "Móvil" : "Escritorio"}`;
    
    // Reiniciar estados
    document.getElementById('arcore-status').textContent = 'ARCore: Comprobando...';
    document.getElementById('gyroscope-status').textContent = 'Giroscopio: Comprobando...';
    document.getElementById('accelerometer-status').textContent = 'Acelerómetro: Comprobando...';
    document.getElementById('magnetometer-status').textContent = 'Magnetómetro: Comprobando...';
    document.getElementById('proximity-status').textContent = 'Sensor de proximidad: Comprobando...';

    // Comprobar ARCore/ARKit (WebXR)
    checkARCapability();

    // Comprobar giroscopio con mejor compatibilidad iOS
    checkGyroscope();

    // Comprobar acelerómetro con mejor compatibilidad iOS
    checkAccelerometer();

    // Comprobar magnetómetro con mejor compatibilidad iOS
    checkMagnetometer();

    // Comprobar sensor de proximidad
    checkProximitySensor();
}

// Verificar soporte AR (ARCore/ARKit)
function checkARCapability() {
    if ('xr' in navigator) {
        navigator.xr.isSessionSupported('immersive-ar')
            .then(supported => {
                const arStatus = document.getElementById('arcore-status');
                if (supported) {
                    arStatus.textContent = browserInfo.isIOS ? 
                        'ARKit: ✓ Disponible' : 
                        'ARCore: ✓ Disponible';
                } else {
                    arStatus.textContent = browserInfo.isIOS ? 
                        'ARKit: ✗ No disponible' : 
                        'ARCore: ✗ No disponible';
                }
            })
            .catch(err => {
                const arStatus = document.getElementById('arcore-status');
                arStatus.textContent = browserInfo.isIOS ? 
                    'ARKit: ✗ No disponible' : 
                    'ARCore: ✗ No disponible';
                console.error('Error al comprobar AR:', err);
            });
    } else {
        const arStatus = document.getElementById('arcore-status');
        arStatus.textContent = browserInfo.isIOS ? 
            'ARKit: ✗ No disponible' : 
            'ARCore: ✗ No disponible';
    }
}

// Comprobar giroscopio con mejor manejo para iOS
function checkGyroscope() {
    try {
        const gyroStatus = document.getElementById('gyroscope-status');
        
        // Verificar soporte usando Sensor API (más moderno)
        if ('Gyroscope' in window) {
            gyroStatus.textContent = 'Giroscopio: ✓ Disponible (Sensor API)';
            return;
        }
        
        // Verificar si DeviceMotionEvent está disponible
        if ('DeviceMotionEvent' in window) {
            // En iOS 13+ necesitamos solicitar permiso explícitamente
            if (browserInfo.isIOS && 
                DeviceMotionEvent.requestPermission && 
                typeof DeviceMotionEvent.requestPermission === 'function') {
                
                DeviceMotionEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            // Ahora podemos verificar el giroscopio
                            detectGyroscopeWithMotion();
                        } else {
                            gyroStatus.textContent = 'Giroscopio: ✗ Permiso denegado';
                        }
                    })
                    .catch(error => {
                        console.error('Error al solicitar permiso para giroscopio:', error);
                        gyroStatus.textContent = 'Giroscopio: ✗ Error al solicitar permiso';
                    });
            } else {
                // En no-iOS o iOS antiguo, verificar directamente
                detectGyroscopeWithMotion();
            }
        } else {
            gyroStatus.textContent = 'Giroscopio: ✗ No disponible';
        }
    } catch (e) {
        console.error('Error al detectar giroscopio:', e);
        document.getElementById('gyroscope-status').textContent = 'Giroscopio: ✗ Error al detectar';
    }
}

// Función auxiliar para detectar giroscopio con DeviceMotion
function detectGyroscopeWithMotion() {
    let gyroTest = false;
    let testTimeout;
    
    const handleMotion = (event) => {
        if (event.rotationRate && 
            (event.rotationRate.alpha !== null || 
             event.rotationRate.beta !== null || 
             event.rotationRate.gamma !== null)) {
            gyroTest = true;
        }
    };
    
    // Agregar listener para evento de movimiento
    window.addEventListener('devicemotion', handleMotion);
    
    // Verificar después de un breve período
    testTimeout = setTimeout(() => {
        document.getElementById('gyroscope-status').textContent = 
            `Giroscopio: ${gyroTest ? '✓ Disponible' : '✗ No disponible'}`;
        window.removeEventListener('devicemotion', handleMotion);
    }, 500);
}

// Comprobar acelerómetro con mejor manejo para iOS
function checkAccelerometer() {
    try {
        const accelStatus = document.getElementById('accelerometer-status');
        
        // Verificar soporte usando Sensor API (más moderno)
        if ('Accelerometer' in window) {
            accelStatus.textContent = 'Acelerómetro: ✓ Disponible (Sensor API)';
            return;
        }
        
        // Verificar si DeviceMotionEvent está disponible
        if ('DeviceMotionEvent' in window) {
            // En iOS 13+ necesitamos solicitar permiso explícitamente
            if (browserInfo.isIOS && 
                DeviceMotionEvent.requestPermission && 
                typeof DeviceMotionEvent.requestPermission === 'function') {
                
                // Reutilizamos el permiso ya solicitado en la función del giroscopio
                detectAccelerometerWithMotion();
            } else {
                // En no-iOS o iOS antiguo, verificar directamente
                detectAccelerometerWithMotion();
            }
        } else {
            accelStatus.textContent = 'Acelerómetro: ✗ No disponible';
        }
    } catch (e) {
        console.error('Error al detectar acelerómetro:', e);
        document.getElementById('accelerometer-status').textContent = 'Acelerómetro: ✗ Error al detectar';
    }
}

// Función auxiliar para detectar acelerómetro con DeviceMotion
function detectAccelerometerWithMotion() {
    let accelTest = false;
    
    const handleMotion = (event) => {
        if (event.accelerationIncludingGravity &&
            (event.accelerationIncludingGravity.x !== null ||
             event.accelerationIncludingGravity.y !== null ||
             event.accelerationIncludingGravity.z !== null)) {
            accelTest = true;
        }
    };
    
    // Agregar listener para evento de movimiento
    window.addEventListener('devicemotion', handleMotion);
    
    // Verificar después de un breve período
    setTimeout(() => {
        document.getElementById('accelerometer-status').textContent = 
            `Acelerómetro: ${accelTest ? '✓ Disponible' : '✗ No disponible'}`;
        window.removeEventListener('devicemotion', handleMotion);
    }, 500);
}

// Comprobar magnetómetro con mejor manejo para iOS
function checkMagnetometer() {
    try {
        const magStatus = document.getElementById('magnetometer-status');
        
        // Verificar si DeviceOrientationEvent está disponible
        if ('DeviceOrientationEvent' in window) {
            // En iOS 13+ necesitamos solicitar permiso explícitamente
            if (browserInfo.isIOS && 
                DeviceOrientationEvent.requestPermission && 
                typeof DeviceOrientationEvent.requestPermission === 'function') {
                
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            // Ahora podemos verificar el magnetómetro
                            detectMagnetometerWithOrientation();
                        } else {
                            magStatus.textContent = 'Magnetómetro: ✗ Permiso denegado';
                        }
                    })
                    .catch(error => {
                        console.error('Error al solicitar permiso para magnetómetro:', error);
                        magStatus.textContent = 'Magnetómetro: ✗ Error al solicitar permiso';
                    });
            } else {
                // En no-iOS o iOS antiguo, verificar directamente
                detectMagnetometerWithOrientation();
            }
        } else {
            magStatus.textContent = 'Magnetómetro: ✗ No disponible';
        }
    } catch (e) {
        console.error('Error al detectar magnetómetro:', e);
        document.getElementById('magnetometer-status').textContent = 'Magnetómetro: ✗ Error al detectar';
    }
}

// Función auxiliar para detectar magnetómetro con DeviceOrientation
function detectMagnetometerWithOrientation() {
    let magTest = false;
    
    const handleOrientation = (event) => {
        if (event.absolute === true || typeof event.webkitCompassHeading !== 'undefined') {
            magTest = true;
        }
    };
    
    // Agregar listener para evento de orientación
    window.addEventListener('deviceorientation', handleOrientation);
    
    // Verificar después de un breve período
    setTimeout(() => {
        document.getElementById('magnetometer-status').textContent = 
            `Magnetómetro: ${magTest ? '✓ Disponible' : '✗ No disponible'}`;
        window.removeEventListener('deviceorientation', handleOrientation);
    }, 500);
}

// Comprobar sensor de proximidad (menos común en navegadores)
function checkProximitySensor() {
    try {
        // Verificar disponibilidad de ProximitySensor
        if ('ProximitySensor' in window) {
            document.getElementById('proximity-status').textContent = 'Sensor de proximidad: ✓ Disponible';
            return;
        }
        
        // Verificar disponibilidad de DeviceProximityEvent
        if ('DeviceProximityEvent' in window || 'ondeviceproximity' in window) {
            document.getElementById('proximity-status').textContent = 'Sensor de proximidad: ✓ Disponible';
            return;
        }
        
        // En iOS, podemos verificar si tiene FaceID como indicador indirecto
        if (browserInfo.isIOS && (/iPhone X/.test(navigator.userAgent) || parseInt(browserInfo.version) >= 11)) {
            document.getElementById('proximity-status').textContent = 'Sensor de proximidad: ✓ Probablemente disponible (FaceID)';
            return;
        }
        
        document.getElementById('proximity-status').textContent = 'Sensor de proximidad: ✗ No disponible';
    } catch (e) {
        document.getElementById('proximity-status').textContent = 'Sensor de proximidad: ✗ Error al detectar';
    }
}

// Evento para inicializar cuando la página esté cargada
window.addEventListener('load', function() {
    // Esperar a que el sistema AR esté inicializado
    setTimeout(initConfigPanel, 3000);
});

// Exportar funciones útiles para otros módulos
window.configUtils = {
    getBrowserInfo: () => browserInfo,
    checkDeviceSensors: checkDeviceSensors,
    toggleFlashlight: toggleFlashlight
};