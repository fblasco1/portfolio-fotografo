import { useChangeLocale, useCurrentLocale } from "@/locales/client"
import { locales } from "@/constants/locales"

export default function LanguageSwitcher() {
  const changeLocale = useChangeLocale()
  const currentLocale = useCurrentLocale()

  return (
    <div className="flex space-x-2">
      {locales.map((locale, i) => (
        <button
          key={i}
          onClick={() => changeLocale(locale as any)}
          className={`px-2 py-1 text-sm font-medium rounded ${
            currentLocale === locale ? "bg-white text-slate-700" : "bg-slate-700 text-white hover:bg-slate-600"
          }`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  )
}