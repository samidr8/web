// ===== APPLETS.JS CORREGIDO SIN ERRORES DE SINTAXIS =====

function showGeogebraApplet() {
  const container = document.getElementById('geogebra-container');
  if (container) {
    container.style.display = 'block';
    container.style.pointerEvents = 'auto';
    
    // Verificar si el iframe ya tiene los parámetros correctos
    const iframe = document.getElementById('geogebra-iframe');
    if (iframe && iframe.src) {
      // Si el iframe ya está cargado, aplicar estilos CSS para agrandar el icono
      applyFullscreenIconStyles();
    }
    
    console.log('🧮 GeoGebra applet mostrado con icono de pantalla completa agrandado');
  }
}

// Función para aplicar estilos CSS que agranden el icono de pantalla completa
function applyFullscreenIconStyles() {
  // Crear estilos CSS personalizados para el iframe de GeoGebra
  const style = document.createElement('style');
  style.id = 'geogebra-fullscreen-styles';
  
  // CSS para agrandar el icono de pantalla completa
  style.textContent = `
    /* Estilos para agrandar el icono de pantalla completa de GeoGebra */
    #geogebra-iframe {
      position: relative;
    }
    
    /* Intentar agrandar el icono usando CSS injection si es posible */
    #geogebra-iframe::after {
      content: "";
      position: absolute;
      bottom: 10px;
      right: 10px;
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 6px;
      z-index: 1000;
      pointer-events: none;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>');
      background-size: 24px 24px;
      background-repeat: no-repeat;
      background-position: center;
      opacity: 0.8;
    }
    
    /* Estilos para el contenedor del applet */
    .geogebra-player {
      position: relative;
    }
    
    /* Botón de pantalla completa personalizado más grande */
    .custom-fullscreen-btn {
      position: absolute;
      bottom: 10px;
      right: 10px;
      width: 50px;
      height: 50px;
      background: rgba(0, 0, 0, 0.8);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      z-index: 1001;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }
    
    .custom-fullscreen-btn:hover {
      background: rgba(0, 0, 0, 0.9);
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    }
    
    .custom-fullscreen-btn svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
    
    /* Ocultar el icono original de GeoGebra cuando sea posible */
    .custom-fullscreen-btn.active ~ #geogebra-iframe::after {
      display: none;
    }
  `;
  
  // Agregar los estilos al documento si no existen
  if (!document.getElementById('geogebra-fullscreen-styles')) {
    document.head.appendChild(style);
  }
  
  // Agregar botón de pantalla completa personalizado
  setTimeout(addCustomFullscreenButton, 1000);
}

// Función para agregar un botón de pantalla completa personalizado más grande
function addCustomFullscreenButton() {
  const geogebraPlayer = document.querySelector('.geogebra-player');
  const iframe = document.getElementById('geogebra-iframe');
  
  if (geogebraPlayer && iframe && !geogebraPlayer.querySelector('.custom-fullscreen-btn')) {
    // Crear botón personalizado más grande
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'custom-fullscreen-btn';
    fullscreenBtn.title = 'Pantalla completa';
    
    // Icono SVG más grande
    fullscreenBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
      </svg>
    `;
    
    // Evento para pantalla completa
    fullscreenBtn.addEventListener('click', () => {
      enterGeogebraFullscreen(iframe);
    });
    
    // Agregar el botón al contenedor
    geogebraPlayer.appendChild(fullscreenBtn);
    
    console.log('✅ Botón de pantalla completa personalizado agregado');
  }
}

// Función para entrar en pantalla completa con detección automática de orientación
function enterGeogebraFullscreen(iframe) {
  if (!iframe) return;
  
  try {
    console.log('📺 Iniciando pantalla completa con adaptación automática de orientación...');
    
    // Entrar directamente en pantalla completa SIN forzar orientación
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen({ navigationUI: "hide" }).then(() => {
        setupOrientationAutoDetection();
      }).catch(() => {
        createCustomFullscreenOverlay(iframe);
      });
    } else if (iframe.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen({ navigationUI: "hide" });
      setupOrientationAutoDetection();
    } else if (iframe.mozRequestFullScreen) {
      iframe.mozRequestFullScreen({ navigationUI: "hide" });
      setupOrientationAutoDetection();
    } else if (iframe.msRequestFullscreen) {
      iframe.msRequestFullscreen({ navigationUI: "hide" });
      setupOrientationAutoDetection();
    } else {
      // Crear overlay personalizado con detección automática
      createCustomFullscreenOverlay(iframe);
    }
    
  } catch (error) {
    console.warn('⚠️ Error en pantalla completa:', error);
    createCustomFullscreenOverlay(iframe);
  }
}

// Función para configurar detección automática de orientación
function setupOrientationAutoDetection() {
  console.log('🔄 Configurando detección automática de orientación...');
  
  // Variables para rastrear orientación
  let currentOrientation = getDeviceOrientation();
  let orientationChangeTimer = null;
  
  // Función para obtener orientación actual
  function getDeviceOrientation() {
    if (screen.orientation) {
      return screen.orientation.angle;
    } else if (window.orientation !== undefined) {
      return window.orientation;
    } else {
      // Fallback: detectar por dimensiones
      return window.innerWidth > window.innerHeight ? 90 : 0;
    }
  }
  
  // Función para obtener tipo de orientación
  function getOrientationType() {
    const angle = getDeviceOrientation();
    if (angle === 0) return 'portrait';
    if (angle === 90 || angle === -90 || angle === 270) return 'landscape';
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }
  
  // Función para adaptar el applet a la orientación
  function adaptAppletToOrientation() {
    const orientationType = getOrientationType();
    const angle = getDeviceOrientation();
    
    console.log(`📱 Orientación detectada: ${orientationType} (${angle}°)`);
    
    // Buscar el iframe en pantalla completa
    const fullscreenIframe = document.fullscreenElement || 
                            document.webkitFullscreenElement || 
                            document.mozFullScreenElement ||
                            document.querySelector('#geogebra-fullscreen-iframe');
    
    if (fullscreenIframe) {
      if (orientationType === 'landscape') {
        // Optimizar para horizontal
        fullscreenIframe.style.cssText = `
          width: 98vw !important;
          height: 92vh !important;
          border: none;
          border-radius: 8px;
          transition: all 0.3s ease;
        `;
        console.log('🔄 Applet optimizado para orientación horizontal');
        showOrientationMessage('📱 Modo horizontal activado - Experiencia optimizada', 'success');
      } else {
        // Optimizar para vertical
        fullscreenIframe.style.cssText = `
          width: 95vw !important;
          height: 85vh !important;
          border: none;
          border-radius: 8px;
          transition: all 0.3s ease;
        `;
        console.log('📱 Applet optimizado para orientación vertical');
        showOrientationMessage('📱 Modo vertical - Rota el dispositivo para mejor experiencia', 'info');
      }
    }
  }
  
  // Función para mostrar mensajes de orientación
  function showOrientationMessage(message, type = 'info') {
    // Remover mensaje anterior si existe
    const existingMessage = document.getElementById('orientation-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.id = 'orientation-message';
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 152, 0, 0.9)'};
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10002;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(5px);
      transition: all 0.3s ease;
      animation: slideInFromTop 0.3s ease;
    `;
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateX(-50%) translateY(-100%)';
        setTimeout(() => {
          if (messageDiv.parentNode) {
            messageDiv.remove();
          }
        }, 300);
      }
    }, 3000);
  }
  
  // Agregar CSS para animación
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes slideInFromTop {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-100%);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
  `;
  document.head.appendChild(styleElement);
  
  // Event listeners para cambios de orientación
  const handleOrientationChange = () => {
    console.log('🔄 Cambio de orientación detectado...');
    
    // Limpiar timer anterior
    if (orientationChangeTimer) {
      clearTimeout(orientationChangeTimer);
    }
    
    // Esperar un poco para que la orientación se estabilice
    orientationChangeTimer = setTimeout(() => {
      const newOrientation = getDeviceOrientation();
      if (newOrientation !== currentOrientation) {
        console.log(`📱 Orientación cambió de ${currentOrientation}° a ${newOrientation}°`);
        currentOrientation = newOrientation;
        adaptAppletToOrientation();
      }
    }, 200);
  };
  
  // Múltiples event listeners para máxima compatibilidad
  window.addEventListener('orientationchange', handleOrientationChange);
  window.addEventListener('resize', handleOrientationChange);
  if (screen.orientation) {
    screen.orientation.addEventListener('change', handleOrientationChange);
  }
  
  // Adaptación inicial
  setTimeout(adaptAppletToOrientation, 500);
  
  // Cleanup function para remover listeners al salir de pantalla completa
  const cleanupOrientationDetection = () => {
    console.log('🧹 Limpiando detección de orientación...');
    window.removeEventListener('orientationchange', handleOrientationChange);
    window.removeEventListener('resize', handleOrientationChange);
    if (screen.orientation) {
      screen.orientation.removeEventListener('change', handleOrientationChange);
    }
    
    if (orientationChangeTimer) {
      clearTimeout(orientationChangeTimer);
    }
    
    // Remover mensaje si existe
    const existingMessage = document.getElementById('orientation-message');
    if (existingMessage) {
      existingMessage.remove();
    }
  };
  
  // Listener para cuando se sale de pantalla completa
  const handleFullscreenChange = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && !document.msFullscreenElement) {
      console.log('📺 Saliendo de pantalla completa...');
      cleanupOrientationDetection();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    }
  };
  
  // Listeners para detectar salida de pantalla completa
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('msfullscreenchange', handleFullscreenChange);
  
  console.log('✅ Detección automática de orientación configurada');
}

// Función para crear un overlay de pantalla completa con adaptación automática de orientación
function createCustomFullscreenOverlay(iframe) {
  // Verificar si ya existe un overlay
  if (document.getElementById('geogebra-fullscreen-overlay')) {
    return;
  }
  
  console.log('📺 Creando overlay de pantalla completa con adaptación automática...');
  
  // Crear overlay de pantalla completa
  const overlay = document.createElement('div');
  overlay.id = 'geogebra-fullscreen-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    transform-origin: center center;
  `;
  
  // Crear iframe clonado para pantalla completa
  const fullscreenIframe = iframe.cloneNode(true);
  fullscreenIframe.id = 'geogebra-fullscreen-iframe';
  
  // Función para adaptar iframe a orientación actual
  function adaptIframeToOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isLandscape) {
      // Optimizar para horizontal
      fullscreenIframe.style.cssText = `
        width: 98vw;
        height: 92vh;
        border: none;
        border-radius: 8px;
        transition: all 0.3s ease;
      `;
      console.log('🔄 Overlay optimizado para orientación horizontal');
    } else {
      // Optimizar para vertical
      fullscreenIframe.style.cssText = `
        width: 95vw;
        height: 85vh;
        border: none;
        border-radius: 8px;
        transition: all 0.3s ease;
      `;
      console.log('📱 Overlay optimizado para orientación vertical');
    }
  }
  
  // Configuración inicial del iframe
  adaptIframeToOrientation();
  
  // Botón para salir de pantalla completa
  const exitBtn = document.createElement('button');
  exitBtn.innerHTML = '✕';
  exitBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  `;
  
  // Función para cerrar overlay
  const closeOverlay = () => {
    console.log('🔚 Cerrando overlay y limpiando event listeners...');
    document.body.removeChild(overlay);
    
    // Limpiar listeners de orientación
    window.removeEventListener('orientationchange', handleOverlayOrientationChange);
    window.removeEventListener('resize', handleOverlayOrientationChange);
    if (screen.orientation) {
      screen.orientation.removeEventListener('change', handleOverlayOrientationChange);
    }
  };
  
  exitBtn.addEventListener('click', closeOverlay);
  
  exitBtn.addEventListener('mouseenter', () => {
    exitBtn.style.background = 'rgba(255, 255, 255, 1)';
    exitBtn.style.transform = 'scale(1.1)';
  });
  
  exitBtn.addEventListener('mouseleave', () => {
    exitBtn.style.background = 'rgba(255, 255, 255, 0.9)';
    exitBtn.style.transform = 'scale(1)';
  });
  
  // Mensaje de orientación inicial (solo en móviles)
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (isMobile) {
    const initialMessage = document.createElement('div');
    initialMessage.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(76, 175, 80, 0.9);
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      font-size: 14px;
      text-align: center;
      z-index: 9999;
      pointer-events: none;
      opacity: 1;
      transition: opacity 0.5s ease;
    `;
    initialMessage.innerHTML = `
      <div>📱 Rota tu dispositivo libremente</div>
      <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">El applet se adaptará automáticamente</div>
    `;
    
    overlay.appendChild(initialMessage);
    
    // Ocultar mensaje inicial después de 3 segundos
    setTimeout(() => {
      if (initialMessage.parentNode) {
        initialMessage.style.opacity = '0';
        setTimeout(() => {
          if (initialMessage.parentNode) {
            initialMessage.parentNode.removeChild(initialMessage);
          }
        }, 500);
      }
    }, 3000);
  }
  
  // Función para manejar cambios de orientación en el overlay
  let overlayOrientationTimer = null;
  const handleOverlayOrientationChange = () => {
    console.log('🔄 Cambio de orientación detectado en overlay...');
    
    // Limpiar timer anterior
    if (overlayOrientationTimer) {
      clearTimeout(overlayOrientationTimer);
    }
    
    // Esperar para que la orientación se estabilice
    overlayOrientationTimer = setTimeout(() => {
      adaptIframeToOrientation();
      
      // Mostrar mensaje de confirmación
      const isLandscape = window.innerWidth > window.innerHeight;
      showOrientationMessage(
        isLandscape 
          ? '📱 Modo horizontal - Experiencia optimizada' 
          : '📱 Modo vertical - Applet adaptado',
        isLandscape ? 'success' : 'info'
      );
    }, 200);
  };
  
  // Función para mostrar mensajes de orientación en overlay
  function showOrientationMessage(message, type = 'info') {
    // Remover mensaje anterior si existe
    const existingMessage = document.getElementById('overlay-orientation-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.id = 'overlay-orientation-message';
    messageDiv.style.cssText = `
      position: absolute;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 152, 0, 0.9)'};
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10002;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(5px);
      transition: all 0.3s ease;
      animation: slideInFromTop 0.3s ease;
    `;
    
    messageDiv.textContent = message;
    overlay.appendChild(messageDiv);
    
    // Auto-ocultar después de 2.5 segundos
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateX(-50%) translateY(-50px)';
        setTimeout(() => {
          if (messageDiv.parentNode) {
            messageDiv.remove();
          }
        }, 300);
      }
    }, 2500);
  }
  
  // Agregar elementos al overlay
  overlay.appendChild(fullscreenIframe);
  overlay.appendChild(exitBtn);
  
  // Agregar overlay al documento
  document.body.appendChild(overlay);
  
  // Event listeners para orientación del overlay
  window.addEventListener('orientationchange', handleOverlayOrientationChange);
  window.addEventListener('resize', handleOverlayOrientationChange);
  if (screen.orientation) {
    screen.orientation.addEventListener('change', handleOverlayOrientationChange);
  }
  
  // Cerrar con tecla Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeOverlay();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  console.log('📺 Overlay con adaptación automática de orientación creado');
}

// Función para actualizar la URL del iframe de GeoGebra con parámetros que mejoren la interfaz
function updateGeogebraIframeForLargerIcons() {
  const iframe = document.getElementById('geogebra-iframe');
  if (!iframe) return;
  
  const currentSrc = iframe.src;
  if (!currentSrc) return;
  
  // Agregar parámetros para mejorar la interfaz
  const separator = currentSrc.includes('?') ? '&' : '?';
  const additionalParams = [
    'showToolBar=true',           // Mostrar barra de herramientas
    'showAlgebraInput=true',      // Mostrar entrada algebraica
    'showMenuBar=true',           // Mostrar barra de menú
    'allowStyleBar=true',         // Permitir barra de estilo
    'allowRescaling=true',        // Permitir reescalado
    'enableRightClick=true',      // Habilitar clic derecho
    'showFullscreenButton=true',  // Mostrar botón de pantalla completa
    'scale=1.2'                   // Escalar la interfaz un 20% más grande
  ].join('&');
  
  // Solo actualizar si no tiene estos parámetros
  if (!currentSrc.includes('showFullscreenButton=true')) {
    iframe.src = `${currentSrc}${separator}${additionalParams}`;
    console.log('🔧 URL de GeoGebra actualizada con parámetros mejorados');
  }
}

// Inicializar mejoras cuando se carga el documento
document.addEventListener('DOMContentLoaded', () => {
  // Aplicar estilos inmediatamente
  applyFullscreenIconStyles();
  
  // Actualizar iframe después de un breve delay
  setTimeout(updateGeogebraIframeForLargerIcons, 2000);
  
  console.log('🚀 Applets.js mejorado cargado con adaptación automática de orientación');
});