function showGeogebraApplet() {
  const container = document.getElementById('geogebra-container');
  if (container) {
    container.style.display = 'block';
    container.style.pointerEvents = 'auto';
    
    console.log('🧮 GeoGebra applet mostrado');
  }
}