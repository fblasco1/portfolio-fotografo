import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/app/[locale]/components/main-layout";
import { I18nProviderClient } from "@/locales/client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cristian Pirovano",
  description: "Portfolio of Cristian Pirovano, photojournalist",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({
  children,
  params,
}: Readonly<Props>) {
  const { locale } = await params;
  
  return (
    <html className="h-full w-full overflow-x-hidden" lang={locale}>
      <body className={`${inter.className} h-full`}>
        <I18nProviderClient locale={locale} fallback={<div>Loading...</div>}>
          <MainLayout locale={locale}>{children}</MainLayout>
        </I18nProviderClient>
      </body>
    </html>
  );
}
