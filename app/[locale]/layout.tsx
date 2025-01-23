import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import MainLayout from "@/app/[locale]/components/main-layout";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cristian Pirovano - Photographer",
  description: "Portfolio of Cristian Pirovano, professional photographer",
}

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

type Props = {
  children: React.ReactNode;
  params: {locale: string};
}

export default function RootLayout({
  children,
  params: { locale },
}: Readonly <Props>) {
  return (
    <html className="h-full" lang={ locale }>
      <body className={`${inter.className} h-full`}>
        <MainLayout locale={locale}>{children}</MainLayout>
      </body>
    </html>
  )
}

