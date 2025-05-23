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
  
  // Ocultar loader inicial MUY RÁPIDO (2-3 segundos máximo)
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
  }, 1500); // 1.5 segundos máximo
}

function onSceneFullyLoaded() {
  console.log('🎯 Configurando eventos de marcadores...');
  
  // Configurar eventos de MindAR
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
  
  // Cargar recursos de forma asíncrona y NO bloqueante
  loadingQueue = [
    { type: 'iframe', target: 'youtube', priority: 1 },
    { type: 'iframe', target: 'geogebra', priority: 2 },
    { type: 'resource', target: 3, priority: 3 }, // Modelo 3D
    { type: 'resource', target: 4, priority: 4 }, // Audio
    { type: 'resource', target: 5, priority: 5 }  // Imagen
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
    } else if (item.type === 'resource') {
      preloadResourceInBackground(item.target);
    }
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

function preloadResourceInBackground(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  
  if (config.loading || config.loaded) return; // Ya se está cargando o ya está cargado
  
  switch(config.type) {
    case "3d":
      preload3DModel(targetIndex);
      break;
    case "podcast":
      preloadAudio(targetIndex);
      break;
    case "imagen":
      preloadImage(targetIndex);
      break;
  }
}

// ===== FUNCIONES DE PRECARGA =====
function preload3DModel(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  config.loading = true;
  
  if (typeof THREE === 'undefined' || !THREE.GLTFLoader) {
    console.warn('THREE.GLTFLoader no disponible para precarga');
    config.loading = false;
    return;
  }
  
  const loader = new THREE.GLTFLoader();
  loader.load(
    config.modelPath,
    (gltf) => {
      console.log('🎨 Modelo 3D precargado exitosamente');
      config.modelLoaded = true;
      config.loaded = true;
      config.loading = false;
      
      // Preparar el asset
      const assets = document.querySelector('a-assets');
      const modelElement = document.createElement('a-asset-item');
      modelElement.setAttribute('id', `target-${targetIndex}-model`);
      modelElement.setAttribute('src', config.modelPath);
      assets.appendChild(modelElement);
    },
    undefined, // Sin progreso durante precarga
    (error) => {
      console.warn('Error precargando modelo 3D:', error);
      config.loading = false;
    }
  );
}

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
  
  // Mostrar contenido INMEDIATAMENTE (ya precargado)
  switch(contentConfig.type) {
    case "video":
      showYoutubePlayer();
      break;
      
    case "geogebra":
      showGeogebraApplet();
      break;
      
    case "webpage":
      showWebpageAlert();
      break;
      
    case "3d":
      if (contentConfig.loaded) {
        show3DModel(targetIndex);
      } else {
        console.log('⏳ Modelo 3D aún cargando...');
        showResourceLoader(targetIndex);
        // Empezar carga si no se ha iniciado
        if (!contentConfig.loading) {
          load3DResource(targetIndex);
        }
      }
      break;
      
    case "podcast":
      if (contentConfig.loaded) {
        showPodcastPlayer(targetIndex);
      } else {
        console.log('⏳ Audio aún cargando...');
        showResourceLoader(targetIndex);
        if (!contentConfig.loading) {
          loadAudioResource(targetIndex);
        }
      }
      break;
      
    case "imagen":
      if (contentConfig.loaded) {
        showImage(targetIndex);
      } else {
        console.log('⏳ Imagen aún cargando...');
        showResourceLoader(targetIndex);
        if (!contentConfig.loading) {
          loadImageResource(targetIndex);
        }
      }
      break;
  }
}

function onTargetLost(event) {
  const targetIndex = event.target.getAttribute('mindar-image-target').targetIndex;
  const contentConfig = CONTENT_CONFIG[targetIndex];
  
  if (!contentConfig) return;
  
  contentConfig.visible = false;
  hideResourceLoader();
}

// ===== FUNCIONES DE SOPORTE (sin cambios) =====
function showResourceLoader(targetIndex) {
  const loader = document.getElementById('ar-resource-loader');
  const bar = document.getElementById('resource-loader-bar');
  if (loader && bar) {
    loader.style.display = 'block';
    bar.style.width = '0%';
  }
}

function hideResourceLoader() {
  const loader = document.getElementById('ar-resource-loader');
  if (loader) {
    loader.style.display = 'none';
  }
}

function updateResourceLoaderProgress(targetIndex, percent) {
  const bar = document.getElementById('resource-loader-bar');
  if (bar) {
    bar.style.width = `${Math.min(percent, 100)}%`;
  }
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