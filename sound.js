// ===== SOUND.JS DINÁMICO OPTIMIZADO =====

function loadAudioResource(targetIndex) {
  const config = getTargetConfig(targetIndex);
  
  if (!config || config.type !== 'podcast') {
    console.error(`❌ Configuración de audio no válida para target ${targetIndex}`);
    return;
  }
  
  // Evitar múltiples cargas
  if (config.loading) {
    console.log(`🎵 Audio target ${targetIndex} ya está cargando...`);
    return;
  }
  
  // Pausar audio anterior si existe
  if (activeAudioElements[targetIndex]) {
    activeAudioElements[targetIndex].pause();
    delete activeAudioElements[targetIndex];
  }
  
  // Marcar como cargando
  config.loading = true;
  showResourceLoader(targetIndex);
  
  // Crear nuevo elemento de audio
  const podcastAudio = new Audio();
  podcastAudio.src = config.audioPath;
  podcastAudio.preload = "auto";
  
  console.log(`🎵 Iniciando carga de audio target ${targetIndex}:`, config.audioPath);
  
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
    console.log(`📊 Metadatos del audio target ${targetIndex} cargados`);
    updateResourceLoaderProgress(targetIndex, 50);
  });
  
  // Manejar cuando puede empezar a reproducirse
  podcastAudio.addEventListener('canplay', () => {
    console.log(`▶️ Audio target ${targetIndex} puede reproducirse`);
    updateResourceLoaderProgress(targetIndex, 80);
  });
  
  // Manejar cuando está completamente cargado
  podcastAudio.addEventListener('canplaythrough', () => {
    if (audioLoaded) return; // Evitar múltiples llamadas
    audioLoaded = true;
    
    clearInterval(progressInterval);
    updateResourceLoaderProgress(targetIndex, 100);
    
    console.log(`✅ Audio target ${targetIndex} cargado completamente`);
    config.loaded = true;
    config.loading = false;
    config.audioElement = podcastAudio;
    
    // Registrar en sistema dinámico
    setActiveAudio(targetIndex, podcastAudio);
    
    setupDynamicPodcastPlayer(targetIndex, podcastAudio);
    
    setTimeout(() => {
      hideResourceLoader();
      if (config.visible) {
        showDynamicPodcastPlayer(targetIndex, config);
      }
    }, 300);
  });
  
  // Manejar errores
  podcastAudio.addEventListener('error', (e) => {
    clearInterval(progressInterval);
    audioLoaded = true;
    
    console.error(`❌ Error cargando audio target ${targetIndex}:`, e);
    config.loading = false;
    hideResourceLoader();
    
    // Mostrar mensaje de error específico
    let errorMsg = `Error al cargar el podcast "${config.title || 'Target ' + targetIndex}".`;
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

function showDynamicPodcastPlayer(targetIndex, config) {
  const container = document.getElementById('podcast-container');
  if (!container) return;
  
  container.style.display = 'block';
  container.style.pointerEvents = 'auto';
  
  // Actualizar título dinámicamente
  const titleElement = document.getElementById('audio-title');
  if (titleElement && config.title) {
    titleElement.textContent = config.title;
  }
  
  // Actualizar duración si está disponible
  const audioElement = activeAudioElements[targetIndex];
  if (audioElement && audioElement.duration && !isNaN(audioElement.duration)) {
    const duration = document.getElementById('podcast-duration');
    if (duration) {
      duration.textContent = formatTime(audioElement.duration);
    }
  }
  
  console.log(`🎵 Reproductor de podcast mostrado para target ${targetIndex}`);
}

function setupDynamicPodcastPlayer(targetIndex, podcastAudio) {
  const progress = document.getElementById('podcast-progress');
  const currentTime = document.getElementById('podcast-current-time');
  const duration = document.getElementById('podcast-duration');

  if (!progress || !currentTime || !duration || !podcastAudio) return;

  // Limpiar eventos previos
  removePreviousAudioListeners(podcastAudio);
  
  // Configurar nuevos eventos
  const updateDuration = () => {
    if (!isNaN(podcastAudio.duration) && podcastAudio.duration > 0) {
      duration.textContent = formatTime(podcastAudio.duration);
    }
  };

  const updateProgress = () => {
    if (podcastAudio.duration > 0 && !isNaN(podcastAudio.duration)) {
      const progressPercent = (podcastAudio.currentTime / podcastAudio.duration) * 100;
      progress.value = progressPercent;
      currentTime.textContent = formatTime(podcastAudio.currentTime);
    }
  };

  const onPlayStart = () => {
    console.log(`▶️ Reproduciendo podcast target ${targetIndex}`);
    const playBtn = document.getElementById('podcast-play-btn');
    const pauseBtn = document.getElementById('podcast-pause-btn');
    if (playBtn) playBtn.style.opacity = '0.5';
    if (pauseBtn) pauseBtn.style.opacity = '1';
  };

  const onPlayPause = () => {
    console.log(`⏸️ Podcast target ${targetIndex} pausado`);
    const playBtn = document.getElementById('podcast-play-btn');
    const pauseBtn = document.getElementById('podcast-pause-btn');
    if (playBtn) playBtn.style.opacity = '1';
    if (pauseBtn) pauseBtn.style.opacity = '0.5';
  };

  const onPlayEnded = () => {
    console.log(`⏹️ Podcast target ${targetIndex} finalizado`);
    podcastAudio.currentTime = 0;
    progress.value = 0;
    currentTime.textContent = '00:00';
    onPlayPause();
  };

  // Agregar eventos
  podcastAudio.addEventListener('loadedmetadata', updateDuration);
  podcastAudio.addEventListener('timeupdate', updateProgress);
  podcastAudio.addEventListener('play', onPlayStart);
  podcastAudio.addEventListener('pause', onPlayPause);
  podcastAudio.addEventListener('ended', onPlayEnded);

  // Configurar control de progreso
  const seekAudio = () => {
    if (podcastAudio.duration > 0 && !isNaN(podcastAudio.duration)) {
      const seekTime = (progress.value / 100) * podcastAudio.duration;
      podcastAudio.currentTime = seekTime;
    }
  };
  
  progress.removeEventListener('input', seekAudio);
  progress.addEventListener('input', seekAudio);

  // Configurar botones dinámicos
  setupDynamicAudioButtons(targetIndex, podcastAudio);
  
  // Actualizar duración inicial
  updateDuration();
}

function setupDynamicAudioButtons(targetIndex, podcastAudio) {
  const playBtn = document.getElementById('podcast-play-btn');
  const pauseBtn = document.getElementById('podcast-pause-btn');
  const stopBtn = document.getElementById('podcast-stop-btn');

  // Crear funciones específicas para este target
  const playFunction = () => playDynamicPodcast(targetIndex, podcastAudio);
  const pauseFunction = () => pauseDynamicPodcast(targetIndex, podcastAudio);
  const stopFunction = () => stopDynamicPodcast(targetIndex, podcastAudio);

  // Limpiar listeners previos
  if (playBtn) {
    playBtn.removeEventListener('click', playFunction);
    playBtn.addEventListener('click', playFunction);
  }

  if (pauseBtn) {
    pauseBtn.removeEventListener('click', pauseFunction);
    pauseBtn.addEventListener('click', pauseFunction);
  }

  if (stopBtn) {
    stopBtn.removeEventListener('click', stopFunction);
    stopBtn.addEventListener('click', stopFunction);
  }
}

function playDynamicPodcast(targetIndex, podcastAudio) {
  if (podcastAudio) {
    console.log(`🎵 Intentando reproducir podcast target ${targetIndex}...`);
    
    // Pausar otros audios activos
    Object.keys(activeAudioElements).forEach(key => {
      if (key !== targetIndex.toString()) {
        const otherAudio = activeAudioElements[key];
        if (otherAudio && !otherAudio.paused) {
          otherAudio.pause();
          console.log(`⏸️ Pausando audio de target ${key}`);
        }
      }
    });
    
    // Verificar si el audio está listo
    if (podcastAudio.readyState >= 3) { // HAVE_FUTURE_DATA
      podcastAudio.play()
        .then(() => {
          console.log(`✅ Reproducción iniciada para target ${targetIndex}`);
        })
        .catch(e => {
          console.error(`❌ Error al reproducir target ${targetIndex}:`, e);
          // Si falla por políticas de autoplay, mostrar mensaje
          if (e.name === 'NotAllowedError') {
            alert('Por favor, haz clic nuevamente para reproducir el audio.');
          }
        });
    } else {
      console.log(`⏳ Audio target ${targetIndex} aún cargando, esperando...`);
      // Intentar cargar y reproducir
      podcastAudio.load();
      podcastAudio.addEventListener('canplay', () => {
        podcastAudio.play().catch(e => console.error('Error:', e));
      }, { once: true });
    }
  } else {
    console.error(`❌ No hay audio cargado para target ${targetIndex}`);
  }
}

function pauseDynamicPodcast(targetIndex, podcastAudio) {
  if (podcastAudio) {
    podcastAudio.pause();
    console.log(`⏸️ Podcast target ${targetIndex} pausado`);
  }
}

function stopDynamicPodcast(targetIndex, podcastAudio) {
  if (podcastAudio) {
    podcastAudio.pause();
    podcastAudio.currentTime = 0;
    
    const progress = document.getElementById('podcast-progress');
    const currentTime = document.getElementById('podcast-current-time');
    if (progress) progress.value = 0;
    if (currentTime) currentTime.textContent = '00:00';
    
    console.log(`⏹️ Podcast target ${targetIndex} detenido`);
  }
}

function removePreviousAudioListeners(audio) {
  // Crear nuevos listeners para evitar acumulación
  const newAudio = audio.cloneNode();
  if (audio.parentNode) {
    audio.parentNode.replaceChild(newAudio, audio);
  }
  return newAudio;
}

// ===== FUNCIONES DE UTILIDAD PARA AUDIO DINÁMICO =====

function pauseAllActiveAudios() {
  Object.keys(activeAudioElements).forEach(targetIndex => {
    const audio = activeAudioElements[targetIndex];
    if (audio && !audio.paused) {
      audio.pause();
      console.log(`⏸️ Audio target ${targetIndex} pausado automáticamente`);
    }
  });
}

function stopAllActiveAudios() {
  Object.keys(activeAudioElements).forEach(targetIndex => {
    const audio = activeAudioElements[targetIndex];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      console.log(`⏹️ Audio target ${targetIndex} detenido automáticamente`);
    }
  });
  
  // Resetear interfaz
  const progress = document.getElementById('podcast-progress');
  const currentTime = document.getElementById('podcast-current-time');
  if (progress) progress.value = 0;
  if (currentTime) currentTime.textContent = '00:00';
}

function getActiveAudioTarget() {
  return Object.keys(activeAudioElements).find(targetIndex => {
    const audio = activeAudioElements[targetIndex];
    return audio && !audio.paused;
  });
}

function isAudioPlaying(targetIndex) {
  const audio = activeAudioElements[targetIndex];
  return audio && !audio.paused;
}

// ===== FUNCIONES LEGACY PARA COMPATIBILIDAD =====

// Mantener funciones originales para compatibilidad con otros archivos
function showPodcastPlayer() {
  const currentTarget = getCurrentActiveTarget();
  const config = getTargetConfig(currentTarget);
  
  if (config && config.type === 'podcast') {
    showDynamicPodcastPlayer(currentTarget, config);
  } else {
    // Fallback al comportamiento original
    const container = document.getElementById('podcast-container');
    if (container) {
      container.style.display = 'block';
      container.style.pointerEvents = 'auto';
    }
  }
}

function setupPodcastPlayer() {
  const currentTarget = getCurrentActiveTarget();
  const audio = activeAudioElements[currentTarget];
  
  if (audio) {
    setupDynamicPodcastPlayer(currentTarget, audio);
  }
}

function playPodcast() {
  const currentTarget = getCurrentActiveTarget();
  const audio = activeAudioElements[currentTarget];
  
  if (audio) {
    playDynamicPodcast(currentTarget, audio);
  }
}

function pausePodcast() {
  const currentTarget = getCurrentActiveTarget();
  const audio = activeAudioElements[currentTarget];
  
  if (audio) {
    pauseDynamicPodcast(currentTarget, audio);
  }
}

function stopPodcast() {
  const currentTarget = getCurrentActiveTarget();
  const audio = activeAudioElements[currentTarget];
  
  if (audio) {
    stopDynamicPodcast(currentTarget, audio);
  }
}