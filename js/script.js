document.addEventListener('DOMContentLoaded', () => {
    const carouselImages = document.querySelectorAll('#background-carousel img');

    // Función para el carrusel
    function startCarousel() {
        let currentIndex = 0;
        setInterval(() => {
            carouselImages[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % carouselImages.length;
            carouselImages[currentIndex].classList.add('active');
        }, 5000); // Cambia la imagen cada 5 segundos
    }

    // Iniciar el carrusel
    startCarousel();
});