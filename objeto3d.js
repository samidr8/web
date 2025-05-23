// ===== OBJETO3D.JS OPTIMIZADO PARA CARGA RÁPIDA =====

function load3DResource(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  
  // Si ya está precargado, mostrar inmediatamente
  if (config.loaded && config.modelLoaded) {
    console.log('🎨 Usando modelo 3D precargado');
    hideResourceLoader();
    if (config.visible) {
      requestAnimationFrame(() => {
        show3DModel(targetIndex);
      });
    }
    return;
  }
  
  // Si no está precargado, cargar con indicador de progreso
  config.loading = true;
  showResourceLoader(targetIndex);
  
  // Verificar si THREE.GLTFLoader está disponible
  if (typeof THREE === 'undefined' || !THREE.GLTFLoader) {
    console.error('❌ THREE.GLTFLoader no está disponible');
    config.loading = false;
    hideResourceLoader();
    show3DError(targetIndex);
    return;
  }
  
  // Cargar modelo 3D usando THREE.GLTFLoader
  const loader = new THREE.GLTFLoader();
  loader.load(
    config.modelPath,
    (gltf) => {
      console.log('🎨 Modelo 3D cargado exitosamente');
      config.modelLoaded = true;
      config.loaded = true;
      config.loading = false;
      
      // Agregar modelo al DOM de A-Frame si no existe
      const assets = document.querySelector('a-assets');
      const existingModel = document.getElementById(`target-${targetIndex}-model`);
      
      if (!existingModel) {
        const modelElement = document.createElement('a-asset-item');
        modelElement.setAttribute('id', `target-${targetIndex}-model`);
        modelElement.setAttribute('src', config.modelPath);
        assets.appendChild(modelElement);
      }
      
      hideResourceLoader();
      
      if (config.visible) {
        requestAnimationFrame(() => {
          show3DModel(targetIndex);
        });
      }
    },
    (xhr) => {
      // Actualizar progreso de carga
      if (xhr.lengthComputable) {
        const percent = (xhr.loaded / xhr.total) * 100;
        updateResourceLoaderProgress(targetIndex, percent);
      }
    },
    (error) => {
      console.error('❌ Error cargando modelo 3D:', error);
      config.loading = false;
      hideResourceLoader();
      show3DError(targetIndex);
    }
  );
}

function show3DModel(targetIndex) {
  const targetEntity = document.querySelector(`a-entity[mindar-image-target="targetIndex: ${targetIndex}"]`);
  
  if (!targetEntity) {
    console.warn('Target entity no encontrada para modelo 3D');
    return;
  }
  
  // Limpiar contenido previo
  while (targetEntity.firstChild) {
    targetEntity.removeChild(targetEntity.firstChild);
  }
  
  // Verificar que el asset existe
  const assetExists = document.getElementById(`target-${targetIndex}-model`);
  if (!assetExists) {
    console.warn('Asset del modelo 3D no encontrado');
    show3DError(targetIndex);
    return;
  }
  
  // Crear modelo 3D
  const model = document.createElement('a-gltf-model');
  model.setAttribute('src', `#target-${targetIndex}-model`);
  model.setAttribute('position', '0 0.1 0');
  model.setAttribute('scale', '0.5 0.5 0.5');
  model.setAttribute('animation', 'property: position; to: 0 0.2 0; dur: 1000; easing: easeInOutQuad; loop: true; dir: alternate');
  
  // Manejar errores del modelo
  model.addEventListener('model-error', () => {
    console.error('Error mostrando modelo 3D');
    show3DError(targetIndex);
  });
  
  // Añadir elemento a la entidad
  targetEntity.appendChild(model);
  
  console.log('✅ Modelo 3D mostrado exitosamente');
}

function show3DError(targetIndex) {
  const targetEntity = document.querySelector(`a-entity[mindar-image-target="targetIndex: ${targetIndex}"]`);
  
  if (targetEntity) {
    // Limpiar contenido previo
    while (targetEntity.firstChild) {
      targetEntity.removeChild(targetEntity.firstChild);
    }
    
    // Crear mensaje de error
    const errorText = document.createElement('a-text');
    errorText.setAttribute('value', 'Error cargando modelo 3D');
    errorText.setAttribute('position', '0 0 0');
    errorText.setAttribute('align', 'center');
    errorText.setAttribute('color', 'red');
    errorText.setAttribute('scale', '0.3 0.3 0.3');
    
    targetEntity.appendChild(errorText);
    
    console.warn('⚠️ Modelo 3D no pudo cargarse, mostrando mensaje de error');
  }
}

// ===== FUNCIONES DE PRECARGA (llamadas desde functions.js) =====
function preload3DModel(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  
  // Evitar doble carga
  if (config.loading || config.loaded) {
    console.log('🎨 Modelo 3D ya está cargando o cargado');
    return;
  }
  
  config.loading = true;
  
  // Verificar disponibilidad de THREE.js
  if (typeof THREE === 'undefined' || !THREE.GLTFLoader) {
    console.warn('⚠️ THREE.GLTFLoader no disponible para precarga');
    config.loading = false;
    return;
  }
  
  console.log(`🎨 Iniciando precarga de modelo 3D: ${config.modelPath}`);
  
  const loader = new THREE.GLTFLoader();
  loader.load(
    config.modelPath,
    (gltf) => {
      console.log('✅ Modelo 3D precargado exitosamente');
      config.modelLoaded = true;
      config.loaded = true;
      config.loading = false;
      
      // Preparar el asset en A-Frame
      const assets = document.querySelector('a-assets');
      const existingModel = document.getElementById(`target-${targetIndex}-model`);
      
      if (!existingModel && assets) {
        const modelElement = document.createElement('a-asset-item');
        modelElement.setAttribute('id', `target-${targetIndex}-model`);
        modelElement.setAttribute('src', config.modelPath);
        assets.appendChild(modelElement);
        console.log(`🎨 Asset del modelo 3D agregado: target-${targetIndex}-model`);
      }
    },
    (xhr) => {
      // Progreso de precarga (opcional, sin mostrar en UI)
      if (xhr.lengthComputable) {
        const percent = (xhr.loaded / xhr.total) * 100;
        console.log(`📈 Progreso precarga modelo 3D: ${percent.toFixed(0)}%`);
      }
    },
    (error) => {
      console.error('❌ Error precargando modelo 3D:', error);
      config.loading = false;
      config.loaded = false;
    }
  );
}

// ===== FUNCIÓN DE DIAGNÓSTICO =====
function diagnose3DCapabilities() {
  console.log('🔍 Diagnosticando capacidades 3D...');
  
  const diagnostics = {
    threeJS: typeof THREE !== 'undefined',
    gltfLoader: typeof THREE !== 'undefined' && !!THREE.GLTFLoader,
    webGL: !!window.WebGLRenderingContext,
    assets: !!document.querySelector('a-assets')
  };
  
  console.log('📊 Diagnóstico 3D:', diagnostics);
  
  if (!diagnostics.threeJS) {
    console.warn('⚠️ THREE.js no está cargado');
  }
  
  if (!diagnostics.gltfLoader) {
    console.warn('⚠️ GLTFLoader no está disponible');
  }
  
  if (!diagnostics.webGL) {
    console.error('❌ WebGL no está soportado');
  }
  
  if (!diagnostics.assets) {
    console.warn('⚠️ Contenedor de assets de A-Frame no encontrado');
  }
  
  return diagnostics;
}

// ===== FUNCIONES DE UTILIDAD =====
function get3DModelStatus(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  
  return {
    loading: config.loading || false,
    loaded: config.loaded || false,
    modelLoaded: config.modelLoaded || false,
    visible: config.visible || false,
    hasAsset: !!document.getElementById(`target-${targetIndex}-model`)
  };
}

function reset3DModel(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  
  // Resetear estado
  config.loading = false;
  config.loaded = false;
  config.modelLoaded = false;
  config.visible = false;
  
  // Limpiar asset si existe
  const asset = document.getElementById(`target-${targetIndex}-model`);
  if (asset) {
    asset.remove();
  }
  
  // Limpiar entidad
  const targetEntity = document.querySelector(`a-entity[mindar-image-target="targetIndex: ${targetIndex}"]`);
  if (targetEntity) {
    while (targetEntity.firstChild) {
      targetEntity.removeChild(targetEntity.firstChild);
    }
  }
  
  console.log(`🔄 Modelo 3D reiniciado: target-${targetIndex}`);
}

// ===== INICIALIZACIÓN AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
  // Ejecutar diagnóstico al cargar
  setTimeout(() => {
    diagnose3DCapabilities();
  }, 1000);
});