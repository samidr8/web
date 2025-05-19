document.addEventListener('DOMContentLoaded', () => {
  // 1. Crear UI personalizado
  const trackingUI = document.createElement('div');
  trackingUI.className = 'custom-tracking-ui';
  trackingUI.style.opacity = '0'; // Inicia oculto
  trackingUI.innerHTML = `
    <div class="tracking-square">
      <span></span>
      <div class="scan-line"></div>
    </div>
  `;
  document.body.appendChild(trackingUI);

  const scene = document.querySelector('a-scene');
  
  // 2. Mostrar durante carga inicial
  scene.addEventListener('renderstart', () => {
    trackingUI.style.opacity = '1';
  });

  // 3. Ocultar cuando el AR esté listo Y cuando se detecten marcadores
  const hideUI = () => trackingUI.style.opacity = '0';
  const showUI = () => trackingUI.style.opacity = '1';

  scene.addEventListener('loaded', hideUI);
  
  // Controlar todos los targets
  const targets = document.querySelectorAll('[mindar-image-target]');
  targets.forEach(target => {
    target.addEventListener('targetFound', hideUI);
    target.addEventListener('targetLost', showUI);
  });

  // 4. Eliminar UI original persistentemente
  const removeDefaultUI = setInterval(() => {
    document.querySelectorAll('.mindar-ui-overlay, .mindar-ui-target').forEach(el => el.remove());
  }, 100);
});