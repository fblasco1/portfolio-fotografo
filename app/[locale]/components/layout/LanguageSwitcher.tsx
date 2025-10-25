import { useChangeLocale, useCurrentLocale } from "@/locales/client"

const locales = ['en', 'es'];

export default function LanguageSwitcher() {
  const changeLocale = useChangeLocale()
  const currentLocale = useCurrentLocale()

  return (
    <div className="flex space-x-2">
      {locales.map((locale, i) => (
        <button
          key={locale}
          onClick={() => changeLocale(locale)}
          className={`px-2 py-1 text-sm rounded transition-colors ${
            currentLocale === locale
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
