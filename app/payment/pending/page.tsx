import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function PaymentPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono de pendiente */}
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-12 h-12 text-yellow-600" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pago Pendiente
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6">
          Tu pago está siendo procesado. Te notificaremos por email cuando se confirme.
        </p>

        {/* Información adicional */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-yellow-800 mb-2">Estado del pago:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Tu pago está en proceso de verificación</li>
            <li>• Esto puede tomar algunos minutos o hasta 48 horas</li>
            <li>• Recibirás un email cuando se confirme</li>
            <li>• No es necesario realizar otro pago</li>
          </ul>
        </div>

        {/* Casos comunes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-800 mb-2">Pagos que quedan pendientes:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Pagos en efectivo (Rapipago, Pago Fácil)</li>
            <li>• Transferencias bancarias</li>
            <li>• Pagos que requieren verificación adicional</li>
          </ul>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 px-6 py-3 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors"
          >
            Volver al Inicio
          </Link>
          <Link
            href="/shop"
            className="flex-1 px-6 py-3 border border-stone-600 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Seguir Comprando
          </Link>
        </div>

        {/* Nota */}
        <p className="text-xs text-gray-500 mt-6">
          Puedes revisar el estado de tu pago en tu cuenta de Mercado Pago o{' '}
          <Link href="/contact" className="text-stone-600 hover:underline">
            contactarnos
          </Link>
          {' '}si tienes dudas.
        </p>
      </div>
    </div>
  );
}

