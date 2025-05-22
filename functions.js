// Funciones principales
function onSceneLoaded() {
  const loader = document.getElementById('ar-loader');
  loader.style.opacity = '0';
  setTimeout(() => {
    loader.style.display = 'none';
  }, 500);
  
  const scene = document.querySelector('a-scene');
  scene.addEventListener('targetFound', onTargetFound);
  scene.addEventListener('targetLost', onTargetLost);
}

function onTargetFound(event) {
  const targetIndex = event.target.getAttribute('mindar-image-target').targetIndex;
  const contentConfig = CONTENT_CONFIG[targetIndex];
  
  if (!contentConfig) return;
  
  contentConfig.visible = true;
  
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
      if (!contentConfig.loaded && !contentConfig.loading) {
        load3DResource(targetIndex);
      } else if (contentConfig.loaded) {
        show3DModel(targetIndex);
      }
      break;
    case "podcast":
      if (!contentConfig.loaded && !contentConfig.loading) {
        loadAudioResource(targetIndex);
      } else if (contentConfig.loaded) {
        showPodcastPlayer();
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

// Funciones de carga de recursos
function loadAudioResource(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  config.loading = true;
  showResourceLoader(targetIndex);
  
  const audio = new Audio();
  audio.src = config.audioPath;
  audio.preload = "auto";
  
  audio.addEventListener('progress', () => {
    if (audio.buffered.length > 0 && audio.duration > 0) {
      const percent = (audio.buffered.end(0) / audio.duration) * 100;
      updateResourceLoaderProgress(targetIndex, percent);
    }
  });
  
  audio.addEventListener('canplaythrough', () => {
    console.log('Audio completamente cargado');
    config.loaded = true;
    config.loading = false;
    
    const assets = document.querySelector('a-assets');
    const audioElement = document.createElement('audio');
    audioElement.setAttribute('id', 'podcast-audio');
    audioElement.setAttribute('src', config.audioPath);
    assets.appendChild(audioElement);
    
    hideResourceLoader();
    if (config.visible) showPodcastPlayer();
  });
  
  audio.addEventListener('error', () => {
    console.error('Error cargando audio');
    config.loading = false;
    hideResourceLoader();
  });
}

//********************************1 INICIO******************************//
function load3DResource(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  config.loading = true;
  showResourceLoader(targetIndex);
  
  const img = new Image();
  img.src = config.imagePath;
  
  img.onload = () => {
    console.log('Imagen cargada');
    config.imageLoaded = true;
    
    const assets = document.querySelector('a-assets');
    const imgElement = document.createElement('img');
    imgElement.setAttribute('id', `target-${targetIndex}-image`);
    imgElement.setAttribute('src', config.imagePath);
    assets.appendChild(imgElement);
    
    check3DLoadComplete(targetIndex);
  };
  
  img.onerror = () => {
    console.error('Error cargando imagen');
    config.loading = false;
    hideResourceLoader();
  };
  
  const loader = new THREE.GLTFLoader();
  loader.load(
    config.modelPath,
    (gltf) => {
      console.log('Modelo 3D cargado');
      config.modelLoaded = true;
      
      const assets = document.querySelector('a-assets');
      const modelElement = document.createElement('a-asset-item');
      modelElement.setAttribute('id', `target-${targetIndex}-model`);
      modelElement.setAttribute('src', config.modelPath);
      assets.appendChild(modelElement);
      
      check3DLoadComplete(targetIndex);
    },
    (xhr) => {
      const percent = (xhr.loaded / xhr.total) * 100;
      updateResourceLoaderProgress(targetIndex, percent);
    },
    (error) => {
      console.error('Error cargando modelo 3D', error);
      config.loading = false;
      hideResourceLoader();
    }
  );
}
//********************************1 FINAL******************************//

//********************************2 INICIO******************************//
function check3DLoadComplete(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  if (config.imageLoaded && config.modelLoaded) {
    config.loaded = true;
    config.loading = false;
    hideResourceLoader();
    
    if (config.visible) {
      requestAnimationFrame(() => {
        show3DModel(targetIndex);
      });
    }
  }
}
//********************************2 INICIO******************************//

// Funciones para mostrar contenido
function showYoutubePlayer() {
  const container = document.getElementById('youtube-container');
  container.style.display = 'block';
  container.style.pointerEvents = 'auto';
}

function showGeogebraApplet() {
  const container = document.getElementById('geogebra-container');
  container.style.display = 'block';
  container.style.pointerEvents = 'auto';
}

function showWebpageAlert() {
  const container = document.getElementById('webpage-container');
  container.style.display = 'block';
  container.style.pointerEvents = 'auto';
  document.getElementById('webpage-alert').style.display = 'block';
}

function showPodcastPlayer() {
  const container = document.getElementById('podcast-container');
  container.style.display = 'block';
  container.style.pointerEvents = 'auto';
  
  if (!podcastSetup) {
    setupPodcastPlayer();
    podcastSetup = true;
  }
  
  const audio = document.getElementById('podcast-audio');
  const playPromise = audio.play();
  
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.log('Reproducción automática fallida, mostrando controles manuales');
    });
  }
}

//********************************3 INICIO******************************//
function show3DModel(targetIndex) {
  const targetEntity = document.querySelector(`a-entity[mindar-image-target="targetIndex: ${targetIndex}"]`);
  
  while (targetEntity.firstChild) {
    targetEntity.removeChild(targetEntity.firstChild);
  }
  
  const plane = document.createElement('a-plane');
  plane.setAttribute('src', `#target-${targetIndex}-image`);
  plane.setAttribute('position', '0 0 0');
  plane.setAttribute('height', '0.552');
  plane.setAttribute('width', '1');
  plane.setAttribute('rotation', '0 0 0');
  
  const model = document.createElement('a-gltf-model');
  model.setAttribute('src', `#target-${targetIndex}-model`);
  model.setAttribute('position', '0 0.1 0');
  model.setAttribute('scale', '0.5 0.5 0.5');
  model.setAttribute('animation', 'property: position; to: 0 0.2 0; dur: 1000; easing: easeInOutQuad; loop: true; dir: alternate');
  
  targetEntity.appendChild(plane);
  targetEntity.appendChild(model);
}
//********************************3 FINAL******************************//

// Funciones para el loader de recursos
function showResourceLoader(targetIndex) {
  const loader = document.getElementById('ar-resource-loader');
  const bar = document.getElementById('resource-loader-bar');
  loader.style.display = 'block';
  bar.style.width = '0%';
}

function hideResourceLoader() {
  const loader = document.getElementById('ar-resource-loader');
  loader.style.display = 'none';
}

function updateResourceLoaderProgress(targetIndex, percent) {
  const bar = document.getElementById('resource-loader-bar');
  if (bar) {
    bar.style.width = `${Math.min(percent, 100)}%`;
  }
}

// Funciones del reproductor de podcast
function setupPodcastPlayer() {
  const audio = document.getElementById('podcast-audio');
  const progress = document.getElementById('podcast-progress');
  const currentTime = document.getElementById('podcast-current-time');
  const duration = document.getElementById('podcast-duration');

  audio.addEventListener('loadedmetadata', () => {
    duration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    progress.value = (audio.currentTime / audio.duration) * 100;
    currentTime.textContent = formatTime(audio.currentTime);
  });

  progress.addEventListener('input', () => {
    const seekTime = (progress.value / 100) * audio.duration;
    audio.currentTime = seekTime;
  });
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function playPodcast() {
  const audio = document.getElementById('podcast-audio');
  audio.play().catch(e => console.log('Error al reproducir:', e));
}

function pausePodcast() {
  const audio = document.getElementById('podcast-audio');
  audio.pause();
}

function stopPodcast() {
  const audio = document.getElementById('podcast-audio');
  audio.pause();
  audio.currentTime = 0;
}

// Funciones de control
function closeContent(type) {
  const container = document.getElementById(`${type}-container`);
  if (container) {
    container.style.display = 'none';

    if (type === 'youtube') {
      const iframe = document.getElementById('youtube-iframe');
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'pauseVideo',
          args: []
        }), '*');
      }
    } else if (type === 'podcast') {
      stopPodcast();
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