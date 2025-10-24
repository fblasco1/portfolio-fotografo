import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "./components/layout/main-layout";
import { I18nProviderClient } from "@/locales/client";
import { AppProviders } from "@/contexts/AppProviders";
import { client } from "@/lib/sanity";
import { settingsQuery } from "@/lib/queries";

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
  
  // Obtener datos de settings desde Sanity
  const settings = await client.fetch(settingsQuery);
  const siteTitle = settings?.content?.[locale as keyof typeof settings.content]?.siteTitle;
  
  return (
    <html className="h-full w-full overflow-x-hidden" lang={locale}>
      <body className={`${inter.className} h-full`}>
        <AppProviders>
          <I18nProviderClient locale={locale} fallback={<div>Loading...</div>}>
            <MainLayout locale={locale} siteTitle={siteTitle}>{children}</MainLayout>
          </I18nProviderClient>
        </AppProviders>
      </body>
    </html>
  );
}
