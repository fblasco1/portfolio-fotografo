"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useI18n } from "@/locales/client";
import LanguageSwitcher from "./LanguageSwitcher";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const navItems = [
  { name: "nav.home", href: "/" },
  { name: "nav.bio", href: "/bio" },
  { name: "nav.gallery", href: "/gallery" },
  { name: "nav.shop", href: "/shop" },
  { name: "nav.book", href: "/book" },
  { name: "nav.contact", href: "/contact" },
];

export default function Header() {
  const t = useI18n();
  const pathname = usePathname();
  const isHomePage = pathname === "/" || pathname === "/es";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 1024);

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${
        isMobile
          ? "bg-white shadow-md"
          : isHomePage
          ? "bg-transparent"
          : "bg-white shadow-md"
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className={isMobile || !isHomePage ? "text-black" : "text-white"}
          >
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-wider">
                CRISTIAN PIROVANO
              </h1>
              <p className="text-xs sm:text-sm uppercase tracking-wide">
                {t("nav.photographer")}
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`uppercase tracking-wide text-sm font-sans ${
                  isMobile || !isHomePage
                    ? "text-black hover:text-gray-600"
                    : "text-white hover:text-gray-300"
                }`}
              >
                {t(item.name)}
              </Link>
            ))}
            <LanguageSwitcher />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`lg:hidden text-black`}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col space-y-4 mt-4 font-sans">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="uppercase tracking-wide text-sm text-white"
                  >
                    {t(item.name)}
                  </Link>
                ))}
                <div className="pt-2">
                  <LanguageSwitcher />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
