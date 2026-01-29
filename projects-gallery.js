/* ============ PROJECTS CANVAS GALLERY ============ */

document.addEventListener('DOMContentLoaded', function () {
    initializeCanvasGalleries();
});

function initializeCanvasGalleries() {
    const galleries = document.querySelectorAll('.project-canvas-gallery');

    galleries.forEach(gallery => {
        const canvasItems = gallery.querySelectorAll('.canvas-item');
        const prevBtn = gallery.querySelector('.canvas-nav.prev');
        const nextBtn = gallery.querySelector('.canvas-nav.next');
        const indicators = gallery.querySelectorAll('.indicator');

        let currentIndex = 0;

        // Ocultar botones si solo hay un item
        if (canvasItems.length <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            gallery.querySelector('.canvas-indicators')?.remove();
            return;
        }

        // Función para mostrar un canvas específico
        function showCanvas(index) {
            // Remover active de todos
            canvasItems.forEach(item => item.classList.remove('active'));
            indicators.forEach(ind => ind.classList.remove('active'));

            // Agregar active al actual
            canvasItems[index].classList.add('active');
            if (indicators[index]) {
                indicators[index].classList.add('active');
            }

            // Lazy load para iframes de YouTube
            const activeCanvas = canvasItems[index];
            if (activeCanvas.getAttribute('data-type') === 'youtube') {
                const iframe = activeCanvas.querySelector('iframe');
                if (iframe && iframe.hasAttribute('data-src')) {
                    iframe.src = iframe.getAttribute('data-src');
                    iframe.removeAttribute('data-src');
                }
            }

            currentIndex = index;
        }

        // Función para ir al siguiente
        function nextCanvas() {
            const newIndex = (currentIndex + 1) % canvasItems.length;
            showCanvas(newIndex);
        }

        // Función para ir al anterior
        function prevCanvas() {
            const newIndex = (currentIndex - 1 + canvasItems.length) % canvasItems.length;
            showCanvas(newIndex);
        }

        // Event listeners para botones
        if (prevBtn) {
            prevBtn.addEventListener('click', prevCanvas);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', nextCanvas);
        }

        // Event listeners para indicadores
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showCanvas(index);
            });
        });

        // Soporte para teclado (flechas)
        gallery.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevCanvas();
            } else if (e.key === 'ArrowRight') {
                nextCanvas();
            }
        });

        // Soporte para swipe en móviles
        let touchStartX = 0;
        let touchEndX = 0;

        gallery.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        gallery.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - siguiente
                    nextCanvas();
                } else {
                    // Swipe right - anterior
                    prevCanvas();
                }
            }
        }

        // Auto-play opcional (descomentado si lo deseas)
        /*
        let autoplayInterval = setInterval(nextCanvas, 5000);
        
        // Pausar autoplay al hover
        gallery.addEventListener('mouseenter', () => {
            clearInterval(autoplayInterval);
        });
        
        gallery.addEventListener('mouseleave', () => {
            autoplayInterval = setInterval(nextCanvas, 5000);
        });
        */
    });
}

/* ============ LAZY LOAD YOUTUBE VIDEOS ============ */

// Cargar video de YouTube solo cuando sea visible (Intersection Observer)
function setupYouTubeLazyLoad() {
    const youtubeVideos = document.querySelectorAll('.project-canvas iframe[data-src]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                if (iframe.hasAttribute('data-src')) {
                    iframe.src = iframe.getAttribute('data-src');
                    iframe.removeAttribute('data-src');
                    observer.unobserve(iframe);
                }
            }
        });
    }, {
        rootMargin: '50px'
    });

    youtubeVideos.forEach(video => observer.observe(video));
}

// Inicializar lazy load
document.addEventListener('DOMContentLoaded', setupYouTubeLazyLoad);

/* ============ UTILIDAD PARA OBTENER ID DE VIDEO DE YOUTUBE ============ */

/**
 * Extrae el ID de video de una URL de YouTube
 * @param {string} url - URL completa de YouTube
 * @returns {string} - ID del video
 */
function getYouTubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Genera URL de embed de YouTube
 * @param {string} videoId - ID del video
 * @returns {string} - URL de embed
 */
function getYouTubeEmbedUrl(videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

// Ejemplo de uso:
const videoId = getYouTubeVideoId('https://www.youtube.com/watch?v=SfXVfhMWj6g');
const embedUrl = getYouTubeEmbedUrl(videoId);
