/**
 * Envío de comprobante de transferencia por email (sin Storage).
 * El archivo viaja solo como adjunto en memoria vía Resend.
 */

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type TransferReceiptAttachment = {
  filename: string;
  content: Buffer;
  mimeType: string;
};

export type SendTransferReceiptEmailParams = {
  orderId: string;
  totalAmount?: number | null;
  currency?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  attachment: TransferReceiptAttachment;
};

export type SendTransferReceiptEmailResult =
  | { ok: true; emailId: string | null }
  | { ok: false; error: string };

export type MerchantBankEmailDetails = {
  cbu: string;
  alias: string;
  holder: string;
};

export type SendCustomerTransferInstructionsParams = {
  toEmail: string;
  customerName?: string | null;
  orderId: string;
  totalAmount: number;
  currency?: string;
  bank: MerchantBankEmailDetails;
  receiptUrl: string;
  expiryHours: number;
  locale?: string;
};

function getAdminEmail(): string {
  return (
    process.env.ADMIN_EMAIL ||
    process.env.PHOTOGRAPHER_EMAIL ||
    "pirovanofotografia@gmail.com"
  );
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "Ventas <noreply@tu-dominio.com>";
}

/**
 * Envía el comprobante al administrador como adjunto.
 * Resend acepta `content` como Buffer (Node.js runtime) o base64.
 */
export async function sendTransferReceiptEmail(
  params: SendTransferReceiptEmailParams
): Promise<SendTransferReceiptEmailResult> {
  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY no configurada" };
  }

  const fromEmail = getFromEmail();
  const adminEmail = getAdminEmail();
  const amountLabel =
    params.totalAmount != null
      ? `${params.currency || "ARS"} ${Number(params.totalAmount).toLocaleString("es-AR")}`
      : "No informado";

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject: `Nuevo comprobante de pago - Orden #${params.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1c1917;">Nuevo comprobante de transferencia</h2>
          <p>El cliente subió un comprobante de pago. La orden requiere <strong>verificación manual</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;"><strong>Orden</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;">${params.orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;"><strong>Monto</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;">${amountLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;"><strong>Cliente</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;">
                ${params.customerName || "—"} ${params.customerEmail ? `(${params.customerEmail})` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Archivo</strong></td>
              <td style="padding: 8px;">${params.attachment.filename} (${params.attachment.mimeType})</td>
            </tr>
          </table>
          <p style="color: #57534e;">Revisá el adjunto y marcá la orden como PAID desde el panel admin si corresponde.</p>
        </div>
      `,
      text: [
        `Nuevo comprobante de transferencia`,
        `Orden: ${params.orderId}`,
        `Monto: ${amountLabel}`,
        `Cliente: ${params.customerName || "—"} ${params.customerEmail || ""}`,
        `Archivo: ${params.attachment.filename}`,
        ``,
        `La orden requiere verificación manual.`,
      ].join("\n"),
      attachments: [
        {
          filename: params.attachment.filename,
          content: params.attachment.content,
          contentType: params.attachment.mimeType,
        },
      ],
    });

    if (error) {
      console.error("❌ Error Resend (comprobante transferencia):", error);
      return { ok: false, error: error.message || "Error al enviar el email" };
    }

    return { ok: true, emailId: data?.id ?? null };
  } catch (err) {
    console.error("❌ Error crítico enviando comprobante:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error desconocido al enviar email",
    };
  }
}

/**
 * Email al cliente al crear la orden: datos bancarios + link para subir el comprobante más tarde.
 */
export async function sendCustomerTransferInstructionsEmail(
  params: SendCustomerTransferInstructionsParams
): Promise<SendTransferReceiptEmailResult> {
  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY no configurada" };
  }

  const fromEmail = getFromEmail();
  const amountLabel = `${params.currency || "ARS"} ${Number(params.totalAmount).toLocaleString("es-AR")}`;
  const greeting = params.customerName?.trim()
    ? `Hola ${params.customerName.trim()},`
    : "Hola,";
  const es = params.locale !== "en";

  const subject = es
    ? `Tu orden de transferencia #${params.orderId.slice(0, 8)}`
    : `Your transfer order #${params.orderId.slice(0, 8)}`;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [params.toEmail],
      subject,
      html: es
        ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1c1917;">Orden creada — transferencia bancaria</h2>
          <p>${greeting}</p>
          <p>Generamos tu orden. Podés transferir ahora o más tarde (por ejemplo a la tarde) y subir el comprobante desde este mismo email.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;"><strong>Orden</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4; font-family: monospace;">${params.orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;"><strong>Monto exacto</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;">${amountLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;"><strong>CBU</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4; font-family: monospace;">${params.bank.cbu}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;"><strong>Alias</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4; font-family: monospace;">${params.bank.alias}</td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Titular</strong></td>
              <td style="padding: 8px;">${params.bank.holder}</td>
            </tr>
          </table>
          <p style="margin: 24px 0;">
            <a href="${params.receiptUrl}"
               style="display: inline-block; background: #1c1917; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Subir comprobante de pago
            </a>
          </p>
          <p style="color: #57534e; font-size: 14px;">
            Tenés <strong>${params.expiryHours} horas</strong> para transferir y subir el comprobante.
            Si el botón no funciona, copiá este enlace:<br/>
            <a href="${params.receiptUrl}">${params.receiptUrl}</a>
          </p>
        </div>
      `
        : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1c1917;">Order created — bank transfer</h2>
          <p>${greeting}</p>
          <p>Your order is ready. You can transfer now or later and upload the receipt from this email.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;"><strong>Order</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4; font-family: monospace;">${params.orderId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;"><strong>Exact amount</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;">${amountLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;"><strong>CBU</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4; font-family: monospace;">${params.bank.cbu}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;"><strong>Alias</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e7e5e4; font-family: monospace;">${params.bank.alias}</td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Account holder</strong></td>
              <td style="padding: 8px;">${params.bank.holder}</td>
            </tr>
          </table>
          <p style="margin: 24px 0;">
            <a href="${params.receiptUrl}"
               style="display: inline-block; background: #1c1917; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Upload payment receipt
            </a>
          </p>
          <p style="color: #57534e; font-size: 14px;">
            You have <strong>${params.expiryHours} hours</strong> to transfer and upload the receipt.
            If the button does not work, copy this link:<br/>
            <a href="${params.receiptUrl}">${params.receiptUrl}</a>
          </p>
        </div>
      `,
      text: [
        es ? "Orden creada — transferencia bancaria" : "Order created — bank transfer",
        greeting,
        `Orden: ${params.orderId}`,
        `Monto: ${amountLabel}`,
        `CBU: ${params.bank.cbu}`,
        `Alias: ${params.bank.alias}`,
        `Titular: ${params.bank.holder}`,
        ``,
        es
          ? `Subí el comprobante acá: ${params.receiptUrl}`
          : `Upload your receipt here: ${params.receiptUrl}`,
        es
          ? `Tenés ${params.expiryHours} horas.`
          : `You have ${params.expiryHours} hours.`,
      ].join("\n"),
    });

    if (error) {
      console.error("❌ Error Resend (instrucciones transferencia cliente):", error);
      return { ok: false, error: error.message || "Error al enviar el email" };
    }

    return { ok: true, emailId: data?.id ?? null };
  } catch (err) {
    console.error("❌ Error crítico enviando instrucciones al cliente:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error desconocido al enviar email",
    };
  }
}
