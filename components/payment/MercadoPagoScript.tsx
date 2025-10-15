'use client';

import { useEffect, useState } from 'react';

interface MercadoPagoScriptProps {
  publicKey: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function MercadoPagoScript({ publicKey, onLoad, onError }: MercadoPagoScriptProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Verificar si el script ya está cargado
    if (window.MercadoPago) {
      setIsLoaded(true);
      onLoad?.();
      return;
    }

    // Crear script tag
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;

    script.onload = () => {
      setIsLoaded(true);
      console.log('✅ SDK de Mercado Pago cargado');
      onLoad?.();
    };

    script.onerror = () => {
      const err = new Error('Error cargando SDK de Mercado Pago');
      setError(err);
      console.error('❌ Error cargando SDK de Mercado Pago');
      onError?.(err);
    };

    // Agregar script al documento
    document.body.appendChild(script);

    // Cleanup
    return () => {
      // Solo remover si no hay otros componentes usándolo
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [publicKey, onLoad, onError]);

  // Este componente no renderiza nada
  return null;
}

