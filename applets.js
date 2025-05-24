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

// Función para entrar en pantalla completa con orientación horizontal forzada
function enterGeogebraFullscreen(iframe) {
  if (!iframe) return;
  
  try {
    console.log('📺 Iniciando pantalla completa con orientación horizontal...');
    
    // PASO 1: Intentar forzar orientación horizontal ANTES de pantalla completa
    forceHorizontalOrientation().then(() => {
      console.log('✅ Orientación horizontal aplicada');
      
      // PASO 2: Entrar en pantalla completa después de orientar
      setTimeout(() => {
        // Método 1: Usar la API de Fullscreen del navegador
        if (iframe.requestFullscreen) {
          iframe.requestFullscreen({ navigationUI: "hide" });
        } else if (iframe.webkitRequestFullscreen) {
          iframe.webkitRequestFullscreen({ navigationUI: "hide" });
        } else if (iframe.mozRequestFullScreen) {
          iframe.mozRequestFullScreen({ navigationUI: "hide" });
        } else if (iframe.msRequestFullscreen) {
          iframe.msRequestFullscreen({ navigationUI: "hide" });
        } else {
          // Método 2: Crear overlay de pantalla completa personalizado
          createCustomFullscreenOverlay(iframe);
        }
      }, 300); // Pequeño delay para que la orientación se aplique
      
    }).catch((error) => {
      console.warn('⚠️ No se pudo cambiar la orientación, continuando con pantalla completa:', error);
      
      // Continuar con pantalla completa aunque no se pueda cambiar orientación
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else {
        createCustomFullscreenOverlay(iframe);
      }
    });
    
  } catch (error) {
    console.warn('⚠️ Error en pantalla completa:', error);
    // Fallback: crear overlay personalizado
    createCustomFullscreenOverlay(iframe);
  }
}

// Función para forzar orientación horizontal
async function forceHorizontalOrientation() {
  try {
    // Método 1: Screen Orientation API (más moderno y efectivo)
    if ('screen' in window && 'orientation' in window.screen) {
      console.log('🔄 Usando Screen Orientation API...');
      
      // Opciones de orientación horizontal
      const orientationOptions = [
        'landscape-primary',   // Horizontal principal
        'landscape-secondary', // Horizontal secundario  
        'landscape'           // Cualquier horizontal
      ];
      
      for (const orientation of orientationOptions) {
        try {
          await window.screen.orientation.lock(orientation);
          console.log(`✅ Orientación bloqueada en: ${orientation}`);
          return; // Éxito, salir del loop
        } catch (lockError) {
          console.log(`⚠️ No se pudo bloquear en ${orientation}:`, lockError.message);
          continue; // Intentar siguiente opción
        }
      }
      
      throw new Error('No se pudo bloquear en ninguna orientación horizontal');
    }
    
    // Método 2: Método legacy para navegadores más antiguos
    else if ('screen' in window && 'lockOrientation' in window.screen) {
      console.log('🔄 Usando método legacy lockOrientation...');
      
      const success = window.screen.lockOrientation('landscape') ||
                     window.screen.lockOrientation('landscape-primary') ||
                     window.screen.lockOrientation('landscape-secondary');
      
      if (success) {
        console.log('✅ Orientación bloqueada (método legacy)');
        return;
      } else {
        throw new Error('lockOrientation falló');
      }
    }
    
    // Método 3: Webkit específico para Safari/Chrome más antiguos
    else if ('screen' in window && 'webkitLockOrientation' in window.screen) {
      console.log('🔄 Usando webkitLockOrientation...');
      
      const success = window.screen.webkitLockOrientation('landscape-primary') ||
                     window.screen.webkitLockOrientation('landscape');
      
      if (success) {
        console.log('✅ Orientación bloqueada (webkit)');
        return;
      } else {
        throw new Error('webkitLockOrientation falló');
      }
    }
    
    // Método 4: Mozilla específico
    else if ('screen' in window && 'mozLockOrientation' in window.screen) {
      console.log('🔄 Usando mozLockOrientation...');
      
      const success = window.screen.mozLockOrientation('landscape-primary') ||
                     window.screen.mozLockOrientation('landscape');
      
      if (success) {
        console.log('✅ Orientación bloqueada (mozilla)');
        return;
      } else {
        throw new Error('mozLockOrientation falló');
      }
    }
    
    // Si no hay APIs disponibles
    else {
      console.log('❌ No hay APIs de orientación disponibles en este navegador');
      throw new Error('APIs de orientación no soportadas');
    }
    
  } catch (error) {
    console.warn('⚠️ Error al forzar orientación horizontal:', error);
    
    // Método fallback: CSS y viewport
    applyHorizontalCSSTricks();
    throw error; // Re-lanzar para que el caller sepa que falló
  }
}

// Función fallback: aplicar trucos CSS para simular orientación horizontal
function applyHorizontalCSSTricks() {
  console.log('🎨 Aplicando trucos CSS para orientación horizontal...');
  
  // Crear meta viewport dinámico para forzar orientación
  let viewportMeta = document.querySelector('meta[name="viewport"]');
  if (!viewportMeta) {
    viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    document.head.appendChild(viewportMeta);
  }
  
  // Configurar viewport para orientación horizontal
  viewportMeta.content = 'width=device-width, initial-scale=1.0, orientation=landscape, user-scalable=no';
  
  // CSS para forzar layout horizontal
  const horizontalCSS = document.createElement('style');
  horizontalCSS.id = 'horizontal-orientation-css';
  horizontalCSS.textContent = `
    @media screen and (orientation: portrait) {
      body.force-landscape {
        transform: rotate(90deg);
        transform-origin: left top;
        width: 100vh;
        height: 100vw;
        overflow-x: hidden;
        position: absolute;
        top: 100%;
        left: 0;
      }
    }
  `;
  
  if (!document.getElementById('horizontal-orientation-css')) {
    document.head.appendChild(horizontalCSS);
  }
}

// Función para desbloquear orientación al salir de pantalla completa
function unlockOrientation() {
  try {
    // Método moderno
    if ('screen' in window && 'orientation' in window.screen && 'unlock' in window.screen.orientation) {
      window.screen.orientation.unlock();
      console.log('🔓 Orientación desbloqueada (moderno)');
    }
    // Métodos legacy
    else if ('screen' in window) {
      if ('unlockOrientation' in window.screen) {
        window.screen.unlockOrientation();
        console.log('🔓 Orientación desbloqueada (legacy)');
      } else if ('webkitUnlockOrientation' in window.screen) {
        window.screen.webkitUnlockOrientation();
        console.log('🔓 Orientación desbloqueada (webkit)');
      } else if ('mozUnlockOrientation' in window.screen) {
        window.screen.mozUnlockOrientation();
        console.log('🔓 Orientación desbloqueada (mozilla)');
      }
    }
    
    // Limpiar CSS tricks si se aplicaron
    const horizontalCSS = document.getElementById('horizontal-orientation-css');
    if (horizontalCSS) {
      horizontalCSS.remove();
    }
    
    // Remover clase force-landscape del body
    document.body.classList.remove('force-landscape');
    
    // Restaurar viewport original
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.content = 'width=device-width, initial-scale=1';
    }
    
  } catch (error) {
    console.warn('⚠️ Error al desbloquear orientación:', error);
  }
}

// Función para crear un overlay de pantalla completa personalizado con orientación horizontal
function createCustomFullscreenOverlay(iframe) {
  // Verificar si ya existe un overlay
  if (document.getElementById('geogebra-fullscreen-overlay')) {
    return;
  }
  
  console.log('📺 Creando overlay de pantalla completa con orientación horizontal...');
  
  // Intentar forzar orientación antes de crear overlay
  forceHorizontalOrientation().catch(() => {
    console.log('⚠️ No se pudo forzar orientación, continuando con overlay...');
  });
  
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
  
  // Crear iframe clonado para pantalla completa con orientación optimizada
  const fullscreenIframe = iframe.cloneNode(true);
  fullscreenIframe.id = 'geogebra-fullscreen-iframe';
  
  // Configurar iframe para orientación horizontal
  if (window.innerWidth < window.innerHeight) {
    // Si estamos en vertical, optimizar para horizontal
    fullscreenIframe.style.cssText = `
      width: 100vh;
      height: 80vw;
      max-width: 95vw;
      max-height: 90vh;
      border: none;
      border-radius: 8px;
      transform: rotate(0deg);
    `;
  } else {
    // Ya estamos en horizontal
    fullscreenIframe.style.cssText = `
      width: 95vw;
      height: 90vh;
      border: none;
      border-radius: 8px;
    `;
  }
  
  // Botón para salir de pantalla completa (más grande para fácil acceso)
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
  
  // Función para cerrar overlay y restaurar orientación
  const closeOverlay = () => {
    console.log('🔚 Cerrando overlay y restaurando orientación...');
    unlockOrientation();
    document.body.removeChild(overlay);
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
  
  // Instrucciones para el usuario (especialmente útil en móviles)
  const instructions = document.createElement('div');
  instructions.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
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
  instructions.innerHTML = `
    <div>📱 Gira tu dispositivo para mejor experiencia</div>
    <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">Esta ventana se cerrará automáticamente en 3 segundos</div>
  `;
  
  // Agregar elementos al overlay
  overlay.appendChild(fullscreenIframe);
  overlay.appendChild(exitBtn);
  
  // Solo mostrar instrucciones en dispositivos móviles
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (isMobile) {
    overlay.appendChild(instructions);
    
    // Ocultar instrucciones después de 3 segundos
    setTimeout(() => {
      if (instructions.parentNode) {
        instructions.style.opacity = '0';
        setTimeout(() => {
          if (instructions.parentNode) {
            instructions.parentNode.removeChild(instructions);
          }
        }, 500);
      }
    }, 3000);
  }
  
  // Agregar overlay al documento
  document.body.appendChild(overlay);
  
  // Cerrar con tecla Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeOverlay();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  // Manejar cambios de orientación
  const handleOrientationChange = () => {
    console.log('🔄 Cambio de orientación detectado');
    // Reajustar el iframe cuando cambie la orientación
    setTimeout(() => {
      if (window.innerWidth > window.innerHeight) {
        // Ahora estamos en horizontal
        fullscreenIframe.style.width = '95vw';
        fullscreenIframe.style.height = '90vh';
        fullscreenIframe.style.transform = 'rotate(0deg)';
      }
    }, 100);
  };
  
  // Escuchar cambios de orientación
  window.addEventListener('orientationchange', handleOrientationChange);
  window.addEventListener('resize', handleOrientationChange);
  
  // Limpiar event listeners al cerrar
  const originalClose = closeOverlay;
  closeOverlay = () => {
    window.removeEventListener('orientationchange', handleOrientationChange);
    window.removeEventListener('resize', handleOrientationChange);
    originalClose();
  };
  
  console.log('📺 Overlay de pantalla completa con orientación horizontal creado');
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
  
  console.log('🚀 Applets.js mejorado cargado con iconos más grandes');
});