/**
 * Tests del flujo de transferencia bancaria manual (Next.js serverless).
 * Ejecutar: npm run test:transfer
 */

import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";

import {
  getMerchantBankDetails,
  validateTransferCheckoutInput,
} from "../lib/orders/bank-details";
import {
  ALLOWED_RECEIPT_MIME_TYPES,
  MAX_RECEIPT_BYTES,
  canUploadTransferReceipt,
  getTransferExpiryHours,
  isTransferOrderStale,
  isTransferPaymentMethod,
  validateReceiptFile,
} from "../lib/orders/transfer-rules";

describe("transfer-rules: validación de comprobante", () => {
  it("rechaza order_id vacío", () => {
    const result = validateReceiptFile({
      orderId: "   ",
      file: { size: 100, type: "image/jpeg", name: "a.jpg" },
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 400);
  });

  it("rechaza archivo ausente", () => {
    const result = validateReceiptFile({ orderId: "ord-1", file: null });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 400);
  });

  it("rechaza archivo vacío", () => {
    const result = validateReceiptFile({
      orderId: "ord-1",
      file: { size: 0, type: "image/jpeg" },
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 400);
  });

  it("rechaza archivos > 3 MB con 413", () => {
    const result = validateReceiptFile({
      orderId: "ord-1",
      file: { size: MAX_RECEIPT_BYTES + 1, type: "image/jpeg", name: "big.jpg" },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 413);
      assert.equal(result.extra?.maxBytes, MAX_RECEIPT_BYTES);
    }
  });

  it("acepta archivo justo en el límite de 3 MB", () => {
    const result = validateReceiptFile({
      orderId: "ord-1",
      file: { size: MAX_RECEIPT_BYTES, type: "application/pdf", name: "ok.pdf" },
    });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.mimeType, "application/pdf");
  });

  it("rechaza mime no permitido con 415", () => {
    const result = validateReceiptFile({
      orderId: "ord-1",
      file: { size: 100, type: "text/plain", name: "x.txt" },
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 415);
  });

  for (const mime of ALLOWED_RECEIPT_MIME_TYPES) {
    it(`acepta mime ${mime}`, () => {
      const result = validateReceiptFile({
        orderId: "ord-1",
        file: { size: 1024, type: mime, name: "receipt" },
      });
      assert.equal(result.ok, true);
    });
  }
});

describe("transfer-rules: estados y expiración 48h", () => {
  it("permite subir solo PENDING_TRANSFER o pending", () => {
    assert.equal(canUploadTransferReceipt("PENDING_TRANSFER"), true);
    assert.equal(canUploadTransferReceipt("pending"), true);
    assert.equal(canUploadTransferReceipt("AWAITING_VERIFICATION"), false);
    assert.equal(canUploadTransferReceipt("PAID"), false);
    assert.equal(canUploadTransferReceipt("EXPIRED"), false);
    assert.equal(canUploadTransferReceipt("approved"), false);
  });

  it("considera TRANSFER o payment_method vacío como transferencia", () => {
    assert.equal(isTransferPaymentMethod("TRANSFER"), true);
    assert.equal(isTransferPaymentMethod(null), true);
    assert.equal(isTransferPaymentMethod(undefined), true);
    assert.equal(isTransferPaymentMethod("MERCADOPAGO"), false);
  });

  it("marca stale si created_at supera 48h", () => {
    const now = Date.parse("2026-08-16T12:00:00.000Z");
    const fresh = new Date(now - 47 * 60 * 60 * 1000).toISOString();
    const stale = new Date(now - 49 * 60 * 60 * 1000).toISOString();

    assert.equal(isTransferOrderStale(fresh, now, 48), false);
    assert.equal(isTransferOrderStale(stale, now, 48), true);
  });

  it("no marca stale en el límite exacto de 48h", () => {
    const now = Date.parse("2026-08-16T12:00:00.000Z");
    const exact = new Date(now - 48 * 60 * 60 * 1000).toISOString();
    assert.equal(isTransferOrderStale(exact, now, 48), false);
  });

  it("ignora created_at inválido", () => {
    assert.equal(isTransferOrderStale("no-es-fecha", Date.now(), 48), false);
  });
});

describe("transfer-rules: TRANSFER_EXPIRY_HOURS env", () => {
  let previous: string | undefined;

  before(() => {
    previous = process.env.TRANSFER_EXPIRY_HOURS;
  });

  after(() => {
    if (previous === undefined) delete process.env.TRANSFER_EXPIRY_HOURS;
    else process.env.TRANSFER_EXPIRY_HOURS = previous;
  });

  it("usa 48 por defecto", () => {
    delete process.env.TRANSFER_EXPIRY_HOURS;
    assert.equal(getTransferExpiryHours(), 48);
  });

  it("respeta override de entorno", () => {
    process.env.TRANSFER_EXPIRY_HOURS = "24";
    assert.equal(getTransferExpiryHours(), 24);
  });

  it("cae a 48 si el valor es inválido", () => {
    process.env.TRANSFER_EXPIRY_HOURS = "abc";
    assert.equal(getTransferExpiryHours(), 48);
  });
});

describe("cron auth (expire-pending-transfers)", () => {
  function isAuthorized(opts: {
    cronSecret?: string;
    nodeEnv?: string;
    authorization?: string | null;
  }): boolean {
    const secret = opts.cronSecret;
    if (!secret) {
      return opts.nodeEnv !== "production";
    }
    return opts.authorization === `Bearer ${secret}`;
  }

  it("en producción exige CRON_SECRET", () => {
    assert.equal(
      isAuthorized({
        cronSecret: "secret-xyz",
        nodeEnv: "production",
        authorization: null,
      }),
      false
    );
    assert.equal(
      isAuthorized({
        cronSecret: "secret-xyz",
        nodeEnv: "production",
        authorization: "Bearer secret-xyz",
      }),
      true
    );
  });

  it("en desarrollo permite sin secret", () => {
    assert.equal(
      isAuthorized({
        cronSecret: undefined,
        nodeEnv: "development",
        authorization: null,
      }),
      true
    );
  });

  it("en producción sin secret deniega", () => {
    assert.equal(
      isAuthorized({
        cronSecret: undefined,
        nodeEnv: "production",
        authorization: null,
      }),
      false
    );
  });
});

describe("flujo feliz (contrato de respuesta)", () => {
  it("define transición PENDING_TRANSFER → AWAITING_VERIFICATION tras email OK", () => {
    const initial = "PENDING_TRANSFER";
    const afterEmailOk = "AWAITING_VERIFICATION";
    assert.equal(canUploadTransferReceipt(initial), true);
    assert.equal(canUploadTransferReceipt(afterEmailOk), false);
  });

  it("define transición PENDING_TRANSFER → EXPIRED tras 48h sin comprobante", () => {
    const now = Date.now();
    const createdAt = new Date(now - 50 * 60 * 60 * 1000).toISOString();
    assert.equal(isTransferOrderStale(createdAt, now, 48), true);
    assert.equal(canUploadTransferReceipt("EXPIRED"), false);
  });
});

describe("checkout transferencia: datos bancarios y payload", () => {
  it("valida email, monto e ítems", () => {
    assert.equal(
      validateTransferCheckoutInput({
        email: "bad",
        totalAmount: 100,
        items: [{ title: "Foto", quantity: 1, price: 100 }],
      }).ok,
      false
    );
    assert.equal(
      validateTransferCheckoutInput({
        email: "ok@test.com",
        totalAmount: 0,
        items: [{ title: "Foto", quantity: 1, price: 0 }],
      }).ok,
      false
    );
    assert.equal(
      validateTransferCheckoutInput({
        email: "ok@test.com",
        totalAmount: 1500,
        items: [{ title: "Foto", quantity: 1, price: 1500 }],
      }).ok,
      true
    );
  });

  it("exige CBU, alias y titular", () => {
    const prev = {
      cbu: process.env.MERCHANT_CBU,
      alias: process.env.MERCHANT_ALIAS,
      holder: process.env.MERCHANT_BANK_HOLDER,
    };
    delete process.env.MERCHANT_CBU;
    delete process.env.MERCHANT_ALIAS;
    delete process.env.MERCHANT_BANK_HOLDER;
    assert.equal(getMerchantBankDetails(), null);

    process.env.MERCHANT_CBU = "0000003100010000000001";
    process.env.MERCHANT_ALIAS = "PIROVANO.FOTO.MP";
    process.env.MERCHANT_BANK_HOLDER = "Cristian Pirovano";
    const bank = getMerchantBankDetails();
    assert.ok(bank);
    assert.equal(bank?.alias, "PIROVANO.FOTO.MP");

    if (prev.cbu === undefined) delete process.env.MERCHANT_CBU;
    else process.env.MERCHANT_CBU = prev.cbu;
    if (prev.alias === undefined) delete process.env.MERCHANT_ALIAS;
    else process.env.MERCHANT_ALIAS = prev.alias;
    if (prev.holder === undefined) delete process.env.MERCHANT_BANK_HOLDER;
    else process.env.MERCHANT_BANK_HOLDER = prev.holder;
  });
});
