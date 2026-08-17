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

function getAdminEmail(): string {
  return (
    process.env.ADMIN_EMAIL ||
    process.env.PHOTOGRAPHER_EMAIL ||
    "pirovanofotografia@gmail.com"
  );
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

  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "Ventas <noreply@tu-dominio.com>";
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
