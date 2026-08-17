import type { NextRequest } from "next/server";

/**
 * IP del cliente en Vercel/Node (NextRequest no expone `.ip` en tipos actuales).
 */
export function getClientIp(request: NextRequest, fallback = "127.0.0.1"): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return fallback;
}
