let currentMarkerId = null;
let markerActive = false; // Variable para rastrear si hay un marcador activo
let currentUrl = ''; // Variable para almacenar la URL actual
let interactiveModels = {}; // Almacenar modelos interactivos detectados
let activeMarkerInfo = null; // Almacena información del marcador activo

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

    // Si el modelo es interactivo, guardar información y crear indicador
    if (marker.type === "3d-model" && marker.content.interactive) {
        activeMarkerInfo = {
            markerId: marker.id,
            infoTitle: marker.content.infoTitle,
            infoContent: marker.content.infoContent,
            infoImage: marker.content.infoImage
        };

        // Crear un indicador visual de interactividad
        createInteractiveIndicator(marker.id);
    } else {
        activeMarkerInfo = null;
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

    // Eliminar indicadores interactivos
    document.querySelectorAll('.interactive-indicator').forEach(indicator => {
        indicator.remove();
    });

    // Actualizar estado
    activeMarkerInfo = null;

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

// Función para mostrar el título del contenido
function showContentTitle(title) {
    const titleEl = document.getElementById('content-title');

    titleEl.textContent = title;
    titleEl.style.display = 'block';

    console.log(`Mostrando título: ${title}`);
}

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

// Añadir manejador de eventos global para toques en la pantalla
document.addEventListener('touchstart', function (e) {
    // Si no hay marcador activo, no hacer nada
    if (!markerActive) return;

    // Verificar si hay algún indicador interactivo tocado
    let target = e.target;
    if (target.classList.contains('interactive-indicator')) {
        // Se tocó un indicador
        e.preventDefault();
        e.stopPropagation();

        if (activeMarkerInfo) {
            showInfoPanel(
                activeMarkerInfo.infoTitle,
                activeMarkerInfo.infoContent,
                activeMarkerInfo.infoImage
            );
        }
        return;
    }

    // Si hay un marcador activo con información y se tocó en el área central
    if (activeMarkerInfo) {
        // Obtener dimensiones de la pantalla
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const touch = e.touches[0];

        // Verificar si el toque está en el área central de la pantalla
        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;

        // Área central más grande para mejor detección
        const touchDistance = Math.sqrt(
            Math.pow(touch.clientX - centerX, 2) +
            Math.pow(touch.clientY - centerY, 2)
        );

        // Si el toque está cerca del centro (área del modelo)
        if (touchDistance < Math.min(screenWidth, screenHeight) * 0.25) { // 25% del tamaño más pequeño
            console.log("Toque detectado sobre el modelo 3D");
            e.preventDefault();
            e.stopPropagation();

            showInfoPanel(
                activeMarkerInfo.infoTitle,
                activeMarkerInfo.infoContent,
                activeMarkerInfo.infoImage
            );
        }
    }
});

// Agregar también manejo de clic para navegadores de escritorio
document.addEventListener('click', function (e) {
    // Si no hay marcador activo, no hacer nada
    if (!markerActive) return;

    // Verificar si hay algún indicador interactivo clicado
    let target = e.target;
    if (target.classList.contains('interactive-indicator')) {
        e.preventDefault();
        e.stopPropagation();

        if (activeMarkerInfo) {
            showInfoPanel(
                activeMarkerInfo.infoTitle,
                activeMarkerInfo.infoContent,
                activeMarkerInfo.infoImage
            );
        }
        return;
    }

    // Si hay un marcador activo con información y se hizo clic en el área central
    if (activeMarkerInfo) {
        // Obtener dimensiones de la pantalla
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Verificar si el clic está en el área central de la pantalla
        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;

        // Calcular distancia del clic al centro
        const clickDistance = Math.sqrt(
            Math.pow(e.clientX - centerX, 2) +
            Math.pow(e.clientY - centerY, 2)
        );

        // Si el clic está cerca del centro (área del modelo)
        if (clickDistance < Math.min(screenWidth, screenHeight) * 0.25) {
            console.log("Clic detectado sobre el modelo 3D");
            e.preventDefault();
            e.stopPropagation();

            showInfoPanel(
                activeMarkerInfo.infoTitle,
                activeMarkerInfo.infoContent,
                activeMarkerInfo.infoImage
            );
        }
    }
});

// Manejo de conexión
window.addEventListener('offline', function () {
    console.warn("Conexión perdida");
    showErrorMessage("Se ha perdido la conexión a Internet. Algunas funciones pueden no estar disponibles.");
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