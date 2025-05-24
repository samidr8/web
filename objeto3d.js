// ===== OBJETO3D.JS - VERSIÓN SIMPLIFICADA =====

// Variable global para controlar el tipo de contenido 3D
let use3DModel = false; // false para usar primitivas primero (más confiable)

// Función principal para cargar recursos 3D
function load3DResource(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  
  console.log('🎨 Iniciando carga de recurso 3D para target:', targetIndex);
  
  // Mostrar loader
  showResourceLoader(targetIndex);
  
  // Simular progreso de carga
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 20;
    updateResourceLoaderProgress(targetIndex, progress);
    
    if (progress >= 100) {
      clearInterval(progressInterval);
      
      // Ocultar loader y mostrar contenido
      setTimeout(() => {
        hideResourceLoader();
        
        if (use3DModel) {
          show3DModel(targetIndex);
        } else {
          show3DPrimitives(targetIndex);
        }
      }, 300);
    }
  }, 200);
}

// Función para mostrar el modelo 3D GLTF
function show3DModel(targetIndex) {
  const config = CONTENT_CONFIG[targetIndex];
  const targetEntity = document.querySelector(`a-entity[mindar-image-target="targetIndex: ${targetIndex}"]`);
  
  if (!targetEntity) {
    console.error('❌ No se encontró la entidad target para el índice:', targetIndex);
    return;
  }
  
  console.log('🎨 Mostrando modelo 3D en target:', targetIndex);
  
  // Limpiar contenido previo
  while (targetEntity.firstChild) {
    targetEntity.removeChild(targetEntity.firstChild);
  }
  
  // Verificar si el asset ya existe en a-assets
  let assetId = `model-${targetIndex}`;
  let asset = document.getElementById(assetId);
  
  if (!asset) {
    // Crear el asset si no existe
    const assets = document.querySelector('a-assets');
    if (assets) {
      asset = document.createElement('a-asset-item');
      asset.setAttribute('id', assetId);
      asset.setAttribute('src', config.modelPath);
      assets.appendChild(asset);
      
      console.log('📦 Asset creado:', assetId);
      
      // Esperar a que se cargue el asset
      asset.addEventListener('loaded', () => {
        console.log('✅ Asset cargado, creando modelo');
        createGLTFModel(targetIndex, targetEntity, assetId);
      });
      
      asset.addEventListener('error', (e) => {
        console.error('❌ Error cargando asset:', e);
        // Mostrar primitivas como fallback
        show3DPrimitives(targetIndex);
      });
    }
  } else {
    // Si el asset ya existe, crear el modelo directamente
    createGLTFModel(targetIndex, targetEntity, assetId);
  }
}

// Función auxiliar para crear el modelo GLTF
function createGLTFModel(targetIndex, targetEntity, assetId) {
  // Crear el modelo GLTF
  const model = document.createElement('a-gltf-model');
  model.setAttribute('src', `#${assetId}`);
  model.setAttribute('position', '0 0 0');
  model.setAttribute('rotation', '0 0 0');
  model.setAttribute('scale', '0.005 0.005 0.005'); // Escala muy pequeña para el Shiba
  
  // Agregar animación
  model.setAttribute('animation', 
    'property: rotation; ' +
    'to: 0 360 0; ' +
    'dur: 10000; ' +
    'easing: linear; ' +
    'loop: true'
  );
  
  // Eventos del modelo
  model.addEventListener('model-loaded', () => {
    console.log('✅ Modelo GLTF cargado y visible');
  });
  
  model.addEventListener('model-error', (e) => {
    console.error('❌ Error con el modelo GLTF:', e);
    // Mostrar primitivas como fallback
    show3DPrimitives(targetIndex);
  });
  
  // Agregar el modelo al target
  targetEntity.appendChild(model);
  
  console.log('✅ Modelo GLTF agregado al DOM');
}

// Función para mostrar primitivas 3D (cubos, esferas, etc.)
function show3DPrimitives(targetIndex) {
  const targetEntity = document.querySelector(`a-entity[mindar-image-target="targetIndex: ${targetIndex}"]`);
  
  if (!targetEntity) {
    console.error('❌ No se encontró la entidad target para el índice:', targetIndex);
    return;
  }
  
  console.log('🎯 Mostrando primitivas 3D en target:', targetIndex);
  
  // Limpiar contenido previo
  while (targetEntity.firstChild) {
    targetEntity.removeChild(targetEntity.firstChild);
  }
  
  // Crear un cubo simple
  const cube = document.createElement('a-box');
  cube.setAttribute('position', '0 0 0');
  cube.setAttribute('scale', '0.1 0.1 0.1');
  cube.setAttribute('color', '#4CC3D9');
  cube.setAttribute('material', 'shader: flat');
  cube.setAttribute('animation', 
    'property: rotation; ' +
    'to: 0 360 0; ' +
    'dur: 3000; ' +
    'easing: linear; ' +
    'loop: true'
  );
  
  // Crear una esfera
  const sphere = document.createElement('a-sphere');
  sphere.setAttribute('position', '0.15 0 0');
  sphere.setAttribute('radius', '0.05');
  sphere.setAttribute('color', '#EF2D5E');
  sphere.setAttribute('material', 'shader: flat');
  sphere.setAttribute('animation',
    'property: position; ' +
    'to: 0.15 0.1 0; ' +
    'dur: 1000; ' +
    'easing: easeInOutQuad; ' +
    'loop: true; ' +
    'dir: alternate'
  );
  
  // Crear un cilindro
  const cylinder = document.createElement('a-cylinder');
  cylinder.setAttribute('position', '-0.15 0 0');
  cylinder.setAttribute('radius', '0.05');
  cylinder.setAttribute('height', '0.1');
  cylinder.setAttribute('color', '#FFC65D');
  cylinder.setAttribute('material', 'shader: flat');
  cylinder.setAttribute('animation',
    'property: rotation; ' +
    'to: 360 0 0; ' +
    'dur: 4000; ' +
    'loop: true'
  );
  
  // Agregar texto
  const text = document.createElement('a-text');
  text.setAttribute('value', '3D TEST');
  text.setAttribute('position', '0 0.15 0');
  text.setAttribute('align', 'center');
  text.setAttribute('color', '#FFFFFF');
  text.setAttribute('scale', '0.2 0.2 0.2');
  
  // Agregar todos los elementos
  targetEntity.appendChild(cube);
  targetEntity.appendChild(sphere);
  targetEntity.appendChild(cylinder);
  targetEntity.appendChild(text);
  
  console.log('✅ Primitivas 3D agregadas');
  
  // Verificar después de un momento
  setTimeout(() => {
    const elements = targetEntity.children;
    console.log(`📊 Elementos agregados: ${elements.length}`);
    
    // Verificar visibilidad
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (el.object3D) {
        console.log(`Elemento ${i} (${el.tagName}):`, {
          visible: el.object3D.visible,
          position: el.getAttribute('position'),
          hasParent: !!el.object3D.parent
        });
      }
    }
  }, 500);
}

// Función para cambiar entre modelo y primitivas
function toggle3DMode() {
  use3DModel = !use3DModel;
  console.log(`🔄 Modo 3D cambiado a: ${use3DModel ? 'Modelo GLTF' : 'Primitivas'}`);
}

// Función de diagnóstico
function test3DCapabilities() {
  console.log('🔍 === TEST DE CAPACIDADES 3D ===');
  
  // Verificar A-Frame
  console.log('A-Frame:', typeof AFRAME !== 'undefined' ? '✅' : '❌');
  
  // Verificar Three.js
  console.log('Three.js:', typeof THREE !== 'undefined' ? '✅' : '❌');
  
  // Verificar WebGL
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  console.log('WebGL:', gl ? '✅' : '❌');
  
  // Verificar escena
  const scene = document.querySelector('a-scene');
  console.log('A-Scene:', scene ? '✅' : '❌');
  
  // Verificar assets
  const assets = document.querySelector('a-assets');
  console.log('A-Assets:', assets ? '✅' : '❌');
  
  // Verificar targets
  const targets = document.querySelectorAll('[mindar-image-target]');
  console.log(`Targets encontrados: ${targets.length}`);
  
  targets.forEach((target, index) => {
    const idx = target.getAttribute('mindar-image-target').targetIndex;
    console.log(`  - Target ${idx}: ${target.children.length} hijos`);
  });
  
  console.log('🔍 === FIN DEL TEST ===');
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 objeto3d.js cargado');
  
  // Ejecutar test de capacidades después de 2 segundos
  setTimeout(test3DCapabilities, 2000);
});

// Hacer funciones disponibles globalmente
window.load3DResource = load3DResource;
window.show3DModel = show3DModel;
window.show3DPrimitives = show3DPrimitives;
window.toggle3DMode = toggle3DMode;
window.test3DCapabilities = test3DCapabilities;