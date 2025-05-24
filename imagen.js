// ===== IMAGEN.JS OPTIMIZADO =====

function loadImageResource(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  
  // Evitar múltiples cargas
  if (config.loading) {
    console.log('🖼️ Imagen ya está cargando...');
    return;
  }
  
  // Marcar como cargando
  config.loading = true;
  showResourceLoader(targetIndex);
  
  console.log('🖼️ Iniciando carga de imagen:', config.imagePath);
  
  // Actualizar progreso inicial
  updateResourceLoaderProgress(targetIndex, 20);
  
  const img = new Image();
  
  // Simular progreso mientras carga
  let progress = 20;
  const progressInterval = setInterval(() => {
    if (progress < 90) {
      progress += 15;
      updateResourceLoaderProgress(targetIndex, progress);
    }
  }, 300);
  
  img.onload = () => {
    clearInterval(progressInterval);
    updateResourceLoaderProgress(targetIndex, 100);
    
    console.log('✅ Imagen cargada exitosamente');
    config.loaded = true;
    config.loading = false;
    
    // Mostrar la imagen en el visor
    const imgView = document.getElementById('imagen-view');
    if (imgView) {
      imgView.src = config.imagePath;
      imgView.style.display = 'block';
    }
    
    // Agregar al assets si no está
    const assets = document.querySelector('a-assets');
    if (!document.getElementById(`target-${targetIndex}-image`) && assets) {
      const imgElement = document.createElement('img');
      imgElement.setAttribute('id', `target-${targetIndex}-image`);
      imgElement.setAttribute('src', config.imagePath);
      assets.appendChild(imgElement);
    }
    
    setTimeout(() => {
      hideResourceLoader();
      
      if (config.visible) {
        showImage(targetIndex);
        showImageContainer();
      }
    }, 300);
  };
  
  img.onerror = () => {
    clearInterval(progressInterval);
    console.error('❌ Error cargando imagen:', config.imagePath);
    config.loading = false;
    hideResourceLoader();
    showImageError(targetIndex);
    alert('Error al cargar la imagen. Verifica que el archivo existe en: ' + config.imagePath);
  };
  
  // Asignar src después de configurar los eventos
  img.src = config.imagePath;
}

function showImage(targetIndex) {
  const targetEntity = document.querySelector(`a-entity[mindar-image-target="targetIndex: ${targetIndex}"]`);
  
  if (!targetEntity) {
    console.warn('Target entity no encontrada para imagen');
    return;
  }
  
  // Limpiar contenido previo
  while (targetEntity.firstChild) {
    targetEntity.removeChild(targetEntity.firstChild);
  }
  
  // Crear plano con imagen
  const plane = document.createElement('a-plane');
  plane.setAttribute('src', `#target-${targetIndex}-image`);
  plane.setAttribute('position', '0 0 0');
  plane.setAttribute('height', '0.552');
  plane.setAttribute('width', '1');
  plane.setAttribute('rotation', '0 0 0');
  
  // Añadir elemento a la entidad
  targetEntity.appendChild(plane);
}

function showImageContainer() {
  const container = document.getElementById('imagen-container');
  if (container) {
    container.style.display = 'block';
    container.style.pointerEvents = 'auto';
    
    // Asegurarse de que la imagen sea visible
    const imgView = document.getElementById('imagen-view');
    if (imgView) {
      imgView.style.display = 'block';
      imgView.style.maxWidth = '100%';
      imgView.style.maxHeight = '100%';
      imgView.style.objectFit = 'contain';
    }
  }
}

function showImageError(targetIndex) {
  const targetEntity = document.querySelector(`a-entity[mindar-image-target="targetIndex: ${targetIndex}"]`);
  
  if (targetEntity) {
    // Limpiar contenido previo
    while (targetEntity.firstChild) {
      targetEntity.removeChild(targetEntity.firstChild);
    }
    
    // Crear mensaje de error
    const errorText = document.createElement('a-text');
    errorText.setAttribute('value', 'Error cargando imagen');
    errorText.setAttribute('position', '0 0 0');
    errorText.setAttribute('align', 'center');
    errorText.setAttribute('color', 'red');
    errorText.setAttribute('scale', '0.3 0.3 0.3');
    
    targetEntity.appendChild(errorText);
  }
  
  // También mostrar error en el contenedor
  const container = document.getElementById('imagen-container');
  if (container) {
    container.style.display = 'block';
    container.style.pointerEvents = 'auto';
    
    const imgView = document.getElementById('imagen-view');
    if (imgView) {
      imgView.style.display = 'none';
    }
    
    // Agregar mensaje de error si no existe
    if (!container.querySelector('.image-error-message')) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'image-error-message';
      errorDiv.style.cssText = 'color: white; text-align: center; padding: 20px;';
      errorDiv.textContent = 'Error al cargar la imagen';
      container.querySelector('.image-viewer').appendChild(errorDiv);
    }
  }
}