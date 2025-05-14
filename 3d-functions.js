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

            // Añadir manejo de eventos para carga de modelos
            model.addEventListener('model-loaded', function () {
                console.log(`Modelo 3D cargado correctamente: ${marker.id}`);
            });

            model.addEventListener('model-error', function (e) {
                console.error(`Error al cargar modelo 3D: ${marker.id}`);
                showErrorMessage(`Error al cargar el modelo 3D. Inténtalo de nuevo.`);
            });

            // Añadir animación de rotación
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

            // Eliminar indicadores interactivos
            document.querySelectorAll('.interactive-indicator').forEach(indicator => {
                indicator.remove();
            });

            activeMarkerInfo = null;
        });

        // Agregar marcador al contenedor
        container.appendChild(nftEl);
    });

    console.log(`${markers.length} marcadores NFT creados`);
}

// Función para manejar interacción con objetos 3D - Simplificada
function handleModelInteraction(markerId) {
    console.log(`Interacción con modelo: ${markerId}`);

    // Buscar el marcador
    const marker = markers.find(m => m.id === markerId);
    if (marker && marker.content.interactive) {
        showInfoPanel(
            marker.content.infoTitle,
            marker.content.infoContent,
            marker.content.infoImage
        );
    }
}

// Función para crear un indicador visual de interactividad (MEJORADA)
function createInteractiveIndicator(markerId) {
    // Eliminar indicadores previos
    document.querySelectorAll('.interactive-indicator').forEach(el => el.remove());

    // Crear nuevo indicador
    const indicator = document.createElement('div');
    indicator.className = 'interactive-indicator';
    indicator.innerHTML = 'i';
    indicator.title = 'Toca para más información';
    indicator.setAttribute('data-for', markerId);

    // Posicionamiento centrado
    indicator.style.position = 'fixed';
    indicator.style.top = '50%';
    indicator.style.left = '50%';
    indicator.style.transform = 'translate(-50%, -100px)'; // Desplazado hacia arriba para mejor visibilidad
    indicator.style.zIndex = '5000'; // Asegurar que esté por encima de todo
    indicator.style.width = '40px'; // Más grande para mejor usabilidad
    indicator.style.height = '40px';
    indicator.style.fontSize = '22px';

    document.body.appendChild(indicator);

    // Al hacer clic en el indicador, mostrar el panel de información
    indicator.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (markerActive && activeMarkerInfo) {
            showInfoPanel(
                activeMarkerInfo.infoTitle,
                activeMarkerInfo.infoContent,
                activeMarkerInfo.infoImage
            );
        }
    });

    console.log(`Indicador interactivo creado para: ${markerId}`);
    return indicator;
}