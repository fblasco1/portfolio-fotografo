'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/[locale]/components/ui/dialog';
import { Button } from '@/app/[locale]/components/ui/button';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface PaymentResultModalProps {
  isOpen: boolean;
  status: 'approved' | 'pending' | 'rejected' | 'in_process' | 'cancelled' | null;
  paymentId?: number;
  statusDetail?: string;
  onClose: () => void;
  onGoHome: () => void;
  onContinueShopping: () => void;
}

export function PaymentResultModal({
  isOpen,
  status,
  paymentId,
  statusDetail,
  onClose,
  onGoHome,
  onContinueShopping,
}: PaymentResultModalProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle2,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50',
          title: '¡Pago Exitoso!',
          description: 'Tu pago ha sido aprobado correctamente.',
          details: 'Recibirás un correo electrónico con los detalles de tu compra.',
        };
      case 'pending':
      case 'in_process':
        return {
          icon: Clock,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          title: 'Pago en Proceso',
          description: 'Tu pago está siendo procesado.',
          details:
            'Recibirás una notificación cuando sea aprobado. Esto puede tomar unos minutos.',
        };
      case 'rejected':
      case 'cancelled':
        return {
          icon: XCircle,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50',
          title: 'Pago Rechazado',
          description: 'No pudimos procesar tu pago.',
          details: statusDetail || 'Por favor verifica los datos de tu tarjeta e intenta nuevamente.',
        };
      default:
        return {
          icon: AlertCircle,
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-50',
          title: 'Estado Desconocido',
          description: 'No pudimos determinar el estado del pago.',
          details: 'Por favor contacta a soporte.',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <div className={`mx-auto w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
            <Icon className={`w-10 h-10 ${config.iconColor}`} />
          </div>
          <DialogTitle className="text-center text-2xl">{config.title}</DialogTitle>
          <DialogDescription asChild>
            <div className="text-center space-y-2">
              <div className="text-lg">{config.description}</div>
              <div className="text-sm text-gray-600">{config.details}</div>
              {paymentId && (
                <div className="text-xs text-gray-500 mt-4">
                  ID de pago: <span className="font-mono">{paymentId}</span>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 bg-white">
          {status === 'approved' ? (
            <>
              <Button onClick={onGoHome} variant="outline" className="w-full sm:w-auto">
                Volver al Inicio
              </Button>
              <Button onClick={onContinueShopping} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                Seguir Comprando
              </Button>
            </>
          ) : status === 'pending' || status === 'in_process' ? (
            <>
              <Button onClick={onGoHome} variant="outline" className="w-full sm:w-auto">
                Volver al Inicio
              </Button>
              <Button onClick={onClose} className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white">
                Entendido
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
                Cerrar
              </Button>
              <Button onClick={() => window.location.reload()} className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white">
                Intentar Nuevamente
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

