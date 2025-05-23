// Configuración de recursos
const CONTENT_CONFIG = {
  0: {
    type: "video",
    container: "youtube",
    youtubeId: "dayfz0ff1Mc",
    loaded: false,
    visible: false
  },
  1: {
    type: "geogebra",
    container: "geogebra",
    appletId: "qzjfkvpm",
    loaded: false,
    visible: false
  },
  2: {
    type: "webpage",
    container: "webpage",
    url: "https://wordwall.net/es/resource/12994896/n%C3%BAmeros-negativos-y-positivos",
    loaded: false,
    visible: false
  },
  3: {
    type: "3d",
    modelPath: "media/shiba/scene.gltf",
    loaded: false,
    loading: false,
    visible: false,
    modelLoaded: false
  },
  4: {
    type: "podcast",
    container: "podcast",
    audioPath: "sound/canto.mp3",
    loaded: false,
    loading: false,
    visible: false
  },
  5: {
    type: "imagen",
    container: "imagen",
    imagePath: "tarjetas/t2.png",
    loaded: false,
    loading: false,
    visible: false
  }
};

// Variables globales
let podcastAudio = null;