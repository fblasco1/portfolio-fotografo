"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useI18n } from "@/locales/client"
import LanguageSwitcher from "./LanguageSwitcher"
import { Menu } from "lucide-react"

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
  const [isTransparent, setIsTransparent] = useState(true)
  const t = useI18n()

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsTransparent(scrollPosition < 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 header-transition ${isTransparent ? "header-solid" : "header-shadow"}`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-white">
            <div>
              <h1 className="text-2xl font-bold tracking-wider">CRISTIAN PIROVANO</h1>
              <p className="text-sm uppercase tracking-wide">{t("nav.photographer")}</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="text-white hover:text-gray-300 uppercase tracking-wide">
                {t(item.name)}
              </Link>
            ))}
            <LanguageSwitcher />
          </div>

          <button onClick={() => toggleMenu()} className="md:hidden text-white" aria-label="Toggle menu">
            <Menu size={24} />
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-gray-300 uppercase tracking-wide"
                  onClick={() => toggleMenu()}
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