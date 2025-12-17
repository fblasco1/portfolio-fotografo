import type { Metadata } from "next";
import { cache } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "./components/layout/main-layout";
import { I18nProviderClient } from "@/locales/client";
import { AppProviders } from "@/contexts/AppProviders";
import { client, urlFor } from "@/lib/sanity";
import { settingsQuery, bioQuery } from "@/lib/queries";

const inter = Inter({ subsets: ["latin"] });

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const fetchSiteData = cache(async () => {
  const [settings, bio] = await Promise.all([
    client.fetch(settingsQuery),
    client.fetch(bioQuery),
  ]);
  return { settings, bio };
});

function getFaviconUrl(settings: any, bio: any): string | undefined {
  if (settings?.favicon?.asset?.url) {
    return settings.favicon.asset.url;
  }

  if (bio?.profileImage) {
    try {
      return urlFor(bio.profileImage).width(512).height(512).fit("crop").url();
    } catch (error) {
      console.warn("Error generating fallback favicon URL:", error);
    }
  }

  return undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { settings, bio } = await fetchSiteData();

  const localizedContent = settings?.content?.[locale as keyof typeof settings.content];
  const defaultTitle = "Cristian Pirovano";
  const defaultDescription = "Portfolio de Cristian Pirovano, fotoperiodista.";

  const faviconUrl = getFaviconUrl(settings, bio);

  return {
    title: localizedContent?.siteTitle || defaultTitle,
    description: localizedContent?.siteDescription || defaultDescription,
    icons: faviconUrl
      ? {
          icon: [
            { url: faviconUrl },
            { url: faviconUrl, rel: "shortcut icon" },
          ],
          apple: [{ url: faviconUrl }],
        }
      : undefined,
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<Props>) {
  const { locale } = await params;

  const { settings, bio } = await fetchSiteData();
  const siteTitle = settings?.content?.[locale as keyof typeof settings.content]?.siteTitle;
  const faviconUrl = getFaviconUrl(settings, bio);
  const socialMedia = settings?.socialMedia || {};

  return (
    <html className="h-full w-full overflow-x-hidden" lang={locale}>
      <head>
        {faviconUrl && (
          <>
            <link rel="icon" href={faviconUrl} />
            <link rel="shortcut icon" href={faviconUrl} />
            <link rel="apple-touch-icon" href={faviconUrl} />
          </>
        )}
      </head>
      <body className={`${inter.className} h-full`}>
        <AppProviders>
          <I18nProviderClient locale={locale} fallback={<div>Loading...</div>}>
            <MainLayout locale={locale} siteTitle={siteTitle} socialMedia={socialMedia}>{children}</MainLayout>
          </I18nProviderClient>
        </AppProviders>
      </body>
    </html>
  );
}
