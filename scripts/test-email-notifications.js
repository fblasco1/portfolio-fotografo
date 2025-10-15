/**
 * Script para probar las notificaciones de email
 * Ejecutar con: node scripts/test-email-notifications.js
 */

const { Resend } = require('resend');

// Configuración de prueba
const resend = new Resend(process.env.RESEND_API_KEY);

// Datos de prueba simulando un pago aprobado
const testPaymentData = {
  paymentId: "1234567890",
  status: "approved",
  statusDetail: "accredited",
  transactionAmount: 50000,
  currency: "ARS",
  paymentMethod: "visa",
  installments: 1,
  customerEmail: "cliente@ejemplo.com",
  customerName: "Juan Pérez",
  customerPhone: "+54 11 1234-5678",
  customerAddress: {
    street_name: "Av. Corrientes",
    street_number: "1234",
    city: "Buenos Aires",
    zip_code: "1043",
    country: "Argentina"
  },
  products: [
    {
      title: "Fotografía Impresa - Tamaño A4",
      quantity: 2,
      price: 25000
    },
    {
      title: "Postal Fotográfica",
      quantity: 1,
      price: 15000
    }
  ],
  orderId: "order_1234567890",
  dateCreated: new Date().toISOString(),
  dateApproved: new Date().toISOString()
};

/**
 * Genera el HTML del email para el fotógrafo (versión simplificada para testing)
 */
function generatePhotographerEmailHTML(data) {
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
      <title>Nueva Venta Aprobada - TEST</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px;">🎉 ¡Nueva Venta Aprobada! (TEST)</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Portfolio Cristian Pirovano</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">💰 Detalles del Pago</h2>
        <p><strong>ID de Pago:</strong> ${data.paymentId}</p>
        <p><strong>ID de Orden:</strong> ${data.orderId}</p>
        <p><strong>Estado:</strong> <span style="color: #28a745; font-weight: bold;">${data.status.toUpperCase()}</span></p>
        <p><strong>Monto Total:</strong> <span style="font-size: 18px; font-weight: bold; color: #28a745;">${data.currency} ${data.transactionAmount}</span></p>
        <p><strong>Método de Pago:</strong> ${data.paymentMethod}</p>
        <p><strong>Fecha de Aprobación:</strong> ${new Date(data.dateApproved).toLocaleString('es-ES')}</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">👤 Información del Cliente</h2>
        <p><strong>Nombre:</strong> ${data.customerName}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.customerEmail}" style="color: #667eea;">${data.customerEmail}</a></p>
        <p><strong>Teléfono:</strong> ${data.customerPhone}</p>
        <h3 style="color: #333; margin-top: 20px;">📍 Dirección de Envío</h3>
        <p style="margin: 5px 0;">
          ${data.customerAddress.street_name} ${data.customerAddress.street_number}<br>
          ${data.customerAddress.city} ${data.customerAddress.zip_code}<br>
          ${data.customerAddress.country}
        </p>
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
        <p><strong>⚠️ ESTE ES UN EMAIL DE PRUEBA</strong></p>
        <p>Este email fue generado automáticamente por el sistema de pagos.</p>
        <p><strong>Portfolio Cristian Pirovano</strong> - Sistema de Ventas Online</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Genera el HTML del email para el cliente (versión simplificada para testing)
 */
function generateCustomerEmailHTML(data) {
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
      <title>Compra Confirmada - TEST</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px;">✅ ¡Compra Confirmada! (TEST)</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Portfolio Cristian Pirovano</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="font-size: 16px; margin: 0;">¡Hola ${data.customerName}!</p>
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
        <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:cristianpirovanoportfolio@gmail.com" style="color: #667eea;">cristianpirovanoportfolio@gmail.com</a></p>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
        <p><strong>⚠️ ESTE ES UN EMAIL DE PRUEBA</strong></p>
        <p>¡Gracias por elegir Portfolio Cristian Pirovano!</p>
        <p><strong>Cristian Pirovano</strong> - Fotógrafo Profesional</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Función principal de prueba
 */
async function testEmailNotifications() {
  console.log('🧪 Iniciando prueba de notificaciones de email...\n');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY no está configurada en las variables de entorno');
    process.exit(1);
  }

  try {
    // Probar email al fotógrafo
    console.log('📧 Enviando email de prueba al fotógrafo...');
    const photographerResult = await resend.emails.send({
      from: "Ventas <noreply@contacto.cristianpirovano.com>",
      to: ["cristianpirovanoportfolio@gmail.com"],
      subject: `🧪 PRUEBA - Nueva Venta Aprobada - ${testPaymentData.customerName} - ${testPaymentData.currency} ${testPaymentData.transactionAmount}`,
      html: generatePhotographerEmailHTML(testPaymentData),
    });

    if (photographerResult.error) {
      console.error('❌ Error enviando email al fotógrafo:', photographerResult.error);
    } else {
      console.log('✅ Email al fotógrafo enviado exitosamente:', photographerResult.data?.id);
    }

    // Probar email al cliente
    console.log('\n📧 Enviando email de prueba al cliente...');
    const customerResult = await resend.emails.send({
      from: "Ventas <noreply@contacto.cristianpirovano.com>",
      to: [testPaymentData.customerEmail],
      subject: `🧪 PRUEBA - Compra Confirmada - Portfolio Cristian Pirovano`,
      html: generateCustomerEmailHTML(testPaymentData),
    });

    if (customerResult.error) {
      console.error('❌ Error enviando email al cliente:', customerResult.error);
    } else {
      console.log('✅ Email al cliente enviado exitosamente:', customerResult.data?.id);
    }

    console.log('\n🎉 Prueba de emails completada!');
    console.log('📋 Verifica tu bandeja de entrada para confirmar que los emails llegaron correctamente.');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    process.exit(1);
  }
}

// Ejecutar la prueba si el script se ejecuta directamente
if (require.main === module) {
  testEmailNotifications();
}

module.exports = { testEmailNotifications, testPaymentData };
