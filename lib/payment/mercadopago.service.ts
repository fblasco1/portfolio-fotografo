import type { PaymentProvider, RegionInfo } from './payment-factory';
import type {
  PaymentRequest,
  PaymentResponse,
  InstallmentOption,
  PaymentMethod,
  Issuer,
} from '@/app/types/payment';
import { getProductPrice } from './config';

export class MercadoPagoProvider implements PaymentProvider {
  name = 'mercadopago';
  private accessToken: string;
  private baseUrl: string;

  constructor() {
    this.accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    
    if (!this.accessToken) {
      console.warn('⚠️ MERCADOPAGO_ACCESS_TOKEN no está configurada');
    } else {
    }
  }

  /**
   * Obtener la URL de notificación para API Orders
   * La notification_url se configura en la orden y tiene prioridad sobre configuración global
   */
  private getNotificationUrl(): string | null {
    // URL de webhook de producción
    const productionWebhookUrl = 'https://cristianpirovano.com/api/payment/webhook/mercadopago';
    
    // En desarrollo, usar la URL base configurada
    if (process.env.NODE_ENV === 'development' && this.baseUrl) {
      const webhookUrl = `${this.baseUrl}/api/payment/webhook/mercadopago`;
      const params = new URLSearchParams({
        source_news: 'webhooks',
        integration_type: 'orders_api',
        version: '3.0.0'
      });
      return `${webhookUrl}?${params.toString()}`;
    }
    
    // En producción, usar la URL fija
    if (process.env.NODE_ENV === 'production') {
      const params = new URLSearchParams({
        source_news: 'webhooks',
        integration_type: 'orders_api',
        version: '3.0.0'
      });
      return `${productionWebhookUrl}?${params.toString()}`;
    }

    // Fallback a URL base si está configurada
    if (this.baseUrl) {
      const webhookUrl = `${this.baseUrl}/api/payment/webhook/mercadopago`;
      const params = new URLSearchParams({
        source_news: 'webhooks',
        integration_type: 'orders_api',
        version: '3.0.0'
      });
      return `${webhookUrl}?${params.toString()}`;
    }

    return null;
  }

  /**
   * Determinar el tipo de método de pago basado en el payment_method_id
   */
  private getPaymentMethodType(paymentMethodId: string): string {
    const normalizedId = this.normalizePaymentMethodId(paymentMethodId);
    
    // Tarjetas de débito (prefijo "deb")
    if (paymentMethodId.startsWith('deb')) {
      return 'debit_card';
    }
    
    // Tarjetas de crédito (sin prefijo)
    const creditCards = ['visa', 'master', 'amex', 'elo', 'naranja', 'cabal', 'argencard', 'cencosud', 'tarshop', 'nativa', 'cordobesa'];
    if (creditCards.includes(normalizedId)) {
      return 'credit_card';
    }
    
    // Por defecto, asumir crédito si no se puede determinar
    console.warn(`⚠️ No se pudo determinar el tipo de tarjeta para: ${paymentMethodId}. Usando 'credit_card' por defecto.`);
    return 'credit_card';
  }

  /**
   * Sanitizar address del payer: la API Orders solo acepta zip_code, street_name, street_number, city
   * (no federal_unit ni otras propiedades adicionales)
   */
  private sanitizePayerAddress(address: Record<string, unknown>): Record<string, string> {
    const allowed = ['zip_code', 'street_name', 'street_number', 'city'];
    const sanitized: Record<string, string> = {};
    for (const key of allowed) {
      if (address[key] != null && typeof address[key] === 'string') {
        sanitized[key] = address[key] as string;
      }
    }
    return sanitized;
  }

  /**
   * Normalizar el payment_method_id para API Orders
   * Remueve prefijos como "deb" (debvisa -> visa)
   */
  private normalizePaymentMethodId(paymentMethodId: string): string {
    // Lista de métodos de pago aceptados por API Orders
    const validPaymentMethods = ['amex', 'argencard', 'cabal', 'cencosud', 'cmr', 'diners', 'master', 'naranja', 'visa'];
    
    // Si el método ya es válido, retornarlo
    if (validPaymentMethods.includes(paymentMethodId)) {
      return paymentMethodId;
    }
    
    // Remover prefijo "deb" si existe (debvisa -> visa, debmaster -> master)
    if (paymentMethodId.startsWith('deb')) {
      const normalized = paymentMethodId.substring(3); // Remover "deb"
      return validPaymentMethods.includes(normalized) ? normalized : paymentMethodId;
    }
    
    // Si tiene otro formato, intentar extraer el nombre de la marca
    // Por ejemplo: "debit_card_visa" -> "visa"
    for (const method of validPaymentMethods) {
      if (paymentMethodId.includes(method)) {
        return method;
      }
    }
    
    // Si no se puede normalizar, retornar el original o visa por defecto
    console.warn(`⚠️ No se pudo normalizar payment_method_id: ${paymentMethodId}. Usando "visa" por defecto.`);
    return 'visa';
  }

  /**
   * Construir array de items para la orden de Mercado Pago
   * a partir de los items del carrito
   */
  private buildOrderItems(
    cartItems: Array<{
      id: string;
      title: string;
      quantity: number;
      productType: 'photos' | 'postcards' | 'photo' | 'postcard';
    }>,
    region: string,
    totalAmount: number
  ): Array<{
    title: string;
    description: string;
    category_id: string;
    quantity: number;
    unit_price: number;
  }> {
    // Calcular cantidad total de items
    const totalQuantity = cartItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    
    // Calcular precio unitario base (con 2 decimales)
    const baseUnitPrice = parseFloat((totalAmount / totalQuantity).toFixed(2));
    
    // Construir items con precio base (sin campo 'id' - no permitido en API Orders)
    const items = cartItems.map((item) => {
      // Normalizar productType (el frontend puede enviar 'photo' en lugar de 'photos')
      const normalizedProductType = item.productType === 'photo' ? 'photos' : 
                                   item.productType === 'postcard' ? 'postcards' : 
                                   item.productType;
      
      return {
        // Remover campo 'id' - no está permitido en API Orders
        title: item.title || 'Producto del Portfolio', // ✅ Requisito: Nombre del item
        description: `${normalizedProductType === 'photos' ? 'Fotografía impresa' : 'Postal'} del Portfolio Fotográfico - ${item.title || 'Producto'}`, // ✅ Requisito: Descripción del item
        // Usar categorías válidas de Mercado Pago según tipo de producto
        // Categorías válidas: art, electronics, fashion, food, home, services, tickets, travel, others
        category_id: normalizedProductType === 'photos' ? 'art' : 'others', // ✅ Requisito: Categoría del item
        quantity: item.quantity || 1, // ✅ Requisito: Cantidad del producto
        unit_price: baseUnitPrice, // ✅ Requisito: Precio del item
      };
    });
    
    // Calcular la suma actual de todos los items
    const currentTotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    
    // Ajustar el último item para que la suma sea exacta
    // Esto evita errores de redondeo
    const difference = parseFloat((totalAmount - currentTotal).toFixed(2));
    if (difference !== 0 && items.length > 0) {
      const lastItem = items[items.length - 1];
      lastItem.unit_price = parseFloat((lastItem.unit_price + (difference / lastItem.quantity)).toFixed(2));
    }
    
    return items;
  }

  isAvailable(region: RegionInfo): boolean {
    // Mercado Pago está disponible en Latinoamérica
    return region.isLatinAmerica && !!this.accessToken;
  }

  getPaymentMethods(): string[] {
    return [
      'credit_card',
      'debit_card',
      'bank_transfer',
      'cash',
      'digital_wallet'
    ];
  }

  /**
   * Obtener el monto mínimo por moneda para transacciones reales
   */
  private getMinimumAmount(currency: string): number {
    const minimumAmounts: Record<string, number> = {
      'ARS': 1,      // Peso Argentino - mínimo 1 ARS
      'BRL': 0.50,   // Real Brasileño - mínimo 0.50 BRL
      'CLP': 100,    // Peso Chileno - mínimo 100 CLP
      'COP': 1000,   // Peso Colombiano - mínimo 1000 COP
      'MXN': 10,     // Peso Mexicano - mínimo 10 MXN
      'PEN': 1,      // Sol Peruano - mínimo 1 PEN
      'UYU': 10,     // Peso Uruguayo - mínimo 10 UYU
    };
    return minimumAmounts[currency] || 1;
  }

  /**
   * Validar datos del pagador para mejorar la tasa de aprobación
   * Implementa validaciones de seguridad según las mejores prácticas de Mercado Pago
   */
  private validatePayerData(payer: any): void {
    const errors: string[] = [];

    // Validar email (requisito obligatorio)
    if (!payer.email || !this.isValidEmail(payer.email)) {
      errors.push('Email del comprador es requerido y debe ser válido');
    }

    // Validar nombre (requisito obligatorio)
    if (!payer.first_name || payer.first_name.trim().length < 2) {
      errors.push('Nombre del comprador es requerido (mínimo 2 caracteres)');
    }

    // Validar apellido (requisito obligatorio)
    if (!payer.last_name || payer.last_name.trim().length < 2) {
      errors.push('Apellido del comprador es requerido (mínimo 2 caracteres)');
    }

    // Validar identificación (buena práctica)
    if (payer.identification) {
      if (!payer.identification.type || !payer.identification.number) {
        errors.push('Tipo y número de identificación son requeridos');
      }
      
      // Validar formato de DNI/CPF según el tipo
      if (payer.identification.type === 'DNI' && !this.isValidDNI(payer.identification.number)) {
        errors.push('Formato de DNI inválido');
      }
      
      if (payer.identification.type === 'CPF' && !this.isValidCPF(payer.identification.number)) {
        errors.push('Formato de CPF inválido');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Datos del pagador inválidos: ${errors.join(', ')}`);
    }
  }

  /**
   * Validar formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar formato de DNI argentino
   */
  private isValidDNI(dni: string): boolean {
    const dniRegex = /^\d{7,8}$/;
    return dniRegex.test(dni.replace(/\D/g, ''));
  }

  /**
   * Validar formato de CPF brasileño
   */
  private isValidCPF(cpf: string): boolean {
    const cpfRegex = /^\d{11}$/;
    const cleanCpf = cpf.replace(/\D/g, '');
    return cpfRegex.test(cleanCpf) && this.validateCPFChecksum(cleanCpf);
  }

  /**
   * Validar dígitos verificadores del CPF
   */
  private validateCPFChecksum(cpf: string): boolean {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf.charAt(10));
  }

  /**
   * Crear una orden de Mercado Pago (Paso A)
   * Implementa las mejores prácticas de seguridad y validación de Mercado Pago
   */
  private async createOrder(
    paymentData: PaymentRequest,
    orderId: string
  ): Promise<{ id: number }> {
    const cartItems = paymentData.metadata?.cart_items || [];
    
    if (cartItems.length === 0) {
      throw new Error('El carrito está vacío. No se puede crear la orden.');
    }

    // Validar monto mínimo
    const currency = paymentData.currency_id || 'ARS';
    const minimumAmount = this.getMinimumAmount(currency);
    const totalAmount = paymentData.transaction_amount;
    
    if (totalAmount < minimumAmount) {
      throw new Error(
        `El monto mínimo para pagos en ${currency} es ${minimumAmount}. ` +
        `Monto actual: ${totalAmount}. ` +
        `Por favor, agrega más productos al carrito o actualiza los precios de los productos en Sanity.`
      );
    }

    // Construir items de la orden con validaciones de seguridad
    const items = this.buildOrderItems(cartItems, currency, totalAmount);

    // Validar datos del pagador (requisito de seguridad)
    this.validatePayerData(paymentData.payer);

    const orderPayload = {
      type: 'online', // Requerido para API Orders
      items: items.map(item => ({
        // Remover campo 'id' - no está permitido en API Orders
        title: item.title, // ✅ Requisito: Nombre del item
        description: item.description, // ✅ Requisito: Descripción del item
        category_id: item.category_id, // ✅ Requisito: Categoría del item
        quantity: item.quantity, // ✅ Requisito: Cantidad del producto/servicio
        unit_price: item.unit_price.toString(), // ✅ Requisito: Precio del item
      })),
      total_amount: totalAmount.toString(),
      external_reference: paymentData.external_reference || orderId, // ✅ Requisito: Referencia externa
      transactions: {
        // La API Orders SÍ requiere transactions, pero con estructura específica
        payments: [
          {
            amount: totalAmount.toString(),
            payment_method: {
              id: paymentData.payment_method_id,
              type: this.getPaymentMethodType(paymentData.payment_method_id || 'visa'),
              token: paymentData.token,
              installments: paymentData.installments,
              statement_descriptor: paymentData.statement_descriptor || 'CRISTIAN PIROVANO'
            }
          }
        ]
      },
      payer: {
        email: paymentData.payer.email, // ✅ Requisito: Email del comprador
        entity_type: 'individual',
        first_name: paymentData.payer.first_name, // ✅ Requisito: Nombre del comprador
        last_name: paymentData.payer.last_name, // ✅ Requisito: Apellido del comprador
        identification: paymentData.payer.identification, // ✅ Buena práctica: Identificación del comprador
        ...(paymentData.payer.phone && { phone: paymentData.payer.phone }), // ✅ Buena práctica: Teléfono del comprador
        ...(paymentData.payer.address && {
          address: this.sanitizePayerAddress(paymentData.payer.address),
        }), // API Orders no acepta federal_unit
      },
    };


    if (process.env.NODE_ENV === 'development') {
    }

    const response = await fetch('https://api.mercadopago.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `order_${orderId}_${Date.now()}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error creando orden de MP:', errorData);
      
      // Log detallado del payload para debugging
      if (errorData.errors && Array.isArray(errorData.errors)) {
        errorData.errors.forEach((error: any, index: number) => {
          console.error(`   Error ${index + 1}:`, error.message);
          if (error.details) {
            console.error(`   Detalles:`, error.details);
          }
        });
      }
      
      console.error('📤 Payload enviado:', JSON.stringify(orderPayload, null, 2));
      
      // Manejo de errores con códigos de estado específicos
      const errorMessage = this.getErrorMessage(errorData, response.status);
      const errorCode = this.getErrorCode(response.status, errorData);
      
      throw new Error(`Error al crear la orden: ${errorMessage} (Código: ${errorCode})`);
    }

    const orderResponse = await response.json();


    return { id: orderResponse.id };
  }

  /**
   * Crear pago usando Payments API directa (solo para credenciales TEST).
   * Permite usar tarjetas de prueba sin gastar dinero real.
   */
  private async createPaymentLegacy(paymentData: PaymentRequest, orderId: string): Promise<PaymentResponse> {
    const payerAddress = paymentData.payer.address
      ? this.sanitizePayerAddress(paymentData.payer.address)
      : undefined;

    const payload = {
      transaction_amount: paymentData.transaction_amount,
      token: paymentData.token,
      description: paymentData.description || 'Compra en Portfolio Fotográfico (prueba)',
      installments: paymentData.installments,
      payment_method_id: paymentData.payment_method_id || 'visa',
      ...(paymentData.issuer_id && { issuer_id: paymentData.issuer_id }),
      external_reference: orderId,
      statement_descriptor: paymentData.statement_descriptor || 'CRISTIAN PIROVANO',
      payer: {
        email: paymentData.payer.email,
        first_name: paymentData.payer.first_name,
        last_name: paymentData.payer.last_name,
        identification: paymentData.payer.identification,
        ...(paymentData.payer.phone && { phone: paymentData.payer.phone }),
        ...(payerAddress && Object.keys(payerAddress).length > 0 && { address: payerAddress }),
      },
      ...(this.getNotificationUrl() && { notification_url: this.getNotificationUrl() }),
      metadata: {
        ...(paymentData.metadata || {}),
        platform: 'portfolio-fotografo',
        integration_type: 'payments_api_test',
        order_id: orderId,
      },
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Modo prueba: Payments API con tarjetas de prueba (sin cobro real)');
    }

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `payment_${orderId}_${Date.now()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = this.getErrorMessage(errorData, response.status);
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Crear un pago usando API Orders (flujo de dos pasos) o Payments API (modo prueba)
   * @param paymentData Datos del pago incluyendo token de tarjeta
   */
  async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    if (!this.accessToken) {
      console.error('❌ Mercado Pago no está configurado - accessToken vacío');
      throw new Error('Mercado Pago no está configurado');
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔑 Iniciando createPayment con token:', this.accessToken.substring(0, 20) + '...');
    }

    try {
      // Generar ID de orden único y robusto para external_reference
      // Formato: order_timestamp_random_cartItems
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 9);
      const cartItemsCount = paymentData.metadata?.cart_items?.length || 0;
      const orderId = paymentData.external_reference || `order_${timestamp}_${random}_${cartItemsCount}items`;

      // MODO PRUEBA: Credenciales TEST + Payments API = tarjetas de prueba sin cobro real
      if (this.accessToken.startsWith('TEST-')) {
        return this.createPaymentLegacy(paymentData, orderId);
      }
      
      // MODO PRODUCCIÓN: API Orders (credenciales APP_USR-)
      // PASO A: Crear Orden de Mercado Pago (sin notification_url)
      const order = await this.createOrder(paymentData, orderId);
      const mercadopagoOrderId = order.id;

      // PASO B: Crear Pago asociado a la Orden (con notification_url)
      const paymentPayload = {
        token: paymentData.token,
        transaction_amount: paymentData.transaction_amount,
        installments: paymentData.installments,
        ...(paymentData.payment_method_id && { payment_method_id: paymentData.payment_method_id }),
        ...(paymentData.issuer_id && { issuer_id: paymentData.issuer_id }),
        // Asociar pago a la orden
        order: {
          id: mercadopagoOrderId,
          type: 'online', // ✅ Requerido: tipo de orden
        },
        payer: {
          email: paymentData.payer.email,
          first_name: paymentData.payer.first_name,
          last_name: paymentData.payer.last_name,
          identification: paymentData.payer.identification,
          address: paymentData.payer.address,
          phone: paymentData.payer.phone,
        },
        description: paymentData.description || 'Compra en Portfolio Fotográfico',
        external_reference: paymentData.external_reference || orderId, // ✅ Siempre presente y único
        statement_descriptor: paymentData.statement_descriptor || 'CRISTIAN PIROVANO',
        // ✅ Configurar notification_url en el pago (OBLIGATORIO para webhooks)
        // Tiene prioridad sobre configuración global
        ...(this.getNotificationUrl() ? {
          notification_url: this.getNotificationUrl()
        } : {}),
        metadata: {
          ...(paymentData.metadata || {}),
          platform: 'portfolio-fotografo',
          integration_type: 'orders_api',
          integration_version: '3.0.0',
          order_id: orderId,
          mercadopago_order_id: mercadopagoOrderId,
          created_at: new Date().toISOString(),
        },
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('💳 Creando pago asociado a orden:', {
          orderId,
          mercadopagoOrderId,
          amount: paymentPayload.transaction_amount,
          installments: paymentPayload.installments,
          notification_url: paymentPayload.notification_url || 'No configurada',
        });
      }

      // Generar Idempotency Key único
      const idempotencyKey = `payment_${orderId}_${Date.now()}`;

      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
          'X-Platform-Id': 'portfolio-fotografo',
          'X-Integrator-Id': 'dev_portfolio',
        },
        body: JSON.stringify(paymentPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error procesando pago:', errorData);
        }

        const errorMessage = this.getErrorMessage(errorData, response.status);
        throw new Error(errorMessage);
      }

      const data: PaymentResponse = await response.json();

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Pago procesado exitosamente:', {
          paymentId: data.id,
          status: data.status,
          orderId,
          mercadopagoOrderId,
        });
      }

      return data;
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error crítico en flujo de pago:', error.message);
      }

      throw new Error(
        `No se pudo procesar el pago: ${error.message || 'Error desconocido'}`
      );
    }
  }

  /**
   * Obtener cuotas disponibles para un monto y tarjeta
   */
  async getInstallments(
    amount: number,
    bin: string,
    locale?: string
  ): Promise<InstallmentOption[]> {
    if (!this.accessToken) {
      throw new Error('Mercado Pago no está configurado');
    }

    try {
      const params = new URLSearchParams({
        amount: amount.toString(),
        bin: bin,
        ...(locale && { locale }),
      });

      const response = await fetch(
        `https://api.mercadopago.com/v1/payment_methods/installments?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error obteniendo cuotas: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error obteniendo cuotas:', error);
      throw error;
    }
  }

  /**
   * Obtener métodos de pago disponibles
   */
  async getAvailablePaymentMethods(): Promise<PaymentMethod[]> {
    if (!this.accessToken) {
      throw new Error('Mercado Pago no está configurado');
    }

    try {
      const response = await fetch(
        'https://api.mercadopago.com/v1/payment_methods',
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error obteniendo métodos de pago: ${response.statusText}`);
      }

      const methods: PaymentMethod[] = await response.json();
      
      // Filtrar solo tarjetas de crédito y débito
      return methods.filter(
        (method) => method.payment_type_id === 'credit_card' || 
                    method.payment_type_id === 'debit_card'
      );
    } catch (error: any) {
      console.error('Error obteniendo métodos de pago:', error);
      throw error;
    }
  }

  /**
   * Obtener emisores (bancos) para un método de pago
   */
  async getIssuers(
    paymentMethodId: string,
    bin: string
  ): Promise<Issuer[]> {
    if (!this.accessToken) {
      throw new Error('Mercado Pago no está configurado');
    }

    try {
      const params = new URLSearchParams({
        payment_method_id: paymentMethodId,
        bin: bin,
      });

      const response = await fetch(
        `https://api.mercadopago.com/v1/payment_methods/card_issuers?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error obteniendo emisores: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error obteniendo emisores:', error);
      throw error;
    }
  }

  /**
   * Obtener el estado de un pago
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    if (!this.accessToken) {
      throw new Error('Mercado Pago no está configurado');
    }

    try {
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error obteniendo estado del pago: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error obteniendo estado del pago:', error);
      throw error;
    }
  }

  /**
   * Procesar un pago (método legacy para compatibilidad)
   * @deprecated Usar createPayment en su lugar
   */
  async processPayment(paymentData: any): Promise<any> {
    const { payment_id } = paymentData;
    
    if (payment_id) {
      return this.getPaymentStatus(payment_id);
    }
    
    throw new Error('payment_id es requerido');
  }


  /**
   * Obtener mensaje de error amigable basado en el error de Mercado Pago
   */
  private getErrorMessage(errorData: any, status: number): string {
    // Errores específicos conocidos
    const errorMessages: Record<string, string> = {
      'bin_exclusion': 'La tarjeta ingresada no es válida o no está permitida para este tipo de transacción. Por favor, intenta con otra tarjeta de crédito o débito.',
      'invalid_card_number': 'El número de tarjeta ingresado no es válido. Verifica los datos e intenta nuevamente.',
      'invalid_expiration_date': 'La fecha de vencimiento de la tarjeta no es válida. Verifica el mes y año.',
      'invalid_security_code': 'El código de seguridad (CVV) ingresado no es válido.',
      'invalid_cardholder_name': 'El nombre del titular de la tarjeta no es válido.',
      'invalid_identification': 'El documento de identificación ingresado no es válido.',
      'insufficient_amount': 'El monto de la transacción es insuficiente.',
      'duplicated_payment': 'Ya existe un pago con los mismos datos. Por favor, espera unos minutos e intenta nuevamente.',
      'card_disabled': 'La tarjeta ingresada está deshabilitada. Contacta a tu banco o intenta con otra tarjeta.',
      'card_not_supported': 'El tipo de tarjeta ingresada no es compatible con este método de pago.',
      'invalid_payment_method': 'El método de pago seleccionado no es válido.',
      'payment_method_not_found': 'El método de pago no fue encontrado. Verifica los datos de la tarjeta.',
      'invalid_installments': 'El número de cuotas seleccionado no es válido.',
      'invalid_issuer': 'El emisor de la tarjeta no es válido.',
      'call_for_authorize': 'La transacción requiere autorización. Contacta a tu banco para autorizar el pago.',
      'card_not_authorized': 'La tarjeta no está autorizada para realizar esta transacción.',
      'expired_card': 'La tarjeta ingresada ha expirado. Verifica la fecha de vencimiento.',
      'invalid_user': 'Los datos del usuario no son válidos.',
      'invalid_payer': 'Los datos del pagador no son válidos.',
      'invalid_transaction_amount': 'El monto de la transacción no es válido.',
      'invalid_currency': 'La moneda de la transacción no es válida.',
      'invalid_operation_type': 'El tipo de operación no es válido.',
      'invalid_payment_type': 'El tipo de pago no es válido.',
      'invalid_payment_method_id': 'El ID del método de pago no es válido.',
      'invalid_token': 'El token de la tarjeta no es válido o ha expirado.',
      'invalid_card_token': 'El token de la tarjeta no es válido. Verifica que Public Key y Access Token sean del mismo par de credenciales en .env.local, y que no hayas esperado demasiado antes de pagar.',
      'invalid_external_reference': 'La referencia externa no es válida.',
      'invalid_notification_url': 'La URL de notificación no es válida.',
      'invalid_metadata': 'Los metadatos no son válidos.',
      'invalid_statement_descriptor': 'El descriptor de estado no es válido.',
      'invalid_processing_mode': 'El modo de procesamiento no es válido.',
      'invalid_merchant_account': 'La cuenta del comerciante no es válida.',
      'invalid_merchant_services': 'Los servicios del comerciante no son válidos.',
      'invalid_merchant_operations': 'Las operaciones del comerciante no son válidas.',
      'invalid_merchant_risk': 'El riesgo del comerciante no es válido.',
      'invalid_merchant_limits': 'Los límites del comerciante no son válidos.',
      'invalid_merchant_configuration': 'La configuración del comerciante no es válida.',
      'invalid_merchant_status': 'El estado del comerciante no es válido.',
      'invalid_merchant_verification': 'La verificación del comerciante no es válida.',
      'invalid_merchant_authorization': 'La autorización del comerciante no es válida.',
      'invalid_merchant_permissions': 'Los permisos del comerciante no son válidos.',
      'invalid_merchant_credentials': 'Las credenciales del comerciante no son válidas.',
      'invalid_merchant_environment': 'El entorno del comerciante no es válido.',
      'invalid_merchant_integration': 'La integración del comerciante no es válida.',
      'invalid_merchant_test_mode': 'El modo de prueba del comerciante no es válido.',
      'invalid_merchant_production_mode': 'El modo de producción del comerciante no es válido.',
      'invalid_merchant_sandbox_mode': 'El modo sandbox del comerciante no es válido.',
      'invalid_merchant_webhook': 'El webhook del comerciante no es válido.',
      'invalid_merchant_callback': 'El callback del comerciante no es válido.',
      'invalid_merchant_redirect': 'La redirección del comerciante no es válida.',
      'invalid_merchant_notification': 'La notificación del comerciante no es válida.',
      'invalid_merchant_webhook_url': 'La URL del webhook del comerciante no es válida.',
      'invalid_merchant_callback_url': 'La URL del callback del comerciante no es válida.',
      'invalid_merchant_redirect_url': 'La URL de redirección del comerciante no es válida.',
      'invalid_merchant_notification_url': 'La URL de notificación del comerciante no es válida.',
      'invalid_credentials': 'La API Orders de Mercado Pago ya no acepta credenciales de prueba (TEST-). Debes activar credenciales de producción y usarlas también para pruebas. Ver docs/mercadopago-test-cards.md.',
    };

    // API Orders devuelve errors: [{code, message, details}], y a veces code 'failed' con details
    if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      const first = errorData.errors[0];
      const detailsStr = Array.isArray(first.details) ? first.details.join(' ') : String(first.details || '');
      if (detailsStr.includes('invalid_card_token')) {
        return 'Token de tarjeta inválido. Asegúrate de que NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY y MERCADOPAGO_ACCESS_TOKEN sean del mismo par (ambos de Producción). Intenta nuevamente con los datos de la tarjeta.';
      }
      if (detailsStr.includes('rejected_by_issuer')) {
        return 'El pago fue rechazado por el emisor de la tarjeta. Con credenciales de producción, las tarjetas de prueba (4509..., 5031...) no funcionan; usa una tarjeta real o contacta a Mercado Pago sobre pruebas con test users.';
      }
      if (detailsStr.includes('invalid_users_involved')) {
        return 'Email del comprador no válido para pruebas. Crea una cuenta Comprador en Tu integración > Cuentas de prueba y usa el email que MP asigna a esa cuenta. Ver docs/mercadopago-test-cards.md.';
      }
      if (detailsStr.includes('processing_error')) {
        return 'Error de procesamiento. Verifica: 1) Titular de tarjeta debe ser APRO para pago aprobado. 2) Código postal en formato argentino (ej. C1406). 3) Intenta de nuevo (puede ser temporal).';
      }
      if (first.code === 'invalid_credentials') {
        const msg = (first.message || '').toLowerCase();
        if (msg.includes('test credentials are not supported')) {
          return 'Mercado Pago ya no acepta credenciales TEST-. Activa credenciales de producción en el panel y úsalas para pruebas. Ver docs/mercadopago-test-cards.md sección "invalid_credentials".';
        }
        return errorMessages['invalid_credentials'] || first.message || 'Credenciales inválidas.';
      }
      if (first.code && errorMessages[first.code]) {
        return errorMessages[first.code];
      }
      if (first.message) {
        return first.message;
      }
    }

    // Buscar el código de error específico
    if (errorData.cause && Array.isArray(errorData.cause)) {
      for (const cause of errorData.cause) {
        if (cause.code && errorMessages[cause.code]) {
          return errorMessages[cause.code];
        }
      }
    }

    // Si hay un código de error directo
    if (errorData.code && errorMessages[errorData.code]) {
      return errorMessages[errorData.code];
    }

    // Si hay un mensaje específico
    if (errorData.message) {
      return `Error de Mercado Pago: ${errorData.message}`;
    }

    // Si hay causas con descripciones
    if (errorData.cause && Array.isArray(errorData.cause)) {
      const causes = errorData.cause.map((c: any) => c.description || c.code).join(', ');
      return `Error de Mercado Pago: ${causes}`;
    }

    // Error genérico basado en el status
    const statusMessages: Record<number, string> = {
      400: 'Los datos enviados no son válidos. Por favor, verifica la información e intenta nuevamente.',
      401: 'Error de autenticación. Por favor, contacta al soporte técnico.',
      403: 'No tienes permisos para realizar esta operación.',
      404: 'El recurso solicitado no fue encontrado.',
      422: 'Los datos enviados no son válidos. Por favor, verifica la información e intenta nuevamente.',
      429: 'Has realizado demasiadas solicitudes. Por favor, espera unos minutos e intenta nuevamente.',
      500: 'Error interno del servidor. Por favor, intenta nuevamente más tarde.',
      502: 'Error de conexión con el servidor. Por favor, intenta nuevamente más tarde.',
      503: 'El servicio no está disponible temporalmente. Por favor, intenta nuevamente más tarde.',
    };

    return statusMessages[status] || `Error de Mercado Pago (${status}). Por favor, intenta nuevamente.`;
  }

  /**
   * Obtener código de error específico para logging y debugging
   */
  private getErrorCode(status: number, errorData: any): string {
    // Códigos de error específicos de Mercado Pago
    if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      const firstError = errorData.errors[0];
      if (firstError.code) {
        return `MP_${firstError.code}`;
      }
    }

    // Códigos de error HTTP estándar
    switch (status) {
      case 400:
        return 'HTTP_400_BAD_REQUEST';
      case 401:
        return 'HTTP_401_UNAUTHORIZED';
      case 402:
        return 'HTTP_402_PAYMENT_REQUIRED';
      case 403:
        return 'HTTP_403_FORBIDDEN';
      case 404:
        return 'HTTP_404_NOT_FOUND';
      case 422:
        return 'HTTP_422_UNPROCESSABLE_ENTITY';
      case 500:
        return 'HTTP_500_INTERNAL_SERVER_ERROR';
      case 502:
        return 'HTTP_502_BAD_GATEWAY';
      case 503:
        return 'HTTP_503_SERVICE_UNAVAILABLE';
      default:
        return `HTTP_${status}_UNKNOWN`;
    }
  }
}
