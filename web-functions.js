// Función mejorada para mostrar contenido web (iframe) con manejo especial para GeoGebra
function showWebContent(url, fallbackEnabled = false, title = '') {
    const webContentContainer = document.querySelector('.web-content-container');
    const iframe = document.getElementById('web-content');
    const closeButton = document.getElementById('close-button');

    // Limpiar primero
    iframe.src = '';
    
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
            needsFallback: false, // GeoGebra con URL de iframe funciona bien
            transform: function(url) {
                // Modificar URL de GeoGebra para asegurar que funcione en iframe
                // Asegurar que tiene los parámetros necesarios
                let geogebraUrl = url;
                if (!geogebraUrl.includes('width=')) {
                    geogebraUrl += (geogebraUrl.includes('?') ? '&' : '?') + 'width=800';
                }
                if (!geogebraUrl.includes('height=')) {
                    geogebraUrl += (geogebraUrl.includes('?') ? '&' : '?') + 'height=600';
                }
                // Agregar parámetros para mejorar compatibilidad con iframes
                if (!geogebraUrl.includes('ld=')) {
                    geogebraUrl += '&ld=true'; // Loading dialog
                }
                if (!geogebraUrl.includes('sdz=')) {
                    geogebraUrl += '&sdz=true'; // Scale to zero
                }
                if (!geogebraUrl.includes('smb=')) {
                    geogebraUrl += '&smb=false'; // Show menu bar
                }
                if (!geogebraUrl.includes('sri=')) {
                    geogebraUrl += '&sri=true'; // Script right interface
                }
                return geogebraUrl;
            }
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

    // Caso especial para GeoGebra - Detectar si es una URL de GeoGebra
    const isGeogebra = url.includes('geogebra.org');
    
    console.log(`Mostrando contenido web: ${transformedUrl}`);
    
    // Intentar cargar el iframe
    try {
        // Para GeoGebra, agregar un manejo específico
        if (isGeogebra) {
            console.log("Detectado contenido de GeoGebra, aplicando configuración especial");
            
            // 1. Asegurar que el iframe tiene sandbox con los permisos adecuados
            iframe.sandbox = "allow-same-origin allow-scripts allow-forms allow-popups";
            
            // 2. Establecer attributes específicos para GeoGebra
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('scrolling', 'no');
            
            // 3. Configurar el estilo para que se vea bien
            iframe.style.border = "none";
            iframe.style.overflow = "hidden";
            
            // 4. Establecer título para accesibilidad
            iframe.title = "GeoGebra Math Applet";
        }
        
        // Configurar el src del iframe
        iframe.src = transformedUrl;
        
        // Hacer visible el contenedor y el botón de cierre
        webContentContainer.classList.add('visible');
        closeButton.style.display = 'flex';
        
        // Comprobar errores de carga después de un tiempo
        setTimeout(function() {
            // Intentar acceder a contenido para ver si cargó
            try {
                // Para GeoGebra, no intentamos acceder al contenido
                // ya que esto siempre falla debido a las restricciones de CORS
                if (!isGeogebra) {
                    const iframeContent = iframe.contentWindow || iframe.contentDocument;
                    
                    if (!iframeContent || !iframeContent.document) {
                        // Si hay problemas, mostrar fallback
                        if (fallbackEnabled) {
                            showFallbackScreen(transformedUrl, title);
                            webContentContainer.classList.remove('visible');
                        }
                    }
                }
            } catch (e) {
                console.error('Error de acceso al iframe: probablemente X-Frame-Options bloqueó carga', e);
                
                // Para GeoGebra, no mostramos el fallback incluso si hay error
                // porque el contenido generalmente se carga bien a pesar del error CORS
                if (!isGeogebra && fallbackEnabled) {
                    showFallbackScreen(transformedUrl, title);
                    webContentContainer.classList.remove('visible');
                }
            }
        }, 2000); // Aumentado el tiempo para cargar
    } catch (error) {
        console.error('Error al cargar contenido web:', error);
        
        if (fallbackEnabled && !isGeogebra) {
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
    webContentContainer.classList.remove('visible');
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