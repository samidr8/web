document.addEventListener('DOMContentLoaded', () => {
  // 1. Crear UI personalizado
  const trackingUI = document.createElement('div');
  trackingUI.className = 'custom-tracking-ui';
  trackingUI.innerHTML = `
    <div class="tracking-square">
      <span></span>
      <div class="scan-line"></div>
    </div>
  `;
  document.body.appendChild(trackingUI);

  const scene = document.querySelector('a-scene');
  
  // Estado inicial
  let isTracking = false;

  // 2. Controlar visibilidad durante carga
  scene.addEventListener('renderstart', () => {
    if (!isTracking) {
      trackingUI.style.opacity = '1';
    }
  });

  scene.addEventListener('loaded', () => {
    if (!isTracking) {
      trackingUI.style.opacity = '0';
    }
  });

  // 3. Controlar detección de marcador
  scene.addEventListener('targetFound', () => {
    isTracking = true;
    trackingUI.style.opacity = '0';
  });

  scene.addEventListener('targetLost', () => {
    isTracking = false;
    trackingUI.style.opacity = '1';
  });

  // 4. Eliminar UI original persistentemente
  const removeDefaultUI = setInterval(() => {
    const defaultUI = document.querySelector('.mindar-ui-overlay');
    if (defaultUI) defaultUI.remove();
  }, 100);
});