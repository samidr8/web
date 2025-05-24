// ===== SOUND.JS OPTIMIZADO =====

function loadAudioResource(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  
  // Evitar múltiples cargas
  if (config.loading) {
    console.log('🎵 Audio ya está cargando...');
    return;
  }
  
  // Resetear estado si es necesario
  if (podcastAudio && !config.loaded) {
    podcastAudio.pause();
    podcastAudio = null;
  }
  
  // Marcar como cargando
  config.loading = true;
  showResourceLoader(targetIndex);
  
  // Crear nuevo elemento de audio
  podcastAudio = new Audio();
  podcastAudio.src = config.audioPath;
  podcastAudio.preload = "auto";
  
  console.log('🎵 Iniciando carga de audio:', config.audioPath);
  
  // Actualizar progreso inicial
  updateResourceLoaderProgress(targetIndex, 10);
  
  // Variable para rastrear si ya se cargó
  let audioLoaded = false;
  
  // Simular progreso mientras carga
  let simulatedProgress = 10;
  const progressInterval = setInterval(() => {
    if (simulatedProgress < 70 && !audioLoaded) {
      simulatedProgress += 15;
      updateResourceLoaderProgress(targetIndex, simulatedProgress);
    }
  }, 500);
  
  // Manejar cuando los metadatos se cargan
  podcastAudio.addEventListener('loadedmetadata', () => {
    console.log('📊 Metadatos del audio cargados');
    updateResourceLoaderProgress(targetIndex, 50);
  });
  
  // Manejar cuando puede empezar a reproducirse
  podcastAudio.addEventListener('canplay', () => {
    console.log('▶️ Audio puede reproducirse');
    updateResourceLoaderProgress(targetIndex, 80);
  });
  
  // Manejar cuando está completamente cargado
  podcastAudio.addEventListener('canplaythrough', () => {
    if (audioLoaded) return; // Evitar múltiples llamadas
    audioLoaded = true;
    
    clearInterval(progressInterval);
    updateResourceLoaderProgress(targetIndex, 100);
    
    console.log('✅ Audio cargado completamente');
    config.loaded = true;
    config.loading = false;
    config.audioElement = podcastAudio;
    
    setupPodcastPlayer();
    
    setTimeout(() => {
      hideResourceLoader();
      if (config.visible) {
        showPodcastPlayer();
      }
    }, 300);
  });
  
  // Manejar errores
  podcastAudio.addEventListener('error', (e) => {
    clearInterval(progressInterval);
    audioLoaded = true;
    
    console.error('❌ Error cargando audio:', e);
    config.loading = false;
    hideResourceLoader();
    
    // Mostrar mensaje de error específico
    let errorMsg = 'Error al cargar el podcast.';
    if (podcastAudio.error) {
      switch(podcastAudio.error.code) {
        case 1: errorMsg += ' Carga abortada.'; break;
        case 2: errorMsg += ' Error de red.'; break;
        case 3: errorMsg += ' Error de decodificación.'; break;
        case 4: errorMsg += ' Formato no soportado.'; break;
      }
    }
    alert(errorMsg);
  });
  
  // Forzar inicio de carga
  podcastAudio.load();
}

function showPodcastPlayer() {
  const container = document.getElementById('podcast-container');
  if (!container) return;
  
  container.style.display = 'block';
  container.style.pointerEvents = 'auto';
  
  // Actualizar duración si está disponible
  if (podcastAudio && podcastAudio.duration && !isNaN(podcastAudio.duration)) {
    const duration = document.getElementById('podcast-duration');
    if (duration) {
      duration.textContent = formatTime(podcastAudio.duration);
    }
  }
}

function setupPodcastPlayer() {
  const progress = document.getElementById('podcast-progress');
  const currentTime = document.getElementById('podcast-current-time');
  const duration = document.getElementById('podcast-duration');

  if (!progress || !currentTime || !duration || !podcastAudio) return;

  // Remover eventos previos para evitar duplicados
  podcastAudio.removeEventListener('loadedmetadata', updateDuration);
  podcastAudio.removeEventListener('timeupdate', updateProgress);
  podcastAudio.removeEventListener('play', onPlayStart);
  podcastAudio.removeEventListener('pause', onPlayPause);
  podcastAudio.removeEventListener('ended', onPlayEnded);
  
  // Configurar nuevos eventos
  podcastAudio.addEventListener('loadedmetadata', updateDuration);
  podcastAudio.addEventListener('timeupdate', updateProgress);
  podcastAudio.addEventListener('play', onPlayStart);
  podcastAudio.addEventListener('pause', onPlayPause);
  podcastAudio.addEventListener('ended', onPlayEnded);

  function updateDuration() {
    if (!isNaN(podcastAudio.duration) && podcastAudio.duration > 0) {
      duration.textContent = formatTime(podcastAudio.duration);
    }
  }

  function updateProgress() {
    if (podcastAudio.duration > 0 && !isNaN(podcastAudio.duration)) {
      const progressPercent = (podcastAudio.currentTime / podcastAudio.duration) * 100;
      progress.value = progressPercent;
      currentTime.textContent = formatTime(podcastAudio.currentTime);
    }
  }

  function onPlayStart() {
    console.log('▶️ Reproduciendo podcast');
    const playBtn = document.getElementById('podcast-play-btn');
    const pauseBtn = document.getElementById('podcast-pause-btn');
    if (playBtn) playBtn.style.opacity = '0.5';
    if (pauseBtn) pauseBtn.style.opacity = '1';
  }

  function onPlayPause() {
    console.log('⏸️ Podcast pausado');
    const playBtn = document.getElementById('podcast-play-btn');
    const pauseBtn = document.getElementById('podcast-pause-btn');
    if (playBtn) playBtn.style.opacity = '1';
    if (pauseBtn) pauseBtn.style.opacity = '0.5';
  }

  function onPlayEnded() {
    console.log('⏹️ Podcast finalizado');
    podcastAudio.currentTime = 0;
    progress.value = 0;
    currentTime.textContent = '00:00';
    onPlayPause();
  }

  // Configurar control de progreso
  progress.removeEventListener('input', seekAudio);
  progress.addEventListener('input', seekAudio);
  
  function seekAudio() {
    if (podcastAudio.duration > 0 && !isNaN(podcastAudio.duration)) {
      const seekTime = (progress.value / 100) * podcastAudio.duration;
      podcastAudio.currentTime = seekTime;
    }
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
  
  // Actualizar duración inicial si está disponible
  updateDuration();
}

function playPodcast() {
  if (podcastAudio) {
    console.log('🎵 Intentando reproducir podcast...');
    
    // Verificar si el audio está listo
    if (podcastAudio.readyState >= 3) { // HAVE_FUTURE_DATA
      podcastAudio.play()
        .then(() => {
          console.log('✅ Reproducción iniciada');
        })
        .catch(e => {
          console.error('❌ Error al reproducir:', e);
          // Si falla por políticas de autoplay, mostrar mensaje
          if (e.name === 'NotAllowedError') {
            alert('Por favor, haz clic nuevamente para reproducir el audio.');
          }
        });
    } else {
      console.log('⏳ Audio aún cargando, esperando...');
      // Intentar cargar y reproducir
      podcastAudio.load();
      podcastAudio.addEventListener('canplay', () => {
        podcastAudio.play().catch(e => console.error('Error:', e));
      }, { once: true });
    }
  } else {
    console.error('❌ No hay audio cargado');
  }
}

function pausePodcast() {
  if (podcastAudio) {
    podcastAudio.pause();
    console.log('⏸️ Podcast pausado');
  }
}

function stopPodcast() {
  if (podcastAudio) {
    podcastAudio.pause();
    podcastAudio.currentTime = 0;
    const progress = document.getElementById('podcast-progress');
    const currentTime = document.getElementById('podcast-current-time');
    if (progress) progress.value = 0;
    if (currentTime) currentTime.textContent = '00:00';
    console.log('⏹️ Podcast detenido');
  }
}