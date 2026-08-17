/**
 * Datos bancarios del comercio (solo servidor).
 * Configurar MERCHANT_CBU, MERCHANT_ALIAS, MERCHANT_BANK_HOLDER en Vercel.
 */

export type MerchantBankDetails = {
  cbu: string;
  alias: string;
  holder: string;
};

export function getMerchantBankDetails(): MerchantBankDetails | null {
  const cbu = (process.env.MERCHANT_CBU || "").trim();
  const alias = (process.env.MERCHANT_ALIAS || "").trim();
  const holder = (process.env.MERCHANT_BANK_HOLDER || "").trim();

  if (!cbu || !alias || !holder) return null;
  return { cbu, alias, holder };
}

export type TransferCheckoutInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  totalAmount: number;
  items: Array<{ title: string; quantity: number; price: number }>;
};

export function validateTransferCheckoutInput(
  input: TransferCheckoutInput
): { ok: true } | { ok: false; error: string } {
  const email = input.email?.trim() ?? "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Email del cliente inválido." };
  }
  if (!Number.isFinite(input.totalAmount) || input.totalAmount <= 0) {
    return { ok: false, error: "El monto total debe ser mayor a 0." };
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { ok: false, error: "La orden no tiene ítems." };
  }
  return { ok: true };
}
