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
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const url = `${MP_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
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
  payments?: Array<{ id: number; status: string; status_detail?: string; transaction_amount: number }>;
  payer?: {
    id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: { area_code?: string; number?: string };
    address?: Record<string, string>;
  };
  /** merchant_orders usa payments, Orders API usa transactions.payments */
  transactions?: {
    payments?: Array<{
      id: number;
      status: string;
      status_detail?: string;
      transaction_amount: number;
      date_approved?: string;
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
 * Buscar órdenes en Mercado Pago
 * Usa la API de órdenes (v1/orders) o merchant_orders como fallback
 * Requiere begin_date y end_date (obligatorios en MP)
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
  /** Convierte YYYY-MM-DD a RFC 3339 (requerido por MP) */
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
  const begin = toRfc3339(beginYmd);
  const end = toRfc3339(endYmd, true);

  const baseParams = new URLSearchParams();
  baseParams.set('begin_date', begin);
  baseParams.set('end_date', end);
  if (params.limit) baseParams.set('limit', String(params.limit));
  if (params.offset) baseParams.set('offset', String(params.offset));
  if (params.status) baseParams.set('status', params.status);
  if (params.external_reference) baseParams.set('external_reference', params.external_reference);

  const query = baseParams.toString();

  // Intentar Orders API (nuevo) - requiere begin_date/end_date
  try {
    const path = `/v1/orders?${query}`;
    const data = await mpFetch<MPOrdersSearchResponse | MPOrder[]>(path);
    if (Array.isArray(data)) return data;
    const elements = (data as MPOrdersSearchResponse).elements;
    if (elements?.length) return elements;
  } catch (e) {
    if (!String(e).includes('404') && !String(e).includes('not found')) {
      console.warn('Orders API search failed, trying merchant_orders:', e);
    }
  }

  // Fallback: merchant_orders (doc: no requiere begin/end_date)
  const moParams = new URLSearchParams();
  if (params.limit) moParams.set('limit', String(params.limit));
  if (params.offset) moParams.set('offset', String(params.offset));
  if (params.status) moParams.set('status', params.status);
  if (params.external_reference) moParams.set('external_reference', params.external_reference);
  try {
    const path = `/merchant_orders/search${moParams.toString() ? `?${moParams.toString()}` : ''}`;
    const data = await mpFetch<{ elements?: MPOrder[]; results?: MPOrder[] } | MPOrder[]>(path);
    let list: MPOrder[] = Array.isArray(data) ? data : [];
    const obj = data as { elements?: MPOrder[]; results?: MPOrder[] };
    if (!Array.isArray(data)) list = obj.elements || obj.results || [];
    // Filtrar por rango de fechas (merchant_orders no acepta begin/end_date)
    const beginTs = new Date(begin).getTime();
    const endTs = new Date(end).getTime();
    return list.filter((o) => {
      const created = new Date((o as any).date_created || 0).getTime();
      return created >= beginTs && created <= endTs;
    });
  } catch {
    return [];
  }
}

/**
 * Obtener una orden por ID
 * Prueba v1/orders y luego v1/merchant_orders
 */
export async function getOrder(orderId: string): Promise<MPOrder> {
  try {
    return await mpFetch<MPOrder>(`/v1/orders/${orderId}`);
  } catch {
    return mpFetch<MPOrder>(`/v1/merchant_orders/${orderId}`);
  }
}

/**
 * Reembolsar una orden
 * Intenta order refund; si falla, intenta refund del pago asociado
 */
export async function refundOrder(orderId: string): Promise<unknown> {
  try {
    return await mpFetch(`/v1/orders/${orderId}/refund`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  } catch (e) {
    const order = await getOrder(orderId).catch(() => null);
    const paymentId =
      (order as any)?.transactions?.payments?.[0]?.id ??
      (order as any)?.payments?.[0]?.id;
    if (paymentId) {
      return mpFetch(`/v1/payments/${paymentId}/refunds`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
    }
    throw e;
  }
}

/**
 * Obtener un pago por ID
 */
export async function getPayment(paymentId: string): Promise<MPPayment> {
  return mpFetch<MPPayment>(`/v1/payments/${paymentId}`);
}
