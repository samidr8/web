// ===== RESOURCES.JS EXPANDIDO - CONFIGURACIÓN PARA 12 MARCADORES =====

// Configuración de recursos escalable y dinámica
const CONTENT_CONFIG = {
  // ===== VIDEOS DE YOUTUBE =====
  0: {
    type: "video",
    container: "youtube",
    youtubeId: "dayfz0ff1Mc",
    title: "Video Suma y Resta de número enteros",
    description: "MÉTODO DEBO Y TENGO",
    loaded: false,
    visible: false
  },
  6: {
    type: "video",
    container: "youtube",
    youtubeId: "d6KleH5mLms", 
    title: "Motivación",
    description: "YOKOI KENJI | DISCIPLINA",
    loaded: false,
    visible: false
  },

  // ===== APPLETS DE GEOGEBRA =====
  1: {
    type: "geogebra",
    container: "geogebra",
    appletId: "qzjfkvpm",
    title: "Sumas y restas de numeoros  enteros",
    description: "Explorador interactivo de pajillas",
    loaded: false,
    visible: false
  },
  7: {
    type: "geogebra",
    container: "geogebra",
    appletId: "s5u5g6yr", 
    title: "Sumas y restas de numeoros  enteros",
    description: "Explorador interactivo de rectas numérica",
    loaded: false,
    visible: false
  },

  // ===== PÁGINAS WEB =====
  2: {
    type: "webpage",
    container: "webpage",
    url: "https://wordwall.net/es/resource/12994896/n%C3%BAmeros-negativos-y-positivos",
    title: "Cuestionario Números",
    description: "Ejercicios interactivos sobre números positivos y negativos",
    loaded: false,
    visible: false
  },
  8: {
    type: "webpage",
    container: "webpage",
    url: "https://www.geogebra.org/calculator",
    title: "Calculadora Online",
    description: "Calculadora científica avanzada",
    loaded: false,
    visible: false
  },

  // ===== MODELOS 3D =====  https://sketchfab.com/
  3: {
    type: "3d",
    modelId: "shibaModel",
    modelPath: "media/shiba/scene.gltf",
    title: "Modelo Perro 3D",
    description: "Mascota virtual interactiva",
    scale: "0.5 0.5 0.5",
    position: "0 0 0.1",
    rotation: "0 0 0",
    animation: "property: position; to: 0 0.1 0.1; dur: 1000; easing: easeInOutQuad; loop: true; dir: alternate",
    loaded: true, // Ya está cargado en el HTML
    visible: false
  },
  9: {
    type: "3d",
    modelId: "cubeModel",
    modelPath: "media/capas_internas_tierra/scene.gltf", 
    title: "Capa de la Tierra 3D",
    description: "Capa de la Tierra 3D",
    scale: "0.001 0.001 0.001",
    position: "0 0 0.05",
    rotation: "45 45 0",
    animation: "property: rotation; to: 45 405 0; dur: 20000; easing: linear; loop: true",
    loaded: false, // Este se cargará dinámicamente
    visible: false
  },

  // ===== PODCASTS/AUDIO =====
  4: {
    type: "podcast",
    container: "podcast",
    audioPath: "sound/canto.mp3",
    title: "Podcast Matemáticas",
    description: "Explicación de conceptos matemáticos en audio",
    loaded: false,
    loading: false,
    visible: false
  },
  10: {
    type: "podcast",
    container: "podcast",
    audioPath: "sound/music.mp3", 
    title: "Música relajante",
    description: "Para descansar",
    loaded: false,
    loading: false,
    visible: false
  },

  // ===== IMÁGENES =====
  5: {
    type: "imagen",
    container: "imagen",
    imagePath: "tarjetas/t6.webp",
    title: "Diagrama Geométrico",
    description: "Ilustración de figuras geométricas básicas",
    loaded: false,
    loading: false,
    visible: false
  },
  11: {
    type: "imagen",
    container: "imagen",
    imagePath: "tarjetas/t6.webp", 
    title: "Fórmulas Matemáticas",
    description: "Compendio de fórmulas algebraicas importantes",
    loaded: false,
    loading: false,
    visible: false
  }
};

// ===== CONFIGURACIONES DINÁMICAS POR TIPO =====

// Configuración para múltiples iframes
const IFRAME_CONTAINERS = {
  youtube: {
    containerId: 'youtube-container',
    iframeId: 'youtube-iframe',
    closeButtonId: 'youtube-close-btn'
  },
  geogebra: {
    containerId: 'geogebra-container',
    iframeId: 'geogebra-iframe',
    closeButtonId: 'geogebra-close-btn'
  },
  webpage: {
    containerId: 'webpage-container',
    alertId: 'webpage-alert',
    closeButtonId: 'webpage-close-btn'
  }
};

// Configuración para múltiples elementos de audio
const AUDIO_CONTAINERS = {
  podcast: {
    containerId: 'podcast-container',
    closeButtonId: 'podcast-close-btn',
    progressId: 'podcast-progress',
    currentTimeId: 'podcast-current-time',
    durationId: 'podcast-duration',
    playButtonId: 'podcast-play-btn',
    pauseButtonId: 'podcast-pause-btn',
    stopButtonId: 'podcast-stop-btn'
  }
};

// Configuración para múltiples imágenes
const IMAGE_CONTAINERS = {
  imagen: {
    containerId: 'imagen-container',
    closeButtonId: 'imagen-close-btn',
    imageId: 'imagen-view'
  }
};

// ===== VARIABLES GLOBALES ESCALABLES =====

// Variables de audio por target
let audioElements = {};

// Target actualmente activo (para manejo dinámico)
let currentActiveTarget = null;

// URL activa para páginas web (dinámica)
let currentWebpageUrl = null;

// Elementos de audio activos por target
let activeAudioElements = {};

// Modelos 3D activos
let active3DModels = {};

// ===== FUNCIONES AUXILIARES PARA ESCALABILIDAD =====

// Obtener configuración por target
function getTargetConfig(targetIndex) {
  return CONTENT_CONFIG[targetIndex] || null;
}

// Obtener todos los targets de un tipo específico
function getTargetsByType(type) {
  return Object.keys(CONTENT_CONFIG)
    .filter(key => CONTENT_CONFIG[key].type === type)
    .map(key => ({ targetIndex: parseInt(key), config: CONTENT_CONFIG[key] }));
}

// Verificar si un target existe
function targetExists(targetIndex) {
  return CONTENT_CONFIG.hasOwnProperty(targetIndex);
}

// Obtener el siguiente target disponible de un tipo
function getNextTargetOfType(type, currentIndex = -1) {
  const targets = getTargetsByType(type);
  const filtered = targets.filter(t => t.targetIndex > currentIndex);
  return filtered.length > 0 ? filtered[0] : targets[0];
}

// ===== FUNCIONES DE UTILIDAD PARA DEPURACIÓN =====

function logTargetInfo() {
  console.log('📊 CONFIGURACIÓN DE TARGETS:');
  console.log('============================');
  
  const types = {};
  Object.keys(CONTENT_CONFIG).forEach(key => {
    const config = CONTENT_CONFIG[key];
    if (!types[config.type]) {
      types[config.type] = [];
    }
    types[config.type].push({
      target: key,
      title: config.title || 'Sin título',
      loaded: config.loaded
    });
  });
  
  Object.keys(types).forEach(type => {
    console.log(`\n${type.toUpperCase()}:`);
    types[type].forEach(item => {
      console.log(`  Target ${item.target}: ${item.title} ${item.loaded ? '✅' : '⏳'}`);
    });
  });
  
  console.log('\n============================');
}

// Función para validar configuración
function validateConfiguration() {
  const errors = [];
  const warnings = [];
  
  Object.keys(CONTENT_CONFIG).forEach(key => {
    const config = CONTENT_CONFIG[key];
    
    // Validar campos requeridos
    if (!config.type) {
      errors.push(`Target ${key}: Falta campo 'type'`);
    }
    
    // Validar según tipo
    switch(config.type) {
      case 'video':
        if (!config.youtubeId) warnings.push(`Target ${key}: Falta youtubeId`);
        break;
      case 'geogebra':
        if (!config.appletId) warnings.push(`Target ${key}: Falta appletId`);
        break;
      case 'webpage':
        if (!config.url) errors.push(`Target ${key}: Falta URL`);
        break;
      case '3d':
        if (!config.modelPath) warnings.push(`Target ${key}: Falta modelPath`);
        break;
      case 'podcast':
        if (!config.audioPath) errors.push(`Target ${key}: Falta audioPath`);
        break;
      case 'imagen':
        if (!config.imagePath) errors.push(`Target ${key}: Falta imagePath`);
        break;
    }
  });
  
  if (errors.length > 0) {
    console.error('❌ ERRORES DE CONFIGURACIÓN:', errors);
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ ADVERTENCIAS DE CONFIGURACIÓN:', warnings);
  }
  
  return { errors, warnings };
}

// Ejecutar validación al cargar
document.addEventListener('DOMContentLoaded', () => {
  logTargetInfo();
  validateConfiguration();
});