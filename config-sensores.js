document.addEventListener('DOMContentLoaded', function() {
  // Crear elementos del panel de configuración
  const configIcon = document.createElement('div');
  configIcon.className = 'ar-config-icon';
  configIcon.innerHTML = '⚙️';
  document.body.appendChild(configIcon);

  const configPanel = document.createElement('div');
  configPanel.className = 'ar-config-panel';
  configPanel.innerHTML = `
    <button class="close-panel-btn">×</button>
    <h3>Configuración AR</h3>
    <div class="ar-config-content">
      <div class="sensor-check">
        <span>Linterna:</span>
        <span class="sensor-status" id="flash-status">No verificado</span>
      </div>
      <button class="ar-config-btn" id="toggle-flash">Activar Linterna</button>
      <div id="flash-error" class="error-message"></div>
      
      <div class="sensor-check">
        <span>WebGL:</span>
        <span class="sensor-status" id="webgl-status">No verificado</span>
      </div>
      <a href="https://get.webgl.org" target="_blank" class="webgl-link">Probar WebGL</a>
      
      <div class="section-title">Sensores</div>
      
      <div class="sensor-check">
        <span>ARCore/ARKit:</span>
        <span class="sensor-status" id="arcore-status">No verificado</span>
      </div>
      
      <div class="sensor-check">
        <span>Giroscopio:</span>
        <span class="sensor-status" id="gyro-status">No verificado</span>
      </div>
      
      <div class="sensor-check">
        <span>Acelerómetro:</span>
        <span class="sensor-status" id="accel-status">No verificado</span>
      </div>
      
      <div class="sensor-check">
        <span>Magnetómetro:</span>
        <span class="sensor-status" id="mag-status">No verificado</span>
      </div>
      
      <div class="sensor-check">
        <span>Sensor de Proximidad:</span>
        <span class="sensor-status" id="prox-status">No verificado</span>
      </div>
    </div>
  `;
  document.body.appendChild(configPanel);

  // Variables de estado
  let flashOn = false;
  let flashSupported = false;

  // Event listeners
  configIcon.addEventListener('click', function() {
    configPanel.style.display = 'block';
    checkSensors();
    checkFlashSupport(); // Verificar soporte de linterna al abrir el panel
  });

  document.querySelector('.close-panel-btn').addEventListener('click', function() {
    configPanel.style.display = 'none';
    if (flashOn) {
      toggleFlash(); // Apagar linterna al cerrar panel
    }
  });

  document.getElementById('toggle-flash').addEventListener('click', toggleFlash);

  // Funciones de verificación de sensores
  function checkSensors() {
    checkWebGL();
    checkARCore();
    checkGyroscope();
    checkAccelerometer();
    checkMagnetometer();
    checkProximity();
  }

  function checkFlashSupport() {
    const flashStatus = document.getElementById('flash-status');
    if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
      flashStatus.textContent = 'No soportado';
      flashStatus.className = 'sensor-status sensor-error';
      document.getElementById('toggle-flash').disabled = true;
      return;
    }
    
    // Verificar si el dispositivo es móvil (donde es más probable tener linterna)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
      flashStatus.textContent = 'Solo móviles';
      flashStatus.className = 'sensor-status sensor-error';
      document.getElementById('toggle-flash').disabled = true;
    } else {
      flashStatus.textContent = 'Listo';
      flashStatus.className = 'sensor-status sensor-ok';
      document.getElementById('toggle-flash').disabled = false;
    }
  }

  function checkWebGL() {
    const webglStatus = document.getElementById('webgl-status');
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl && gl instanceof WebGLRenderingContext) {
        webglStatus.textContent = 'Soportado';
        webglStatus.className = 'sensor-status sensor-ok';
      } else {
        webglStatus.textContent = 'No soportado';
        webglStatus.className = 'sensor-status sensor-error';
      }
    } catch (e) {
      webglStatus.textContent = 'Error';
      webglStatus.className = 'sensor-status sensor-error';
    }
  }

  function checkARCore() {
    const arcoreStatus = document.getElementById('arcore-status');
    // Detección básica de soporte AR
    if (navigator.xr && navigator.xr.isSessionSupported) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        arcoreStatus.textContent = supported ? 'Soportado' : 'No soportado';
        arcoreStatus.className = supported ? 'sensor-status sensor-ok' : 'sensor-status sensor-error';
      }).catch(() => {
        arcoreStatus.textContent = 'Error al verificar';
        arcoreStatus.className = 'sensor-status sensor-error';
      });
    } else {
      arcoreStatus.textContent = 'No soportado';
      arcoreStatus.className = 'sensor-status sensor-error';
    }
  }

  function checkGyroscope() {
    const gyroStatus = document.getElementById('gyro-status');
    if ('Gyroscope' in window) {
      const gyro = new Gyroscope({ frequency: 60 });
      gyro.addEventListener('reading', () => {
        gyroStatus.textContent = 'Soportado';
        gyroStatus.className = 'sensor-status sensor-ok';
        gyro.stop();
      });
      gyro.addEventListener('error', () => {
        gyroStatus.textContent = 'Error';
        gyroStatus.className = 'sensor-status sensor-error';
      });
      gyro.start();
    } else {
      gyroStatus.textContent = 'No soportado';
      gyroStatus.className = 'sensor-status sensor-error';
    }
  }

  function checkAccelerometer() {
    const accelStatus = document.getElementById('accel-status');
    if ('Accelerometer' in window) {
      const accel = new Accelerometer({ frequency: 60 });
      accel.addEventListener('reading', () => {
        accelStatus.textContent = 'Soportado';
        accelStatus.className = 'sensor-status sensor-ok';
        accel.stop();
      });
      accel.addEventListener('error', () => {
        accelStatus.textContent = 'Error';
        accelStatus.className = 'sensor-status sensor-error';
      });
      accel.start();
    } else {
      accelStatus.textContent = 'No soportado';
      accelStatus.className = 'sensor-status sensor-error';
    }
  }

  function checkMagnetometer() {
    const magStatus = document.getElementById('mag-status');
    if ('Magnetometer' in window) {
      const mag = new Magnetometer({ frequency: 60 });
      mag.addEventListener('reading', () => {
        magStatus.textContent = 'Soportado';
        magStatus.className = 'sensor-status sensor-ok';
        mag.stop();
      });
      mag.addEventListener('error', () => {
        magStatus.textContent = 'Error';
        magStatus.className = 'sensor-status sensor-error';
      });
      mag.start();
    } else {
      magStatus.textContent = 'No soportado';
      magStatus.className = 'sensor-status sensor-error';
    }
  }

  function checkProximity() {
    const proxStatus = document.getElementById('prox-status');
    if ('ondeviceproximity' in window || 'onuserproximity' in window || 'ProximitySensor' in window) {
      proxStatus.textContent = 'Soportado';
      proxStatus.className = 'sensor-status sensor-ok';
    } else {
      proxStatus.textContent = 'No soportado';
      proxStatus.className = 'sensor-status sensor-error';
    }
  }

  // Control de la linterna
  function toggleFlash() {
    const flashStatus = document.getElementById('flash-status');
    const flashError = document.getElementById('flash-error');
    const flashButton = document.getElementById('toggle-flash');
    
    if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
      flashError.textContent = 'API de medios no soportada';
      return;
    }

    flashOn = !flashOn;
    
    if (flashOn) {
      // Activar linterna
      navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          torch: true
        }
      }).then(stream => {
        const track = stream.getVideoTracks()[0];
        track.applyConstraints({
          advanced: [{ torch: true }]
        }).then(() => {
          flashStatus.textContent = 'Activada';
          flashButton.textContent = 'Apagar Linterna';
          flashError.textContent = '';
          flashSupported = true;
        }).catch(err => {
          flashError.textContent = 'No se pudo activar la linterna';
          console.error('Error al activar linterna:', err);
          flashOn = false;
          stream.getTracks().forEach(track => track.stop());
        });
      }).catch(err => {
        flashError.textContent = 'Error al acceder a la cámara';
        console.error('Error de cámara:', err);
        flashOn = false;
      });
    } else {
      // Apagar linterna
      const videoElements = document.querySelectorAll('video');
      let found = false;
      
      videoElements.forEach(video => {
        if (video.srcObject) {
          video.srcObject.getTracks().forEach(track => {
            if (track.kind === 'video') {
              track.stop();
              found = true;
            }
          });
        }
      });
      
      if (found) {
        flashStatus.textContent = 'Apagada';
        flashButton.textContent = 'Activar Linterna';
      }
    }
  }
});