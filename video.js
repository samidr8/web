function showYoutubePlayer() {
  const container = document.getElementById('youtube-container');
  if (container) {
    container.style.display = 'block';
    container.style.pointerEvents = 'auto';
    
    // Intentar reproducir automáticamente si está configurado
    const iframe = document.getElementById('youtube-iframe');
    if (iframe && iframe.src.includes('autoplay=1')) {
      // El video intentará reproducirse automáticamente
      console.log('📺 YouTube player mostrado con autoplay');
    }
  }
}