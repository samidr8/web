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
        showDeviceInfo(); // Esta función ahora es async
    });

    document.querySelector('.close-panel-btn').addEventListener('click', function () {
        configPanel.style.display = 'none';
        if (flashOn) {
            toggleFlash();
        }

        if (flashStream && !flashOn) {
            flashStream.getTracks().forEach(track => track.stop());
            flashStream = null;
            flashTrack = null;
        }
    });

    document.getElementById('toggle-flash').addEventListener('click', toggleFlash);

    // ===== DETECCIÓN DE DISPOSITIVOS CORREGIDA CON USER-AGENT CLIENT HINTS =====
    
    // Función principal para detección de dispositivos
    async function getDeviceInfo() {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform || '';
        const vendor = navigator.vendor || '';
        
        console.log('🔍 UserAgent completo:', userAgent);
        console.log('🔍 Platform:', platform);
        console.log('🔍 Vendor:', vendor);
        
        // Variables para almacenar información
        let os = 'Desconocido';
        let osVersion = '';
        let browser = 'Desconocido';
        let browserVersion = '';
        let deviceType = 'Escritorio';
        let deviceModel = '';
        
        // 🚀 NUEVA API: User-Agent Client Hints (Solución al problema de Android 10)
        let clientHintsInfo = null;
        
        if ('userAgentData' in navigator && navigator.userAgentData) {
            try {
                console.log('✅ User-Agent Client Hints disponible');
                
                // Obtener información básica
                const basicInfo = navigator.userAgentData;
                console.log('📊 Información básica:', basicInfo);
                
                // Obtener información detallada (requiere permisos)
                clientHintsInfo = await navigator.userAgentData.getHighEntropyValues([
                    'platform',
                    'platformVersion',
                    'architecture',
                    'model',
                    'uaFullVersion',
                    'bitness',
                    'fullVersionList'
                ]);
                
                console.log('🎯 Client Hints detallados:', clientHintsInfo);
                
                // Usar Client Hints para obtener información real
                if (clientHintsInfo.platform) {
                    if (clientHintsInfo.platform === 'Android') {
                        const realVersion = clientHintsInfo.platformVersion || 'Versión no disponible';
                        os = `Android ${realVersion}`;
                        osVersion = realVersion;
                        
                        // Obtener modelo real del dispositivo
                        if (clientHintsInfo.model && clientHintsInfo.model !== 'K') {
                            deviceModel = clientHintsInfo.model;
                        }
                        
                        // Determinar si es móvil o tablet
                        deviceType = basicInfo.mobile ? 'Android Móvil' : 'Android Tablet';
                        
                        console.log('✅ Android real detectado:', os, 'Modelo:', deviceModel);
                    } else if (clientHintsInfo.platform === 'Windows') {
                        // Corregir detección de Windows usando Client Hints
                        const winVersion = clientHintsInfo.platformVersion;
                        if (winVersion) {
                            // Mapear versiones de Windows correctamente
                            const majorVersion = parseInt(winVersion.split('.')[0]);
                            if (majorVersion >= 10) {
                                // Windows 11 se identifica por build number, no por version major
                                // Pero Client Hints puede dar información más precisa
                                if (winVersion.includes('22000') || majorVersion >= 22000 || winVersion >= '10.0.22000') {
                                    os = 'Windows 11';
                                } else {
                                    os = 'Windows 10';
                                }
                            } else {
                                os = `Windows ${winVersion}`;
                            }
                        } else {
                            os = 'Windows';
                        }
                        deviceType = 'Escritorio Windows';
                        console.log('✅ Windows detectado:', os);
                    } else {
                        // Para otras plataformas (macOS, Linux, etc.)
                        os = clientHintsInfo.platform;
                        if (clientHintsInfo.platformVersion) {
                            // No agregar version para evitar números raros en otras plataformas
                            if (clientHintsInfo.platform === 'macOS') {
                                os = `macOS ${clientHintsInfo.platformVersion}`;
                            } else if (clientHintsInfo.platform === 'Linux') {
                                os = 'Linux';
                            } else {
                                os = clientHintsInfo.platform;
                            }
                        }
                        deviceType = `Escritorio ${clientHintsInfo.platform}`;
                    }
                }
                
                // Obtener información del navegador desde Client Hints
                if (clientHintsInfo.fullVersionList && clientHintsInfo.fullVersionList.length > 0) {
                    // Buscar el navegador principal (no "Chromium" genérico)
                    const mainBrowser = clientHintsInfo.fullVersionList.find(b => 
                        b.brand && !b.brand.includes('Not') && b.brand !== 'Chromium'
                    ) || clientHintsInfo.fullVersionList[0];
                    
                    if (mainBrowser) {
                        browser = `${mainBrowser.brand} ${mainBrowser.version}`;
                        browserVersion = mainBrowser.version;
                    }
                }
                
            } catch (error) {
                console.warn('⚠️ Error obteniendo Client Hints:', error);
                // Fallback al método tradicional
                clientHintsInfo = null;
            }
        } else {
            console.log('❌ User-Agent Client Hints no disponible');
        }
        
        // 🔄 FALLBACK: Detección tradicional si no hay Client Hints
        if (!clientHintsInfo) {
            console.log('🔄 Usando detección tradicional de User Agent');
            
            // Detección de SO tradicional mejorada
            if (/Android/i.test(userAgent)) {
                // Advertir sobre limitación de Android 10
                const androidMatch = userAgent.match(/Android\s+([\d\.]+)/i);
                if (androidMatch && androidMatch[1] === '10') {
                    os = `Android ${androidMatch[1]} (⚠️ Puede ser versión congelada)`;
                    console.warn('⚠️ ADVERTENCIA: Chrome congela Android como versión 10. La versión real puede ser diferente.');
                } else {
                    os = androidMatch ? `Android ${androidMatch[1]}` : 'Android (versión no detectada)';
                }
                
                // Detectar tipo de dispositivo Android
                deviceType = /Mobile/i.test(userAgent) ? 'Android Móvil' : 'Android Tablet';
                
                // Intentar detectar modelo (limitado por congelación)
                const modelPatterns = [
                    /;\s*([^;]+\s+[^;]+)\s+Build/i,
                    /;\s*(SM-[^\s;]+)/i,
                    /;\s*(Redmi[^;]+)/i,
                    /;\s*(Mi\s+[^;]+)/i,
                    /;\s*(POCO[^;]+)/i,
                    /;\s*(OnePlus[^;]+)/i,
                    /;\s*(Pixel[^;]+)/i
                ];
                
                for (const pattern of modelPatterns) {
                    const match = userAgent.match(pattern);
                    if (match && match[1] && match[1] !== 'K') {
                        deviceModel = match[1].trim();
                        break;
                    }
                }
                
                if (deviceModel === 'K') {
                    deviceModel = 'Modelo congelado por privacidad';
                }
            }
            // iOS
            else if (/iPhone|iPad|iPod/i.test(userAgent) || /Mac.*Mobile/i.test(userAgent)) {
                const iosMatch = userAgent.match(/OS\s+([\d_]+)/i);
                osVersion = iosMatch ? iosMatch[1].replace(/_/g, '.') : '';
                os = osVersion ? `iOS ${osVersion}` : 'iOS (versión no detectada)';
                
                if (/iPhone/i.test(userAgent)) {
                    deviceType = 'iPhone';
                } else if (/iPad/i.test(userAgent)) {
                    deviceType = 'iPad';
                }
            }
            // Otros sistemas (fallback mejorado)
            else if (/Windows/i.test(userAgent)) {
                const winMatch = userAgent.match(/Windows NT ([\d\.]+)/);
                if (winMatch) {
                    const ntVersion = winMatch[1];
                    // Mapeo correcto de versiones de Windows NT
                    const windowsVersions = {
                        '10.0': 'Windows 10', // Por defecto Windows 10
                        '6.3': 'Windows 8.1',
                        '6.2': 'Windows 8',
                        '6.1': 'Windows 7',
                        '6.0': 'Windows Vista'
                    };
                    
                    // Para Windows 10/11, intentar detectar mejor
                    if (ntVersion === '10.0') {
                        // Windows 11 detection fallback (no es 100% preciso sin Client Hints)
                        // Buscar pistas en el user agent
                        if (userAgent.includes('Windows NT 10.0; Win64; x64')) {
                            // Sin Client Hints, es difícil distinguir entre 10 y 11
                            os = 'Windows 10/11';
                        } else {
                            os = 'Windows 10';
                        }
                    } else {
                        os = windowsVersions[ntVersion] || `Windows NT ${ntVersion}`;
                    }
                } else {
                    os = 'Windows';
                }
                deviceType = 'Escritorio Windows';
            }
            else if (/Mac/i.test(userAgent) && !/Mobile/i.test(userAgent)) {
                const macMatch = userAgent.match(/Mac OS X ([\d_]+)/);
                os = macMatch ? `macOS ${macMatch[1].replace(/_/g, '.')}` : 'macOS';
            }
            else if (/Linux/i.test(userAgent)) {
                os = 'Linux';
            }
            
            // Detección de navegador tradicional
            if (/EdgA?/i.test(userAgent)) {
                const edgeMatch = userAgent.match(/EdgA?\/([\d\.]+)/);
                browser = edgeMatch ? `Edge ${edgeMatch[1]}` : 'Edge';
            } else if (/SamsungBrowser/i.test(userAgent)) {
                const samsungMatch = userAgent.match(/SamsungBrowser\/([\d\.]+)/);
                browser = samsungMatch ? `Samsung Internet ${samsungMatch[1]}` : 'Samsung Internet';
            } else if (/OPR|Opera/i.test(userAgent)) {
                const operaMatch = userAgent.match(/(?:OPR|Opera)\/([\d\.]+)/);
                browser = operaMatch ? `Opera ${operaMatch[1]}` : 'Opera';
            } else if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) {
                const chromeMatch = userAgent.match(/Chrome\/([\d\.]+)/);
                browser = chromeMatch ? `Chrome ${chromeMatch[1]}` : 'Chrome';
            } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
                const safariMatch = userAgent.match(/Version\/([\d\.]+)/);
                browser = safariMatch ? `Safari ${safariMatch[1]}` : 'Safari';
            } else if (/Firefox/i.test(userAgent)) {
                const firefoxMatch = userAgent.match(/Firefox\/([\d\.]+)/);
                browser = firefoxMatch ? `Firefox ${firefoxMatch[1]}` : 'Firefox';
            }
        }
        
        // Información adicional del dispositivo
        const deviceInfo = {
            os,
            osVersion,
            browser,
            browserVersion,
            deviceType,
            deviceModel,
            screenResolution: `${screen.width}x${screen.height}`,
            pixelRatio: window.devicePixelRatio || 1,
            touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            clientHintsSupported: !!clientHintsInfo,
            clientHintsData: clientHintsInfo,
            isAndroidFrozen: /Android 10/i.test(userAgent) && /Chrome/i.test(userAgent),
            fullUserAgent: userAgent
        };
        
        return deviceInfo;
    }

    // Función mejorada para mostrar información del dispositivo
    async function showDeviceInfo() {
        try {
            const info = await getDeviceInfo();
            
            // Mostrar información básica
            document.getElementById('browser-info').textContent = info.browser;
            document.getElementById('os-info').textContent = info.os;
            
            // Mostrar tipo de dispositivo con modelo si está disponible
            let deviceDisplay = info.deviceType;
            if (info.deviceModel && info.deviceModel !== 'Modelo congelado por privacidad') {
                deviceDisplay += ` (${info.deviceModel})`;
            }
            document.getElementById('device-type').textContent = deviceDisplay;
            
            // Log detallado para debugging
            console.log('📱 Información completa del dispositivo:', info);
            
            // Mostrar advertencias específicas
            if (info.isAndroidFrozen && !info.clientHintsSupported) {
                console.warn('⚠️ LIMITACIÓN: Este navegador congela la información de Android como versión 10 por privacidad.');
                console.warn('💡 SOLUCIÓN: User-Agent Client Hints no están disponibles. La versión real puede ser diferente.');
            }
            
            if (info.clientHintsSupported) {
                console.log('✅ ÉXITO: Usando User-Agent Client Hints para información precisa');
            }
            
            // Agregar información adicional al panel
            const deviceInfoContainer = document.getElementById('device-info');
            if (deviceInfoContainer && !deviceInfoContainer.querySelector('.additional-info')) {
                const additionalInfo = document.createElement('div');
                additionalInfo.className = 'additional-info';
                additionalInfo.style.marginTop = '15px';
                
                let additionalHTML = `
                    <div><strong>Resolución:</strong> <span>${info.screenResolution}</span></div>
                    <div><strong>Pixel Ratio:</strong> <span>${info.pixelRatio}</span></div>
                    <div><strong>Touch:</strong> <span>${info.touchSupport ? 'Soportado' : 'No soportado'}</span></div>
                `;
                
                // Mostrar estado de Client Hints
                if (info.clientHintsSupported) {
                    additionalHTML += `<div><strong>Client Hints:</strong> <span style="color: #4CAF50;">✅ Activo</span></div>`;
                } else {
                    additionalHTML += `<div><strong>Client Hints:</strong> <span style="color: #FF9800;">⚠️ No disponible</span></div>`;
                }
                
                // Advertencia para Android congelado
                if (info.isAndroidFrozen && !info.clientHintsSupported) {
                    additionalHTML += `<div style="color: #f44336; font-size: 11px; margin-top: 8px; padding: 6px; background: rgba(244, 67, 54, 0.1); border-radius: 4px;"><strong>⚠️ Advertencia:</strong> La versión de Android mostrada puede ser incorrecta debido a políticas de privacidad del navegador.</div>`;
                }
                
                additionalInfo.innerHTML = additionalHTML;
                deviceInfoContainer.appendChild(additionalInfo);
            }
            
        } catch (error) {
            console.error('❌ Error obteniendo información del dispositivo:', error);
            
            // Fallback en caso de error
            document.getElementById('browser-info').textContent = 'Error al detectar';
            document.getElementById('os-info').textContent = 'Error al detectar';
            document.getElementById('device-type').textContent = 'Error al detectar';
        }
    }

    // Función auxiliar para actualizar la pantalla del SO cuando se obtiene información adicional
    function updateOSDisplay(osString) {
        const osElement = document.getElementById('os-info');
        if (osElement) {
            osElement.textContent = osString;
        }
    }

    // Función para verificar y habilitar Client Hints en el servidor (información)
    function checkClientHintsSetup() {
        console.log('🔧 CONFIGURACIÓN RECOMENDADA PARA EL SERVIDOR:');
        console.log('Para obtener información completa del dispositivo, agrega estos headers HTTP:');
        console.log('Accept-CH: Sec-CH-UA-Platform-Version, Sec-CH-UA-Model, Sec-CH-UA-Full-Version-List');
        console.log('Permissions-Policy: ch-ua-platform-version=*, ch-ua-model=*, ch-ua-full-version-list=*');
        
        if ('userAgentData' in navigator) {
            console.log('✅ Client Hints está disponible en este navegador');
        } else {
            console.log('❌ Client Hints NO está disponible en este navegador');
        }
    }

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

    function checkFlashSupport() {
        const flashStatus = document.getElementById('flash-status');
        const flashButton = document.getElementById('toggle-flash');

        if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
            flashStatus.textContent = 'No soportado';
            flashStatus.className = 'sensor-status sensor-error';
            flashButton.disabled = true;
            return;
        }

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

    // Inicializar verificación de Client Hints
    checkClientHintsSetup();
});