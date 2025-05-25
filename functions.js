// ===== FUNCTIONS.JS OPTIMIZADO PARA CARGA RÁPIDA =====

// Variables globales para control de carga
let cameraReady = false;
let backgroundLoadingInProgress = false;
let loadingQueue = [];

// Variables dinámicas (declaradas solo aquí para evitar conflictos)
// currentActiveTarget, currentWebpageUrl, activeAudioElements están en resources.js

// Inicialización RÁPIDA - Solo lo esencial
document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 Iniciando sistema dinámico escalable...');
  
  // 1. Configurar listeners dinámicos
  setupDynamicEventListeners();
  
  // 2. Inicializar cámara INMEDIATAMENTE
  initializeCamera();
  
  // 3. Aplicar optimizaciones CSS
  applyLoaderOptimizations();
  
  // 4. Preparar modelos 3D dinámicos
  prepareDynamic3DModels();
});

// ===== CONFIGURACIÓN DINÁMICA DE EVENT LISTENERS =====
function setupDynamicEventListeners() {
  console.log('🔧 Configurando listeners dinámicos...');
  
  // Configurar listeners para todos los tipos de contenido
  setupIframeListeners();
  setupWebpageListeners();
  setupAudioListeners();
  setupImageListeners();
}

function setupIframeListeners() {
  // YouTube
  const youtubeCloseBtn = document.getElementById('youtube-close-btn');
  if (youtubeCloseBtn) {
    youtubeCloseBtn.addEventListener('click', () => closeDynamicContent('youtube'));
  }
  
  // GeoGebra
  const geogebraCloseBtn = document.getElementById('geogebra-close-btn');
  if (geogebraCloseBtn) {
    geogebraCloseBtn.addEventListener('click', () => closeDynamicContent('geogebra'));
  }
}

function setupWebpageListeners() {
  const webpageCloseBtn = document.getElementById('webpage-close-btn');
  const cancelBtn = document.getElementById('cancel-webpage-btn');
  const openBtn = document.getElementById('open-browser-btn');
  
  if (webpageCloseBtn) {
    webpageCloseBtn.addEventListener('click', handleDynamicWebpageClose);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', handleDynamicWebpageClose);
  }
  
  if (openBtn) {
    openBtn.addEventListener('click', openDynamicExternalBrowser);
  }
}

function setupAudioListeners() {
  const podcastCloseBtn = document.getElementById('podcast-close-btn');
  if (podcastCloseBtn) {
    podcastCloseBtn.addEventListener('click', () => closeDynamicContent('podcast'));
  }
}

function setupImageListeners() {
  const imageCloseBtn = document.getElementById('imagen-close-btn');
  if (imageCloseBtn) {
    imageCloseBtn.addEventListener('click', () => closeDynamicContent('imagen'));
  }
}

// ===== PREPARACIÓN DE MODELOS 3D DINÁMICOS =====
function prepareDynamic3DModels() {
  console.log('🎨 Preparando modelos 3D dinámicos...');
  
  // Obtener todos los targets 3D
  const targets3D = getTargetsByType('3d');
  
  targets3D.forEach(({ targetIndex, config }) => {
    if (!config.loaded && config.modelPath) {
      // Preparar asset dinámicamente
      prepareDynamic3DAsset(targetIndex, config);
    }
  });
}

function prepareDynamic3DAsset(targetIndex, config) {
  const assets = document.querySelector('a-assets');
  if (!assets) return;
  
  // Verificar si ya existe
  if (document.getElementById(config.modelId)) {
    config.loaded = true;
    return;
  }
  
  // Crear asset dinámicamente
  const assetItem = document.createElement('a-asset-item');
  assetItem.setAttribute('id', config.modelId);
  assetItem.setAttribute('src', config.modelPath);
  
  assetItem.addEventListener('loaded', () => {
    console.log(`✅ Modelo 3D ${config.modelId} cargado dinámicamente`);
    config.loaded = true;
  });
  
  assetItem.addEventListener('error', () => {
    console.error(`❌ Error cargando modelo 3D ${config.modelId}`);
  });
  
  assets.appendChild(assetItem);
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
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      loaderBar.style.width = progress + '%';
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          const loader = document.getElementById('ar-loader');
          if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
              loader.style.display = 'none';
              cameraReady = true;
              console.log('✅ Cámara lista - iniciando carga dinámica');
              startDynamicBackgroundLoading();
            }, 500);
          }
        }, 300);
      }
    }, 300);
  }
}

function onSceneFullyLoaded() {
  console.log('🎯 Configurando eventos dinámicos de marcadores...');
  
  const scene = document.querySelector('a-scene');
  scene.addEventListener('targetFound', onDynamicTargetFound);
  scene.addEventListener('targetLost', onDynamicTargetLost);
}

// ===== CARGA DINÁMICA EN SEGUNDO PLANO =====
function startDynamicBackgroundLoading() {
  if (backgroundLoadingInProgress) return;
  
  backgroundLoadingInProgress = true;
  console.log('⚡ Iniciando carga dinámica en segundo plano...');
  
  if (typeof PerformanceMonitor !== 'undefined') {
    PerformanceMonitor.mark('Inicio Carga Dinámica');
  }
  
  // Construir cola dinámicamente basada en la configuración
  buildDynamicLoadingQueue();
  processDynamicLoadingQueue();
}

function buildDynamicLoadingQueue() {
  loadingQueue = [];
  
  // Obtener todos los targets de video y geogebra para precarga
  const videoTargets = getTargetsByType('video');
  const geogebraTargets = getTargetsByType('geogebra');
  
  // Agregar videos con prioridad alta
  videoTargets.forEach(({ targetIndex }) => {
    loadingQueue.push({ 
      type: 'iframe', 
      target: 'youtube', 
      targetIndex: targetIndex,
      priority: 1 
    });
  });
  
  // Agregar GeoGebra con prioridad media
  geogebraTargets.forEach(({ targetIndex }) => {
    loadingQueue.push({ 
      type: 'iframe', 
      target: 'geogebra', 
      targetIndex: targetIndex,
      priority: 2 
    });
  });
  
  // Ordenar por prioridad
  loadingQueue.sort((a, b) => a.priority - b.priority);
  
  console.log(`📋 Cola de carga dinámica: ${loadingQueue.length} elementos`);
}

function processDynamicLoadingQueue() {
  if (loadingQueue.length === 0) {
    console.log('✅ Todos los recursos dinámicos cargados');
    
    if (typeof PerformanceMonitor !== 'undefined') {
      PerformanceMonitor.mark('Recursos Dinámicos Precargados');
      PerformanceMonitor.checkPerformanceGoals();
    }
    
    return;
  }
  
  const item = loadingQueue.shift();
  
  setTimeout(() => {
    loadDynamicResourceInBackground(item);
    processDynamicLoadingQueue();
  }, 300);
}

function loadDynamicResourceInBackground(item) {
  console.log(`📦 Cargando dinámicamente: ${item.type} - Target ${item.targetIndex}`);
  
  try {
    if (item.type === 'iframe') {
      loadDynamicIframeInBackground(item.target, item.targetIndex);
    }
  } catch (error) {
    console.warn(`⚠️ Error cargando target ${item.targetIndex}:`, error);
  }
}

function loadDynamicIframeInBackground(containerType, targetIndex) {
  const config = getTargetConfig(targetIndex);
  if (!config) return;
  
  if (containerType === 'youtube' && config.type === 'video') {
    const iframe = document.getElementById('youtube-iframe');
    if (iframe && config.youtubeId) {
      iframe.src = `https://www.youtube.com/embed/${config.youtubeId}?enablejsapi=1&controls=1`;
      console.log(`📺 YouTube Target ${targetIndex} cargado en segundo plano`);
    }
  } else if (containerType === 'geogebra' && config.type === 'geogebra') {
    const iframe = document.getElementById('geogebra-iframe');
    if (iframe && config.appletId) {
      let geogebraUrl;
      if (config.appletId === "classic") {
        geogebraUrl = "https://www.geogebra.org/classic";
      } else {
        geogebraUrl = `https://www.geogebra.org/material/iframe/id/${config.appletId}/width/1400/height/800/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false`;
      }
      iframe.src = geogebraUrl;
      console.log(`🧮 GeoGebra Target ${targetIndex} cargado en segundo plano`);
    }
  }
}

// ===== DETECCIÓN DINÁMICA DE MARCADORES =====
function onDynamicTargetFound(event) {
  const targetIndex = parseInt(event.target.getAttribute('mindar-image-target').targetIndex);
  const contentConfig = getTargetConfig(targetIndex);
  
  if (!contentConfig) {
    console.warn(`⚠️ Target ${targetIndex} no encontrado en configuración`);
    return;
  }
  
  // Establecer como target activo
  currentActiveTarget = targetIndex;
  contentConfig.visible = true;
  
  console.log(`🎯 Target ${targetIndex} detectado - Tipo: ${contentConfig.type} - "${contentConfig.title || 'Sin título'}"`);
  
  if (typeof PerformanceMonitor !== 'undefined') {
    PerformanceMonitor.mark(`Target ${targetIndex} Detectado`);
  }
  
  // Manejar según el tipo
  handleDynamicTargetByType(targetIndex, contentConfig);
}

function handleDynamicTargetByType(targetIndex, config) {
  switch(config.type) {
    case "video":
      handleDynamicVideo(targetIndex, config);
      break;
      
    case "geogebra":
      handleDynamicGeoGebra(targetIndex, config);
      break;
      
    case "webpage":
      handleDynamicWebpage(targetIndex, config);
      break;
      
    case "3d":
      handleDynamic3D(targetIndex, config);
      break;
      
    case "podcast":
      handleDynamicPodcast(targetIndex, config);
      break;
      
    case "imagen":
      handleDynamicImage(targetIndex, config);
      break;
      
    default:
      console.warn(`⚠️ Tipo de contenido no reconocido: ${config.type}`);
  }
}

// ===== MANEJADORES DINÁMICOS POR TIPO =====

function handleDynamicVideo(targetIndex, config) {
  showResourceLoader(targetIndex);
  
  if (!config.loaded) {
    // Actualizar iframe con el video específico
    const iframe = document.getElementById('youtube-iframe');
    if (iframe && config.youtubeId) {
      iframe.src = `https://www.youtube.com/embed/${config.youtubeId}?enablejsapi=1&controls=1&autoplay=1`;
    }
    
    simulateIframeLoading(targetIndex, () => {
      hideResourceLoader();
      showYoutubePlayer();
      config.loaded = true;
    });
  } else {
    // Ya cargado, solo actualizar src si es necesario
    const iframe = document.getElementById('youtube-iframe');
    if (iframe && config.youtubeId) {
      const currentSrc = iframe.src;
      const expectedSrc = `https://www.youtube.com/embed/${config.youtubeId}`;
      if (!currentSrc.includes(config.youtubeId)) {
        iframe.src = `${expectedSrc}?enablejsapi=1&controls=1&autoplay=1`;
      }
    }
    
    setTimeout(() => {
      hideResourceLoader();
      showYoutubePlayer();
    }, 100);
  }
}

function handleDynamicGeoGebra(targetIndex, config) {
  showResourceLoader(targetIndex);
  
  if (!config.loaded) {
    // Actualizar iframe con el applet específico
    const iframe = document.getElementById('geogebra-iframe');
    if (iframe && config.appletId) {
      let geogebraUrl;
      if (config.appletId === "classic") {
        geogebraUrl = "https://www.geogebra.org/classic";
      } else {
        geogebraUrl = `https://www.geogebra.org/material/iframe/id/${config.appletId}/width/1400/height/800/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false`;
      }
      iframe.src = geogebraUrl;
    }
    
    simulateIframeLoading(targetIndex, () => {
      hideResourceLoader();
      showGeogebraApplet();
      config.loaded = true;
    });
  } else {
    setTimeout(() => {
      hideResourceLoader();
      showGeogebraApplet();
    }, 100);
  }
}

function handleDynamicWebpage(targetIndex, config) {
  // Establecer URL activa dinámicamente
  currentWebpageUrl = config.url;
  
  simulateWebpageCheck(targetIndex, () => {
    hideResourceLoader();
    showWebpageAlert();
    config.loaded = true;
  });
}

function handleDynamic3D(targetIndex, config) {
  console.log(`🎨 Modelo 3D ${targetIndex} detectado - manejado por A-Frame`);
  
  // Crear o actualizar entidad 3D dinámicamente
  const targetEntity = document.querySelector(`a-entity[mindar-image-target="targetIndex: ${targetIndex}"]`);
  
  if (targetEntity && config.loaded) {
    // Verificar si el modelo ya está agregado
    let existingModel = targetEntity.querySelector('a-gltf-model');
    
    if (!existingModel) {
      // Crear modelo dinámicamente
      existingModel = document.createElement('a-gltf-model');
      existingModel.setAttribute('src', `#${config.modelId}`);
      existingModel.setAttribute('scale', config.scale || '1 1 1');
      existingModel.setAttribute('position', config.position || '0 0 0.1');
      existingModel.setAttribute('rotation', config.rotation || '0 0 0');
      
      if (config.animation) {
        existingModel.setAttribute('animation', config.animation);
      }
      
      targetEntity.appendChild(existingModel);
      console.log(`✅ Modelo 3D ${config.modelId} agregado dinámicamente`);
    }
  }
  
  config.visible = true;
}

function handleDynamicPodcast(targetIndex, config) {
  showResourceLoader(targetIndex);
  loadAudioResource(targetIndex);
}

function handleDynamicImage(targetIndex, config) {
  showResourceLoader(targetIndex);
  loadImageResource(targetIndex);
}

function onDynamicTargetLost(event) {
  const targetIndex = parseInt(event.target.getAttribute('mindar-image-target').targetIndex);
  const contentConfig = getTargetConfig(targetIndex);
  
  if (!contentConfig) return;
  
  contentConfig.visible = false;
  hideResourceLoader();
  
  // Solo resetear si era el target activo
  if (currentActiveTarget === targetIndex) {
    currentActiveTarget = null;
  }
  
  console.log(`👻 Target ${targetIndex} perdido`);
}

// ===== FUNCIONES DE CIERRE DINÁMICAS =====

function closeDynamicContent(containerType) {
  const container = document.getElementById(`${containerType}-container`);
  if (container) {
    container.style.display = 'none';

    // Lógica específica por tipo
    if (containerType === 'youtube') {
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
    } else if (containerType === 'podcast') {
      // Pausar todos los audios activos
      Object.keys(activeAudioElements).forEach(targetIndex => {
        const audio = activeAudioElements[targetIndex];
        if (audio) {
          try {
            audio.pause();
            audio.currentTime = 0;
          } catch (error) {
            console.warn(`Error pausando audio ${targetIndex}:`, error);
          }
        }
      });
    }
  }
  
  // Marcar todos los targets de este tipo como no visibles
  Object.keys(CONTENT_CONFIG).forEach(key => {
    const config = CONTENT_CONFIG[key];
    if (config.container === containerType) {
      config.visible = false;
    }
  });
}

function handleDynamicWebpageClose() {
  closeDynamicContent('webpage');
  currentWebpageUrl = null;
}

function openDynamicExternalBrowser() {
  if (!currentWebpageUrl) {
    console.warn('⚠️ No hay URL activa para abrir');
    return;
  }
  
  try {
    const newWindow = window.open(currentWebpageUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = currentWebpageUrl;
    }
    console.log(`🌐 Abriendo URL dinámica: ${currentWebpageUrl}`);
  } catch (e) {
    console.error('Error al abrir el navegador:', e);
    window.location.href = currentWebpageUrl;
  }
  
  handleDynamicWebpageClose();
}

// ===== FUNCIONES DE SOPORTE OPTIMIZADAS (DINÁMICAS) =====

function showResourceLoader(targetIndex) {
  console.log(`⚡ MOSTRAR LOADER INMEDIATAMENTE - Target ${targetIndex}`);
  
  const loader = document.getElementById('ar-resource-loader');
  const bar = document.getElementById('resource-loader-bar');
  const loaderText = document.querySelector('.loader-text');
  
  if (loader && bar) {
    // ✅ OPTIMIZACIÓN CRÍTICA: Aparecer INSTANTÁNEAMENTE
    loader.style.display = 'block';
    loader.style.opacity = '1';
    loader.style.visibility = 'visible';
    
    // Resetear barra SIN transiciones para aparecer al instante
    bar.style.transition = 'none';
    bar.style.width = '0%';
    
    // Obtener configuración dinámica del target
    const config = getTargetConfig(targetIndex);
    const resourceNames = {
      'video': 'video de YouTube',
      'geogebra': 'applet de GeoGebra',
      '3d': 'modelo 3D',
      'podcast': 'podcast',
      'imagen': 'imagen',
      'webpage': 'página web'
    };
    
    if (loaderText && config) {
      const resourceName = resourceNames[config.type] || 'recurso AR';
      const title = config.title ? ` - ${config.title}` : '';
      loaderText.textContent = `Cargando ${resourceName}${title}...`;
    }
    
    // ✅ PROGRESO INICIAL INMEDIATO (sin requestAnimationFrame que causa delay)
    setTimeout(() => {
      bar.style.transition = 'width 0.3s ease';
      bar.style.width = '15%';
    }, 50); // Delay mínimo para aplicar transición
  }
  
  console.log(`✅ Loader mostrado instantáneamente para target ${targetIndex}`);
}

function hideResourceLoader() {
  const loader = document.getElementById('ar-resource-loader');
  const bar = document.getElementById('resource-loader-bar');
  
  if (loader) {
    if (bar) {
      bar.style.transition = 'width 0.2s ease';
      bar.style.width = '100%';
    }
    
    setTimeout(() => {
      loader.style.display = 'none';
      loader.style.opacity = '0';
      if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0%';
      }
    }, 200);
  }
}

function updateResourceLoaderProgress(targetIndex, percent) {
  const bar = document.getElementById('resource-loader-bar');
  if (bar) {
    bar.style.transition = 'width 0.2s ease';
    bar.style.width = `${Math.min(percent, 100)}%`;
  }
}

// ===== FUNCIONES DE SIMULACIÓN OPTIMIZADAS =====

function simulateIframeLoading(targetIndex, callback) {
  let progress = 15;
  const interval = setInterval(() => {
    progress += 25;
    updateResourceLoaderProgress(targetIndex, progress);
    
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(callback, 100);
    }
  }, 200);
}

function simulateWebpageCheck(targetIndex, callback) {
  let progress = 15;
  const interval = setInterval(() => {
    progress += 30;
    updateResourceLoaderProgress(targetIndex, progress);
    
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(callback, 100);
    }
  }, 150);
}

// ===== CSS OPTIMIZACIONES =====

function applyLoaderOptimizations() {
  const loaderOptimizationCSS = `
    /* ✅ OPTIMIZACIÓN CRÍTICA: Loader instantáneo */
    #ar-resource-loader {
      opacity: 0;
      transition: none !important;
      visibility: hidden;
    }
    
    #ar-resource-loader[style*="display: block"] {
      opacity: 1 !important;
      visibility: visible !important;
    }
    
    .loader-bar {
      transition: width 0.2s ease !important;
    }
    
    /* Asegurar que el loader tenga prioridad visual máxima */
    #ar-resource-loader {
      z-index: 10001 !important;
      pointer-events: auto !important;
    }
  `;

  if (!document.getElementById('loader-optimization-styles')) {
    const style = document.createElement('style');
    style.id = 'loader-optimization-styles';
    style.textContent = loaderOptimizationCSS;
    document.head.appendChild(style);
  }
}

// ===== FUNCIONES AUXILIARES PARA AUDIO DINÁMICO =====

function setActiveAudio(targetIndex, audioElement) {
  // Pausar audios previos
  Object.keys(activeAudioElements).forEach(key => {
    if (key !== targetIndex.toString()) {
      const prevAudio = activeAudioElements[key];
      if (prevAudio && !prevAudio.paused) {
        prevAudio.pause();
      }
    }
  });
  
  // Establecer nuevo audio activo
  activeAudioElements[targetIndex] = audioElement;
}

function removeActiveAudio(targetIndex) {
  if (activeAudioElements[targetIndex]) {
    delete activeAudioElements[targetIndex];
  }
}

// ===== FUNCIONES AUXILIARES PARA MODELOS 3D =====

function setActive3DModel(targetIndex, modelElement) {
  if (!active3DModels) {
    active3DModels = {};
  }
  active3DModels[targetIndex] = modelElement;
}

function removeActive3DModel(targetIndex) {
  if (active3DModels && active3DModels[targetIndex]) {
    delete active3DModels[targetIndex];
  }
}

// ===== FUNCIONES DE UTILIDAD Y DEPURACIÓN =====

function getCurrentActiveTarget() {
  return currentActiveTarget;
}

function getActiveTargets() {
  return Object.keys(CONTENT_CONFIG)
    .filter(key => CONTENT_CONFIG[key].visible)
    .map(key => ({
      targetIndex: parseInt(key),
      config: CONTENT_CONFIG[key]
    }));
}

function resetAllTargets() {
  Object.keys(CONTENT_CONFIG).forEach(key => {
    CONTENT_CONFIG[key].visible = false;
  });
  
  currentActiveTarget = null;
  currentWebpageUrl = null;
  
  // Limpiar audios activos
  Object.keys(activeAudioElements).forEach(key => {
    const audio = activeAudioElements[key];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
  activeAudioElements = {};
  
  console.log('🔄 Todos los targets reseteados');
}

function getTargetStatistics() {
  const stats = {
    total: Object.keys(CONTENT_CONFIG).length,
    loaded: 0,
    visible: 0,
    byType: {}
  };
  
  Object.keys(CONTENT_CONFIG).forEach(key => {
    const config = CONTENT_CONFIG[key];
    
    if (config.loaded) stats.loaded++;
    if (config.visible) stats.visible++;
    
    if (!stats.byType[config.type]) {
      stats.byType[config.type] = { total: 0, loaded: 0, visible: 0 };
    }
    
    stats.byType[config.type].total++;
    if (config.loaded) stats.byType[config.type].loaded++;
    if (config.visible) stats.byType[config.type].visible++;
  });
  
  return stats;
}

// ===== FUNCIONES DE COMPATIBILIDAD =====

// Funciones legacy para mantener compatibilidad
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Funciones que serán llamadas desde otros archivos
function showYoutubePlayer() {
  const container = document.getElementById('youtube-container');
  if (container) {
    container.style.display = 'block';
    container.style.pointerEvents = 'auto';
    console.log('📺 Reproductor de YouTube mostrado dinámicamente');
  }
}

function showGeogebraApplet() {
  const container = document.getElementById('geogebra-container');
  if (container) {
    container.style.display = 'block';
    container.style.pointerEvents = 'auto';
    console.log('🧮 Applet de GeoGebra mostrado dinámicamente');
    
    // 🔧 CORREGIDO: Llamar directamente la función del mensaje
    setTimeout(() => {
      console.log('🔧 Intentando mostrar mensaje de orientación...');
      
      // Verificar si la función existe y llamarla
      if (typeof showOrientationInstructionMessage === 'function') {
        console.log('✅ Función showOrientationInstructionMessage encontrada, ejecutando...');
        showOrientationInstructionMessage();
      } else {
        console.error('❌ Función showOrientationInstructionMessage no encontrada');
      }
      
      // También aplicar estilos
      if (typeof applyFullscreenIconStyles === 'function') {
        console.log('✅ Aplicando estilos de pantalla completa...');
        applyFullscreenIconStyles();
      }
    }, 100); // Delay mínimo para asegurar que el DOM esté listo
  }
}

function showWebpageAlert() {
  const container = document.getElementById('webpage-container');
  const alert = document.getElementById('webpage-alert');
  
  if (container && alert) {
    container.style.display = 'block';
    container.style.pointerEvents = 'auto';
    alert.style.display = 'block';
    
    // Actualizar texto dinámicamente si hay configuración específica
    if (currentActiveTarget !== null) {
      const config = getTargetConfig(currentActiveTarget);
      if (config && config.title) {
        const alertText = alert.querySelector('p');
        if (alertText) {
          alertText.textContent = `"${config.title}" no puede mostrarse directamente debido a políticas de seguridad. ¿Deseas abrirlo en tu navegador?`;
        }
      }
    }
    
    console.log('🌐 Alerta de página web mostrada dinámicamente');
  }
}

// ===== FUNCIONES DE INICIALIZACIÓN FINAL =====

// Auto-ejecutar validaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Ejecutar después de un pequeño delay para asegurar que todo esté cargado
  setTimeout(() => {
    if (typeof getTargetStatistics === 'function') {
      const stats = getTargetStatistics();
      console.log('📊 ESTADÍSTICAS INICIALES:', stats);
      
      // Verificar integridad del sistema
      if (stats.total === 0) {
        console.error('❌ No se encontraron configuraciones de targets');
      } else {
        console.log(`✅ Sistema dinámico listo con ${stats.total} targets configurados`);
      }
    }
  }, 1000);
});