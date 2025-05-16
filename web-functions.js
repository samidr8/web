// Función mejorada para mostrar contenido web (iframe)
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
        },
        {
            pattern: 'wordwall.net',
            needsFallback: false
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
        // Configurar el iframe primero
        iframe.src = transformedUrl;
        
        // Mostrar el contenedor y el botón de cierre
        webContentContainer.style.display = 'block';
        closeButton.style.display = 'flex';
        
        console.log(`Mostrando contenido web: ${transformedUrl}`);

        // Comprobar errores de carga después de un tiempo
        setTimeout(function() {
            try {
                // Intentar acceder a contenido para ver si cargó
                const iframeContent = iframe.contentWindow || iframe.contentDocument;
                
                // Verificar si podemos acceder al documento del iframe
                // (esto fallará con errores de origen cruzado)
                if (iframeContent) {
                    try {
                        // Intentar acceder a document para verificar si está disponible
                        const test = iframeContent.document;
                        console.log('Iframe cargado correctamente');
                    } catch (e) {
                        console.warn('Error de origen cruzado al acceder al contenido del iframe:', e);
                        // Si hay error de acceso pero el iframe parece estar cargando, 
                        // lo dejamos continuar ya que podría ser un problema de CORS normal
                    }
                } else if (fallbackEnabled) {
                    console.error('No se pudo acceder al iframe, mostrando fallback');
                    showFallbackScreen(transformedUrl, title);
                    webContentContainer.style.display = 'none';
                }
            } catch (e) {
                console.error('Error al verificar el iframe:', e);
                if (fallbackEnabled) {
                    showFallbackScreen(transformedUrl, title);
                    webContentContainer.style.display = 'none';
                }
            }
        }, 2000);
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
    const fallbackContainer = document.getElementById('fallback-container');

    // Limpiar iframe y ocultar contenedores
    iframe.src = '';
    webContentContainer.style.display = 'none';
    fallbackContainer.style.display = 'none';

    // Ocultar título al cerrar contenido
    hideContentTitle();

    console.log('Contenido web cerrado');
}

// Mostrar pantalla de fallback cuando iframe falla
function showFallbackScreen(url, title = '') {
    currentUrl = url;
    const fallbackContainer = document.getElementById('fallback-container');
    const webContentContainer = document.querySelector('.web-content-container');
    
    // Ocultar contenedor del iframe
    webContentContainer.style.display = 'none';
    
    // Mostrar contenedor de fallback
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
    // Verificar si ya existe un mensaje de error y eliminarlo
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(errorElement => {
        errorElement.remove();
    });

    // Crear nuevo mensaje de error
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    
    setTimeout(() => {
        if (errorElement.parentNode) {
            errorElement.remove();
        }
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

// Función para verificar si un iframe está visible en la pantalla
function isIframeVisible(iframe) {
    if (!iframe) return false;
    
    // Comprobar si el iframe tiene dimensiones
    const rect = iframe.getBoundingClientRect();
    const hasSize = rect.width > 0 && rect.height > 0;
    
    // Comprobar si el iframe está en el viewport
    const isInViewport = rect.bottom > 0 && 
                         rect.right > 0 && 
                         rect.top < window.innerHeight && 
                         rect.left < window.innerWidth;
    
    // Comprobar si el iframe o su contenedor tienen display:none
    const style = window.getComputedStyle(iframe);
    const isDisplayed = style.display !== 'none';
    
    // Comprobar el contenedor padre
    const container = iframe.closest('.web-content-container');
    const containerDisplayed = container ? 
                               window.getComputedStyle(container).display !== 'none' : 
                               true;
    
    return hasSize && isInViewport && isDisplayed && containerDisplayed;
}

// Script para solucionar problemas de visualización del iframe
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos importantes
    const webContentContainer = document.querySelector('.web-content-container');
    const iframe = document.getElementById('web-content');
    const closeButton = document.getElementById('close-button');
    
    // Reemplazar la función activateMarkerContent original para manejar mejor los iframes
    if (typeof window.activateMarkerContent === 'function') {
        const originalActivateMarkerContent = window.activateMarkerContent;
        
        window.activateMarkerContent = function(marker) {
            // Llamar a la función original
            originalActivateMarkerContent(marker);
            
            // Lógica adicional para asegurar que los iframes sean visibles
            if (marker.type === "iframe") {
                setTimeout(function() {
                    ensureIframeVisibility();
                }, 500);
            }
        };
    }
    
    // Reemplazar la función showWebContent para garantizar visibilidad
    const originalShowWebContent = window.showWebContent;
    
    if (typeof originalShowWebContent === 'function') {
        window.showWebContent = function(url, fallbackEnabled = false, title = '') {
            // Ejecutar la función original
            originalShowWebContent(url, fallbackEnabled, title);
            
            // Asegurar que el iframe sea visible
            setTimeout(function() {
                ensureIframeVisibility();
            }, 500);
        };
    }
    
    // Función para verificar y corregir la visibilidad del iframe
    function ensureIframeVisibility() {
        if (!iframe || !webContentContainer) return;
        
        // Si el iframe tiene src pero no es visible, forzar visibilidad
        if (iframe.src && iframe.src !== 'about:blank' && webContentContainer.style.display !== 'block') {
            console.log('Forzando visibilidad del iframe');
            webContentContainer.style.display = 'block';
            webContentContainer.classList.add('visible');
            closeButton.style.display = 'flex';
            
            // Verificar visibilidad después de un momento
            setTimeout(checkVisibility, 500);
        }
    }
    
    // Función para verificar si el iframe es realmente visible
    function checkVisibility() {
        if (!iframe || !webContentContainer) return;
        
        const rect = iframe.getBoundingClientRect();
        const hasSize = rect.width > 0 && rect.height > 0;
        
        console.log('Estado del iframe:', {
            src: iframe.src,
            display: webContentContainer.style.display,
            width: rect.width,
            height: rect.height,
            hasSize: hasSize,
            isVisible: webContentContainer.classList.contains('visible')
        });
        
        if (!hasSize && iframe.src && iframe.src !== 'about:blank') {
            console.warn('Iframe sin dimensiones, aplicando corrección');
            webContentContainer.classList.add('visible');
            
            // Intentar forzar un reflow
            iframe.style.display = 'none';
            void iframe.offsetHeight; // Forzar reflow
            iframe.style.display = 'block';
        }
    }
    
    // Observar cambios en el iframe
    if (iframe) {
        iframe.addEventListener('load', function() {
            console.log('Iframe cargado:', iframe.src);
            ensureIframeVisibility();
        });
    }
});

// Función para forzar la visibilidad del iframe (puede ser llamada desde la consola para debug)
window.forceIframeVisibility = function() {
    const webContentContainer = document.querySelector('.web-content-container');
    const iframe = document.getElementById('web-content');
    const closeButton = document.getElementById('close-button');
    
    if (webContentContainer && iframe && iframe.src && iframe.src !== 'about:blank') {
        console.log('Forzando visibilidad del iframe manualmente');
        webContentContainer.style.display = 'block';
        webContentContainer.classList.add('visible');
        closeButton.style.display = 'flex';
    } else {
        console.log('No hay iframe para mostrar o no tiene contenido');
    }
};