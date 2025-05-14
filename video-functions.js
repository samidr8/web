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