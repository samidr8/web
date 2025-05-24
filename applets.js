// ===== APPLETS.JS MEJORADO CON ICONOS MÁS GRANDES Y MENSAJE INSTRUCTIVO =====

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
    
    // NUEVO: Mostrar mensaje instructivo sobre orientación de pantalla
    showOrientationInstructionMessage();
    
    console.log('🧮 GeoGebra applet mostrado con icono de pantalla completa agrandado');
  }
}

// NUEVA FUNCIÓN: Mostrar mensaje instructivo sobre orientación
function showOrientationInstructionMessage() {
  // Verificar si ya existe un mensaje para evitar duplicados
  if (document.getElementById('orientation-instruction-message')) {
    return;
  }
  
  // Crear el contenedor del mensaje
  const messageContainer = document.createElement('div');
  messageContainer.id = 'orientation-instruction-message';
  messageContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, rgba(54, 94, 255, 0.95), rgba(50, 82, 244, 0.95));
    color: white;
    padding: 20px 30px;
    border-radius: 15px;
    font-family: Arial, sans-serif;
    text-align: center;
    z-index: 10005;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    animation: messageSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    max-width: 90vw;
    box-sizing: border-box;
  `;
  
  // Contenido del mensaje
  messageContainer.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
      <span style="font-size: 18px; font-weight: bold;">Activar la Orientación de la Pantalla.</span>
    </div>
    <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">
      Luego presione el botón de pantalla completa.
    </div>
  `;
  
  // Agregar CSS para la animación si no existe
  if (!document.getElementById('orientation-message-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'orientation-message-styles';
    styleElement.textContent = `
      @keyframes messageSlideIn {
        from {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.7) translateY(20px);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1) translateY(0);
        }
      }
      
      @keyframes messageSlideOut {
        from {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1) translateY(0);
        }
        to {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.9) translateY(-20px);
        }
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // Agregar el mensaje al documento
  document.body.appendChild(messageContainer);
  
  // Configurar desaparición automática después de 2 segundos
  setTimeout(() => {
    if (messageContainer.parentNode) {
      // Aplicar animación de salida
      messageContainer.style.animation = 'messageSlideOut 0.3s ease-in forwards';
      
      // Remover el elemento después de la animación
      setTimeout(() => {
        if (messageContainer.parentNode) {
          messageContainer.parentNode.removeChild(messageContainer);
        }
      }, 300);
    }
  }, 5000); // 5 segundos como solicitaste
  
  console.log('📱 Mensaje de instrucción de orientación mostrado');
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

// Función para entrar en pantalla completa
function enterGeogebraFullscreen(iframe) {
  if (!iframe) return;
  
  try {
    // Método 1: Usar la API de Fullscreen del navegador
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen();
    } else if (iframe.mozRequestFullScreen) {
      iframe.mozRequestFullScreen();
    } else if (iframe.msRequestFullscreen) {
      iframe.msRequestFullscreen();
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
  
  console.log('🚀 Applets.js mejorado cargado con iconos más grandes y mensaje instructivo');
});