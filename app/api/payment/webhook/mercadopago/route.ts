import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { EmailNotificationService, PaymentNotificationData } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * Webhook handler para notificaciones de Mercado Pago
 * Implementa validación de firmas según documentación oficial
 * https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks
 */

const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';

/**
 * Valida la firma del webhook para asegurar que proviene de Mercado Pago
 * Implementa validación según documentación oficial de Mercado Pago
 * https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks
 */
function validateWebhookSignature(request: NextRequest, dataId: string): boolean {
  try {
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    if (!xSignature || !xRequestId) {
      console.warn('⚠️ Headers de firma no encontrados:', {
        hasXSignature: !!xSignature,
        hasXRequestId: !!xRequestId
      });
      return false;
    }

    // Separar timestamp y hash de x-signature
    // Formato: ts=1705320600,v1=abc123def456...
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
      console.warn('⚠️ Timestamp o hash no encontrados en x-signature:', {
        xSignature,
        ts: !!ts,
        hash: !!hash
      });
      return false;
    }

    // Verificar que el webhook no sea demasiado antiguo (5 minutos)
    const webhookAge = Date.now() - parseInt(ts) * 1000;
    if (webhookAge > 5 * 60 * 1000) {
      console.warn('⚠️ Webhook expirado:', { 
        age: webhookAge / 1000, 
        ts,
        maxAge: 300 
      });
      return false;
    }

    // Generar manifest según especificación de Mercado Pago
    // Formato: id:{dataId};request-id:{xRequestId};ts:{timestamp};
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    // Calcular HMAC SHA256
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    hmac.update(manifest);
    const expectedSignature = hmac.digest('hex');

    // Comparar signatures
    const isValid = expectedSignature === hash;
    
    if (!isValid) {
      console.error('❌ Firma inválida:', {
        expected: expectedSignature,
        received: hash,
        manifest,
        dataId,
        xRequestId,
        ts
      });
    } else {
      console.log('✅ Firma válida:', {
        dataId,
        xRequestId,
        ts,
        age: webhookAge / 1000
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

    // Guardar o actualizar orden en Supabase
    await saveOrUpdateOrder(payment);

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
 * Procesa notificaciones de orden comercial de Mercado Pago
 */
async function processOrderNotification(orderId: string) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado');
    }

    // Obtener detalles de la orden
    const response = await fetch(`https://api.mercadopago.com/v1/merchant_orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo orden: ${response.status}`);
    }

    const merchantOrder = await response.json();

    console.log('📦 Orden comercial recibida:', {
      id: merchantOrder.id,
      status: merchantOrder.status,
      external_reference: merchantOrder.external_reference,
      total_amount: merchantOrder.total_amount,
      paid_amount: merchantOrder.paid_amount,
      payments: merchantOrder.payments?.length || 0,
    });

    // Guardar o actualizar orden en Supabase
    await saveOrUpdateOrderFromMerchantOrder(merchantOrder);

    // Procesar emails automáticos solo para órdenes pagadas
    if (merchantOrder.status === 'paid') {
      await processApprovedOrder(merchantOrder);
    }

    return merchantOrder;
  } catch (error) {
    console.error('❌ Error procesando notificación de orden:', error);
    throw error;
  }
}

/**
 * Procesa órdenes pagadas enviando emails automáticos
 */
async function processApprovedOrder(merchantOrder: any) {
  try {
    console.log('🎉 Procesando orden pagada:', merchantOrder.id);

    // Extraer información del primer pago (en tarjeta siempre hay 1 pago)
    const payment = merchantOrder.payments?.[0];
    if (!payment) {
      console.error('❌ Orden pagada sin información de pago');
      return;
    }

    // Obtener detalles del pago para información del cliente
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${payment.id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!paymentResponse.ok) {
      console.error('❌ Error obteniendo detalles del pago:', payment.id);
      return;
    }

    const paymentData = await paymentResponse.json();

    // Construir datos de notificación
    const notificationData: PaymentNotificationData = {
      paymentId: payment.id.toString(),
      status: payment.status,
      statusDetail: paymentData.status_detail || '',
      transactionAmount: payment.transaction_amount,
      currency: merchantOrder.currency_id,
      paymentMethod: paymentData.payment_method_id,
      installments: paymentData.installments || 1,
      customerEmail: merchantOrder.payer?.email || paymentData.payer?.email || '',
      customerName: merchantOrder.payer?.nickname || 
        (paymentData.payer?.first_name && paymentData.payer?.last_name 
          ? `${paymentData.payer.first_name} ${paymentData.payer.last_name}`.trim()
          : paymentData.payer?.first_name || ''),
      customerPhone: paymentData.payer?.phone?.number ? 
        `${paymentData.payer.phone.area_code || ''}${paymentData.payer.phone.number}`.trim() : undefined,
      customerAddress: paymentData.payer?.address ? {
        street_name: paymentData.payer.address.street_name,
        street_number: paymentData.payer.address.street_number,
        city: paymentData.payer.address.city,
        zip_code: paymentData.payer.address.zip_code,
        country: paymentData.payer.address.federal_unit
      } : undefined,
      products: extractProductsFromOrder(merchantOrder),
      orderId: merchantOrder.external_reference || `order_${merchantOrder.id}`,
      dateCreated: paymentData.date_created,
      dateApproved: paymentData.date_approved
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
    console.error('❌ Error procesando orden aprobada:', error);
  }
}

/**
 * Extrae información de productos de la orden de Mercado Pago
 */
function extractProductsFromOrder(merchantOrder: any): Array<{title: string, quantity: number, price: number}> {
  if (!merchantOrder.items || merchantOrder.items.length === 0) {
    // Fallback: crear producto genérico
    return [{
      title: merchantOrder.external_reference || 'Producto del Portfolio',
      quantity: 1,
      price: merchantOrder.total_amount || 0
    }];
  }

  return merchantOrder.items.map((item: any) => ({
    title: item.title || 'Producto',
    quantity: item.quantity || 1,
    price: item.unit_price || 0
  }));
}

/**
 * Extrae información de productos del pago (legacy - mantener para compatibilidad)
 */
function extractProductsFromPayment(payment: any): Array<{title: string, quantity: number, price: number}> {
  const description = payment.description || 'Producto del Portfolio';
  const amount = payment.transaction_amount || 0;
  
  return [{
    title: description,
    quantity: 1,
    price: amount
  }];
}

/**
 * Guarda o actualiza una orden en Supabase
 */
async function saveOrUpdateOrder(payment: any) {
  try {
    const orderData = {
      payment_id: payment.id.toString(),
      status: payment.status,
      status_detail: payment.status_detail,
      total_amount: payment.transaction_amount,
      currency: payment.currency_id,
      payment_method_id: payment.payment_method_id,
      installments: payment.installments || 1,
      customer_email: payment.payer?.email || '',
      customer_name: payment.payer?.first_name && payment.payer?.last_name
        ? `${payment.payer.first_name} ${payment.payer.last_name}`.trim()
        : payment.payer?.first_name || '',
      customer_phone: payment.payer?.phone?.number
        ? `${payment.payer.phone.area_code || ''}${payment.payer.phone.number}`.trim()
        : null,
      shipping_address: payment.payer?.address || null,
      items: extractProductsFromPayment(payment),
      metadata: {
        mercadopago_payment_id: payment.id,
        date_created: payment.date_created,
        date_approved: payment.date_approved,
        date_last_updated: payment.date_last_updated,
        operation_type: payment.operation_type,
        payment_type_id: payment.payment_type_id,
      },
      updated_at: new Date().toISOString(),
    };

    // Buscar orden existente por payment_id
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('payment_id', payment.id.toString())
      .single();

    if (existingOrder) {
      // Actualizar orden existente
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update(orderData)
        .eq('id', existingOrder.id);

      if (updateError) {
        throw updateError;
      }

      // Registrar cambio de estado en historial
      await addOrderStatusHistory(existingOrder.id, payment.status, payment.status_detail);

      console.log('✅ Orden actualizada en Supabase:', existingOrder.id);
    } else {
      // Crear nueva orden
      const { data: newOrder, error: insertError } = await supabaseAdmin
        .from('orders')
        .insert({
          ...orderData,
          external_reference: payment.external_reference || `order_${payment.id}`,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Registrar estado inicial en historial
      await addOrderStatusHistory(newOrder.id, payment.status, payment.status_detail);

      console.log('✅ Nueva orden guardada en Supabase:', newOrder.id);
    }
  } catch (error) {
    console.error('❌ Error guardando orden en Supabase:', error);
    // No lanzar error para no afectar el webhook
  }
}

/**
 * Guarda o actualiza orden desde Merchant Order
 */
async function saveOrUpdateOrderFromMerchantOrder(merchantOrder: any) {
  try {
    const payment = merchantOrder.payments?.[0];
    if (!payment) {
      console.warn('⚠️ Merchant Order sin pagos');
      return;
    }

    // Obtener detalles del pago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${payment.id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!paymentResponse.ok) {
      throw new Error(`Error obteniendo pago: ${paymentResponse.status}`);
    }

    const paymentData = await paymentResponse.json();

    const orderData = {
      mercadopago_order_id: merchantOrder.id.toString(),
      payment_id: payment.id.toString(),
      preference_id: merchantOrder.preference_id || null,
      status: merchantOrder.status === 'paid' ? 'approved' : 'pending',
      status_detail: paymentData.status_detail || null,
      total_amount: merchantOrder.total_amount,
      currency: merchantOrder.currency_id,
      payment_method_id: paymentData.payment_method_id || null,
      installments: paymentData.installments || 1,
      customer_email: merchantOrder.payer?.email || paymentData.payer?.email || '',
      customer_name: merchantOrder.payer?.nickname || 
        (paymentData.payer?.first_name && paymentData.payer?.last_name
          ? `${paymentData.payer.first_name} ${paymentData.payer.last_name}`.trim()
          : paymentData.payer?.first_name || ''),
      customer_phone: paymentData.payer?.phone?.number
        ? `${paymentData.payer.phone.area_code || ''}${paymentData.payer.phone.number}`.trim()
        : null,
      shipping_address: paymentData.payer?.address || null,
      items: extractProductsFromOrder(merchantOrder),
      metadata: {
        mercadopago_order_id: merchantOrder.id,
        mercadopago_payment_id: payment.id,
        date_created: merchantOrder.date_created,
        date_last_updated: merchantOrder.date_last_updated,
      },
      updated_at: new Date().toISOString(),
    };

    // Buscar orden existente
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('payment_id', payment.id.toString())
      .single();

    if (existingOrder) {
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update(orderData)
        .eq('id', existingOrder.id);

      if (updateError) throw updateError;

      await addOrderStatusHistory(
        existingOrder.id,
        orderData.status,
        orderData.status_detail
      );

      console.log('✅ Orden actualizada desde Merchant Order:', existingOrder.id);
    } else {
      const { data: newOrder, error: insertError } = await supabaseAdmin
        .from('orders')
        .insert({
          ...orderData,
          external_reference: merchantOrder.external_reference || `order_${merchantOrder.id}`,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await addOrderStatusHistory(newOrder.id, orderData.status, orderData.status_detail);

      console.log('✅ Nueva orden guardada desde Merchant Order:', newOrder.id);
    }
  } catch (error) {
    console.error('❌ Error guardando orden desde Merchant Order:', error);
  }
}

/**
 * Agrega entrada al historial de cambios de estado
 */
async function addOrderStatusHistory(
  orderId: string,
  status: string,
  statusDetail?: string,
  notes?: string
) {
  try {
    const { error } = await supabaseAdmin
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status,
        status_detail: statusDetail || null,
        notes: notes || null,
      });

    if (error) {
      console.error('❌ Error guardando historial:', error);
    }
  } catch (error) {
    console.error('❌ Error en addOrderStatusHistory:', error);
  }
}

/**
 * Handler principal del webhook
 * Implementa todos los requisitos de seguridad de Mercado Pago
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let webhookData: any = null;
  
  try {
    // Parsear el body
    webhookData = await request.json();

    console.log('🔔 Webhook recibido:', {
      id: webhookData.id,
      type: webhookData.type,
      action: webhookData.action,
      data_id: webhookData.data?.id,
      live_mode: webhookData.live_mode,
      date_created: webhookData.date_created,
      user_id: webhookData.user_id,
      application_id: webhookData.application_id
    });

    // Validar que sea un webhook válido
    if (!webhookData.type || !webhookData.data?.id) {
      console.warn('⚠️ Webhook inválido: faltan campos requeridos', {
        hasType: !!webhookData.type,
        hasDataId: !!webhookData.data?.id,
        body: webhookData
      });
      return NextResponse.json({ 
        received: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validar firma si hay secret configurado
    if (WEBHOOK_SECRET) {
      const isValid = validateWebhookSignature(request, webhookData.data.id.toString());
      
      if (!isValid) {
        console.error('❌ Firma del webhook inválida', {
          dataId: webhookData.data.id,
          type: webhookData.type,
          headers: {
            xSignature: request.headers.get('x-signature'),
            xRequestId: request.headers.get('x-request-id')
          }
        });
        return NextResponse.json({ 
          received: false, 
          error: 'Invalid signature' 
        }, { status: 401 });
      }
      
      console.log('✅ Firma del webhook válida');
    } else {
      console.warn('⚠️ MERCADOPAGO_WEBHOOK_SECRET no configurado - validación de firma desactivada');
    }

    // Procesar según el tipo de evento
    let processed = false;
    switch (webhookData.type) {
      case 'payment':
        console.log('💳 Procesando notificación de pago');
        await processPaymentNotification(webhookData.data.id);
        processed = true;
        break;
        
      case 'topic_merchant_order_wh':
        console.log('📦 Procesando notificación de orden comercial');
        await processOrderNotification(webhookData.data.id);
        processed = true;
        break;
        
      case 'plan':
      case 'subscription':
        console.log('📋 Notificación de suscripción recibida (no procesada)');
        break;
        
      case 'invoice':
        console.log('📄 Notificación de factura recibida (no procesada)');
        break;
        
      case 'point_integration_wh':
        console.log('🏪 Notificación de Point recibida (no procesada)');
        break;
        
      case 'topic_chargebacks_wh':
        console.log('⚠️ Notificación de contracargo recibida (no procesada)');
        break;
        
      default:
        console.log(`ℹ️ Tipo de notificación no manejado: ${webhookData.type}`);
    }

    const processingTime = Date.now() - startTime;
    console.log('✅ Webhook procesado exitosamente:', {
      type: webhookData.type,
      dataId: webhookData.data.id,
      processed,
      processingTime: `${processingTime}ms`
    });

    // IMPORTANTE: Responder 200 OK dentro de 22 segundos
    return NextResponse.json({ 
      received: true,
      processed,
      processingTime: `${processingTime}ms`
    }, { status: 200 });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Error procesando webhook:', {
      error: error.message,
      stack: error.stack,
      webhookData,
      processingTime: `${processingTime}ms`
    });
    
    // Aún así retornar 200 para que MP no reintente
    // El error ya fue logged para investigación
    return NextResponse.json({ 
      received: true, 
      error: 'Internal error logged',
      processingTime: `${processingTime}ms`
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

