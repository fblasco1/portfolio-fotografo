-- ===========================================
-- MIGRACIÓN: Agregar payer y payment_info a orders
-- ===========================================
-- Persiste la información completa del pagador y del pago

-- Columna payer: objeto completo del pagador (name, email, id, phone, address, identification)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payer JSONB DEFAULT '{}'::jsonb;

-- Columna payment_info: datos del pago de transactions.payments (para Online Payments)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_info JSONB DEFAULT '{}'::jsonb;

-- Índice para buscar por mercadopago_order_id (usado por admin)
CREATE INDEX IF NOT EXISTS idx_orders_mercadopago_order_id ON orders(mercadopago_order_id);
