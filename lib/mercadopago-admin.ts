/**
 * Cliente para APIs de administración de Mercado Pago
 * Orders, Payments, Refunds
 */

const MP_BASE = 'https://api.mercadopago.com';

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado');
  }
  return token;
}

async function mpFetch<T>(
  path: string,
  options: RequestInit & { headers?: Record<string, string> } = {}
): Promise<T> {
  const token = getAccessToken();
  const url = `${MP_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const msg = (errData as any)?.message || errData?.errors?.[0]?.message || res.statusText;
    throw new Error(`Mercado Pago API: ${msg}`);
  }

  return res.json() as Promise<T>;
}

export interface MPOrder {
  id: string | number;
  type?: string;
  status: string;
  status_detail?: string;
  total_amount: string | number;
  total_paid_amount?: string | number;
  currency?: string;
  external_reference?: string;
  date_created: string;
  last_updated_date?: string;
  paid_amount?: number;
  items?: Array<{
    id?: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: string;
    category_id?: string;
  }>;
  payments?: Array<{ id: number | string; status: string; status_detail?: string; transaction_amount?: number; amount?: string }>;
  payer?: {
    id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: { area_code?: string; number?: string };
    address?: Record<string, string>;
  };
  /** transactions.payments (Online Payments: id string PAY01...) */
  transactions?: {
    payments?: Array<{
      id: number | string;
      status: string;
      status_detail?: string;
      transaction_amount?: number;
      amount?: string;
      date_approved?: string;
      payment_method?: { id?: string; installments?: number };
    }>;
  };
}

export interface MPOrdersSearchResponse {
  elements?: MPOrder[];
  next_offset?: number;
  total?: number;
}

export interface MPPayment {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  date_created: string;
  date_approved: string | null;
  payer: {
    email?: string;
    first_name?: string;
    last_name?: string;
    id?: string;
  };
  payment_method_id: string;
  installments: number;
  external_reference: string;
}

/**
 * Buscar órdenes en Mercado Pago (Online Payments API)
 */
export async function searchOrders(params: {
  limit?: number;
  offset?: number;
  status?: string;
  date_created_from?: string;
  date_created_to?: string;
  begin_date?: string;
  end_date?: string;
  external_reference?: string;
} = {}): Promise<MPOrder[]> {
  const now = new Date();
  const toYmd = (d: Date) => d.toISOString().slice(0, 10);
  const toRfc3339 = (ymd: string, endOfDay = false) => {
    if (/^\d{4}-\d{2}-\d{2}T/.test(ymd)) return ymd;
    return endOfDay ? `${ymd}T23:59:59.999Z` : `${ymd}T00:00:00.000Z`;
  };
  const endYmd = params.end_date ?? params.date_created_to ?? toYmd(now);
  const beginYmd = params.begin_date ?? params.date_created_from ?? (() => {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return toYmd(d);
  })();
  const dateCreatedFrom = toRfc3339(beginYmd);
  const dateCreatedTo = toRfc3339(endYmd, true);
  const limit = Math.min(params.limit || 50, 50);
  const offset = params.offset || 0;

  const searchParams = new URLSearchParams();
  searchParams.set('begin_date', dateCreatedFrom);
  searchParams.set('end_date', dateCreatedTo);
  searchParams.set('limit', String(limit));
  searchParams.set('offset', String(offset));
  if (params.status) searchParams.set('status', params.status);
  if (params.external_reference) searchParams.set('external_reference', params.external_reference);

  try {
    const data = await mpFetch<{ elements?: MPOrder[]; results?: MPOrder[] } | MPOrder[]>(
      `/v1/orders?${searchParams.toString()}`
    );
    let list: MPOrder[] = Array.isArray(data) ? data : [];
    const obj = data as { elements?: MPOrder[]; results?: MPOrder[] };
    if (!Array.isArray(data)) list = obj.elements || obj.results || [];
    return list;
  } catch (e) {
    console.warn('searchOrders failed:', e);
    return [];
  }
}

/**
 * Obtener una orden por ID (Online Payments API)
 */
export async function getOrder(orderId: string): Promise<MPOrder> {
  return mpFetch<MPOrder>(`/v1/orders/${orderId}`);
}

/**
 * Reembolsar una orden (Online Payments API)
 * POST /v1/orders/{order_id}/refund con X-Idempotency-Key
 * Reembolso total: body vacío. Reembolso parcial: { amount: number }
 */
export async function refundOrder(orderId: string, amount?: number): Promise<unknown> {
  const idempotencyKey = `refund_${orderId}_${Date.now()}`;
  const body = amount != null ? { amount } : {};
  return mpFetch(`/v1/orders/${orderId}/refund`, {
    method: 'POST',
    headers: {
      'X-Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(body),
  });
}

/**
 * Obtener un pago por ID (usado por webhook u otras partes del sistema)
 */
export async function getPayment(paymentId: string): Promise<MPPayment> {
  return mpFetch<MPPayment>(`/v1/payments/${paymentId}`);
}
