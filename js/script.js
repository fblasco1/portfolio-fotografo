document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const menu = document.getElementById("menu");

  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("active");
  });
});

function hideSpinner() {
  document.getElementById("loading-overlay").style.display = "none";
  document.body.classList.remove("i18n-loading");
}

i18next.on("loaded", function (loaded) {
  i18next.changeLanguage("es", (err, t) => {
    if (err) return console.log("something went wrong loading", err);
    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      element.innerHTML = i18next.t(element.getAttribute("data-i18n"));
    });
    // No ocultar el spinner aquí
  });
});

window.addEventListener("load", function () {
  // Espera a que todas las imágenes se carguen
  Promise.all(
    Array.from(document.images)
      .filter((img) => !img.complete)
      .map(
        (img) =>
          new Promise((resolve) => {
            img.onload = img.onerror = resolve;
          })
      )
  ).then(() => {
    // Oculta el spinner cuando todas las imágenes y traducciones estén cargadas
    hideSpinner();
  });
});
