import { useChangeLocale, useCurrentLocale } from "@/locales/client"

const locales = ['en', 'es'];

interface LanguageSwitcherProps {
  variant?: 'default' | 'transparent';
}

export default function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const changeLocale = useChangeLocale()
  const currentLocale = useCurrentLocale()

  const isTransparent = variant === 'transparent';

  return (
    <div className="flex space-x-2">
      {locales.map((locale, i) => (
        <button
          key={locale}
          onClick={() => changeLocale(locale as 'en' | 'es')}
          className={`px-2 py-1 text-sm rounded transition-colors ${
            isTransparent
              ? currentLocale === locale
                ? "bg-white/20 text-white"
                : "text-white/80 hover:text-white hover:bg-white/10"
              : currentLocale === locale
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
