// Función mejorada para mostrar contenido web (iframe)
function showWebContent(url, fallbackEnabled = false, title = '') {
    const webContentContainer = document.querySelector('.web-content-container');
    const iframe = document.getElementById('web-content');
    const closeButton = document.getElementById('close-button');

    // Limpiar primero
    iframe.src = '';
    webContentContainer.style.display = 'none';
    closeButton.style.display = 'none';

    // Mostrar título si se proporciona
    if (title) {
        showContentTitle(title);
    }

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
            transform: function(url) {
                // Asegurar que formularios de Microsoft Forms tengan embedded=true
                if (!url.includes('embedded=true')) {
                    return url + (url.includes('?') ? '&' : '?') + 'embedded=true';
                }
                return url;
            }
        },
        {
            pattern: 'docs.google.com/forms',
            transform: function(url) {
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
        showFallbackScreen(transformedUrl, title);
        return;
    }

    // Intentar cargar el iframe
    try {
        iframe.src = transformedUrl;
        webContentContainer.style.display = 'block';
        closeButton.style.display = 'flex';

        // Comprobar errores de carga después de un tiempo
        setTimeout(function() {
            // Intentar acceder a contenido para ver si cargó
            try {
                const iframeContent = iframe.contentWindow || iframe.contentDocument;
                if (!iframeContent || !iframeContent.document) {
                    // Si hay problemas, mostrar fallback
                    if (fallbackEnabled) {
                        showFallbackScreen(transformedUrl, title);
                        webContentContainer.style.display = 'none';
                        closeButton.style.display = 'none';
                    }
                }
            } catch (e) {
                // Error al acceder al contenido (error de seguridad/origen cruzado)
                console.error('Error de acceso al iframe: probablemente X-Frame-Options bloqueó carga');
                if (fallbackEnabled) {
                    showFallbackScreen(transformedUrl, title);
                    webContentContainer.style.display = 'none';
                    closeButton.style.display = 'none';
                }
            }
        }, 1500);

        console.log(`Mostrando contenido web: ${transformedUrl}`);
    } catch (error) {
        console.error('Error al cargar contenido web:', error);
        if (fallbackEnabled) {
            showFallbackScreen(transformedUrl, title);
        } else {
            showErrorMessage('Error al cargar el contenido. Verifique su conexión a Internet.');
            hideContentTitle();
        }
    }
}

// Función para cerrar contenido web
function closeWebContent() {
    const webContentContainer = document.querySelector('.web-content-container');
    const iframe = document.getElementById('web-content');
    const closeButton = document.getElementById('close-button');
    const fallbackContainer = document.getElementById('fallback-container');

    iframe.src = '';
    webContentContainer.style.display = 'none';
    closeButton.style.display = 'none';
    fallbackContainer.style.display = 'none';

    // Ocultar título al cerrar contenido
    hideContentTitle();

    console.log('Contenido web cerrado');
}

// Mostrar pantalla de fallback cuando iframe falla
function showFallbackScreen(url, title = '') {
    currentUrl = url;
    const fallbackContainer = document.getElementById('fallback-container');
    fallbackContainer.style.display = 'block';

    // Mostrar título si se proporciona
    if (title) {
        showContentTitle(title);
    }

    // Configurar botón para abrir en nueva ventana
    document.getElementById('open-external-btn').onclick = function() {
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

// Función para mostrar mensajes de error
function showErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

// Función para ocultar el título del contenido
function hideContentTitle() {
    const titleElement = document.getElementById('content-title');
    if (titleElement) {
        titleElement.style.display = 'none';
    }
}

// Función para mostrar el título del contenido
function showContentTitle(title) {
    const titleElement = document.getElementById('content-title');
    if (titleElement) {
        titleElement.textContent = title;
        titleElement.style.display = 'block';
    }
}