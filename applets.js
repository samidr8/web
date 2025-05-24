// ===== APPLETS.JS CON FUNCIONALIDAD DE PANTALLA COMPLETA =====

let isFullscreen = false;
let fullscreenContainer = null;

function showGeogebraApplet() {
  const container = document.getElementById('geogebra-container');
  if (container) {
    container.style.display = 'block';
    container.style.pointerEvents = 'auto';
    
    // Agregar botón de pantalla completa si no existe
    addFullscreenButton(container);
    
    console.log('🧮 GeoGebra applet mostrado');
  }
}

function addFullscreenButton(container) {
  // Verificar si el botón ya existe
  if (container.querySelector('.fullscreen-btn')) {
    return;
  }
  
  // Crear el botón de pantalla completa
  const fullscreenBtn = document.createElement('button');
  fullscreenBtn.className = 'fullscreen-btn';
  fullscreenBtn.innerHTML = `
    <span class="fullscreen-icon">⛶</span>
    <span class="fullscreen-text">Pantalla Completa</span>
  `;
  
  // Agregar el botón al contenedor
  const geogebraPlayer = container.querySelector('.geogebra-player');
  if (geogebraPlayer) {
    geogebraPlayer.appendChild(fullscreenBtn);
  }
  
  // Event listener para el botón
  fullscreenBtn.addEventListener('click', toggleFullscreen);
}

function toggleFullscreen() {
  const container = document.getElementById('geogebra-container');
  const geogebraPlayer = container.querySelector('.geogebra-player');
  const iframe = document.getElementById('geogebra-iframe');
  const fullscreenBtn = container.querySelector('.fullscreen-btn');
  
  if (!isFullscreen) {
    // Entrar en pantalla completa
    enterFullscreen(container, geogebraPlayer, iframe, fullscreenBtn);
  } else {
    // Salir de pantalla completa
    exitFullscreen(container, geogebraPlayer, iframe, fullscreenBtn);
  }
}

function enterFullscreen(container, geogebraPlayer, iframe, fullscreenBtn) {
  console.log('📱 Entrando en modo pantalla completa');
  
  // Marcar como pantalla completa
  isFullscreen = true;
  fullscreenContainer = container;
  
  // Aplicar estilos de pantalla completa al contenedor
  container.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.95) !important;
    z-index: 99999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    margin: 0 !important;
  `;
  
  // Aplicar estilos al player
  geogebraPlayer.style.cssText = `
    width: 95vw !important;
    height: 90vh !important;
    max-width: none !important;
    max-height: none !important;
    aspect-ratio: auto !important;
    background: #fff !important;
    border-radius: 8px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8) !important;
    position: relative !important;
  `;
  
  // Aplicar estilos al iframe
  if (iframe) {
    iframe.style.cssText = `
      width: 100% !important;
      height: calc(100% - 60px) !important;
      border: none !important;
      border-radius: 8px 8px 0 0 !important;
    `;
  }
  
  // Actualizar el botón
  fullscreenBtn.innerHTML = `
    <span class="fullscreen-icon">⛷</span>
    <span class="fullscreen-text">Salir</span>
  `;
  fullscreenBtn.style.cssText = `
    position: absolute !important;
    bottom: 10px !important;
    right: 15px !important;
    background: linear-gradient(135deg, #FF5722, #FF7043) !important;
    color: white !important;
    z-index: 100000 !important;
  `;
  
  // Forzar orientación horizontal en móviles
  requestLandscapeOrientation();
  
  // Ocultar otros elementos de la página
  hidePageElements();
  
  // Listener para ESC
  document.addEventListener('keydown', handleEscapeKey);
  
  // Prevent scroll
  document.body.style.overflow = 'hidden';
}

function exitFullscreen(container, geogebraPlayer, iframe, fullscreenBtn) {
  console.log('📱 Saliendo del modo pantalla completa');
  
  // Marcar como NO pantalla completa
  isFullscreen = false;
  fullscreenContainer = null;
  
  // Restaurar estilos originales del contenedor
  container.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    display: block;
    z-index: 9999;
  `;
  
  // Restaurar estilos del player
  geogebraPlayer.style.cssText = `
    width: 90vw;
    max-width: 600px;
    aspect-ratio: 4/3;
    height: auto;
    margin: 0 auto;
    background: #fff;
    border: 2px solid #ddd;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
    pointer-events: auto;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
  `;
  
  // Restaurar estilos del iframe
  if (iframe) {
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `;
  }
  
  // Actualizar el botón
  fullscreenBtn.innerHTML = `
    <span class="fullscreen-icon">⛶</span>
    <span class="fullscreen-text">Pantalla Completa</span>
  `;
  fullscreenBtn.style.cssText = `
    position: absolute;
    top: 45px;
    right: 50px;
    background: linear-gradient(135deg, #2196F3, #42A5F5);
    color: white;
    z-index: 10000;
  `;
  
  // Restaurar elementos de la página
  showPageElements();
  
  // Remove ESC listener
  document.removeEventListener('keydown', handleEscapeKey);
  
  // Restore scroll
  document.body.style.overflow = '';
  
  // Restaurar orientación
  exitLandscapeOrientation();
}

function requestLandscapeOrientation() {
  try {
    // Intentar forzar orientación horizontal
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(err => {
        console.log('⚠️ No se pudo forzar orientación landscape:', err);
      });
    }
    
    // Alternativa para navegadores que no soportan screen.orientation
    if ('orientation' in window) {
      console.log('📱 Solicitando orientación horizontal');
    }
  } catch (error) {
    console.log('⚠️ Error al solicitar orientación:', error);
  }
}

function exitLandscapeOrientation() {
  try {
    // Liberar bloqueo de orientación
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    }
  } catch (error) {
    console.log('⚠️ Error al liberar orientación:', error);
  }
}

function hidePageElements() {
  // Ocultar elementos que no sean el applet
  const elementsToHide = [
    'a-scene',
    '.ar-config-icon',
    '#youtube-container',
    '#podcast-container',
    '#imagen-container',
    '#webpage-container'
  ];
  
  elementsToHide.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el && !el.closest('#geogebra-container')) {
        el.style.display = 'none';
      }
    });
  });
}

function showPageElements() {
  // Mostrar elementos ocultos
  const elementsToShow = [
    'a-scene',
    '.ar-config-icon'
  ];
  
  elementsToShow.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el) {
        el.style.display = '';
      }
    });
  });
}

function handleEscapeKey(event) {
  if (event.key === 'Escape' && isFullscreen) {
    toggleFullscreen();
  }
}

// Listener para cambios de orientación
window.addEventListener('orientationchange', () => {
  if (isFullscreen) {
    // Pequeño delay para que la orientación se complete
    setTimeout(() => {
      const container = document.getElementById('geogebra-container');
      const geogebraPlayer = container?.querySelector('.geogebra-player');
      
      if (geogebraPlayer) {
        // Reajustar tamaños después del cambio de orientación
        geogebraPlayer.style.width = '95vw';
        geogebraPlayer.style.height = '90vh';
      }
    }, 100);
  }
});

// Listener para detectar salida de pantalla completa por otros medios
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && isFullscreen) {
    // Si se salió de pantalla completa por F11 o ESC del navegador
    const container = document.getElementById('geogebra-container');
    if (container) {
      const geogebraPlayer = container.querySelector('.geogebra-player');
      const iframe = document.getElementById('geogebra-iframe');
      const fullscreenBtn = container.querySelector('.fullscreen-btn');
      
      if (geogebraPlayer && iframe && fullscreenBtn) {
        exitFullscreen(container, geogebraPlayer, iframe, fullscreenBtn);
      }
    }
  }
});

// Función auxiliar para detectar si el dispositivo es móvil
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Exportar funciones si es necesario
window.showGeogebraApplet = showGeogebraApplet;
window.toggleFullscreen = toggleFullscreen;