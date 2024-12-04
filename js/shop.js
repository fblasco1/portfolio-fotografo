document.addEventListener("DOMContentLoaded", () => {
  const photoGrid = document.getElementById("photo-grid");
  const cartItems = document.getElementById("cart-items");
  const checkoutButton = document.getElementById("checkout-button");
  const imageModal = document.getElementById("image-modal");
  const modalImage = document.getElementById("modal-image");
  const checkoutModal = document.getElementById("checkout-modal");
  const checkoutForm = document.getElementById("checkout-form");
  const selectedPhotosList = document.getElementById("selected-photos-list");
  const closeButtons = document.querySelectorAll(".modal .close");

  let cart = [];

  const photos = [
    {
      id: 1,
      titleKey: "shop.photo1.title",
      subtitle: "Buenos Aires, Argentina 2022",
      url: "./assets/Tienda/1.jpg",
    },
    {
      id: 2,
      titleKey: "shop.photo2.title",
      subtitle: "Buenos Aires, Argentina 2023",
      url: "./assets/Tienda/2.jpg",
    },
    {
      id: 3,
      titleKey: "shop.photo3.title",
      subtitle: "Buenos Aires, Argentina 2022",
      url: "./assets/Tienda/3.jpg",
    },
    {
      id: 4,
      titleKey: "shop.photo4.title",
      subtitle: "Buenos Aires, Argentina 2023",
      url: "./assets/Tienda/4.jpg",
    },
    {
      id: 5,
      titleKey: "shop.photo5.title",
      subtitle: "Gorongosa, Mozambique 2010",
      url: "./assets/Tienda/5.jpg",
    },
    {
      id: 6,
      titleKey: "shop.photo6.title",
      subtitle: "Belén, Palestina 2022",
      url: "./assets/Tienda/6.jpg",
    },
    {
      id: 7,
      titleKey: "shop.photo7.title",
      subtitle: "Pushkar, India 2011",
      url: "./assets/Tienda/7.jpg",
    },
    {
      id: 8,
      titleKey: "shop.photo8.title",
      subtitle: "Don Khong, Laos 2012",
      url: "./assets/Tienda/8.jpg",
    },
    {
      id: 9,
      titleKey: "shop.photo9.title",
      subtitle: "Vian Xai, Laos 2012",
      url: "./assets/Tienda/9.jpg",
    },
    {
      id: 10,
      titleKey: "shop.photo10.title",
      subtitle: "Buenos Aires, Argentina 2024",
      url: "./assets/Tienda/10.jpg",
    },
    {
      id: 11,
      titleKey: "shop.photo11.title",
      subtitle: "Myanmar 2017",
      url: "./assets/Tienda/11.jpg",
    },
    {
      id: 12,
      titleKey: "shop.photo12.title",
      subtitle: "Myanmar 2012",
      url: "./assets/Tienda/12.jpg",
    },
    {
      id: 13,
      titleKey: "shop.photo13.title",
      subtitle: "Myanmar 2012",
      url: "./assets/Tienda/13.jpg",
    },
    {
      id: 14,
      titleKey: "shop.photo14.title",
      subtitle: "India 2011",
      url: "./assets/Tienda/14.jpg",
    },
    {
      id: 15,
      titleKey: "shop.photo15.title",
      subtitle: "Marruecos 2009",
      url: "./assets/Tienda/15.jpg",
    },
    {
      id: 16,
      titleKey: "shop.photo16.title",
      subtitle: "Palestina 2013",
      url: "./assets/Tienda/16.jpg",
    },
    {
      id: 17,
      titleKey: "shop.photo17.title",
      subtitle: "India 2011",
      url: "./assets/Tienda/17.jpg",
    },
  ];

  function createPhotoItem(photo) {
    const photoItem = document.createElement("div");
    photoItem.classList.add("photo-item");

    photoItem.innerHTML = `
            <img src="${photo.url}" alt="${i18next.t(
      photo.titleKey
    )}" class="preview-image">
            <div class="photo-details">
                <h2 class="photo-title">${i18next.t(photo.titleKey)}</h2>
                <p class="photo-subtitle">${photo.subtitle}</p>
                <button class="add-to-cart-button" data-id="${
                  photo.id
                }">${i18next.t("shop.addToCart")}</button>
            </div>
        `;

    const img = photoItem.querySelector(".preview-image");
    img.addEventListener("click", () => openImageModal(photo));

    return photoItem;
  }

  function openImageModal(photo) {
    modalImage.src = photo.url;
    modalImage.alt = i18next.t(photo.titleKey);
    imageModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
  }

  function openCheckoutModal() {
    if (cart.length > 0) {
      updateCheckoutPhotosList();
      checkoutModal.style.display = "flex";
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");

      // For mobile, scroll to top of checkout form
      if (window.innerWidth <= 480) {
        window.scrollTo(0, 0);
      }
    }
  }

  function closeModals() {
    imageModal.style.display = "none";
    checkoutModal.style.display = "none";
    document.body.style.overflow = "auto";
  }

  function updateCart() {
    cartItems.innerHTML = "";
    if (cart.length === 0) {
      document.getElementById("cart-section").style.display = "none";
      return;
    }

    document.getElementById("cart-section").style.display = "block";
    cart.forEach((photo) => {
      const cartItem = document.createElement("div");
      cartItem.classList.add("cart-item");
      cartItem.innerHTML = `
                <img src="${photo.url}" alt="${i18next.t(photo.titleKey)}">
                <span>${i18next.t(photo.titleKey)}</span>
                <button class="remove-item" data-id="${photo.id}">${i18next.t(
        "shop.remove"
      )}</button>
            `;
      cartItems.appendChild(cartItem);
    });
  }

  function updateCheckoutPhotosList() {
    selectedPhotosList.innerHTML =
      "<h3>" + i18next.t("shop.checkout.selectedPhotos") + "</h3>";
    const list = document.createElement("ul");
    cart.forEach((photo) => {
      const li = document.createElement("li");
      li.textContent = i18next.t(photo.titleKey);
      list.appendChild(li);
    });
    selectedPhotosList.appendChild(list);
  }

  async function handleCheckoutSubmit(event) {
    event.preventDefault();

    // Recopila datos del formulario
    const formData = new FormData(checkoutForm);
    const customerName = formData.get("name");
    const customerEmail = formData.get("email");
    const customerAddress = formData.get("address");

    // Serializa los datos del carrito (ID y títulos de fotos)
    const selectedPhotos = cart.map((photo) => ({
      id: photo.id,
      title: i18next.t(photo.titleKey),
    }));

    // Crea el payload para enviar
    const payload = {
      name: customerName,
      subject: "Order Shop: " + customerName,
      email: customerEmail,
      address: customerAddress,
      photos: selectedPhotos,
    };

    try {
      // Envía los datos a Formspree
      const response = await fetch("https://formspree.io/f/xwpkyabj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Pedido enviado con éxito
        alert(i18next.t("shop.checkout.success"));
        cart = [];
        updateCart();
        closeModals();
        checkoutForm.reset();
      } else {
        throw new Error("Error al enviar el pedido.");
      }
    } catch (error) {
      // Manejo de errores
      console.error(error);
      alert(i18next.t("shop.checkout.error"));
    }
  }

  // Event Listeners
  photoGrid.addEventListener("click", (event) => {
    if (event.target.classList.contains("add-to-cart-button")) {
      const photoId = parseInt(event.target.getAttribute("data-id"));
      const photo = photos.find((p) => p.id === photoId);
      if (photo && !cart.some((p) => p.id === photoId)) {
        cart.push(photo);
        updateCart();
      }
    }
  });

  cartItems.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-item")) {
      const photoId = parseInt(event.target.getAttribute("data-id"));
      cart = cart.filter((p) => p.id !== photoId);
      updateCart();
    }
  });

  checkoutButton.addEventListener("click", openCheckoutModal);

  if (closeButtons) {
    closeButtons.forEach((button) => {
      button.addEventListener("click", closeModals);
    });
  }

  window.addEventListener("click", (event) => {
    if (event.target === imageModal || event.target === checkoutModal) {
      closeModals();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModals();
    }
  });

  checkoutForm.addEventListener("submit", handleCheckoutSubmit);

  // Initialize the photo grid
  photos.forEach((photo) => {
    photoGrid.appendChild(createPhotoItem(photo));
  });

  // Initialize cart display
  updateCart();

  // Handle language changes
  i18next.on("languageChanged", () => {
    // Refresh the photo grid with new translations
    photoGrid.innerHTML = "";
    photos.forEach((photo) => {
      photoGrid.appendChild(createPhotoItem(photo));
    });
    // Update cart with new translations
    updateCart();
  });
});
