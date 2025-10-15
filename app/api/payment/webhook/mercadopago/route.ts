import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { EmailNotificationService, PaymentNotificationData } from '@/lib/email';

/**
 * Webhook handler para notificaciones de Mercado Pago
 * Implementa validación de firmas según documentación oficial
 * https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks
 */

const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';

/**
 * Valida la firma del webhook para asegurar que proviene de Mercado Pago
 */
function validateWebhookSignature(request: NextRequest, dataId: string): boolean {
  try {
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    if (!xSignature || !xRequestId) {
      console.warn('⚠️ Headers de firma no encontrados');
      return false;
    }

    // Separar timestamp y hash
    const parts = xSignature.split(',');
    let ts = '';
    let hash = '';

    parts.forEach(part => {
      const [key, value] = part.split('=');
      if (key?.trim() === 'ts') {
        ts = value?.trim() || '';
      } else if (key?.trim() === 'v1') {
        hash = value?.trim() || '';
      }
    });

    if (!ts || !hash) {
      console.warn('⚠️ Timestamp o hash no encontrados en x-signature');
      return false;
    }

    // Verificar que el webhook no sea demasiado antiguo (5 minutos)
    const webhookAge = Date.now() - parseInt(ts) * 1000;
    if (webhookAge > 5 * 60 * 1000) {
      console.warn('⚠️ Webhook expirado:', { age: webhookAge / 1000, ts });
      return false;
    }

    // Generar manifest según especificación de MP
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    // Calcular HMAC
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    hmac.update(manifest);
    const expectedSignature = hmac.digest('hex');

    // Comparar signatures
    const isValid = expectedSignature === hash;
    
    if (!isValid) {
      console.error('❌ Firma inválida:', {
        expected: expectedSignature,
        received: hash,
        manifest
      });
    }

    return isValid;
  } catch (error) {
    console.error('❌ Error validando firma del webhook:', error);
    return false;
  }
}

/**
 * Procesa notificaciones de pago de Mercado Pago
 */
async function processPaymentNotification(paymentId: string) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado');
    }

    // Obtener detalles del pago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo pago: ${response.status}`);
    }

    const payment = await response.json();

    console.log('💳 Pago recibido:', {
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      external_reference: payment.external_reference,
      transaction_amount: payment.transaction_amount,
      currency_id: payment.currency_id,
      payment_method_id: payment.payment_method_id,
      payer_email: payment.payer?.email
    });

    // Procesar emails automáticos solo para pagos aprobados
    if (payment.status === 'approved') {
      await processApprovedPayment(payment);
    }

    return payment;
  } catch (error) {
    console.error('❌ Error procesando notificación de pago:', error);
    throw error;
  }
}

/**
 * Procesa pagos aprobados enviando emails automáticos
 */
async function processApprovedPayment(payment: any) {
  try {
    console.log('🎉 Procesando pago aprobado:', payment.id);

    // Extraer información del pago
    const notificationData: PaymentNotificationData = {
      paymentId: payment.id.toString(),
      status: payment.status,
      statusDetail: payment.status_detail,
      transactionAmount: payment.transaction_amount,
      currency: payment.currency_id,
      paymentMethod: payment.payment_method_id,
      installments: payment.installments || 1,
      customerEmail: payment.payer?.email || '',
      customerName: payment.payer?.first_name && payment.payer?.last_name 
        ? `${payment.payer.first_name} ${payment.payer.last_name}`.trim()
        : payment.payer?.first_name || '',
      customerPhone: payment.payer?.phone?.number ? 
        `${payment.payer.phone.area_code || ''}${payment.payer.phone.number}`.trim() : undefined,
      customerAddress: payment.payer?.address ? {
        street_name: payment.payer.address.street_name,
        street_number: payment.payer.address.street_number,
        city: payment.payer.address.city,
        zip_code: payment.payer.address.zip_code,
        country: payment.payer.address.federal_unit
      } : undefined,
      products: extractProductsFromPayment(payment),
      orderId: payment.external_reference || `order_${payment.id}`,
      dateCreated: payment.date_created,
      dateApproved: payment.date_approved
    };

    // Inicializar servicio de emails
    const emailService = new EmailNotificationService();

    // Enviar emails en paralelo
    const [photographerEmailSent, customerEmailSent] = await Promise.allSettled([
      emailService.sendPhotographerNotification(notificationData),
      emailService.sendCustomerConfirmation(notificationData)
    ]);

    // Log resultados
    if (photographerEmailSent.status === 'fulfilled' && photographerEmailSent.value) {
      console.log('✅ Email enviado al fotógrafo exitosamente');
    } else {
      console.error('❌ Error enviando email al fotógrafo:', photographerEmailSent.status === 'rejected' ? photographerEmailSent.reason : 'Error desconocido');
    }

    if (customerEmailSent.status === 'fulfilled' && customerEmailSent.value) {
      console.log('✅ Email enviado al cliente exitosamente');
    } else {
      console.error('❌ Error enviando email al cliente:', customerEmailSent.status === 'rejected' ? customerEmailSent.reason : 'Error desconocido');
    }

  } catch (error) {
    console.error('❌ Error procesando pago aprobado:', error);
    // No lanzar el error para no afectar el webhook
  }
}

/**
 * Extrae información de productos del pago
 * Nota: Esta función es básica ya que Mercado Pago no incluye detalles de productos en el webhook
 * En una implementación completa, deberías almacenar los productos en tu base de datos
 * y recuperarlos usando el external_reference o metadata
 */
function extractProductsFromPayment(payment: any): Array<{title: string, quantity: number, price: number}> {
  // Por ahora, creamos un producto genérico basado en la descripción
  // En el futuro, esto debería venir de tu base de datos usando payment.external_reference
  const description = payment.description || 'Producto del Portfolio';
  const amount = payment.transaction_amount || 0;
  
  return [{
    title: description,
    quantity: 1,
    price: amount
  }];
}

/**
 * Handler principal del webhook
 */
export async function POST(request: NextRequest) {
  try {
    // Parsear el body
    const body = await request.json();

    console.log('🔔 Webhook recibido:', {
      id: body.id,
      type: body.type,
      action: body.action,
      data_id: body.data?.id
    });

    // Validar que sea un webhook válido
    if (!body.type || !body.data?.id) {
      console.warn('⚠️ Webhook inválido: faltan campos requeridos');
      return NextResponse.json({ received: false }, { status: 400 });
    }

    // Validar firma si hay secret configurado
    if (WEBHOOK_SECRET) {
      const isValid = validateWebhookSignature(request, body.data.id.toString());
      
      if (!isValid) {
        console.error('❌ Firma del webhook inválida');
        return NextResponse.json({ received: false, error: 'Invalid signature' }, { status: 401 });
      }
      
      console.log('✅ Firma del webhook válida');
    } else {
      console.warn('⚠️ MERCADOPAGO_WEBHOOK_SECRET no configurado - validación de firma desactivada');
    }

    // Procesar según el tipo de evento
    switch (body.type) {
      case 'payment':
        await processPaymentNotification(body.data.id);
        break;
        
      case 'plan':
      case 'subscription':
        console.log('📋 Notificación de suscripción recibida');
        // Implementar lógica de suscripciones si es necesario
        break;
        
      case 'invoice':
        console.log('📄 Notificación de factura recibida');
        // Implementar lógica de facturas si es necesario
        break;
        
      case 'point_integration_wh':
        console.log('🏪 Notificación de Point recibida');
        // Implementar lógica de Point si es necesario
        break;
        
      case 'topic_merchant_order_wh':
        console.log('📦 Notificación de orden comercial recibida');
        // Implementar lógica de órdenes si es necesario
        break;
        
      case 'topic_chargebacks_wh':
        console.log('⚠️ Notificación de contracargo recibida');
        // Implementar lógica de contracargos si es necesario
        break;
        
      default:
        console.log(`ℹ️ Tipo de notificación no manejado: ${body.type}`);
    }

    // IMPORTANTE: Responder 200 OK dentro de 22 segundos
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error procesando webhook:', error);
    
    // Aún así retornar 200 para que MP no reintente
    // El error ya fue logged para investigación
    return NextResponse.json({ 
      received: true, 
      error: 'Internal error logged' 
    }, { status: 200 });
  }
}

/**
 * Método GET para verificar que el endpoint está activo
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    webhook: 'Mercado Pago Webhook Handler',
    version: '1.0.0'
  });
}

