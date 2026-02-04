import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface PaymentNotificationData {
  paymentId: string;
  status: string;
  statusDetail: string;
  transactionAmount: number;
  currency: string;
  paymentMethod: string;
  installments: number;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: {
    street_name?: string;
    street_number?: string;
    city?: string;
    zip_code?: string;
    country?: string;
  };
  products: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  orderId: string;
  dateCreated: string;
  dateApproved?: string;
}

/**
 * Servicio para enviar notificaciones por email relacionadas con pagos
 */
export class EmailNotificationService {
  private fromEmail = process.env.RESEND_FROM_EMAIL || "Ventas <noreply@tu-dominio.com>";
  private photographerEmail = process.env.PHOTOGRAPHER_EMAIL || "cristianpirovanoportfolio@gmail.com";

  /**
   * Envía notificación al fotógrafo sobre una nueva compra aprobada
   */
  async sendPhotographerNotification(data: PaymentNotificationData): Promise<boolean> {
    if (!resend) {
      console.warn('⚠️ RESEND_API_KEY no configurada, saltando envío de email al fotógrafo');
      return false;
    }
    
    try {
      const { data: result, error } = await resend.emails.send({
        from: this.fromEmail,
        to: [this.photographerEmail],
        subject: `🎉 Nueva Venta Aprobada - ${data.customerName || 'Cliente'} - ${data.currency} ${data.transactionAmount}`,
        html: this.generatePhotographerEmailHTML(data),
        text: this.generatePhotographerEmailText(data),
      });

      if (error) {
        console.error('❌ Error enviando email al fotógrafo:', error);
        return false;
      }

      console.log('✅ Email enviado al fotógrafo:', result?.id);
      return true;
    } catch (error) {
      console.error('❌ Error crítico enviando email al fotógrafo:', error);
      return false;
    }
  }

  /**
   * Envía confirmación de compra al cliente
   */
  async sendCustomerConfirmation(data: PaymentNotificationData): Promise<boolean> {
    if (!resend) {
      console.warn('⚠️ RESEND_API_KEY no configurada, saltando envío de email al cliente');
      return false;
    }
    
    try {
      const { data: result, error } = await resend.emails.send({
        from: this.fromEmail,
        to: [data.customerEmail],
        subject: `✅ Compra Confirmada - Portfolio Cristian Pirovano`,
        html: this.generateCustomerEmailHTML(data),
        text: this.generateCustomerEmailText(data),
      });

      if (error) {
        console.error('❌ Error enviando email al cliente:', error);
        return false;
      }

      console.log('✅ Email enviado al cliente:', result?.id);
      return true;
    } catch (error) {
      console.error('❌ Error crítico enviando email al cliente:', error);
      return false;
    }
  }

  /**
   * Genera el HTML del email para el fotógrafo
   */
  private generatePhotographerEmailHTML(data: PaymentNotificationData): string {
    const productsList = data.products
      .map(product => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${product.title}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${product.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${data.currency} ${product.price}</td>
        </tr>
      `).join('');

    const addressInfo = data.customerAddress ? `
      <h3 style="color: #333; margin-top: 20px;">📍 Dirección de Envío</h3>
      <p style="margin: 5px 0;">
        ${data.customerAddress.street_name} ${data.customerAddress.street_number}<br>
        ${data.customerAddress.city} ${data.customerAddress.zip_code}<br>
        ${data.customerAddress.country}
      </p>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nueva Venta Aprobada</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">🎉 ¡Nueva Venta Aprobada!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Portfolio Cristian Pirovano</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">💰 Detalles del Pago</h2>
          <p><strong>ID de Pago:</strong> ${data.paymentId}</p>
          <p><strong>ID de Orden:</strong> ${data.orderId}</p>
          <p><strong>Estado:</strong> <span style="color: #28a745; font-weight: bold;">${data.status.toUpperCase()}</span></p>
          <p><strong>Monto Total:</strong> <span style="font-size: 18px; font-weight: bold; color: #28a745;">${data.currency} ${data.transactionAmount}</span></p>
          <p><strong>Método de Pago:</strong> ${data.paymentMethod}</p>
          ${data.installments > 1 ? `<p><strong>Cuotas:</strong> ${data.installments}</p>` : ''}
          <p><strong>Fecha de Aprobación:</strong> ${new Date(data.dateApproved || data.dateCreated).toLocaleString('es-ES')}</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">👤 Información del Cliente</h2>
          <p><strong>Nombre:</strong> ${data.customerName || 'No proporcionado'}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.customerEmail}" style="color: #667eea;">${data.customerEmail}</a></p>
          ${data.customerPhone ? `<p><strong>Teléfono:</strong> ${data.customerPhone}</p>` : ''}
          ${addressInfo}
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">🛍️ Productos Comprados</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background: #e9ecef;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Producto</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Cantidad</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${productsList}
            </tbody>
          </table>
        </div>

        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
          <h3 style="color: #1976d2; margin-top: 0;">📋 Próximos Pasos</h3>
          <ol style="margin: 10px 0; padding-left: 20px;">
            <li>Contactar al cliente para coordinar el envío</li>
            <li>Preparar los productos según la orden</li>
            <li>Organizar el envío con la información de dirección proporcionada</li>
            <li>Confirmar la entrega con el cliente</li>
          </ol>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
          <p>Este email fue generado automáticamente por el sistema de pagos.</p>
          <p><strong>Cristian Pirovano</strong> - Sistema de Ventas Online</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el texto plano del email para el fotógrafo
   */
  private generatePhotographerEmailText(data: PaymentNotificationData): string {
    const productsList = data.products
      .map(product => `- ${product.title} (x${product.quantity}) - ${data.currency} ${product.price}`)
      .join('\n');

    const addressInfo = data.customerAddress ? `
DIRECCIÓN DE ENVÍO:
${data.customerAddress.street_name} ${data.customerAddress.street_number}
${data.customerAddress.city} ${data.customerAddress.zip_code}
${data.customerAddress.country}
` : '';

    return `
🎉 ¡NUEVA VENTA APROBADA! - Cristian Pirovano

💰 DETALLES DEL PAGO:
- ID de Pago: ${data.paymentId}
- ID de Orden: ${data.orderId}
- Estado: ${data.status.toUpperCase()}
- Monto Total: ${data.currency} ${data.transactionAmount}
- Método de Pago: ${data.paymentMethod}
${data.installments > 1 ? `- Cuotas: ${data.installments}` : ''}
- Fecha de Aprobación: ${new Date(data.dateApproved || data.dateCreated).toLocaleString('es-ES')}

👤 INFORMACIÓN DEL CLIENTE:
- Nombre: ${data.customerName || 'No proporcionado'}
- Email: ${data.customerEmail}
${data.customerPhone ? `- Teléfono: ${data.customerPhone}` : ''}
${addressInfo}

🛍️ PRODUCTOS COMPRADOS:
${productsList}

📋 PRÓXIMOS PASOS:
1. Contactar al cliente para coordinar el envío
2. Preparar los productos según la orden
3. Organizar el envío con la información de dirección proporcionada
4. Confirmar la entrega con el cliente

---
Este email fue generado automáticamente por el sistema de pagos.
Cristian Pirovano - Sistema de Ventas Online
    `;
  }

  /**
   * Genera el HTML del email para el cliente
   */
  private generateCustomerEmailHTML(data: PaymentNotificationData): string {
    const productsList = data.products
      .map(product => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${product.title}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${product.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${data.currency} ${product.price}</td>
        </tr>
      `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Compra Confirmada</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">✅ ¡Compra Confirmada!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Cristian Pirovano</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="font-size: 16px; margin: 0;">¡Hola ${data.customerName || 'Cliente'}!</p>
          <p>Gracias por tu compra. Tu pago ha sido procesado exitosamente y estamos preparando tu pedido.</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">📋 Detalles de tu Compra</h2>
          <p><strong>ID de Orden:</strong> ${data.orderId}</p>
          <p><strong>ID de Pago:</strong> ${data.paymentId}</p>
          <p><strong>Estado:</strong> <span style="color: #28a745; font-weight: bold;">APROBADO</span></p>
          <p><strong>Monto Total:</strong> <span style="font-size: 18px; font-weight: bold; color: #28a745;">${data.currency} ${data.transactionAmount}</span></p>
          <p><strong>Fecha de Compra:</strong> ${new Date(data.dateCreated).toLocaleString('es-ES')}</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">🛍️ Productos Comprados</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background: #e9ecef;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Producto</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Cantidad</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${productsList}
            </tbody>
          </table>
        </div>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 20px;">
          <h3 style="color: #155724; margin-top: 0;">📦 ¿Qué sigue ahora?</h3>
          <p style="margin: 10px 0;">Te contactaremos pronto para coordinar el envío de tus productos. Mantén este email como comprobante de tu compra.</p>
        </div>

        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin-top: 0;">📞 ¿Necesitas ayuda?</h3>
          <p style="margin: 10px 0;">Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos:</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:pirovanofotografia@gmail.com" style="color: #667eea;">pirovanofotografia@gmail.com</a></p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
          <p>¡Gracias por elegirme!</p>
          <p><strong>Cristian Pirovano</strong> - Fotógrafo Profesional</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el texto plano del email para el cliente
   */
  private generateCustomerEmailText(data: PaymentNotificationData): string {
    const productsList = data.products
      .map(product => `- ${product.title} (x${product.quantity}) - ${data.currency} ${product.price}`)
      .join('\n');

    return `
✅ ¡COMPRA CONFIRMADA! - Cristian Pirovano

¡Hola ${data.customerName || 'Cliente'}!

Gracias por tu compra. Tu pago ha sido procesado exitosamente y estamos preparando tu pedido.

📋 DETALLES DE TU COMPRA:
- ID de Orden: ${data.orderId}
- ID de Pago: ${data.paymentId}
- Estado: APROBADO
- Monto Total: ${data.currency} ${data.transactionAmount}
- Fecha de Compra: ${new Date(data.dateCreated).toLocaleString('es-ES')}

🛍️ PRODUCTOS COMPRADOS:
${productsList}

📦 ¿QUÉ SIGUE AHORA?
Te contactaremos pronto para coordinar el envío de tus productos. Mantén este email como comprobante de tu compra.

📞 ¿NECESITAS AYUDA?
Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos:
Email: pirovanofotografia@gmail.com

¡Gracias por apoyar mi trabajo!

Cristian Pirovano
    `;
  }
}
