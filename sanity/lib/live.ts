/**
 * Fetch helpers de Sanity.
 * `defineLive` / Live Content API no están disponibles en next-sanity@11;
 * usamos el client CDN estándar. Si se actualiza next-sanity a una versión
 * con Live API, se puede volver a defineLive aquí.
 */
import { client } from "./client";

type SanityFetchParams = {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
};

export async function sanityFetch<T = unknown>({
  query,
  params = {},
  tags,
}: SanityFetchParams): Promise<T> {
  return client.fetch<T>(query, params, {
    next: tags?.length ? { tags } : undefined,
  });
}

/** Placeholder: sin Live Content API en esta versión de next-sanity. */
export function SanityLive() {
  return null;
}
