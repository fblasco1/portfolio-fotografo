import type { MetadataRoute } from "next";
import { getSiteUrl, localePath } from "@/lib/site-url";

const LOCALES = ["en", "es"] as const;

const PUBLIC_PATHS = [
  "/",
  "/gallery",
  "/bio",
  "/documentaries",
  "/book",
  "/contact",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of PUBLIC_PATHS) {
    for (const locale of LOCALES) {
      const loc = `${base}${localePath(locale, path)}`;
      const alternates: Record<string, string> = {};
      for (const alt of LOCALES) {
        alternates[alt] = `${base}${localePath(alt, path)}`;
      }
      entries.push({
        url: loc,
        lastModified: new Date(),
        changeFrequency: path === "/" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : 0.8,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
