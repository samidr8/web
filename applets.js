// ===== APPLETS.JS MEJORADO CON ICONOS MÁS GRANDES =====

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
      background: rgba(54, 94, 255, 0.76);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      z-index: 1001;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(52, 69, 255, 0.3);
    }
    
    .custom-fullscreen-btn:hover {
      background: rgba(50, 82, 244, 0.9);
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(0, 85, 255, 0.4);
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
    
    /* Estilos para el mensaje de orientación */
    .orientation-message {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(54, 94, 255, 0.95);
      color: white;
      padding: 20px 30px;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      z-index: 10002;
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.2);
      animation: fadeInScale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }
    
    .orientation-message.fade-out {
      animation: fadeOutScale 0.3s ease-in-out forwards;
    }
    
    @keyframes fadeOutScale {
      from {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      to {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
      }
    }
  `;
  
  // Agregar los estilos al documento si no existen
  if (!document.getElementById('geogebra-fullscreen-styles')) {
    document.head.appendChild(style);
  }
  
  // Agregar botón de pantalla completa personalizado
  setTimeout(addCustomFullscreenButton, 1000);
}

// Función para mostrar mensaje de orientación (solo si está desactivada)
function showOrientationMessage() {
  // Verificar si la orientación automática está desactivada
  if (!isOrientationLocked()) {
    console.log('📱 Orientación automática está activada, no mostrar mensaje');
    return; // No mostrar mensaje si la orientación está activada
  }
  
  // Verificar si ya existe un mensaje
  const existingMessage = document.getElementById('orientation-reminder');
  if (existingMessage) {
    return; // No mostrar múltiples mensajes
  }
  
  // Crear elemento del mensaje
  const messageDiv = document.createElement('div');
  messageDiv.id = 'orientation-reminder';
  messageDiv.className = 'orientation-message';
  messageDiv.innerHTML = `
    <div>📱 Activar la Orientación de la Pantalla</div>
    <div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">Para una mejor experiencia en pantalla completa</div>
  `;
  
  // Agregar al documento
  document.body.appendChild(messageDiv);
  
  // Auto-ocultar después de 3 segundos (cambiado de 4 a 3)
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.classList.add('fade-out');
      
      // Remover del DOM después de la animación
      setTimeout(() => {
        if (messageDiv.parentNode) {
          document.body.removeChild(messageDiv);
        }
      }, 300);
    }
  }, 3000); // Cambiado a 3 segundos
  
  console.log('📱 Mensaje de orientación mostrado (orientación desactivada)');
}

// Función para detectar si la orientación automática está bloqueada/desactivada
function isOrientationLocked() {
  try {
    // Método 1: Verificar si el dispositivo permite cambios de orientación
    if (screen.orientation) {
      // Si está bloqueada en una orientación específica, significa que está "activada" programáticamente
      // Pero si el usuario tiene desactivada la rotación, no podremos detectarlo directamente
      
      // Verificamos si podemos obtener información sobre la orientación
      const currentAngle = screen.orientation.angle;
      console.log('🔄 Ángulo actual de orientación:', currentAngle);
      
      // Método indirecto: verificar si las dimensiones sugieren orientación fija
      const aspectRatio = window.innerWidth / window.innerHeight;
      const isLandscape = aspectRatio > 1;
      const shouldBeLandscape = (currentAngle === 90 || currentAngle === 270);
      
      // Si la orientación física no coincide con lo esperado, probablemente esté bloqueada
      if (isLandscape !== shouldBeLandscape) {
        console.log('📱 Orientación parece estar bloqueada por el usuario');
        return true; // Orientación está desactivada/bloqueada
      }
    }
    
    // Método 2: Verificar usando window.orientation (método legacy)
    if (typeof window.orientation !== 'undefined') {
      // Si window.orientation existe pero no cambia, podría estar bloqueada
      const orientation = window.orientation;
      console.log('🔄 Window orientation:', orientation);
      
      // Método heurístico: verificar si las proporciones no coinciden con la orientación reportada
      const windowAspect = window.innerWidth / window.innerHeight;
      const isCurrentlyLandscape = windowAspect > 1;
      const shouldBeLandscapeByAngle = (orientation === 90 || orientation === -90 || orientation === 270);
      
      if (isCurrentlyLandscape !== shouldBeLandscapeByAngle) {
        console.log('📱 Orientación probablemente bloqueada (método legacy)');
        return true;
      }
    }
    
    // Método 3: Verificar mediante detección de cambio de orientación
    // Si estamos en móvil pero la orientación parece fija, probablemente esté desactivada
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (isMobile) {
      // En móviles, si estamos en portrait y las dimensiones son muy verticales,
      // es probable que la rotación esté desactivada
      const aspectRatio = window.innerWidth / window.innerHeight;
      if (aspectRatio < 0.7) {
        console.log('📱 Dispositivo móvil en portrait extremo - rotación probablemente desactivada');
        return true;
      }
    }
    
    // Si llegamos aquí, asumimos que la orientación está activada
    console.log('✅ Orientación parece estar activada');
    return false;
    
  } catch (error) {
    console.warn('⚠️ Error detectando estado de orientación:', error);
    // En caso de error, mostrar el mensaje por seguridad
    return true;
  }
}

// Función para mostrar mensaje después de entrar en pantalla completa
function checkAndShowOrientationMessage() {
  // Esperar un poco para que la pantalla completa se estabilice
  setTimeout(() => {
    // Verificar si realmente estamos en pantalla completa
    const isFullscreen = document.fullscreenElement || 
                        document.webkitFullscreenElement || 
                        document.mozFullScreenElement ||
                        document.msFullscreenElement ||
                        document.getElementById('geogebra-fullscreen-overlay');
    
    if (isFullscreen) {
      console.log('📺 Pantalla completa confirmada, verificando orientación...');
      showOrientationMessage();
    }
  }, 1000); // Esperar 1 segundo después de entrar en pantalla completa
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
      // MODIFICADO: NO mostrar mensaje antes, sino después de pantalla completa
      enterGeogebraFullscreen(iframe);
    });
    
    // Agregar el botón al contenedor
    geogebraPlayer.appendChild(fullscreenBtn);
    
    console.log('✅ Botón de pantalla completa personalizado agregado');
  }
}

// Función para entrar en pantalla completa
function enterGeogebraFullscreen(iframe) {
  if (!iframe) return;
  
  try {
    // Método 1: Usar la API de Fullscreen del navegador
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen().then(() => {
        // Mostrar mensaje DESPUÉS de entrar en pantalla completa
        checkAndShowOrientationMessage();
      }).catch(() => {
        console.warn('Error con requestFullscreen, usando overlay');
        createCustomFullscreenOverlay(iframe);
      });
    } else if (iframe.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen();
      // Para navegadores webkit, verificar después de un delay
      checkAndShowOrientationMessage();
    } else if (iframe.mozRequestFullScreen) {
      iframe.mozRequestFullScreen();
      // Para Firefox, verificar después de un delay
      checkAndShowOrientationMessage();
    } else if (iframe.msRequestFullscreen) {
      iframe.msRequestFullscreen();
      // Para IE/Edge, verificar después de un delay
      checkAndShowOrientationMessage();
    } else {
      // Método 2: Crear overlay de pantalla completa personalizado
      createCustomFullscreenOverlay(iframe);
    }
    
    console.log('📺 Entrando en pantalla completa de GeoGebra');
  } catch (error) {
    console.warn('⚠️ No se pudo activar pantalla completa:', error);
    // Fallback: crear overlay personalizado
    createCustomFullscreenOverlay(iframe);
  }
}

// Función para crear un overlay de pantalla completa personalizado
function createCustomFullscreenOverlay(iframe) {
  // Verificar si ya existe un overlay
  if (document.getElementById('geogebra-fullscreen-overlay')) {
    return;
  }
  
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
  `;
  
  // Crear iframe clonado para pantalla completa
  const fullscreenIframe = iframe.cloneNode(true);
  fullscreenIframe.id = 'geogebra-fullscreen-iframe';
  fullscreenIframe.style.cssText = `
    width: 95vw;
    height: 90vh;
    border: none;
    border-radius: 8px;
  `;
  
  // Botón para salir de pantalla completa
  const exitBtn = document.createElement('button');
  exitBtn.innerHTML = '✕';
  exitBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  `;
  
  exitBtn.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  exitBtn.addEventListener('mouseenter', () => {
    exitBtn.style.background = 'rgba(255, 255, 255, 1)';
    exitBtn.style.transform = 'scale(1.1)';
  });
  
  exitBtn.addEventListener('mouseleave', () => {
    exitBtn.style.background = 'rgba(255, 255, 255, 0.9)';
    exitBtn.style.transform = 'scale(1)';
  });
  
  // Agregar elementos al overlay
  overlay.appendChild(fullscreenIframe);
  overlay.appendChild(exitBtn);
  
  // Agregar overlay al documento
  document.body.appendChild(overlay);
  
  // NUEVO: Verificar y mostrar mensaje de orientación después de crear el overlay
  checkAndShowOrientationMessage();
  
  // Cerrar con tecla Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(overlay);
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  console.log('📺 Overlay de pantalla completa personalizado creado');
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
  
  console.log('🚀 Applets.js mejorado cargado con iconos más grandes y mensaje de orientación');
});