// ===== IMAGEN.JS DINÁMICO OPTIMIZADO =====

function loadImageResource(targetIndex) {
  const config = getTargetConfig(targetIndex);
  
  if (!config || config.type !== 'imagen') {
    console.error(`❌ Configuración de imagen no válida para target ${targetIndex}`);
    return;
  }
  
  // Evitar múltiples cargas
  if (config.loading) {
    console.log(`🖼️ Imagen target ${targetIndex} ya está cargando...`);
    return;
  }
  
  // Marcar como cargando
  config.loading = true;
  showResourceLoader(targetIndex);
  
  console.log(`🖼️ Iniciando carga de imagen target ${targetIndex}:`, config.imagePath);
  
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
    
    console.log(`✅ Imagen target ${targetIndex} cargada exitosamente`);
    config.loaded = true;
    config.loading = false;
    
    // Mostrar la imagen en el visor
    const imgView = document.getElementById('imagen-view');
    if (imgView) {
      imgView.src = config.imagePath;
      imgView.style.display = 'block';
      imgView.alt = config.title || `Imagen Target ${targetIndex}`;
    }
    
    // Agregar al assets si no está
    const assets = document.querySelector('a-assets');
    const assetId = `target-${targetIndex}-image`;
    if (!document.getElementById(assetId) && assets) {
      const imgElement = document.createElement('img');
      imgElement.setAttribute('id', assetId);
      imgElement.setAttribute('src', config.imagePath);
      assets.appendChild(imgElement);
    }
    
    setTimeout(() => {
      hideResourceLoader();
      
      if (config.visible) {
        showDynamicImage(targetIndex);
        showDynamicImageContainer(targetIndex, config);
      }
    }, 300);
  };
  
  img.onerror = () => {
    clearInterval(progressInterval);
    console.error(`❌ Error cargando imagen target ${targetIndex}:`, config.imagePath);
    config.loading = false;
    hideResourceLoader();
    showDynamicImageError(targetIndex, config);
    
    const errorMessage = `Error al cargar "${config.title || 'imagen'}". Verifica que el archivo existe en: ${config.imagePath}`;
    alert(errorMessage);
  };
  
  // Asignar src después de configurar los eventos
  img.src = config.imagePath;
}

function showDynamicImage(targetIndex) {
  const targetEntity = document.querySelector(`a-entity[mindar-image-target="targetIndex: ${targetIndex}"]`);
  
  if (!targetEntity) {
    console.warn(`⚠️ Target entity ${targetIndex} no encontrada para imagen`);
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
  
  console.log(`🖼️ Imagen target ${targetIndex} mostrada en AR`);
}

function showDynamicImageContainer(targetIndex, config) {
  const container = document.getElementById('imagen-container');
  if (!container) return;
  
  container.style.display = 'block';
  container.style.pointerEvents = 'auto';
  
  // Asegurarse de que la imagen sea visible
  const imgView = document.getElementById('imagen-view');
  if (imgView) {
    imgView.style.display = 'block';
    imgView.style.maxWidth = '100%';
    imgView.style.maxHeight = '100%';
    imgView.style.objectFit = 'contain';
    
    // Actualizar título si existe
    if (config.title) {
      imgView.title = config.title;
    }
  }
  
  // Limpiar mensajes de error previos
  const errorMessage = container.querySelector('.image-error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
  
  console.log(`🖼️ Contenedor de imagen mostrado para target ${targetIndex}: "${config.title || 'Sin título'}"`);
}

function showDynamicImageError(targetIndex, config) {
  const targetEntity = document.querySelector(`a-entity[mindar-image-target="targetIndex: ${targetIndex}"]`);
  
  if (targetEntity) {
    // Limpiar contenido previo
    while (targetEntity.firstChild) {
      targetEntity.removeChild(targetEntity.firstChild);
    }
    
    // Crear mensaje de error
    const errorText = document.createElement('a-text');
    errorText.setAttribute('value', `Error: ${config.title || 'Imagen'}`);
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
      errorDiv.style.cssText = 'color: white; text-align: center; padding: 20px; background: rgba(244, 67, 54, 0.8); border-radius: 8px; margin: 10px;';
      errorDiv.innerHTML = `
        <h3>Error al cargar imagen</h3>
        <p><strong>${config.title || `Target ${targetIndex}`}</strong></p>
        <p>Archivo: ${config.imagePath}</p>
        <p style="font-size: 12px; opacity: 0.8;">Verifica que el archivo existe y es accesible</p>
      `;
      container.querySelector('.image-viewer').appendChild(errorDiv);
    }
  }
  
  console.error(`❌ Error mostrado para imagen target ${targetIndex}`);
}

// ===== FUNCIONES DE UTILIDAD PARA IMÁGENES DINÁMICAS =====

function preloadAllImages() {
  const imageTargets = getTargetsByType('imagen');
  
  console.log(`📦 Precargando ${imageTargets.length} imágenes...`);
  
  imageTargets.forEach(({ targetIndex, config }) => {
    if (!config.loaded && !config.loading) {
      console.log(`🖼️ Precargando imagen target ${targetIndex}...`);
      
      const img = new Image();
      config.loading = true;
      
      img.onload = () => {
        console.log(`✅ Imagen target ${targetIndex} precargada`);
        config.loaded = true;
        config.loading = false;
        
        // Agregar a assets
        const assets = document.querySelector('a-assets');
        const assetId = `target-${targetIndex}-image`;
        if (!document.getElementById(assetId) && assets) {
          const imgElement = document.createElement('img');
          imgElement.setAttribute('id', assetId);
          imgElement.setAttribute('src', config.imagePath);
          assets.appendChild(imgElement);
        }
      };
      
      img.onerror = () => {
        console.warn(`⚠️ Error precargando imagen target ${targetIndex}`);
        config.loading = false;
      };
      
      img.src = config.imagePath;
    }
  });
}

function getLoadedImagesCount() {
  const imageTargets = getTargetsByType('imagen');
  return imageTargets.filter(({ config }) => config.loaded).length;
}

function getImageLoadingStatus() {
  const imageTargets = getTargetsByType('imagen');
  const status = {
    total: imageTargets.length,
    loaded: 0,
    loading: 0,
    pending: 0,
    details: []
  };
  
  imageTargets.forEach(({ targetIndex, config }) => {
    const itemStatus = {
      targetIndex,
      title: config.title || `Target ${targetIndex}`,
      path: config.imagePath,
      loaded: config.loaded,
      loading: config.loading
    };
    
    if (config.loaded) {
      status.loaded++;
    } else if (config.loading) {
      status.loading++;
    } else {
      status.pending++;
    }
    
    status.details.push(itemStatus);
  });
  
  return status;
}

// ===== FUNCIONES LEGACY PARA COMPATIBILIDAD =====

// Mantener funciones originales para compatibilidad
function showImage(targetIndex) {
  showDynamicImage(targetIndex);
}

function showImageContainer() {
  const currentTarget = getCurrentActiveTarget();
  const config = getTargetConfig(currentTarget);
  
  if (config && config.type === 'imagen') {
    showDynamicImageContainer(currentTarget, config);
  } else {
    // Fallback al comportamiento original
    const container = document.getElementById('imagen-container');
    if (container) {
      container.style.display = 'block';
      container.style.pointerEvents = 'auto';
    }
  }
}

function showImageError(targetIndex) {
  const config = getTargetConfig(targetIndex);
  showDynamicImageError(targetIndex, config);
}

// ===== INICIALIZACIÓN Y UTILIDADES =====

// Función para validar todas las rutas de imágenes
function validateImagePaths() {
  const imageTargets = getTargetsByType('imagen');
  const validation = {
    valid: [],
    invalid: [],
    warnings: []
  };
  
  imageTargets.forEach(({ targetIndex, config }) => {
    if (!config.imagePath) {
      validation.invalid.push({
        targetIndex,
        error: 'Falta ruta de imagen'
      });
    } else if (!config.imagePath.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      validation.warnings.push({
        targetIndex,
        path: config.imagePath,
        warning: 'Extensión de archivo no estándar'
      });
    } else {
      validation.valid.push({
        targetIndex,
        path: config.imagePath
      });
    }
  });
  
  if (validation.invalid.length > 0) {
    console.error('❌ Imágenes con configuración inválida:', validation.invalid);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Advertencias de imágenes:', validation.warnings);
  }
  
  console.log(`✅ Imágenes válidas: ${validation.valid.length}/${imageTargets.length}`);
  
  return validation;
}

// Auto-validar al cargar
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    validateImagePaths();
    
    const status = getImageLoadingStatus();
    console.log('📊 Estado inicial de imágenes:', status);
  }, 1500);
});