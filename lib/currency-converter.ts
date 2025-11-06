/**
 * Servicio para convertir precios de USD a moneda local
 */

import { getDollarRateByCurrency } from './dolar-api';

/**
 * Convierte un precio en USD a la moneda local
 * @param amountUSD Precio en dólares
 * @param currency Código de moneda (ARS, BRL, CLP, etc.)
 * @param countryCode Código de país (opcional, para mejor precisión)
 * @returns Precio convertido en moneda local
 */
export async function convertUSDToLocal(
  amountUSD: number,
  currency: string,
  countryCode?: string
): Promise<number> {
  if (currency.toUpperCase() === 'USD') {
    return amountUSD;
  }

  try {
    const rate = await getDollarRateByCurrency(currency, countryCode);
    const converted = amountUSD * rate;
    
    // Redondear según la moneda
    return roundByCurrency(converted, currency);
  } catch (error) {
    console.error('Error convirtiendo moneda:', error);
    // En caso de error, retornar el precio en USD como fallback
    return amountUSD;
  }
}

/**
 * Redondea un precio según las reglas de cada moneda
 */
function roundByCurrency(amount: number, currency: string): number {
  const upperCurrency = currency.toUpperCase();

  switch (upperCurrency) {
    case 'ARS': // Pesos argentinos: redondear a 0 decimales
      return Math.round(amount);
    
    case 'BRL': // Reales brasileños: 2 decimales
      return Math.round(amount * 100) / 100;
    
    case 'CLP': // Pesos chilenos: 0 decimales
      return Math.round(amount);
    
    case 'COP': // Pesos colombianos: 0 decimales
      return Math.round(amount);
    
    case 'MXN': // Pesos mexicanos: 2 decimales
      return Math.round(amount * 100) / 100;
    
    case 'PEN': // Soles peruanos: 2 decimales
      return Math.round(amount * 100) / 100;
    
    case 'UYU': // Pesos uruguayos: 0 decimales
      return Math.round(amount);
    
    case 'USD': // Dólares: 2 decimales
      return Math.round(amount * 100) / 100;
    
    default:
      // Por defecto, 2 decimales
      return Math.round(amount * 100) / 100;
  }
}

/**
 * Convierte un precio de moneda local a USD
 * @param amountLocal Precio en moneda local
 * @param currency Código de moneda
 * @param countryCode Código de país (opcional)
 * @returns Precio en USD
 */
export async function convertLocalToUSD(
  amountLocal: number,
  currency: string,
  countryCode?: string
): Promise<number> {
  if (currency.toUpperCase() === 'USD') {
    return amountLocal;
  }

  try {
    const rate = await getDollarRateByCurrency(currency, countryCode);
    const converted = amountLocal / rate;
    
    // Redondear a 2 decimales para USD
    return Math.round(converted * 100) / 100;
  } catch (error) {
    console.error('Error convirtiendo moneda a USD:', error);
    return amountLocal;
  }
}
