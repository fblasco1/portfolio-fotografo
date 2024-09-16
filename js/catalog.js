const photos = [
    { id: 1, url: './assets/foto1.jpg', title: 'Indian Women', description: 'Retrato de mujer hindu' },
    { id: 2, url: './assets/foto2.jpg', title: 'Jubilados', description: 'Jubilados y Represion' },
    { id: 3, url: './assets/foto3.jpg', title: 'El pescador', description: 'Pescador en una balsa' },
    { id: 4, url: './assets/foto4.jpg', title: 'Gendarmeria', description: 'Gendarmes y sus escudos' },
    { id: 5, url: './assets/foto5.jpg', title: 'Piquete', description: 'Piqueteros' },
];

const gallery = document.getElementById('photoGallery');
const modal = document.getElementById('photoModal');
const modalImg = document.getElementById('modalImg');
const modalCaption = document.getElementById('modalCaption');
const closeBtn = document.querySelector('.close');
const menuToggle = document.getElementById('menuToggle');
const menu = document.getElementById('menu');

function createPhotoItem(photo) {
    const photoItem = document.createElement('div');
    photoItem.className = 'photo-item';
    photoItem.innerHTML = `
        <img src="${photo.url}" alt="${photo.title}" loading="lazy">
        <div class="photo-info">
            <div class="photo-title">${photo.title}</div>
            <p>${photo.description}</p>
            <button class="buy-btn" data-id="${photo.id}">Comprar</button>
        </div>
    `;
    return photoItem;
}

function renderGallery() {
    photos.forEach(photo => {
        const photoItem = createPhotoItem(photo);
        gallery.appendChild(photoItem);
    });
}

function openModal(imgSrc, imgAlt, imgDescription) {
    modal.style.display = "block";
    modalImg.src = imgSrc;
    modalImg.alt = imgAlt;
    modalCaption.textContent = imgDescription;
    document.body.style.overflow = 'hidden';
    modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = 'auto';
    modal.setAttribute('aria-hidden', 'true');
}

function buyPhoto(photoId) {
    const photo = photos.find(p => p.id === parseInt(photoId));
    const size = prompt("Ingrese el tamaño deseado:");
    const name = prompt("Ingrese su nombre y apellido:");
    const country = prompt("Ingrese su país de residencia:");
    const email = prompt("Ingrese su correo electrónico:");
    const whatsapp = prompt("Ingrese su número de WhatsApp:");

    // Here you would implement the email sending functionality
    console.log(`
        Compra de foto:
        ID: ${photoId}
        Título: ${photo.title}
        Tamaño: ${size}
        Nombre: ${name}
        País: ${country}
        Email: ${email}
        WhatsApp: ${whatsapp}
    `);

    alert("Gracias por su compra. Nos pondremos en contacto con usted pronto.");
}

function toggleMenu() {
    menu.classList.toggle('show');
}

// Event Listeners
gallery.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
        const photoItem = e.target.closest('.photo-item');
        const title = photoItem.querySelector('.photo-title').textContent;
        const description = photoItem.querySelector('p').textContent;
        openModal(e.target.src, title, description);
    } else if (e.target.classList.contains('buy-btn')) {
        buyPhoto(e.target.dataset.id);
    }
});

closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

menuToggle.addEventListener('click', toggleMenu);

// Initialize
renderGallery();