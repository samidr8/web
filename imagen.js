// ===== IMAGEN.JS OPTIMIZADO =====

function loadImageResource(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  
  // Si ya está precargada, mostrar inmediatamente
  if (config.loaded) {
    console.log('🖼️ Usando imagen precargada');
    document.getElementById('imagen-view').src = config.imagePath;
    hideResourceLoader();
    if (config.visible) {
      showImage(targetIndex);
    }
    return;
  }
  
  // Si no está precargada, cargar con indicador
  config.loading = true;
  showResourceLoader(targetIndex);
  
  const img = new Image();
  img.src = config.imagePath;
  
  img.onload = () => {
    console.log('🖼️ Imagen cargada exitosamente');
    config.loaded = true;
    config.loading = false;
    
    // Mostrar la imagen en el visor
    document.getElementById('imagen-view').src = config.imagePath;
    
    // Agregar al assets si no está
    const assets = document.querySelector('a-assets');
    if (!document.getElementById(`target-${targetIndex}-image`)) {
      const imgElement = document.createElement('img');
      imgElement.setAttribute('id', `target-${targetIndex}-image`);
      imgElement.setAttribute('src', config.imagePath);
      assets.appendChild(imgElement);
    }
    
    hideResourceLoader();
    
    if (config.visible) {
      showImage(targetIndex);
    }
  };
  
  img.onerror = () => {
    console.error('❌ Error cargando imagen');
    config.loading = false;
    hideResourceLoader();
    showImageError(targetIndex);
  };
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
  
  // Mostrar el contenedor de imagen
  const container = document.getElementById('imagen-container');
  if (container) {
    container.style.display = 'block';
    container.style.pointerEvents = 'auto';
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
}