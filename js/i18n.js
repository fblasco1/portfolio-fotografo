const i18next = window.i18next;
const i18nextHttpBackend = window.i18nextHttpBackend;
const i18nextBrowserLanguageDetector = window.i18nextBrowserLanguageDetector;

i18next
  .use(i18nextHttpBackend)
  .use(i18nextBrowserLanguageDetector)
  .init({
    fallbackLng: 'en',
    debug: true,
    backend: {
      loadPath: '/locales/{{lng}}.json'
    }
  });

function updateContent() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = i18next.t(key);
  });
}

i18next.on('languageChanged', () => {
  updateContent();
});

document.addEventListener('DOMContentLoaded', () => {
  updateContent();
});

function changeLanguage(lng) {
  i18next.changeLanguage(lng);
}

// Make changeLanguage globally accessible
window.changeLanguage = changeLanguage;