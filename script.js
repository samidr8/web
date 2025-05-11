// Configuración de marcadores y sus contenidos
const markers = [
    {
        id: "volcan-marker",
        url: "https://samidr8.github.io/web/markers/dinosaurio",
        type: "3d-model",
        content: {
            url: "https://samidr8.github.io/web/media/volcano.glb",
            scale: "300 300 300",
            position: "150 0 -150",
            rotation: "0 0 0",
            title: "Modelo 3D de Volcán",
            // Se puede añadir interactividad a cualquier modelo
            interactive: true,
            infoTitle: "Volcán",
            infoContent: "• Los volcanes son aberturas en la corteza terrestre\n• Liberan magma, ceniza y gases del interior\n• Pueden formar montañas cónicas\n• Hay más de 1,500 volcanes activos en la Tierra",
            infoImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Erupcion_del_volcan_de_Pacaya.JPG/220px-Erupcion_del_volcan_de_Pacaya.JPG"
        }
    },
    {
        id: "tierra-marker",
        url: "https://samidr8.github.io/web/markers/tierra",
        type: "3d-model",
        content: {
            url: "https://samidr8.github.io/web/media/tierra.glb",
            scale: "1500 1500 1500",
            position: "150 0 -150",
            rotation: "0 180 0",
            title: "Modelo 3D de la Tierra",
            // Propiedades para interactividad
            interactive: true,
            infoTitle: "La Tierra",
            infoContent: "• Diámetro: 12,742 km\n• Distancia al Sol: 149.6 millones km\n• Edad: 4.54 mil millones de años\n• Período de rotación: 23.93 horas\n• Período orbital: 365.25 días",
            infoImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/240px-The_Blue_Marble_%28remastered%29.jpg"
        }
    },
    {
        id: "video-marker",
        url: "https://samidr8.github.io/web/markers/zenon",
        type: "video",
        content: {
            url: "https://www.youtube.com/watch?v=7B0Z_JaEGlU",
            title: "Video de YouTube"
        }
    },
    {
        id: "formulario-marker",
        url: "https://samidr8.github.io/web/markers/formulario",
        type: "iframe",
        content: {
            url: "https://www.mep.go.cr/",
            title: "Página MEP",
            fallbackEnabled: true // Nueva propiedad para indicar si se debe mostrar fallback
        }
    },
    {
        id: "geogebra-marker",
        url: "https://samidr8.github.io/web/markers/geogebra",
        type: "iframe",
        content: {
            url: "https://www.geogebra.org/material/iframe/id/DCDmYQ8z/width/1400/height/800/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/true/rc/false/ld/false/sdz/false/ctl/false",
            title: "Applet de GeoGebra"
        }
    }
];

let currentMarkerId = null;
let markerActive = false; // Variable para rastrear si hay un marcador activo
let currentUrl = ''; // Variable para almacenar la URL actual
let interactiveModels = {}; // Almacenar modelos interactivos detectados

// Mostrar panel de información
function showInfoPanel(title, content, imageUrl) {
    const panel = document.getElementById('info-panel');
    const titleElement = document.getElementById('info-panel-title');
    const textElement = document.getElementById('info-panel-text');
    const imageElement = document.getElementById('info-panel-image');
    
    // Establecer contenido
    titleElement.textContent = title || 'Información';
    
    // Procesar contenido con saltos de línea
    const formattedContent = content ? content.replace(/\n/g, '<br>') : '';
    textElement.innerHTML = formattedContent;
    
    // Configurar imagen
    if (imageUrl && imageUrl.trim() !== '') {
        imageElement.src = imageUrl;
        imageElement.style.display = 'block';
    } else {
        imageElement.style.display = 'none';
    }
    
    // Mostrar panel
    panel.style.display = 'block';
    
    console.log(`Mostrando panel informativo para: ${title}`);
}

// Cerrar panel de información
function closeInfoPanel() {
    const panel = document.getElementById('info-panel');
    panel.style.display = 'none';
    console.log('Panel informativo cerrado');
}

// Función para establecer el estado del indicador
function setIndicatorStatus(active) {
    const indicator = document.getElementById('status-indicator');
    if (indicator) {
        indicator.style.backgroundColor = active ? '#4CAF50' : 'red'; // Verde si activo, rojo si no
    }
    markerActive = active;
    console.log(active ? "Marcador detectado" : "Sin marcador");
}

// Función para manejar interacción con objetos 3D - Modificada para mejor detección
function handleModelInteraction(event) {
    if (!markerActive) return; // Solo procesar si hay un marcador activo
    
    event.stopPropagation();
    
    // Obtener el ID del modelo
    const modelId = event.currentTarget.id;
    console.log(`Modelo tocado: ${modelId}`);
    
    // Buscar información del modelo
    const model = interactiveModels[modelId];
    if (model) {
        showInfoPanel(
            model.infoTitle,
            model.infoContent,
            model.infoImage
        );
    }
}

// Verificar compatibilidad con AR
function checkARCompatibility() {
    // Verificar soporte para WebAR
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showErrorMessage("Tu navegador no soporta acceso a la cámara, necesario para AR.");
        return false;
    }
    return true;
}

// Mostrar mensaje de error
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<p>${message}</p>`;
    document.body.appendChild(errorDiv);
    document.querySelector('.arjs-loader').style.display = 'none';

    // Eliminar mensaje después de 5 segundos
    setTimeout(() => {
        if (errorDiv && errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);

    // Ocultar título cuando hay un error
    hideContentTitle();
}

// Función específica para ocultar el título
function hideContentTitle() {
    const titleEl = document.getElementById('content-title');
    if (titleEl) {
        titleEl.style.display = 'none';
    }
}

// Mostrar pantalla de fallback cuando iframe falla
function showFallbackScreen(url) {
    currentUrl = url;
    const fallbackContainer = document.getElementById('fallback-container');
    fallbackContainer.style.display = 'block';

    // Configurar botón para abrir en nueva ventana
    document.getElementById('open-external-btn').onclick = function () {
        window.open(url, '_blank');
        closeFallbackScreen();
    };

    // Configurar botón para cerrar
    document.getElementById('close-fallback-btn').onclick = closeFallbackScreen;

    console.log(`Mostrando pantalla de fallback para: ${url}`);
}

// Cerrar pantalla de fallback
function closeFallbackScreen() {
    const fallbackContainer = document.getElementById('fallback-container');
    fallbackContainer.style.display = 'none';
    hideContentTitle();
    console.log('Pantalla de fallback cerrada');
}

// Función para crear un indicador visual de interactividad - Mejorada para evitar duplicados
function createInteractiveIndicator(model) {
    // Verificar si ya existe un indicador para este modelo
    const existingIndicator = document.querySelector(`.interactive-indicator[data-for="${model.id}"]`);
    if (existingIndicator) return existingIndicator;
    
    const indicator = document.createElement('div');
    indicator.className = 'interactive-indicator';
    indicator.innerHTML = 'i';
    indicator.title = 'Toca para más información';
    indicator.setAttribute('data-for', model.id);
    
    // Posicionar el indicador cerca del modelo
    const modelRect = model.getBoundingClientRect();
    indicator.style.left = `${modelRect.right - 20}px`;
    indicator.style.top = `${modelRect.top + 20}px`;
    
    document.body.appendChild(indicator);
    
    // Actualizar posición del indicador regularmente
    const updateInterval = setInterval(() => {
        if (!document.body.contains(model)) {
            // Si el modelo ya no existe, eliminar el indicador y el intervalo
            if (document.body.contains(indicator)) {
                indicator.remove();
            }
            clearInterval(updateInterval);
            return;
        }
        
        if (model.isConnected && window.getComputedStyle(model).display !== 'none' && markerActive) {
            const updatedRect = model.getBoundingClientRect();
            indicator.style.left = `${updatedRect.right - 20}px`;
            indicator.style.top = `${updatedRect.top + 20}px`;
            indicator.style.display = 'flex';
        } else {
            indicator.style.display = 'none';
        }
    }, 200);
    
    return indicator;
}

// Función mejorada para mostrar contenido web (iframe)
function showWebContent(url, fallbackEnabled = false) {
    const iframe = document.getElementById('web-content');
    const closeButton = document.getElementById('close-button');

    // Limpiar primero
    iframe.src = '';

    // Lista de sitios conocidos que necesitan tratamiento especial
    const knownPatterns = [
        {
            pattern: 'mep.go.cr',
            needsFallback: true
        },
        {
            pattern: 'geogebra.org/material/iframe',
            needsFallback: false // GeoGebra con URL de iframe funciona bien
        },
        {
            pattern: 'forms.office.com',
            transform: function (url) {
                // Asegurar que formularios de Microsoft Forms tengan embedded=true
                if (!url.includes('embedded=true')) {
                    return url + (url.includes('?') ? '&' : '?') + 'embedded=true';
                }
                return url;
            }
        },
        {
            pattern: 'docs.google.com/forms',
            transform: function (url) {
                // Asegurar que formularios de Google tengan embedded=true
                if (!url.includes('embedded=true')) {
                    return url + (url.includes('?') ? '&' : '?') + 'embedded=true';
                }
                return url;
            }
        }
    ];

    // Verificar si el sitio necesita tratamiento especial
    let useDirectFallback = false;
    let transformedUrl = url;

    for (const site of knownPatterns) {
        if (url.includes(site.pattern)) {
            if (site.needsFallback === true) {
                useDirectFallback = true;
            }

            if (site.transform) {
                transformedUrl = site.transform(url);
            }

            break;
        }
    }

    // Si sabemos que el sitio no permite iframes, mostrar fallback directamente
    if (useDirectFallback || (fallbackEnabled === true)) {
        showFallbackScreen(transformedUrl);
        return;
    }

    // Intentar cargar el iframe
    try {
        iframe.src = transformedUrl;
        iframe.style.display = 'block';
        closeButton.style.display = 'flex';

        // Comprobar errores de carga después de un tiempo
        setTimeout(function () {
            // Intentar acceder a contenido para ver si cargó
            try {
                const iframeContent = iframe.contentWindow || iframe.contentDocument;
                if (!iframeContent || !iframeContent.document) {
                    // Si hay problemas, mostrar fallback
                    if (fallbackEnabled) {
                        showFallbackScreen(transformedUrl);
                        iframe.style.display = 'none';
                        closeButton.style.display = 'none';
                    }
                }
            } catch (e) {
                // Error al acceder al contenido (error de seguridad/origen cruzado)
                console.error('Error de acceso al iframe: probablemente X-Frame-Options bloqueó carga');
                if (fallbackEnabled) {
                    showFallbackScreen(transformedUrl);
                    iframe.style.display = 'none';
                    closeButton.style.display = 'none';
                }
            }
        }, 1500);

        console.log(`Mostrando contenido web: ${transformedUrl}`);
    } catch (error) {
        console.error('Error al cargar contenido web:', error);
        if (fallbackEnabled) {
            showFallbackScreen(transformedUrl);
        } else {
            showErrorMessage('Error al cargar el contenido. Verifique su conexión a Internet.');
            hideContentTitle();
        }
    }
}

// Función para cerrar contenido web
function closeWebContent() {
    const iframe = document.getElementById('web-content');
    const closeButton = document.getElementById('close-button');
    const fallbackContainer = document.getElementById('fallback-container');

    iframe.src = '';
    iframe.style.display = 'none';
    closeButton.style.display = 'none';
    fallbackContainer.style.display = 'none';

    // Ocultar título al cerrar contenido
    hideContentTitle();

    console.log('Contenido web cerrado');
}

// Función mejorada para mostrar video
function showVideo(url) {
    const videoContainer = document.getElementById('video-container');
    const videoWrapper = document.getElementById('video-wrapper');
    const closeButton = videoContainer.querySelector('.close-button');

    // Limpiar el contenedor
    videoWrapper.innerHTML = '';

    try {
        // Verificar si es un enlace de YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            // Extraer el ID del video de YouTube con mejor manejo de formatos
            let videoId = '';
            if (url.includes('youtube.com/watch?v=')) {
                videoId = url.split('v=')[1].split(/[&?]/)[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split(/[&?]/)[0];
            } else if (url.includes('youtube.com/embed/')) {
                videoId = url.split('embed/')[1].split(/[&?]/)[0];
            }

            if (videoId) {
                // Crear un iframe para el video de YouTube con mejores opciones
                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
                iframe.setAttribute('allowfullscreen', 'true');
                iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen');
                iframe.style.height = '360px'; // Altura estándar para proporción 16:9

                videoWrapper.appendChild(iframe);
                console.log(`Reproduciendo video de YouTube: ${videoId}`);
            } else {
                throw new Error('No se pudo extraer el ID del video de YouTube');
            }
        } else {
            // Es un video MP4 u otro formato directo
            const video = document.createElement('video');
            video.src = url;
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            video.style.width = '100%';

            videoWrapper.appendChild(video);
            console.log(`Reproduciendo video directo: ${url}`);

            // Manejo de errores
            video.onerror = function () {
                throw new Error('Error al cargar el video');
            };
        }

        // Mostrar el contenedor y el botón de cierre
        videoContainer.style.display = 'block';
        closeButton.style.display = 'flex';

    } catch (error) {
        console.error(`Error: ${error.message}`);
        showErrorMessage(`Error al cargar el video: ${error.message}`);
        hideContentTitle();
    }
}

// Función para cerrar video
function closeVideo() {
    const videoContainer = document.getElementById('video-container');
    const videoWrapper = document.getElementById('video-wrapper');
    const closeButton = videoContainer.querySelector('.close-button');

    // Limpiar el contenedor
    videoWrapper.innerHTML = '';
    videoContainer.style.display = 'none';
    closeButton.style.display = 'none';

    // Ocultar título al cerrar video
    hideContentTitle();

    console.log('Video cerrado');
}

// Función para mostrar el título del contenido
function showContentTitle(title) {
    const titleEl = document.getElementById('content-title');

    titleEl.textContent = title;
    titleEl.style.display = 'block';

    console.log(`Mostrando título: ${title}`);
}

// Función mejorada para activar contenido basado en el tipo de marcador
function activateMarkerContent(marker) {
    currentMarkerId = marker.id;
    setIndicatorStatus(true); // Cambiar indicador a verde
    console.log(`Activando contenido para marcador: ${marker.id}`);

    // Ocultar todo el contenido primero
    hideAllContent();

    // Mostrar título del contenido si existe
    if (marker.content.title) {
        showContentTitle(marker.content.title);
    }

    // Activar el contenido apropiado según el tipo
    switch (marker.type) {
        case "3d-model":
            // Los modelos 3D ya están en la escena, solo necesitamos asegurarnos de que sean visibles
            const modelEntity = document.querySelector(`#model-root-${marker.id}`);
            if (modelEntity) {
                modelEntity.setAttribute('visible', true);
            }
            break;

        case "video":
            showVideo(marker.content.url);
            break;

        case "iframe":
            showWebContent(marker.content.url, marker.content.fallbackEnabled);
            break;

        default:
            console.log(`Tipo de contenido desconocido: ${marker.type}`);
    }
}

// Función mejorada para ocultar todo el contenido
function hideAllContent() {
    // Ocultar todos los modelos 3D
    document.querySelectorAll('[id^="model-root-"]').forEach(model => {
        model.setAttribute('visible', false);
    });

    // Cerrar contenido web
    const iframe = document.getElementById('web-content');
    const closeButton = document.getElementById('close-button');
    const fallbackContainer = document.getElementById('fallback-container');

    if (iframe) {
        iframe.src = '';
        iframe.style.display = 'none';
    }

    if (closeButton) {
        closeButton.style.display = 'none';
    }

    if (fallbackContainer) {
        fallbackContainer.style.display = 'none';
    }

    // Cerrar video
    const videoContainer = document.getElementById('video-container');
    const videoWrapper = document.getElementById('video-wrapper');
    const videoCloseButton = videoContainer ? videoContainer.querySelector('.close-button') : null;

    if (videoWrapper) {
        videoWrapper.innerHTML = '';
    }

    if (videoContainer) {
        videoContainer.style.display = 'none';
    }

    if (videoCloseButton) {
        videoCloseButton.style.display = 'none';
    }

    // Cerrar panel de información
    closeInfoPanel();

    // Ocultar título
    hideContentTitle();
}

// Función modificada para crear marcadores NFT dinámicamente
function createNFTMarkers() {
    const container = document.getElementById('nft-markers-container');

    markers.forEach(marker => {
        // Crear elemento a-nft para cada marcador
        const nftEl = document.createElement('a-nft');
        nftEl.setAttribute('id', `nft-${marker.id}`);
        nftEl.setAttribute('type', 'nft');
        nftEl.setAttribute('url', marker.url);
        nftEl.setAttribute('smooth', 'true');
        nftEl.setAttribute('smoothCount', '10');
        nftEl.setAttribute('smoothTolerance', '0.01');
        nftEl.setAttribute('smoothThreshold', '5');
        
        // Ya no usamos el raycaster global
        // nftEl.setAttribute('raycaster', 'objects: .clickable');
        nftEl.setAttribute('emitevents', 'true');

        // Si es un modelo 3D, crear la entidad del modelo
        if (marker.type === "3d-model") {
            const modelRoot = document.createElement('a-entity');
            modelRoot.setAttribute('id', `model-root-${marker.id}`);
            modelRoot.setAttribute('position', marker.content.position);
            modelRoot.setAttribute('visible', false); // Inicialmente oculto

            const model = document.createElement('a-entity');
            model.setAttribute('id', `model-${marker.id}`);
            model.setAttribute('gltf-model', marker.content.url);
            model.setAttribute('scale', marker.content.scale);
            model.setAttribute('rotation', marker.content.rotation);
            
            // Verificar si el modelo debe ser interactivo
            if (marker.content.interactive) {
                // Guardar la información del modelo para usar en interacción
                interactiveModels[`model-${marker.id}`] = {
                    infoTitle: marker.content.infoTitle || 'Información',
                    infoContent: marker.content.infoContent || 'No hay información disponible',
                    infoImage: marker.content.infoImage || ''
                };
                
                // MODIFICADO: Usar un enfoque basado en eventos de toque directo
                model.addEventListener('click', function(event) {
                    if (markerActive) {
                        event.stopPropagation();
                        showInfoPanel(
                            interactiveModels[`model-${marker.id}`].infoTitle,
                            interactiveModels[`model-${marker.id}`].infoContent,
                            interactiveModels[`model-${marker.id}`].infoImage
                        );
                    }
                });
                
                console.log(`Modelo interactivo configurado: ${marker.id}`);
            }

            // Añadir manejo de eventos para carga de modelos
            model.addEventListener('model-loaded', function () {
                console.log(`Modelo 3D cargado correctamente: ${marker.id}`);
            });

            model.addEventListener('model-error', function (e) {
                console.error(`Error al cargar modelo 3D: ${marker.id}`);
                showErrorMessage(`Error al cargar el modelo 3D. Inténtalo de nuevo.`);
            });

            model.setAttribute('animation', {
                property: 'rotation',
                to: '0 360 0',
                loop: true,
                dur: 10000, // 10 segundos para una rotación completa
                easing: 'linear'
            });

            modelRoot.appendChild(model);
            nftEl.appendChild(modelRoot);
        }

        // Mejorado el manejo de eventos de marcador
        nftEl.addEventListener('markerFound', function () {
            console.log(`🎯 Marcador ${marker.id} encontrado`);

            // Activar contenido para este marcador
            activateMarkerContent(marker);
        });

        nftEl.addEventListener('markerLost', function () {
            console.log(`❌ Marcador ${marker.id} perdido`);

            // Cambiar el indicador a rojo
            setIndicatorStatus(false);

            // Para este caso, solo ocultamos el título ya que no queremos 
            // interrumpir la interacción del usuario con videos/formularios
            hideContentTitle();
        });

        // Agregar marcador al contenedor
        container.appendChild(nftEl);
    });

    console.log(`${markers.length} marcadores NFT creados`);
}

// Implementación mejorada para detección de toques en modelos 3D
document.addEventListener('touchstart', function(e) {
    if (!markerActive) return; // Solo procesar si hay un marcador activo
    
    // Obtener todos los modelos 3D actuales que son interactivos
    for (const modelId in interactiveModels) {
        const modelElement = document.getElementById(modelId);
        if (modelElement && modelElement.isConnected && window.getComputedStyle(modelElement).display !== 'none') {
            // Verificar si el toque está sobre o cerca del modelo
            const modelRect = modelElement.getBoundingClientRect();
            const touch = e.touches[0];
            
            // Expandir ligeramente el área de detección para mejor experiencia de usuario
            const expandBy = 40; // píxeles
            const expandedRect = {
                left: modelRect.left - expandBy,
                right: modelRect.right + expandBy,
                top: modelRect.top - expandBy,
                bottom: modelRect.bottom + expandBy
            };
            
            if (touch.clientX >= expandedRect.left && 
                touch.clientX <= expandedRect.right && 
                touch.clientY >= expandedRect.top && 
                touch.clientY <= expandedRect.bottom) {
                
                console.log(`Toque detectado sobre/cerca del modelo: ${modelId}`);
                showInfoPanel(
                    interactiveModels[modelId].infoTitle,
                    interactiveModels[modelId].infoContent,
                    interactiveModels[modelId].infoImage
                );
                
                // Evitar propagación para no activar otros elementos
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        }
    }
});

// Manejo de conexión
window.addEventListener('offline', function () {
    console.warn("Conexión perdida");
    showErrorMessage("Se ha perdido la conexión a Internet. Algunas funciones pueden no estar disponibles.");

    // Ocultar título cuando se pierde la conexión
    hideContentTitle();
});

window.addEventListener('online', function () {
    console.log("Conexión recuperada");
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(el => {
        if (el && el.parentNode) {
            el.remove();
        }
    });
});

// Al cargar la página
window.addEventListener('load', function () {
    console.log("Página cargada, verificando compatibilidad...");

    // Inicializar el indicador en rojo (sin marcador)
    setIndicatorStatus(false);

    // Verificar compatibilidad
    if (!checkARCompatibility()) {
        return; // Detener inicialización si no es compatible
    }

    console.log("Inicializando sistema AR");

    // Crear marcadores NFT
    createNFTMarkers();

    // Comprobar si es la primera visita
    const firstVisit = !localStorage.getItem('ar_book_visited');
    if (firstVisit) {
        // Mostrar instrucciones solo la primera vez
        document.getElementById('instructions').style.display = 'flex';
        localStorage.setItem('ar_book_visited', 'true');
    } else {
        // Ocultar instrucciones
        document.getElementById('instructions').style.display = 'none';
    }

    // Ocultar el loader después de inicialización
    setTimeout(() => {
        document.querySelector('.arjs-loader').style.display = 'none';
        console.log("Sistema AR inicializado");
    }, 3000);

    // Prevenir zoom en móviles
    document.addEventListener('touchmove', function (e) {
        if (e.scale !== 1) { e.preventDefault(); }
    }, { passive: false });

    // Manejar casos donde el navegador pierde foco
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            console.log("Aplicación en segundo plano");
        } else {
            console.log("Aplicación en primer plano");
        }
    });
});