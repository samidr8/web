function showWebpageAlert() {
  const targetIndex = 2; // El índice de la página web
  const config = CONTENT_CONFIG[targetIndex];
  
  // Mostrar loader mientras "verifica" la página
  showResourceLoader(targetIndex);
  
  // Simular verificación de la página
  let progress = 0;
  const interval = setInterval(() => {
    progress += 25;
    updateResourceLoaderProgress(targetIndex, progress);
    
    if (progress >= 100) {
      clearInterval(interval);
      
      setTimeout(() => {
        hideResourceLoader();
        
        // Mostrar el alert
        const container = document.getElementById('webpage-container');
        container.style.display = 'block';
        container.style.pointerEvents = 'auto';
        document.getElementById('webpage-alert').style.display = 'block';
        
        config.loaded = true;
      }, 300);
    }
  }, 200);
}