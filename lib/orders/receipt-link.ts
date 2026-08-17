import { getSiteUrl, localePath } from "@/lib/site-url";

export function buildReceiptUploadUrl(
  orderId: string,
  token: string,
  locale: string = "es"
): string {
  const receiptPath = localePath(
    locale,
    `/orders/${orderId}/receipt?token=${encodeURIComponent(token)}`
  );
  return `${getSiteUrl()}${receiptPath}`;
}
