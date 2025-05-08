// Elementos de la interfaz
const welcomeScreen = document.getElementById('welcome-screen');
const arContainer = document.getElementById('ar-container');
const startArButton = document.getElementById('start-ar');
const backButton = document.getElementById('back-button');
const debugPanel = document.getElementById('debug-panel');
const debugContent = document.getElementById('debug-content');
const toggleDebug = document.getElementById('toggle-debug');
const configButton = document.getElementById('config-button');
const configPanel = document.getElementById('config-panel');
const patternRatioSlider = document.getElementById('pattern-ratio');
const ratioValue = document.getElementById('ratio-value');
const detectionModeSelect = document.getElementById('detection-mode');
const thresholdSlider = document.getElementById('threshold-value');
const thresholdDisplay = document.getElementById('threshold-display');
const applyConfigButton = document.getElementById('apply-config');
const resetConfigButton = document.getElementById('reset-config');
const markerIndicator = document.getElementById('marker-indicator');
const markerName = document.getElementById('marker-name');
const ariaAnnouncer = document.getElementById('aria-announcer');

// Estado y variables globales
let debugIsMinimized = false;
let videoElement = null;
let markerDetected = {
    marker1: false,
    marker2: false,
    marker3: false
};

// Asegurarse de que los valores iniciales son correctos
patternRatioSlider.value = 0.75;
ratioValue.textContent = '0.75';
thresholdSlider.value = 80;
thresholdDisplay.textContent = '80';

// Función para anunciar mensajes al lector de pantalla
function announceToScreenReader(message) {
    if (ariaAnnouncer) {
        ariaAnnouncer.textContent = '';
        setTimeout(() => {
            ariaAnnouncer.textContent = message;
        }, 100);
    }
}

// Componente personalizado de AFRAME para manejo de eventos de marcadores
if (!AFRAME.components.registerevents) {
    AFRAME.registerComponent('registerevents', {
        init: function () {
            const marker = this.el;
            const markerId = marker.id;
            
            // Eventos de marcador encontrado
            marker.addEventListener('markerFound', function() {
                markerDetected[markerId] = true;
                addDebugMessage(`Marcador detectado: ${markerId}`, 'success');
                
                // Actualizar indicador visual
                markerIndicator.style.display = 'block';
                markerName.textContent = markerId;
                
                // Anunciar para accesibilidad
                announceToScreenReader(`Marcador ${markerId} detectado`);
                
                // Comportamiento específico por marcador
                if (markerId === 'marker1') {
                    handleMarker1Found();
                }
            });
            
            // Eventos de marcador perdido
            marker.addEventListener('markerLost', function() {
                markerDetected[markerId] = false;
                addDebugMessage(`Marcador perdido: ${markerId}`, 'warning');
                
                // Actualizar indicador visual
                let anyMarkerVisible = Object.values(markerDetected).some(detected => detected);
                if (!anyMarkerVisible) {
                    markerIndicator.style.display = 'none';
                    markerName.textContent = 'ninguno';
                    // Anunciar para accesibilidad
                    announceToScreenReader('Ningún marcador visible');
                }
                
                // Comportamiento específico por marcador
                if (markerId === 'marker1') {
                    handleMarker1Lost();
                }
            });
        }
    });
}

// Función para manejar cuando se encuentra el marcador 1 (video)
function handleMarker1Found() {
    try {
        if (!videoElement) {
            videoElement = document.getElementById('animal-video-asset');
        }
        
        if (videoElement) {
            // Siempre iniciar silenciado (requerimiento de la mayoría de navegadores móviles)
            videoElement.muted = true;
            
            // Utilizamos una promesa para manejar la reproducción
            const playPromise = videoElement.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    addDebugMessage('Video reproduciendo (inicialmente silenciado)', 'info');
                    
                    // Intentar quitar el silencio después de interacción del usuario
                    document.addEventListener('touchstart', unmuteBound, { once: true });
                    document.addEventListener('click', unmuteBound, { once: true });
                    
                }).catch(e => {
                    addDebugMessage(`Problema al reproducir video: ${e.message}`, 'error');
                });
            }
        } else {
            addDebugMessage('Error: No se encontró el elemento de video', 'error');
        }
    } catch (e) {
        addDebugMessage(`Error al reproducir video: ${e.message}`, 'error');
    }
}

// Función para quitar silencio, enlazada a eventos de interacción
function unmuteVideo() {
    if (videoElement && markerDetected.marker1) {
        videoElement.muted = false;
        addDebugMessage('Audio de video habilitado tras interacción', 'success');
    }
}
const unmuteBound = unmuteVideo.bind(this);

// Función para manejar cuando se pierde el marcador 1 (video)
function handleMarker1Lost() {
    try {
        if (videoElement) {
            videoElement.pause();
            videoElement.currentTime = 0;
            videoElement.muted = true; // Silenciar para evitar reproducción no deseada
            addDebugMessage('Video pausado', 'info');
        }
    } catch (e) {
        addDebugMessage(`Error al pausar video: ${e.message}`, 'error');
    }
}

// Función para verificar y solicitar permiso de cámara
async function checkAndRequestCameraPermission() {
    try {
        // Verificar si ya tenemos permiso (puede fallar en algunos navegadores)
        const permissionStatus = await navigator.permissions.query({ name: 'camera' })
            .catch(() => ({ state: 'prompt' }));
            
        if (permissionStatus.state === 'granted') {
            return true;
        } else if (permissionStatus.state === 'denied') {
            addDebugMessage('Permiso de cámara denegado. Por favor, habilítelo en la configuración de su navegador.', 'error');
            return false;
        }
        
        // Solicitar permiso
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' }, 
            audio: false 
        });
        
        // Cerrar el stream inmediatamente después de verificar el permiso
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (error) {
        addDebugMessage(`Error al acceder a la cámara: ${error.message}`, 'error');
        return false;
    }
}

// Función para obtener todos los parámetros de configuración AR.js
function getArJsParameters() {
    const scene = document.getElementById('ar-scene');
    if (!scene) return null;
    
    // Obtener la configuración actual
    const arjsSystem = scene.systems['arjs'];
    if (!arjsSystem) return null;
    
    return {
        patternRatio: patternRatioSlider.value,
        detectionMode: detectionModeSelect.value,
        threshold: thresholdSlider.value
    };
}

// Función para aplicar configuración AR.js
function applyArJsConfig(config) {
    const scene = document.getElementById('ar-scene');
    if (!scene) {
        addDebugMessage('Error: No se puede acceder a la escena AR', 'error');
        return;
    }
    
    // Construir string de configuración
    let arjsConfigString = scene.getAttribute('arjs');
    
    // Actualizar patternRatio
    if (arjsConfigString.includes('patternRatio:')) {
        arjsConfigString = arjsConfigString.replace(/patternRatio: [0-9.]+/, `patternRatio: ${config.patternRatio}`);
    } else {
        arjsConfigString += `; patternRatio: ${config.patternRatio}`;
    }
    
    // Actualizar detectionMode
    if (arjsConfigString.includes('detectionMode:')) {
        arjsConfigString = arjsConfigString.replace(/detectionMode: [a-zA-Z_]+/, `detectionMode: ${config.detectionMode}`);
    } else {
        arjsConfigString += `; detectionMode: ${config.detectionMode}`;
    }
    
    // Aplicar configuración
    scene.setAttribute('arjs', arjsConfigString);
    
    // Reiniciar arjs
    try {
        const arSystem = scene.systems['arjs'];
        if (arSystem && arSystem._arController) {
            // Actualizar la configuración
            arSystem._arController.setPatternDetectionMode(config.detectionMode === 'mono' ? 0 : 1);
            arSystem._arController.setThresholdMode(0); // Auto
            arSystem._arController.setThreshold(parseInt(config.threshold)); // Usar valor del slider
            arSystem._arController.setPatternRatio(parseFloat(config.patternRatio));
            
            addDebugMessage(`Configuración actualizada: ratio=${config.patternRatio}, modo=${config.detectionMode}, umbral=${config.threshold}`, 'success');
        } else {
            addDebugMessage('No se pudo acceder al controlador AR para actualizar la configuración', 'warning');
        }
    } catch (e) {
        addDebugMessage(`Error al actualizar configuración AR: ${e.message}`, 'error');
    }
}

// Función para agregar mensajes de depuración
function addDebugMessage(message, type = 'info') {
    const messageElement = document.createElement('div');
    messageElement.className = `debug-message debug-${type}`;
    messageElement.textContent = message;
    
    debugContent.appendChild(messageElement);
    debugContent.scrollTop = debugContent.scrollHeight;
    
    // Límite de mensajes (mantener los últimos 50)
    while (debugContent.children.length > 50) {
        debugContent.removeChild(debugContent.firstChild);
    }
    
    // También enviamos al console.log para depuración adicional
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// Función para crear un indicador visual para ayudar en la detección de marcadores
function createMarkerHelper() {
    const scene = document.getElementById('ar-scene');
    if (!scene) return;
    
    // Crear un elemento visual para ayudar al usuario
    const helperEntity = document.createElement('a-entity');
    helperEntity.setAttribute('id', 'marker-helper');
    helperEntity.setAttribute('position', '0 0 -1'); // Frente a la cámara
    helperEntity.setAttribute('geometry', 'primitive: ring; radiusInner: 0.4; radiusOuter: 0.5');
    helperEntity.setAttribute('material', 'color: #00dbde; shader: flat; opacity: 0.8');
    helperEntity.setAttribute('animation', 'property: scale; from: 0.5 0.5 0.5; to: 1.5 1.5 1.5; dur: 1500; easing: easeInOutQuad; loop: true');
    
    // Añadir a la cámara para que se mueva con ella
    const camera = scene.querySelector('a-entity[camera]');
    if (camera) {
        camera.appendChild(helperEntity);
        addDebugMessage('Ayuda visual para detección de marcadores activada', 'info');
    }
    
    // Ocultar cuando se detecta un marcador
    document.addEventListener('markerFound', function hideHelper() {
        if (helperEntity.parentNode) {
            helperEntity.setAttribute('visible', 'false');
        }
    });
    
    // Mostrar cuando no hay marcadores detectados
    document.addEventListener('markerLost', function showHelper() {
        if (!Object.values(markerDetected).some(d => d) && helperEntity.parentNode) {
            helperEntity.setAttribute('visible', 'true');
        }
    });
}

// Detectar capacidades del dispositivo
function detectDeviceCapabilities() {
    const capabilities = {
        isHighEnd: false,
        fps: 30,
        resolution: 'medium',
        webGL2: false
    };
    
    // Verificar WebGL2
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2');
        capabilities.webGL2 = !!gl;
    } catch (e) {
        capabilities.webGL2 = false;
    }
    
    // Verificar rendimiento
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    if (!isMobile) {
        capabilities.isHighEnd = true; // Probablemente desktop
        capabilities.fps = 60;
        capabilities.resolution = 'high';
    } else {
        // Intentar detectar dispositivos de gama alta
        const isRecentiPhone = /iPhone/.test(userAgent) && !/(iPhone\s(5|6|7|8|SE|X))/.test(userAgent);
        const isRecentAndroid = /Android/.test(userAgent) && /Android\s([8-9]|1[0-9])/.test(userAgent);
        
        if (isRecentiPhone || isRecentAndroid) {
            capabilities.isHighEnd = true;
            capabilities.fps = 60;
            capabilities.resolution = 'high';
        }
    }
    
    // Aplicar configuración basada en capacidades
    if (capabilities.isHighEnd) {
        addDebugMessage('Dispositivo de alta capacidad detectado - usando configuración óptima', 'success');
    } else {
        addDebugMessage('Dispositivo de capacidad estándar - adaptando rendimiento', 'info');
        // Ajustar parámetros AR.js para mejorar rendimiento
        adjustARPerformance(false);
    }
    
    return capabilities;
}

// Ajustar rendimiento basado en capacidades
function adjustARPerformance(isHighEnd) {
    const scene = document.getElementById('ar-scene');
    if (!scene) return;
    
    if (!isHighEnd) {
        // Configuración para dispositivos de menor capacidad
        let arjsConfigString = scene.getAttribute('arjs');
        arjsConfigString = arjsConfigString.replace(/maxDetectionRate: [0-9.]+/, 'maxDetectionRate: 20');
        scene.setAttribute('arjs', arjsConfigString);
        
        // Bajar calidad del renderizador
        const rendererSystem = scene.systems.renderer;
        if (rendererSystem && rendererSystem.renderer) {
            rendererSystem.renderer.setPixelRatio(1);
        }
    }
}

// Función para manejar cambios de orientación
function handleOrientationChange() {
    return new Promise((resolve) => {
        window.addEventListener('orientationchange', function() {
            addDebugMessage('Cambio de orientación detectado', 'info');
            announceToScreenReader('Orientación de pantalla cambiada, reajustando vista');
            
            // Esperar a que se complete el cambio de orientación
            setTimeout(() => {
                // Obtener nuevas dimensiones
                const width = window.innerWidth;
                const height = window.innerHeight;
                addDebugMessage(`Nueva resolución: ${width}x${height}`, 'info');
                
                // Actualizar el renderer si existe
                const scene = document.getElementById('ar-scene');
                if (scene && scene.object3D) {
                    if (scene.systems.renderer && scene.systems.renderer.renderer) {
                        scene.systems.renderer.renderer.setSize(width, height);
                        addDebugMessage('Renderer redimensionado', 'success');
                    }
                    
                    // Actualizar la cámara
                    const camera = scene.camera;
                    if (camera) {
                        camera.aspect = width / height;
                        camera.updateProjectionMatrix();
                        addDebugMessage('Cámara actualizada', 'success');
                    }
                }
                
                // Forzar actualización de detección de marcadores
                forceMarkerDetectionUpdate();
                resolve();
            }, 300);
        });
    });
}

// Función para verificar recursos
async function checkResources() {
    try {
        addDebugMessage('Verificando recursos AR...', 'info');
        
        // Lista de recursos que debemos verificar
        const resources = [
            { tipo: 'Marcador', ruta: 'markers/pattern-marker1.patt' },
            { tipo: 'Marcador', ruta: 'markers/pattern-marker2.patt' },
            { tipo: 'Marcador', ruta: 'markers/pattern-marker3.patt' },
            { tipo: 'Video', ruta: 'media/sonidos_animales.mp4' },
            { tipo: 'Modelo 3D', ruta: 'media/volcano.glb' },
            { tipo: 'Imagen', ruta: 'media/matematicas.png' }
        ];
        
        // Verificar cada recurso
        let resourcesOk = true;
        for (const resource of resources) {
            try {
                const response = await fetch(resource.ruta, { method: 'HEAD' });
                if (response.ok) {
                    addDebugMessage(`${resource.tipo} (${resource.ruta}) cargado correctamente`, 'success');
                } else {
                    addDebugMessage(`Error: No se encontró ${resource.tipo} (${resource.ruta})`, 'error');
                    resourcesOk = false;
                }
            } catch (e) {
                addDebugMessage(`Error verificando ${resource.tipo} (${resource.ruta}): ${e.message}`, 'error');
                resourcesOk = false;
            }
        }
        
        if (resourcesOk) {
            addDebugMessage('Todos los recursos verificados correctamente', 'success');
            // Tiempo para dejar que el sistema se inicialice completamente
            setTimeout(() => {
                addDebugMessage('Sistema AR listo - Apunta a los marcadores', 'success');
                // Llamar a función de verificación de marcadores
                checkMarkerValidity();
            }, 3000);
        } else {
            addDebugMessage('Algunos recursos no están disponibles. La experiencia AR puede no funcionar correctamente.', 'warning');
        }
        
    } catch (error) {
        addDebugMessage(`Error al verificar recursos: ${error.message}`, 'error');
    }
}

// Función para verificar la calidad de los marcadores
function checkMarkerValidity() {
    addDebugMessage('Verificando calidad de marcadores...', 'info');
    
    // Verificar disponibilidad de marcadores
    const markers = document.querySelectorAll('a-marker');
    if (markers.length === 0) {
        addDebugMessage('No se encontraron marcadores en la escena', 'error');
        return;
    }
    
    addDebugMessage(`Encontrados ${markers.length} marcadores en la escena`, 'success');
    
    // Intentar forzar una actualización de marcadores
    setTimeout(() => {
        const scene = document.getElementById('ar-scene');
        if (scene && scene.systems['arjs']) {
            try {
                const arSystem = scene.systems['arjs'];
                if (arSystem && arSystem._arController) {
                    // Forzar actualización de parámetros
                    arSystem._arController.setThresholdMode(0);
                    arSystem._arController.setThreshold(80);
                    arSystem._arController.setPatternRatio(0.75);
                    
                    addDebugMessage('Parámetros de detección de marcadores optimizados', 'success');
                    
                    // Verificar configuración de procesamiento de imagen
                    const processingMode = arSystem._arController.getProcessingMode();
                    addDebugMessage(`Modo de procesamiento actual: ${processingMode}`, 'info');
                    
                    // Agregar mensajes de ayuda para mejorar la detección
                    addDebugMessage('Consejos para mejor detección:', 'info');
                    addDebugMessage('1. Asegúrate de tener buena iluminación', 'info');
                    addDebugMessage('2. Evita reflejos en los marcadores', 'info');
                    addDebugMessage('3. Mantén el marcador completamente visible', 'info');
                    addDebugMessage('4. Distancia óptima: 20-50cm del marcador', 'info');
                }
            } catch (e) {
                addDebugMessage(`Error al optimizar marcadores: ${e.message}`, 'error');
            }
        }
    }, 5000);
}

// Función para mejorar manualmente la detección de marcadores
function forceMarkerDetectionUpdate() {
    const scene = document.getElementById('ar-scene');
    if (!scene || !scene.systems['arjs']) return;
    
    try {
        const arSystem = scene.systems['arjs'];
        if (arSystem && arSystem._arController) {
            // Configurar parámetros óptimos
            const config = {
                patternRatio: parseFloat(patternRatioSlider.value),
                detectionMode: detectionModeSelect.value,
                threshold: parseInt(thresholdSlider.value)
            };
            
            // Aplicar configuración optimizada
            arSystem._arController.setPatternDetectionMode(config.detectionMode === 'mono' ? 0 : 1);
            arSystem._arController.setThresholdMode(0); // Auto
            arSystem._arController.setThreshold(config.threshold);
            arSystem._arController.setPatternRatio(config.patternRatio);
            
            addDebugMessage('Forzada actualización de parámetros de detección', 'success');
        }
    } catch (e) {
        addDebugMessage(`Error al forzar actualización: ${e.message}`, 'error');
    }
}

// Función para cambiar entre cámaras
function addCameraSwitchButton() {
    const switchCameraButton = document.createElement('button');
    switchCameraButton.textContent = '📷 Cambiar cámara';
    switchCameraButton.id = 'switch-camera-button';
    switchCameraButton.setAttribute('aria-label', 'Cambiar entre cámara frontal y trasera');
    
    switchCameraButton.addEventListener('click', async () => {
        try {
            // Obtener la configuración actual
            const scene = document.getElementById('ar-scene');
            if (!scene || !scene.systems['arjs']) {
                throw new Error('Sistema AR no inicializado');
            }
            
            const arSystem = scene.systems['arjs'];
            if (!arSystem || !arSystem._arSource) {
                throw new Error('Fuente AR no disponible');
            }
            
            // Detener la cámara actual
            arSystem._arSource.stop();
            
            // Cambiar la configuración de facingMode
            const currentFacingMode = arSystem._arSource.parameters.facingMode;
            const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
            arSystem._arSource.parameters.facingMode = newFacingMode;
            
            // Reiniciar la cámara con la nueva configuración
            await arSystem._arSource.init();
            await arSystem._arSource.start();
            
            addDebugMessage(`Cambiado a cámara: ${newFacingMode === 'environment' ? 'trasera' : 'frontal'}`, 'success');
            announceToScreenReader(`Cambiado a cámara ${newFacingMode === 'environment' ? 'trasera' : 'frontal'}`);
            
        } catch (error) {
            addDebugMessage(`Error al cambiar cámara: ${error.message}`, 'error');
        }
    });
    
    arContainer.appendChild(switchCameraButton);
}

// Añadir botón para forzar actualización
function addForceUpdateButton() {
    const forceUpdateButton = document.createElement('button');
    forceUpdateButton.textContent = '🔄 Forzar detección';
    forceUpdateButton.id = 'force-update-button'; 
    forceUpdateButton.className = 'config-button';
    forceUpdateButton.setAttribute('aria-label', 'Forzar actualización de detección de marcadores');
    
    forceUpdateButton.addEventListener('click', forceMarkerDetectionUpdate);
    arContainer.appendChild(forceUpdateButton);
}

// Implementar soporte para modo offline con Service Worker
function setupOfflineSupport() {
    if ('serviceWorker' in navigator) {
        // Comprobar si existe el archivo service-worker.js antes de registrarlo
        fetch('service-worker.js', { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    return navigator.serviceWorker.register('service-worker.js');
                } else {
                    throw new Error('El archivo service-worker.js no está disponible');
                }
            })
            .then(registration => {
                addDebugMessage('Service Worker registrado, soporte offline habilitado', 'success');
            })
            .catch(error => {
                addDebugMessage(`Modo offline no disponible: ${error.message}`, 'warning');
            });
    } else {
        addDebugMessage('Este navegador no soporta Service Workers (no se podrá usar offline)', 'warning');
    }
}

// Inicializar la interfaz y los elementos de accesibilidad
function enhanceAccessibility() {
    // Añadir atributos ARIA a los elementos de UI
    startArButton.setAttribute('aria-label', 'Iniciar experiencia de Realidad Aumentada');
    backButton.setAttribute('aria-label', 'Volver a la pantalla de inicio');
    configButton.setAttribute('aria-label', 'Abrir panel de configuración');
    
    // Función para anunciar eventos importantes ya está definida (announceToScreenReader)
}

// Control del panel de depuración
toggleDebug.addEventListener('click', () => {
    if (debugIsMinimized) {
        debugContent.style.display = 'block';
        toggleDebug.textContent = '−';
        toggleDebug.setAttribute('aria-label', 'Minimizar panel de depuración');
        debugIsMinimized = false;
    } else {
        debugContent.style.display = 'none';
        toggleDebug.textContent = '+';
        toggleDebug.setAttribute('aria-label', 'Expandir panel de depuración');
        debugIsMinimized = true;
    }
});

// Control del panel de configuración
configButton.addEventListener('click', () => {
    const newDisplay = configPanel.style.display === 'none' ? 'block' : 'none';
    configPanel.style.display = newDisplay;
    
    if (newDisplay === 'block') {
        announceToScreenReader('Panel de configuración abierto');
    } else {
        announceToScreenReader('Panel de configuración cerrado');
    }
});

// Actualizar valor mostrado del slider
patternRatioSlider.addEventListener('input', () => {
    ratioValue.textContent = patternRatioSlider.value;
});

// Actualizar valor mostrado del slider de umbral
thresholdSlider.addEventListener('input', () => {
    thresholdDisplay.textContent = thresholdSlider.value;
});

// Aplicar configuración
applyConfigButton.addEventListener('click', () => {
    const config = {
        patternRatio: patternRatioSlider.value,
        detectionMode: detectionModeSelect.value,
        threshold: thresholdSlider.value
    };
    
    applyArJsConfig(config);
    configPanel.style.display = 'none';
    announceToScreenReader('Configuración aplicada');
});

// Resetear configuración
resetConfigButton.addEventListener('click', () => {
    patternRatioSlider.value = 0.75;
    ratioValue.textContent = '0.75';
    detectionModeSelect.value = 'mono';
    thresholdSlider.value = 80;
    thresholdDisplay.textContent = '80';
    
    const config = {
        patternRatio: 0.75,
        detectionMode: 'mono',
        threshold: 80
    };
    
    applyArJsConfig(config);
    addDebugMessage('Configuración restablecida a valores optimizados', 'info');
    announceToScreenReader('Configuración restablecida a valores predeterminados');
});

// Evento para iniciar AR
startArButton.addEventListener('click', async () => {
    try {
        addDebugMessage('Verificando compatibilidad del dispositivo...', 'info');
        
        // Verificar compatibilidad
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            addDebugMessage('Error: Dispositivo no compatible con acceso a cámara', 'error');
            alert('Tu dispositivo no soporta acceso a la cámara o el navegador no es compatible.');
            return;
        }
        
        // Verificar permisos de cámara
        const permissionGranted = await checkAndRequestCameraPermission();
        if (!permissionGranted) {
            addDebugMessage('No se pudo obtener permiso para la cámara', 'error');
            alert('No se puede iniciar AR sin permiso para la cámara.');
            return;
        }
        
        // Obtener información de las cámaras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        addDebugMessage(`Cámaras detectadas: ${cameras.length}`, 'info');
        
        // Detectar capacidades del dispositivo
        const capabilities = detectDeviceCapabilities();
        
        // Precarga de video manualmente para evitar problemas
        videoElement = document.getElementById('animal-video-asset');
        if (videoElement) {
            videoElement.load();
            videoElement.muted = true; // Inicialmente silenciado
            videoElement.setAttribute('playsinline', '');
            addDebugMessage('Video precargado correctamente', 'success');
        }
        
        // Mostrar AR y ocultar pantalla de bienvenida
        welcomeScreen.style.display = 'none';
        arContainer.style.display = 'block';
        announceToScreenReader('Experiencia de realidad aumentada iniciada. Apunte su cámara hacia un marcador.');
        
        // Inicializar video
        if (videoElement) {
            // Preparar el video pero mantenerlo pausado
            videoElement.currentTime = 0;
            
            // Manejar eventos de video para depuración
            videoElement.addEventListener('play', () => {
                addDebugMessage('Evento: Video iniciado', 'info');
            });
            
            videoElement.addEventListener('pause', () => {
                addDebugMessage('Evento: Video pausado', 'info');
            });
            
            videoElement.addEventListener('error', (e) => {
                addDebugMessage(`Error de video: ${e.message || 'Error desconocido'}`, 'error');
            });
        }
        
        // Añadir ayuda visual para detección de marcadores
        createMarkerHelper();
        
        // Añadir botón para cambiar de cámara
        if (cameras.length > 1) {
            addCameraSwitchButton();
        }
        
        // Añadir botón para forzar actualización
        addForceUpdateButton();
        
        // Configurar manejo de orientación
        handleOrientationChange();
        
        // Verificar recursos
        checkResources();
        
        // Configurar soporte offline
        setupOfflineSupport();
        
        // Mejorar accesibilidad
        enhanceAccessibility();
        
    } catch (error) {
        addDebugMessage(`Error al iniciar AR: ${error.message}`, 'error');
        console.error('Error:', error);
        alert(`Error al iniciar AR: ${error.message}`);
    }
});

// Evento para volver atrás
backButton.addEventListener('click', () => {
    addDebugMessage('Volviendo a la pantalla de inicio...', 'info');
    
    // Pausar el video si está reproduciéndose
    if (videoElement) {
        videoElement.pause();
        videoElement.currentTime = 0;
        videoElement.muted = true;
    }
    
    // Detener la cámara y AR
    try {
        const scene = document.getElementById('ar-scene');
        if (scene && scene.systems['arjs']) {
            const arSystem = scene.systems['arjs'];
            if (arSystem && arSystem._arSource) {
                arSystem._arSource.stop();
                arSystem._arSource.destroy();
            }
        }
    } catch (e) {
        addDebugMessage(`Error al detener AR: ${e.message}`, 'error');
    }
    
    // Restablecer indicadores de detección de marcadores
    markerDetected = {
        marker1: false,
        marker2: false,
        marker3: false
    };
    
    // Ocultar indicador de marcador
    markerIndicator.style.display = 'none';
    
    // Mostrar pantalla de bienvenida y ocultar AR
    arContainer.style.display = 'none';
    welcomeScreen.style.display = 'flex';
    configPanel.style.display = 'none'; // Ocultar panel de configuración
    
    // Eliminar botones dinámicos
    const switchCameraButton = document.getElementById('switch-camera-button');
    if (switchCameraButton) {
        switchCameraButton.remove();
    }
    
    const forceUpdateButton = document.getElementById('force-update-button');
    if (forceUpdateButton) {
        forceUpdateButton.remove();
    }
    
    // Reiniciar panel de depuración
    debugContent.innerHTML = '<div class="debug-message debug-info">Sistema AR inicializando...</div>';
    if (debugIsMinimized) {
        debugContent.style.display = 'block';
        toggleDebug.textContent = '−';
        debugIsMinimized = false;
    }
    
    // Anunciar para accesibilidad
    announceToScreenReader('Ha vuelto a la pantalla de inicio');
});

// Prevenir comportamientos no deseados en dispositivos táctiles
document.addEventListener('touchmove', function(e) {
    if (arContainer.style.display === 'block') {
        e.preventDefault();
    }
}, { passive: false });

// Detectar cuando la página pierde el foco para pausar el video
document.addEventListener('visibilitychange', () => {
    if (document.hidden && videoElement) {
        videoElement.pause();
    }
});

// Mostrar mensaje inicial
addDebugMessage('Aplicación AR lista. Haga clic en "Iniciar AR" para comenzar.', 'info');

// Configurar manejo de errores global
window.addEventListener('error', (event) => {
    addDebugMessage(`Error global: ${event.message}`, 'error');
});

// Agregar función para manejar problemas de inicialización AR.js
window.addEventListener('artoolkitNFTCreated', function(ev) {
    addDebugMessage('ARToolkit NFT inicializado correctamente', 'success');
});