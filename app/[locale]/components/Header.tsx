"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useI18n } from "@/locales/client"
import LanguageSwitcher from "./LanguageSwitcher"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"

const navItems = [
  { name: "nav.home", href: "/" },
  { name: "nav.bio", href: "/bio" },
  { name: "nav.gallery", href: "/gallery" },
  { name: "nav.shop", href: "/shop" },
  { name: "nav.book", href: "/book" },
  { name: "nav.contact", href: "/contact" },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const t = useI18n()
  const pathname = usePathname()
  const isHomePage = pathname === "/" || pathname === "/es"

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const headerClass = isHomePage
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black bg-opacity-80 backdrop-blur-md" : "bg-transparent"
      }`
    : "fixed top-0 left-0 right-0 z-50 bg-white shadow-md"

  const textClass = isHomePage ? "text-white" : "text-black"

  const linkClass = isHomePage ? "text-white hover:text-gray-300" : "text-black hover:text-gray-600"

  return (
    <header className={headerClass}>
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className={textClass}>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-wider">CRISTIAN PIROVANO</h1>
              <p className="text-xs sm:text-sm uppercase tracking-wide">{t("nav.photographer")}</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className={`${linkClass} uppercase tracking-wide text-sm`}>
                {t(item.name)}
              </Link>
            ))}
            <LanguageSwitcher />
          </div>

          <button onClick={toggleMenu} className={`lg:hidden ${textClass} focus:outline-none`} aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${linkClass} uppercase tracking-wide text-sm`}
                  onClick={toggleMenu}
                >
                  {t(item.name)}
                </Link>
              ))}
              <div className="pt-2">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

