// ===== FUNCTIONS.JS OPTIMIZADO PARA CARGA RÁPIDA =====

// Variables globales para control de carga
let cameraReady = false;
let backgroundLoadingInProgress = false;
let loadingQueue = [];

// Inicialización RÁPIDA - Solo lo esencial
document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 Iniciando carga rápida...');
  
  // 1. SOLO configurar listeners (NO cargar iframes todavía)
  setupEventListeners();
  
  // 2. Inicializar cámara INMEDIATAMENTE
  initializeCamera();
  
  // 3. Empezar carga en segundo plano DESPUÉS de que la cámara esté lista
  // (no bloquear la inicialización)
});

function setupEventListeners() {
  // Configurar listeners básicos sin cargar contenido
  document.getElementById('youtube-close-btn').addEventListener('click', () => closeContent('youtube'));
  document.getElementById('geogebra-close-btn').addEventListener('click', () => closeContent('geogebra'));
  document.getElementById('webpage-close-btn').addEventListener('click', handleWebpageClose);
  document.getElementById('cancel-webpage-btn').addEventListener('click', handleWebpageClose);
  document.getElementById('open-browser-btn').addEventListener('click', openExternalBrowser);
  document.getElementById('podcast-close-btn').addEventListener('click', () => closeContent('podcast'));
  document.getElementById('imagen-close-btn').addEventListener('click', () => closeContent('imagen'));
}

function initializeCamera() {
  const scene = document.querySelector('a-scene');
  
  // Listener para cuando la escena esté lista (RÁPIDO)
  scene.addEventListener('renderstart', onCameraQuickStart);
  scene.addEventListener('loaded', onSceneFullyLoaded);
}

function onCameraQuickStart() {
  console.log('📷 Cámara iniciando...');
  
  // Marcar rendimiento si está disponible
  if (typeof PerformanceMonitor !== 'undefined') {
    PerformanceMonitor.mark('Cámara Lista');
  }
  
  // Animar la barra de progreso del loader inicial
  const loaderBar = document.getElementById('loader-bar');
  if (loaderBar) {
    // Simular progreso de carga
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      loaderBar.style.width = progress + '%';
      
      if (progress >= 100) {
        clearInterval(interval);
        // Ocultar loader inicial después de completar la animación
        setTimeout(() => {
          const loader = document.getElementById('ar-loader');
          if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
              loader.style.display = 'none';
              cameraReady = true;
              console.log('✅ Cámara lista en segundo plano');
              
              // AHORA empezar carga en segundo plano
              startBackgroundLoading();
            }, 500);
          }
        }, 300);
      }
    }, 300);
  }
}

function onSceneFullyLoaded() {
  console.log('🎯 Configurando eventos de marcadores...');
  
  // Configurar eventos de MindAR SOLO para targets que NO son 3D
  const scene = document.querySelector('a-scene');
  scene.addEventListener('targetFound', onTargetFound);
  scene.addEventListener('targetLost', onTargetLost);
}

// ===== CARGA EN SEGUNDO PLANO =====
function startBackgroundLoading() {
  if (backgroundLoadingInProgress) return;
  
  backgroundLoadingInProgress = true;
  console.log('⚡ Iniciando carga en segundo plano...');
  
  // Marcar rendimiento si está disponible
  if (typeof PerformanceMonitor !== 'undefined') {
    PerformanceMonitor.mark('Inicio Carga en Segundo Plano');
  }
  
  // ELIMINADO: No precargar modelo 3D - ya está en el HTML
  // Solo precargar iframes (audio e imágenes se cargan cuando se detectan)
  loadingQueue = [
    { type: 'iframe', target: 'youtube', priority: 1 },
    { type: 'iframe', target: 'geogebra', priority: 2 }
  ];
  
  // Procesar cola de carga con intervalos para no bloquear
  processLoadingQueue();
}

function processLoadingQueue() {
  if (loadingQueue.length === 0) {
    console.log('✅ Todos los recursos cargados en segundo plano');
    
    // Marcar rendimiento si está disponible
    if (typeof PerformanceMonitor !== 'undefined') {
      PerformanceMonitor.mark('Recursos Precargados');
      PerformanceMonitor.checkPerformanceGoals();
    }
    
    return;
  }
  
  const item = loadingQueue.shift();
  
  // Cargar con delay para no saturar la red
  setTimeout(() => {
    loadResourceInBackground(item);
    processLoadingQueue(); // Continuar con el siguiente
  }, 300); // 300ms entre cada carga
}

function loadResourceInBackground(item) {
  console.log(`📦 Cargando en segundo plano: ${item.type} - ${item.target}`);
  
  try {
    if (item.type === 'iframe') {
      loadIframeInBackground(item.target);
    }
    // ELIMINADO: No hay más carga de recursos 3D en segundo plano
  } catch (error) {
    console.warn(`⚠️ Error cargando ${item.target} en segundo plano:`, error);
  }
}

function loadIframeInBackground(target) {
  if (target === 'youtube') {
    const iframe = document.getElementById('youtube-iframe');
    // Cargar iframe SIN autoplay para evitar problemas
    iframe.src = `https://www.youtube.com/embed/${CONTENT_CONFIG[0].youtubeId}?enablejsapi=1&controls=1`;
    console.log('📺 YouTube iframe cargado en segundo plano');
    
  } else if (target === 'geogebra') {
    const iframe = document.getElementById('geogebra-iframe');
    const config = CONTENT_CONFIG[1];
    
    let geogebraUrl;
    if (config.appletId === "classic") {
      geogebraUrl = "https://www.geogebra.org/classic";
    } else {
      geogebraUrl = `https://www.geogebra.org/material/iframe/id/${config.appletId}/width/1400/height/800/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false`;
    }
    
    iframe.src = geogebraUrl;
    console.log('🧮 GeoGebra iframe cargado en segundo plano');
  }
}

// ELIMINADAS: Funciones de precarga de modelo 3D
// preload3DModel(), preloadAudio(), preloadImage() se mantienen solo para audio e imagen

function preloadAudio(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  config.loading = true;
  
  const audio = new Audio();
  audio.src = config.audioPath;
  audio.preload = "auto";
  
  audio.addEventListener('canplaythrough', () => {
    console.log('🎵 Audio precargado exitosamente');
    config.loaded = true;
    config.loading = false;
    // Guardar referencia para uso posterior
    config.audioElement = audio;
  });
  
  audio.addEventListener('error', () => {
    console.warn('Error precargando audio');
    config.loading = false;
  });
}

function preloadImage(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  config.loading = true;
  
  const img = new Image();
  img.src = config.imagePath;
  
  img.onload = () => {
    console.log('🖼️ Imagen precargada exitosamente');
    config.loaded = true;
    config.loading = false;
    
    // Preparar el asset
    const assets = document.querySelector('a-assets');
    const imgElement = document.createElement('img');
    imgElement.setAttribute('id', `target-${targetIndex}-image`);
    imgElement.setAttribute('src', config.imagePath);
    assets.appendChild(imgElement);
  };
  
  img.onerror = () => {
    console.warn('Error precargando imagen');
    config.loading = false;
  };
}

// ===== DETECCIÓN DE MARCADORES (INSTANTÁNEA) =====
function onTargetFound(event) {
  const targetIndex = event.target.getAttribute('mindar-image-target').targetIndex;
  const contentConfig = CONTENT_CONFIG[targetIndex];
  
  if (!contentConfig) return;
  
  contentConfig.visible = true;
  console.log(`🎯 Marcador ${targetIndex} detectado - Tipo: ${contentConfig.type}`);
  
  // Marcar rendimiento si está disponible
  if (typeof PerformanceMonitor !== 'undefined') {
    PerformanceMonitor.mark(`Marcador ${targetIndex} Detectado`);
  }
  
  // CLAVE: NO interferir con el modelo 3D (target 3)
  if (targetIndex == 3) {
    console.log('🎨 Modelo 3D detectado - dejando que A-Frame lo maneje nativamente');
    contentConfig.loaded = true;
    return; // SALIR TEMPRANO - no hacer nada más
  }
  
  // Mostrar contenido SOLO para targets que NO son 3D
  switch(contentConfig.type) {
    case "video":
      if (!contentConfig.loaded) {
        showResourceLoader(targetIndex);
        // Simular carga del iframe de YouTube
        simulateIframeLoading(targetIndex, () => {
          hideResourceLoader();
          showYoutubePlayer();
          contentConfig.loaded = true;
        });
      } else {
        showYoutubePlayer();
      }
      break;
      
    case "geogebra":
      if (!contentConfig.loaded) {
        showResourceLoader(targetIndex);
        // Simular carga del iframe de GeoGebra
        simulateIframeLoading(targetIndex, () => {
          hideResourceLoader();
          showGeogebraApplet();
          contentConfig.loaded = true;
        });
      } else {
        showGeogebraApplet();
      }
      break;
      
    case "webpage":
      showWebpageAlert();
      break;
      
    case "podcast":
      // Cargar directamente cuando se detecta
      console.log('⏳ Cargando podcast...');
      showResourceLoader(targetIndex);
      loadAudioResource(targetIndex);
      break;
      
    case "imagen":
      // Cargar directamente cuando se detecta
      console.log('⏳ Cargando imagen...');
      showResourceLoader(targetIndex);
      loadImageResource(targetIndex);
      break;
  }
}

function onTargetLost(event) {
  const targetIndex = event.target.getAttribute('mindar-image-target').targetIndex;
  const contentConfig = CONTENT_CONFIG[targetIndex];
  
  if (!contentConfig) return;
  
  contentConfig.visible = false;
  hideResourceLoader();
  
  // CLAVE: NO interferir con el modelo 3D (target 3)
  if (targetIndex == 3) {
    console.log('🎨 Modelo 3D perdido - A-Frame lo oculta automáticamente');
    return; // SALIR TEMPRANO - no hacer nada más
  }
}

// ===== FUNCIONES DE SOPORTE =====
function showResourceLoader(targetIndex) {
  const loader = document.getElementById('ar-resource-loader');
  const bar = document.getElementById('resource-loader-bar');
  const loaderText = document.querySelector('.loader-text');
  
  if (loader && bar) {
    loader.style.display = 'block';
    bar.style.width = '0%';
    
    // Personalizar texto según el tipo de recurso
    const config = CONTENT_CONFIG[targetIndex];
    const resourceNames = {
      'video': 'video de YouTube',
      'geogebra': 'applet de GeoGebra',
      '3d': 'modelo 3D',
      'podcast': 'podcast',
      'imagen': 'imagen',
      'webpage': 'página web'
    };
    
    if (loaderText) {
      loaderText.textContent = `Cargando ${resourceNames[config.type] || 'recurso AR'}...`;
    }
    
    // Animar la barra de progreso
    setTimeout(() => {
      bar.style.transition = 'width 0.3s ease';
      bar.style.width = '10%';
    }, 100);
  }
}

function hideResourceLoader() {
  const loader = document.getElementById('ar-resource-loader');
  const bar = document.getElementById('resource-loader-bar');
  
  if (loader) {
    // Completar la barra antes de ocultar
    if (bar) {
      bar.style.width = '100%';
    }
    
    setTimeout(() => {
      loader.style.display = 'none';
      if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0%';
      }
    }, 300);
  }
}

function updateResourceLoaderProgress(targetIndex, percent) {
  const bar = document.getElementById('resource-loader-bar');
  if (bar) {
    bar.style.transition = 'width 0.3s ease';
    bar.style.width = `${Math.min(percent, 100)}%`;
  }
}

// Función para simular carga de iframes
function simulateIframeLoading(targetIndex, callback) {
  let progress = 10;
  const interval = setInterval(() => {
    progress += 20;
    updateResourceLoaderProgress(targetIndex, progress);
    
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(callback, 300);
    }
  }, 300);
}

function closeContent(type) {
  const container = document.getElementById(`${type}-container`);
  if (container) {
    container.style.display = 'none';

    if (type === 'youtube') {
      const iframe = document.getElementById('youtube-iframe');
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'pauseVideo',
            args: []
          }), '*');
        } catch (error) {
          console.warn('No se pudo pausar YouTube:', error);
        }
      }
    } else if (type === 'podcast' && podcastAudio) {
      try {
        podcastAudio.pause();
        podcastAudio.currentTime = 0;
      } catch (error) {
        console.warn('No se pudo pausar el podcast:', error);
      }
    }
  }
  
  Object.keys(CONTENT_CONFIG).forEach(key => {
    if (CONTENT_CONFIG[key].container === type) {
      CONTENT_CONFIG[key].visible = false;
    }
  });
}

function handleWebpageClose() {
  closeContent('webpage');
}

function openExternalBrowser() {
  try {
    const newWindow = window.open(CONTENT_CONFIG[2].url, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = CONTENT_CONFIG[2].url;
    }
  } catch (e) {
    console.error('Error al abrir el navegador:', e);
    window.location.href = CONTENT_CONFIG[2].url;
  }
  closeContent('webpage');
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}