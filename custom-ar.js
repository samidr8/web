// Guardar como custom-ar.js
window.onload = function() {
    // Esperar a que AR.js se inicialice
    setTimeout(() => {
        // Obtener la escena AR
        const arScene = document.querySelector('a-scene');
        if (!arScene || !arScene.hasAttribute('arjs')) return;
        
        console.log("Aplicando configuración personalizada para AR.js");
        
        // Modificar configuración de AR.js
        const arjsSystem = arScene.systems.arjs;
        if (arjsSystem && arjsSystem._arSource) {
            // 1. Modificar la resolución y configuración de la cámara
            arjsSystem._arSource.parameters.sourceWidth = 640;
            arjsSystem._arSource.parameters.sourceHeight = 480;
            arjsSystem._arSource.parameters.displayWidth = 640;
            arjsSystem._arSource.parameters.displayHeight = 480;
            
            // 2. Forzar reinicio con configuración simplificada
            if (arjsSystem._arSource._initialized) {
                console.log("Reiniciando fuente AR con configuración optimizada");
                
                // Detener la cámara actual si está activa
                if (arjsSystem._arSource.domElement && arjsSystem._arSource.domElement.srcObject) {
                    const tracks = arjsSystem._arSource.domElement.srcObject.getTracks();
                    tracks.forEach(track => track.stop());
                }
                
                // Forzar reinicio con configuración más simple
                const constraints = {
                    audio: false,
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    }
                };
                
                // Iniciar cámara manualmente
                navigator.mediaDevices.getUserMedia(constraints)
                    .then(stream => {
                        console.log("Cámara iniciada con configuración personalizada");
                        // Asignar el stream al elemento de video de AR.js
                        if (arjsSystem._arSource.domElement) {
                            arjsSystem._arSource.domElement.srcObject = stream;
                        }
                    })
                    .catch(error => {
                        console.error("Error al iniciar cámara con configuración personalizada:", error);
                        // Intentar configuración mínima como último recurso
                        navigator.mediaDevices.getUserMedia({ video: true })
                            .then(fallbackStream => {
                                console.log("Cámara iniciada con configuración mínima");
                                if (arjsSystem._arSource.domElement) {
                                    arjsSystem._arSource.domElement.srcObject = fallbackStream;
                                }
                            });
                    });
            }
            
            // 3. Modificar parámetros de detección
            if (arjsSystem._arController) {
                console.log("Ajustando parámetros de detección");
                arjsSystem._arController.setThreshold(60);
                arjsSystem._arController.setPatternRatio(0.65);
            }
        }
    }, 1000); // Esperar 1 segundo para asegurar que AR.js está inicializado
};