import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono de éxito */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Pago Exitoso!
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6">
          Tu pago ha sido procesado correctamente. Recibirás un email de confirmación con los detalles de tu compra.
        </p>

        {/* Información adicional */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-green-800 mb-2">¿Qué sigue?</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>✓ Recibirás un email con los detalles de tu compra</li>
            <li>✓ Tu pedido será procesado en las próximas 24-48 horas</li>
            <li>✓ Nos pondremos en contacto contigo para coordinar el envío</li>
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
            href="/gallery"
            className="flex-1 px-6 py-3 border border-stone-600 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Seguir Comprando
          </Link>
        </div>

        {/* Nota */}
        <p className="text-xs text-gray-500 mt-6">
          Si tienes alguna consulta, contáctanos a través de nuestro{' '}
          <Link href="/contact" className="text-stone-600 hover:underline">
            formulario de contacto
          </Link>
        </p>
      </div>
    </div>
  );
}

