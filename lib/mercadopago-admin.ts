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
    const details = (errData as any)?.details ?? errData?.errors?.[0]?.details;
    const detailStr = details != null
      ? (typeof details === 'string' ? details : JSON.stringify(details))
      : '';
    const fullMsg = detailStr
      ? `Mercado Pago API: ${msg}. Details: ${detailStr}`
      : `Mercado Pago API: ${msg}`;
    throw new Error(fullMsg);
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
    name?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: { area_code?: string; number?: string };
    address?: Record<string, string>;
    identification?: { type?: string; number?: string };
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

/** Online Payments API: created, processed, action_required, failed, processing, refunded, canceled */
export type OrderStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'in_process'
  | 'cancelled'
  | 'refunded';

export function mapMPOrderStatusToOrderStatus(
  orderStatus: string,
  paymentStatus?: string,
  statusDetail?: string
): OrderStatus {
  const os = (orderStatus || '').toLowerCase();
  const ps = (paymentStatus || '').toLowerCase();
  const sd = (statusDetail || '').toLowerCase();

  // processed = todas las transacciones exitosas → approved
  if (os === 'processed' || ps === 'approved' || sd === 'accredited') return 'approved';
  // refunded
  if (os === 'refunded' || ps === 'refunded' || ps === 'charged_back' || sd === 'refunded' || sd === 'partially_refunded')
    return 'refunded';
  // canceled (MP usa spelling US)
  if (os === 'canceled' || os === 'cancelled' || ps === 'canceled' || ps === 'cancelled' || sd === 'canceled')
    return 'cancelled';
  // failed / rejected
  if (os === 'failed' || ps === 'rejected') return 'rejected';
  // processing, action_required, in_process
  if (os === 'processing' || os === 'action_required' || ps === 'in_process' || ps === 'pending' || sd === 'in_process')
    return 'in_process';
  // created, open
  if (os === 'created' || os === 'open') return 'pending';

  return 'pending';
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
  status?: string;
  date_created_from?: string;
  date_created_to?: string;
  begin_date?: string;
  end_date?: string;
  external_reference?: string;
} = {}): Promise<MPOrder[]> {
  const now = new Date();
  const toYmd = (d: Date) => d.toISOString().slice(0, 10);
  const toIso8601 = (ymd: string, endOfDay = false) => {
    if (/^\d{4}-\d{2}-\d{2}T/.test(ymd)) return ymd;
    if (endOfDay) {
      return `${ymd}T23:59:59.999Z`;
    }
    return `${ymd}T00:00:00.000Z`;
  };
  let endYmd = params.end_date ?? params.date_created_to ?? toYmd(now);
  let beginYmd = params.begin_date ?? params.date_created_from ?? (() => {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return toYmd(d);
  })();
  const beginDate = new Date(beginYmd + 'T00:00:00.000Z');
  let endDate = new Date(endYmd + 'T00:00:00.000Z');
  const diffMs = endDate.getTime() - beginDate.getTime();
  const maxRangeMs = 29 * 24 * 60 * 60 * 1000; // 29 días: MP permite máx 1 month
  if (diffMs > maxRangeMs) {
    endDate = new Date(beginDate.getTime() + maxRangeMs);
    endYmd = endDate.toISOString().slice(0, 10);
  }
  const diffDays = Math.ceil((endDate.getTime() - beginDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 30) {
    throw new Error(`Mercado Pago API: Invalid date range. Details: date range: maximum allowed is 1 month`);
  }
  const beginDateIso = toIso8601(beginYmd);
  const endDateIso = toIso8601(endYmd, true);

  const p = new URLSearchParams();
  p.set('begin_date', beginDateIso);
  p.set('end_date', endDateIso);

  const path = `/v1/orders?${p.toString()}`;
  if (process.env.NODE_ENV === 'development') {
    console.log('[MP] searchOrders:', path);
  }

  try {
    const data = await mpFetch<{ elements?: MPOrder[]; results?: MPOrder[]; data?: MPOrder[] } | MPOrder[]>(path);
    const list = Array.isArray(data) ? data : (data as any).elements || (data as any).results || (data as any).data || [];
    if (process.env.NODE_ENV === 'development') {
      console.log('[MP] searchOrders ok:', list.length, 'orders');
    }
    const filtered = params.status
      ? list.filter((o: MPOrder) => (o.status || '').toLowerCase() === (params.status || '').toLowerCase())
      : list;
    return filtered;
  } catch (e) {
    console.warn('[MP] searchOrders failed:', e);
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
