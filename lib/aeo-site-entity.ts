import { urlFor } from "@/lib/sanity";

/** Identificadores estables (@id) para enlazar entidades entre JSON-LD y AEO. */
export function sitePersonId(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}#person`;
}

export function siteWebsiteId(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}#website`;
}

export function profileImageUrl(bio: { profileImage?: unknown } | null): string | undefined {
  if (!bio?.profileImage) return undefined;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- asset Sanity
    return urlFor(bio.profileImage as any).width(800).height(800).fit("crop").url();

  } catch {
    return undefined;
  }
}

export function personDescriptionFromContent(
  locale: string,
  siteDescription: string,
  firstBioParagraph?: string,
): string {
  const fromBio = firstBioParagraph?.trim();
  if (fromBio) {
    return fromBio.length > 560 ? `${fromBio.slice(0, 557)}…` : fromBio;
  }
  return siteDescription;
}

export function knowsAboutTopics(locale: string): string[] {
  return locale === "es"
    ? [
        "Fotoperiodismo",
        "Fotografía documental",
        "Reportaje visual",
        "Argentina",
        "Latinoamérica",
      ]
    : [
        "Photojournalism",
        "Documentary photography",
        "Visual reportage",
        "Argentina",
        "Latin America",
      ];
}
