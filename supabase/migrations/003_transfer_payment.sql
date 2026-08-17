-- ===========================================
-- MIGRACIÓN: Transferencia bancaria manual
-- ===========================================
-- Ejecutar en SQL Editor de Supabase
-- Extiende `orders` para el flujo PENDING_TRANSFER → AWAITING_VERIFICATION → PAID

-- Columnas nuevas
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS receipt_url TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_receipt_url ON orders((receipt_url IS NOT NULL));

-- Ampliar CHECK de status (incluye estados MP existentes + transferencia)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check CHECK (
    status IN (
      -- Mercado Pago (legado)
      'pending',
      'approved',
      'rejected',
      'in_process',
      'cancelled',
      'refunded',
      -- Transferencia manual
      'PENDING_TRANSFER',
      'AWAITING_VERIFICATION',
      'PAID',
      'EXPIRED',
      'SHIPPED'
    )
  );

COMMENT ON COLUMN orders.payment_method IS 'TRANSFER | MERCADOPAGO | …';
COMMENT ON COLUMN orders.receipt_url IS 'Legado/opcional; el flujo actual envía el comprobante por email sin Storage';
