// Componentes de pago
export { default as OrderSummary } from './OrderSummary';
export { default as PaymentConfirmation } from './PaymentConfirmation';
export { default as CartButton } from './CartButton';
export { default as AddToCartButton } from './AddToCartButton';
export { default as RegionSelector } from './RegionSelector';

// Hooks
export { useCart } from '../../contexts/CartContext';
export { useRegion } from '../../contexts/RegionContext';
export { usePayment } from '../../hooks/usePayment';

// Utilidades
export { formatPrice, detectRegion, detectRegionByIP, detectRegionByBrowser } from '../../lib/payment/region-detector';
export { calculateTotalPrice, getProductPrice, isCurrencySupported } from '../../lib/payment/config';
export { PaymentFactory } from '../../lib/payment/payment-factory';
