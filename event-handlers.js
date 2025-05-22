// Manejadores de eventos
document.addEventListener('DOMContentLoaded', function () {
  // Configurar iframes
  document.getElementById('youtube-iframe').src = `https://www.youtube.com/embed/${CONTENT_CONFIG[0].youtubeId}?autoplay=1&enablejsapi=1&controls=1`;
  document.getElementById('geogebra-iframe').src = `https://www.geogebra.org/material/iframe/id/${CONTENT_CONFIG[1].appletId}/width/1400/height/800/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/false/ctl/false`;

  // Configurar listeners para controles
  document.getElementById('youtube-close-btn').addEventListener('click', () => closeContent('youtube'));
  document.getElementById('geogebra-close-btn').addEventListener('click', () => closeContent('geogebra'));
  document.getElementById('webpage-close-btn').addEventListener('click', handleWebpageClose);
  document.getElementById('cancel-webpage-btn').addEventListener('click', handleWebpageClose);
  document.getElementById('open-browser-btn').addEventListener('click', openExternalBrowser);
  document.getElementById('podcast-close-btn').addEventListener('click', () => closeContent('podcast'));
  document.getElementById('podcast-play-btn').addEventListener('click', playPodcast);
  document.getElementById('podcast-pause-btn').addEventListener('click', pausePodcast);
  document.getElementById('podcast-stop-btn').addEventListener('click', stopPodcast);

  // Ocultar loader inicial cuando la cámara esté lista
  const scene = document.querySelector('a-scene');
  scene.addEventListener('loaded', onSceneLoaded);
});