// Tipos para integración con Checkout API de Mercado Pago

export interface CardToken {
  id: string;
  public_key: string;
  card_id: string | null;
  status: string;
  date_created: string;
  date_last_updated: string;
  date_due: string;
  luhn_validation: boolean;
  live_mode: boolean;
  require_esc: boolean;
  security_code_length: number;
  cardholder: {
    identification: {
      number: string;
      type: string;
    };
    name: string;
  };
}

export interface PaymentMethod {
  id: string;
  name: string;
  payment_type_id: string;
  type?: string;
  thumbnail: string;
  secure_thumbnail: string;
  status: string;
  settings: {
    card_number: {
      validation: string;
      length: number;
    };
    bin: {
      pattern: string;
      installments_pattern: string;
      exclusion_pattern: string;
    };
    security_code: {
      length: number;
      card_location: string;
      mode: string;
    };
  };
  additional_info_needed: string[];
  min_allowed_amount: number;
  max_allowed_amount: number;
  accreditation_time: number;
  financial_institutions: any[];
  processing_modes: string[];
}

export interface Installment {
  installments: number;
  installment_rate: number;
  discount_rate: number;
  min_allowed_amount: number;
  max_allowed_amount: number;
  recommended_message: string;
  installment_amount: number;
  total_amount: number;
  payment_method_option_id?: string;
}

export interface InstallmentOption {
  payment_method_id: string;
  payment_type_id: string;
  issuer: {
    id: string;
    name: string;
  };
  processing_mode: string;
  merchant_account_id: string | null;
  payer_costs: Installment[];
}

export interface Issuer {
  id: string;
  name: string;
  thumbnail: string;
  processing_mode: string;
}

export interface PayerInfo {
  email: string;
  first_name?: string;
  last_name?: string;
  identification?: {
    type: string;
    number: string;
  };
  address?: {
    zip_code?: string;
    street_name?: string;
    street_number?: string;
    neighborhood?: string;
    city?: string;
    federal_unit?: string;
  };
  phone?: {
    area_code?: string;
    number?: string;
  };
}

export interface PaymentRequest {
  token: string;
  transaction_amount: number;
  installments: number;
  payment_method_id: string;
  issuer_id?: string;
  currency_id?: string; // NUEVO
  payer: PayerInfo;
  description?: string;
  external_reference?: string;
  statement_descriptor?: string;
  metadata?: Record<string, any>;
  notification_url?: string;
}

export interface PaymentResponse {
  id: number;
  status: 'approved' | 'pending' | 'rejected' | 'in_process' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  date_created: string;
  date_approved: string | null;
  date_last_updated: string;
  money_release_date: string | null;
  payment_method_id: string;
  payment_type_id: string;
  installments: number;
  external_reference: string;
  transaction_details: {
    net_received_amount: number;
    total_paid_amount: number;
    overpaid_amount: number;
    installment_amount: number;
  };
  card: {
    first_six_digits: string;
    last_four_digits: string;
    expiration_month: number;
    expiration_year: number;
    date_created: string;
    date_last_updated: string;
    cardholder: {
      name: string;
      identification: {
        number: string;
        type: string;
      };
    };
  };
  payer: {
    id: string;
    email: string;
    identification: {
      type: string;
      number: string;
    };
    type: string;
  };
}

// Tipos para el SDK de Mercado Pago (window.MercadoPago)
export interface MercadoPagoSDK {
  new (publicKey: string, options?: { locale?: string }): MercadoPagoInstance;
}

export interface MercadoPagoInstance {
  getIdentificationTypes(): Promise<IdentificationType[]>;
  getPaymentMethods(options: { bin: string }): Promise<PaymentMethod[]>;
  getIssuers(options: { paymentMethodId: string; bin: string }): Promise<Issuer[]>;
  getInstallments(options: {
    amount: string;
    locale?: string;
    bin: string;
    processingMode?: string;
  }): Promise<InstallmentOption[]>;
  createCardToken(cardData: CardFormData): Promise<CardToken>;
  fields: {
    create(type: string, options?: any): CardField;
  };
}

export interface CardField {
  mount(elementId: string): void;
  unmount(): void;
  on(event: string, callback: (error?: any) => void): void;
}

export interface IdentificationType {
  id: string;
  name: string;
  type: string;
  min_length: number;
  max_length: number;
}

export interface CardFormData {
  cardNumber: string;
  cardholderName: string;
  cardExpirationMonth: string;
  cardExpirationYear: string;
  expiryDate: string;
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
}

// Declaración global para TypeScript
declare global {
  interface Window {
    MercadoPago: MercadoPagoSDK;
  }
}

export {};

