const STORAGE_KEY = "portfolio_book_checkout_v1";

export type BookCheckoutSession = {
  bookId: string;
  title: string;
  subtitle: string;
  image: string;
  unitPriceLocal: number;
  quantity: number;
};

export function saveBookCheckoutSession(data: BookCheckoutSession): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function readBookCheckoutSession(): BookCheckoutSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BookCheckoutSession;
    if (
      !parsed ||
      typeof parsed.bookId !== "string" ||
      typeof parsed.title !== "string" ||
      typeof parsed.unitPriceLocal !== "number" ||
      parsed.unitPriceLocal <= 0
    ) {
      return null;
    }
    return {
      bookId: parsed.bookId,
      title: parsed.title,
      subtitle: typeof parsed.subtitle === "string" ? parsed.subtitle : "",
      image: typeof parsed.image === "string" ? parsed.image : "",
      unitPriceLocal: parsed.unitPriceLocal,
      quantity: typeof parsed.quantity === "number" && parsed.quantity > 0 ? parsed.quantity : 1,
    };
  } catch {
    return null;
  }
}

export function clearBookCheckoutSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
