"use client";

import { useState, useEffect } from 'react';
import { useRegion } from '@/contexts/RegionContext';
import { formatPrice } from '@/lib/payment/region-detector';

interface PaymentConfirmationProps {
  paymentId: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  amount: number;
  currency: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: number;
  }>;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  locale: string;
  onClose: () => void;
}

export default function PaymentConfirmation({
  paymentId,
  status,
  amount,
  currency,
  items,
  customerInfo,
  locale,
  onClose
}: PaymentConfirmationProps) {
  const { region } = useRegion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getStatusInfo = () => {
    switch (status) {
      case 'approved':
        return {
          icon: '✅',
          title: locale === 'es' ? '¡Pago Aprobado!' : 'Payment Approved!',
          message: locale === 'es' 
            ? 'Tu pago ha sido procesado exitosamente. Recibirás un email de confirmación pronto.'
            : 'Your payment has been processed successfully. You will receive a confirmation email soon.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      case 'rejected':
        return {
          icon: '❌',
          title: locale === 'es' ? 'Pago Rechazado' : 'Payment Rejected',
          message: locale === 'es'
            ? 'Tu pago fue rechazado. Por favor verifica los datos de tu tarjeta e intenta nuevamente.'
            : 'Your payment was rejected. Please verify your card details and try again.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      case 'cancelled':
        return {
          icon: '⚠️',
          title: locale === 'es' ? 'Pago Cancelado' : 'Payment Cancelled',
          message: locale === 'es'
            ? 'El pago fue cancelado. Puedes intentar nuevamente cuando estés listo.'
            : 'The payment was cancelled. You can try again when you are ready.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      default:
        return {
          icon: '⏳',
          title: locale === 'es' ? 'Procesando Pago' : 'Processing Payment',
          message: locale === 'es'
            ? 'Tu pago está siendo procesado. Te notificaremos cuando esté completo.'
            : 'Your payment is being processed. We will notify you when it is complete.',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {locale === 'es' ? 'Confirmación de Pago' : 'Payment Confirmation'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-4`}>
            <div className="flex items-center space-x-3">
              <span className={`text-3xl ${statusInfo.iconColor}`}>
                {statusInfo.icon}
              </span>
              <div>
                <h3 className={`text-lg font-semibold ${statusInfo.textColor}`}>
                  {statusInfo.title}
                </h3>
                <p className={`text-sm ${statusInfo.textColor}`}>
                  {statusInfo.message}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'es' ? 'Detalles del Pago' : 'Payment Details'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  {locale === 'es' ? 'ID de Pago' : 'Payment ID'}
                </p>
                <p className="font-mono text-sm text-gray-900">{paymentId}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">
                  {locale === 'es' ? 'Monto' : 'Amount'}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {region ? formatPrice(amount, region.currency, region.symbol) : `${currency} ${amount}`}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'es' ? 'Productos' : 'Products'}
            </h3>
            
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">
                      {locale === 'es' ? 'Cantidad' : 'Quantity'}: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {region ? formatPrice(item.price * item.quantity, region.currency, region.symbol) : `${currency} ${item.price * item.quantity}`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'es' ? 'Información de Envío' : 'Shipping Information'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  {locale === 'es' ? 'Nombre' : 'Name'}
                </p>
                <p className="font-medium text-gray-900">{customerInfo.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{customerInfo.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">
                  {locale === 'es' ? 'Teléfono' : 'Phone'}
                </p>
                <p className="font-medium text-gray-900">{customerInfo.phone}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">
                  {locale === 'es' ? 'Ciudad' : 'City'}
                </p>
                <p className="font-medium text-gray-900">{customerInfo.city}</p>
              </div>
              
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">
                  {locale === 'es' ? 'Dirección' : 'Address'}
                </p>
                <p className="font-medium text-gray-900">{customerInfo.address}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">
                  {locale === 'es' ? 'Código Postal' : 'Postal Code'}
                </p>
                <p className="font-medium text-gray-900">{customerInfo.postalCode}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {status === 'approved' && (
              <button
                onClick={() => window.print()}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>{locale === 'es' ? 'Imprimir Recibo' : 'Print Receipt'}</span>
              </button>
            )}
            
            {(status === 'rejected' || status === 'cancelled') && (
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-stone-600 text-white py-3 px-4 rounded-md hover:bg-stone-700 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{locale === 'es' ? 'Intentar Nuevamente' : 'Try Again'}</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600"
            >
              {locale === 'es' ? 'Cerrar' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
