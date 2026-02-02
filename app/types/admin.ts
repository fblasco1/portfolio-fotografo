export interface Order {
  id: string;
  user_id: string | null;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  payment_id: string | null;
  preference_id: string | null;
  mercadopago_order_id: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'in_process' | 'cancelled' | 'refunded';
  status_detail: string | null;
  total_amount: number;
  currency: string;
  payment_method_id: string | null;
  installments: number;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  shipping_address: any;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  status_detail: string | null;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
}
