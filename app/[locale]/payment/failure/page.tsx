import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono de error */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pago No Procesado
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6">
          No pudimos procesar tu pago. Esto puede deberse a varios motivos, pero no te preocupes, puedes intentarlo nuevamente.
        </p>

        {/* Información adicional */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-red-800 mb-2">Motivos comunes:</h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Fondos insuficientes en la tarjeta</li>
            <li>• Datos de tarjeta incorrectos</li>
            <li>• Límite de compra excedido</li>
            <li>• Tarjeta bloqueada o vencida</li>
          </ul>
        </div>

        {/* Sugerencias */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-800 mb-2">¿Qué puedes hacer?</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Verifica los datos de tu tarjeta</li>
            <li>• Intenta con otro método de pago</li>
            <li>• Contacta a tu banco si el problema persiste</li>
            <li>• Usa otro medio de pago disponible</li>
          </ul>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/checkout"
            className="flex-1 px-6 py-3 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors"
          >
            Reintentar Pago
          </Link>
          <Link
            href="/shop"
            className="flex-1 px-6 py-3 border border-stone-600 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Volver a la Tienda
          </Link>
        </div>

        {/* Nota */}
        <p className="text-xs text-gray-500 mt-6">
          Si necesitas ayuda, contáctanos a través de nuestro{' '}
          <Link href="/contact" className="text-stone-600 hover:underline">
            formulario de contacto
          </Link>
        </p>
      </div>
    </div>
  );
}

