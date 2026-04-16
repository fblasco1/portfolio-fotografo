/**
 * URL pública del sitio (canonical, OG, sitemap).
 * En producción define NEXT_PUBLIC_SITE_URL (p. ej. https://tudominio.com).
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

/** Ruta con prefijo de idioma (en sin prefijo con rewriteDefault, es con /es). */
export function localePath(locale: string, pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (locale === "es") {
    return path === "/" ? "/es" : `/es${path}`;
  }
  return path === "/" ? "/" : path;
}
