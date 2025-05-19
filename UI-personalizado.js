document.addEventListener('DOMContentLoaded', () => {
  // 1. Crear UI personalizado (INICIALMENTE OCULTO)
  const trackingUI = document.createElement('div');
  trackingUI.className = 'custom-tracking-ui';
  trackingUI.style.opacity = '0'; // ← Inicia oculto
  trackingUI.innerHTML = `
    <div class="tracking-square">
      <span></span>
      <div class="scan-line"></div>
    </div>
  `;
  document.body.appendChild(trackingUI);

  // 2. Mostrar solo durante la carga
  const scene = document.querySelector('a-scene');
  
  // Evento: Cuando el AR comienza a cargar (pero aún no está listo)
  scene.addEventListener('renderstart', () => {
    trackingUI.style.opacity = '1'; // ← Se muestra
  });

  // Evento: Cuando el AR termina de cargar
  scene.addEventListener('loaded', () => {
    trackingUI.style.opacity = '0'; // ← Se oculta
  });

  // 3. Eliminar el UI original de MindAR (por si acaso)
  const removeDefaultUI = setInterval(() => {
    const defaultUI = document.querySelector('.mindar-ui-overlay');
    if (defaultUI) defaultUI.remove();
  }, 100);
});
