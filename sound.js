// ===== SOUND.JS OPTIMIZADO =====

function loadAudioResource(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  
  // Si ya está precargado, usar el audio existente
  if (config.loaded && config.audioElement) {
    console.log('🎵 Usando audio precargado');
    podcastAudio = config.audioElement;
    setupPodcastPlayer();
    hideResourceLoader();
    if (config.visible) showPodcastPlayer();
    return;
  }
  
  // Si no está precargado, cargar normalmente con indicador
  config.loading = true;
  showResourceLoader(targetIndex);
  
  podcastAudio = new Audio();
  podcastAudio.src = config.audioPath;
  podcastAudio.preload = "auto";
  
  // Manejar progreso de carga
  podcastAudio.addEventListener('progress', () => {
    if (podcastAudio.buffered.length > 0 && podcastAudio.duration > 0) {
      const percent = (podcastAudio.buffered.end(0) / podcastAudio.duration) * 100;
      updateResourceLoaderProgress(targetIndex, percent);
    }
  });
  
  podcastAudio.addEventListener('canplaythrough', () => {
    console.log('🎵 Audio cargado completamente');
    config.loaded = true;
    config.loading = false;
    config.audioElement = podcastAudio; // Guardar referencia
    
    setupPodcastPlayer();
    hideResourceLoader();
    if (config.visible) showPodcastPlayer();
  });
  
  podcastAudio.addEventListener('error', () => {
    console.error('❌ Error cargando audio');
    config.loading = false;
    hideResourceLoader();
  });
}

function showPodcastPlayer(targetIndex) {
  const container = document.getElementById('podcast-container');
  if (!container) return;
  
  container.style.display = 'block';
  container.style.pointerEvents = 'auto';
  
  // Si el audio ya está precargado, intentar reproducir automáticamente
  if (podcastAudio && podcastAudio.readyState >= 3) { // HAVE_FUTURE_DATA
    const playPromise = podcastAudio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('⚠️ Reproducción automática fallida, mostrando controles manuales');
      });
    }
  }
}

function setupPodcastPlayer() {
  const progress = document.getElementById('podcast-progress');
  const currentTime = document.getElementById('podcast-current-time');
  const duration = document.getElementById('podcast-duration');

  if (!progress || !currentTime || !duration || !podcastAudio) return;

  // Configurar eventos solo una vez
  podcastAudio.removeEventListener('loadedmetadata', updateDuration);
  podcastAudio.removeEventListener('timeupdate', updateProgress);
  
  podcastAudio.addEventListener('loadedmetadata', updateDuration);
  podcastAudio.addEventListener('timeupdate', updateProgress);

  function updateDuration() {
    duration.textContent = formatTime(podcastAudio.duration);
  }

  function updateProgress() {
    if (podcastAudio.duration > 0) {
      progress.value = (podcastAudio.currentTime / podcastAudio.duration) * 100;
      currentTime.textContent = formatTime(podcastAudio.currentTime);
    }
  }

  // Configurar control de progreso
  progress.removeEventListener('input', seekAudio);
  progress.addEventListener('input', seekAudio);
  
  function seekAudio() {
    const seekTime = (progress.value / 100) * podcastAudio.duration;
    podcastAudio.currentTime = seekTime;
  }

  // Configurar botones
  const playBtn = document.getElementById('podcast-play-btn');
  const pauseBtn = document.getElementById('podcast-pause-btn');
  const stopBtn = document.getElementById('podcast-stop-btn');

  if (playBtn) {
    playBtn.removeEventListener('click', playPodcast);
    playBtn.addEventListener('click', playPodcast);
  }

  if (pauseBtn) {
    pauseBtn.removeEventListener('click', pausePodcast);
    pauseBtn.addEventListener('click', pausePodcast);
  }

  if (stopBtn) {
    stopBtn.removeEventListener('click', stopPodcast);
    stopBtn.addEventListener('click', stopPodcast);
  }
}

function playPodcast() {
  if (podcastAudio) {
    podcastAudio.play().catch(e => console.log('❌ Error al reproducir:', e));
  }
}

function pausePodcast() {
  if (podcastAudio) {
    podcastAudio.pause();
  }
}

function stopPodcast() {
  if (podcastAudio) {
    podcastAudio.pause();
    podcastAudio.currentTime = 0;
  }
}