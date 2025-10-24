"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useI18n } from "@/locales/client";
import LanguageSwitcher from "./LanguageSwitcher";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

interface HeaderProps {
  siteTitle?: string;
}

export default function Header({ siteTitle }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useI18n();
  const pathname = usePathname();

  // Procesar el título para separar título principal y subtítulo
  const processTitle = (title: string) => {
    if (!title) return { mainTitle: "CRISTIAN PIROVANO", subtitle: "FOTOPERIODISTA" };
    
    const parts = title.split(" - ");
    if (parts.length === 2) {
      return {
        mainTitle: parts[0].toUpperCase(),
        subtitle: parts[1].toLowerCase()
      };
    }
    
    // Si no hay guión, usar todo como título principal
    return {
      mainTitle: title.toUpperCase(),
      subtitle: ""
    };
  };

  const { mainTitle, subtitle } = processTitle(siteTitle || "CRISTIAN PIROVANO - FOTOPERIODISTA");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { key: "home", href: "/" },
    { key: "shop", href: "/shop" },
    { key: "gallery", href: "/gallery" },
    { key: "bio", href: "/bio" },
    { key: "documentaries", href: "/documentaries" },
    { key: "book", href: "/book" },
    { key: "contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/es" || pathname === "/en";
    }
    return pathname.includes(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm"
          : "bg-white/95 backdrop-blur-sm shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-start">
            <span className="text-xl font-bold text-gray-900 tracking-wider">
              {mainTitle}
            </span>
            {subtitle && (
              <span className="text-sm font-normal text-gray-600 -mt-1">
                {subtitle}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-gray-600 ${
                  isActive(item.href)
                    ? "text-gray-900"
                    : "text-gray-700"
                }`}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>

          {/* Desktop Language Switcher */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white">
                <SheetHeader>
                  <SheetTitle className="text-left text-lg font-bold text-gray-900">
                    {mainTitle}
                  </SheetTitle>
                  {subtitle && (
                    <SheetDescription className="text-left text-sm text-gray-600">
                      {subtitle}
                    </SheetDescription>
                  )}
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`text-lg font-medium transition-colors hover:text-gray-600 ${
                        isActive(item.href)
                          ? "text-gray-900"
                          : "text-gray-700"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  ))}
                  <div className="pt-4 border-t">
                    <LanguageSwitcher />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
