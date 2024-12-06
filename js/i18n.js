document.addEventListener("DOMContentLoaded", () => {
  const i18next = window.i18next;
  const i18nextHttpBackend = window.i18nextHttpBackend;
  const i18nextBrowserLanguageDetector = window.i18nextBrowserLanguageDetector;

  i18next
    .use(i18nextHttpBackend)
    .use(i18nextBrowserLanguageDetector)
    .init(
      {
        fallbackLng: "en",
        debug: false, // Cambiado a false para producción
        backend: {
          loadPath: "/locales/{{lng}}.json",
        },
      },
      function (err, t) {
        if (err) return console.error("Error al cargar las traducciones:", err);
        updateContent();
        document.body.classList.remove("i18n-loading");
        document.body.classList.add("i18n-loaded");
      }
    );

  function updateContent() {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      element.textContent = i18next.t(key);
    });
  }

  i18next.on("languageChanged", updateContent);

  window.changeLanguage = function (lng) {
    i18next.changeLanguage(lng, (err) => {
      if (err) return console.error("Error al cambiar el idioma:", err);
    });
  };
});
