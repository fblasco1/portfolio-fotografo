import type { Metadata } from "next";
import { cache } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "./components/layout/main-layout";
import { I18nProviderClient } from "@/locales/client";
import { AppProviders } from "@/contexts/AppProviders";
import { client, urlFor } from "@/lib/sanity";
import { settingsQuery, bioQuery } from "@/lib/queries";
import { getSiteUrl, localePath } from "@/lib/site-url";
import {
  knowsAboutTopics,
  personDescriptionFromContent,
  profileImageUrl,
  sitePersonId,
  siteWebsiteId,
} from "@/lib/aeo-site-entity";

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
  const siteTitle = localizedContent?.siteTitle || defaultTitle;
  const siteDescription = localizedContent?.siteDescription || defaultDescription;
  const baseUrl = getSiteUrl();

  const faviconUrl = getFaviconUrl(settings, bio);

  let ogImage: string | undefined;
  if (bio?.profileImage) {
    try {
      ogImage = urlFor(bio.profileImage).width(1200).height(630).fit("crop").url();
    } catch {
      ogImage = undefined;
    }
  }

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle.split(" - ")[0]?.trim() || defaultTitle}`,
    },
    description: siteDescription,
    openGraph: {
      type: "website",
      locale: locale === "es" ? "es_AR" : "en_US",
      siteName: siteTitle.split(" - ")[0]?.trim() || defaultTitle,
      title: siteTitle,
      description: siteDescription,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: siteTitle }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: siteTitle,
      description: siteDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
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
  const baseUrl = getSiteUrl();
  const displayName = (siteTitle || "Cristian Pirovano").split(" - ")[0]?.trim() || "Cristian Pirovano";
  const sameAs = [
    socialMedia.instagram,
    socialMedia.facebook,
    socialMedia.twitter,
    socialMedia.linkedin,
    socialMedia.youtube,
    socialMedia.tiktok,
  ].filter((u): u is string => Boolean(u && typeof u === "string"));

  const localizedSettings =
    settings?.content?.[locale as keyof typeof settings.content] || settings?.content?.es;
  const siteDesc =
    localizedSettings?.siteDescription ||
    (locale === "es"
      ? "Portfolio de Cristian Pirovano, fotoperiodista."
      : "Portfolio of Cristian Pirovano, photojournalist.");
  const bioContent = bio?.content?.[locale as keyof typeof bio.content] || bio?.content?.es;
  const firstBioParagraph = bioContent?.paragraphs?.[0];
  const personDescription = personDescriptionFromContent(locale, siteDesc, firstBioParagraph);
  const personImageUrl = profileImageUrl(bio);
  const personId = sitePersonId(baseUrl);
  const websiteId = siteWebsiteId(baseUrl);

  const siteEntityGraphJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: displayName,
        description: personDescription,
        jobTitle: locale === "es" ? "Fotoperiodista" : "Photojournalist",
        ...(personImageUrl ? { image: personImageUrl } : {}),
        url: `${baseUrl}${localePath(locale, "/")}`,
        ...(sameAs.length > 0 ? { sameAs } : {}),
        knowsAbout: knowsAboutTopics(locale),
        knowsLanguage: ["es-AR", "en"],
        workLocation: {
          "@type": "Place",
          name: "Argentina",
          addressCountry: "AR",
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: displayName,
        description: siteDesc,
        url: baseUrl,
        inLanguage: locale === "es" ? ["es-AR", "es"] : ["en-US", "en"],
        publisher: { "@id": personId },
        about: { "@id": personId },
      },
    ],
  };

  return (
    <html className="h-full w-full overflow-x-hidden" lang={locale === "es" ? "es-AR" : "en"}>
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteEntityGraphJsonLd) }}
        />
        <AppProviders>
          <I18nProviderClient locale={locale} fallback={<div>Loading...</div>}>
            <MainLayout locale={locale} siteTitle={siteTitle} socialMedia={socialMedia}>{children}</MainLayout>
          </I18nProviderClient>
        </AppProviders>
      </body>
    </html>
  );
}
