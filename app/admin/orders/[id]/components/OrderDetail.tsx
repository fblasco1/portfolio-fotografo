'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/app/[locale]/components/ui/card';
import { Button } from '@/app/[locale]/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import AdminNav from '@/app/admin/components/AdminNav';
import type { Order } from '@/app/types/admin';

interface OrderDetailProps {
  orderId: string;
}

function PaymentInfoCard({ payment }: { payment: Record<string, unknown> }) {
  if (payment._error) {
    return <p className="text-sm text-amber-700">{String(payment._error)}</p>;
  }
  const renderValue = (val: unknown): React.ReactNode => {
    if (val == null) return '—';
    if (typeof val === 'boolean') return val ? 'Sí' : 'No';
    if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
      return (
        <pre className="text-xs bg-stone-100 p-2 rounded overflow-x-auto max-h-32 overflow-y-auto">
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    }
    return String(val);
  };

  const skipKeys = new Set(['metadata', 'additional_info', '_error']);
  const entries = Object.entries(payment).filter(([k]) => !skipKeys.has(k));

  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <div key={key} className="text-sm">
          <span className="font-medium text-stone-600">{key}:</span>{' '}
          <span className="text-stone-900">{renderValue(value)}</span>
        </div>
      ))}
      {(payment.metadata || payment.additional_info) && (
        <details className="mt-2">
          <summary className="font-medium text-stone-600 cursor-pointer">metadata / additional_info</summary>
          <pre className="text-xs bg-stone-100 p-2 rounded mt-2 overflow-x-auto max-h-40 overflow-y-auto">
            {JSON.stringify(
              { metadata: payment.metadata, additional_info: payment.additional_info },
              null,
              2
            )}
          </pre>
        </details>
      )}
    </div>
  );
}

export default function OrderDetail({ orderId }: OrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Orden no encontrada');
      }
      const data = await res.json();
      setOrder(data.order);
      setPayment(data.payment ? (data.payment as Record<string, unknown>) : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar la orden');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleRefund = async () => {
    if (!order || !confirm('¿Confirmar reembolso de esta orden?')) return;
    setRefunding(true);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/refund`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al reembolsar');
      alert('Reembolso procesado correctamente');
      fetchOrder();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al procesar reembolso');
    } finally {
      setRefunding(false);
    }
  };

  const canRefund = order?.status === 'approved';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="container mx-auto px-4 py-8">
          <AdminNav />
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-stone-300 border-t-stone-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="container mx-auto px-4 py-8">
          <AdminNav />
          <div className="rounded-lg bg-red-50 p-6 text-red-700">
            <p className="font-medium">{error || 'Orden no encontrada'}</p>
            <Link href="/admin/dashboard" className="mt-4 inline-block">
              <Button variant="outline" className="gap-2 min-h-[44px] px-4 cursor-pointer hover:bg-stone-100 active:scale-[0.98] transition-all">
                <ArrowLeft className="h-4 w-4" />
                Volver al Panel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="container mx-auto px-4 py-8">
        <AdminNav />
        <Link href="/admin/dashboard">
          <Button variant="ghost" className="mb-4 gap-2 min-h-[44px] px-4 cursor-pointer hover:bg-stone-100 active:scale-[0.98] transition-all">
            <ArrowLeft className="h-4 w-4" />
            Volver al Panel
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border-stone-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Detalle de la Orden</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-600">ID</label>
                <p className="text-sm font-mono text-stone-900">{order.id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-stone-600">
                  Información del pagador (payer)
                </label>
                {order.payer ? (
                  <div className="mt-2 space-y-1 text-sm text-stone-700 bg-stone-50 rounded-lg p-4">
                    {order.payer.name && (
                      <p><span className="font-medium text-stone-600">Nombre:</span> {order.payer.name}</p>
                    )}
                    {(order.payer.first_name || order.payer.last_name) && !order.payer.name && (
                      <p>
                        <span className="font-medium text-stone-600">Nombre:</span>{' '}
                        {[order.payer.first_name, order.payer.last_name].filter(Boolean).join(' ')}
                      </p>
                    )}
                    {order.payer.email && (
                      <p><span className="font-medium text-stone-600">Email:</span> {order.payer.email}</p>
                    )}
                    {order.payer.id && (
                      <p><span className="font-medium text-stone-600">ID payer:</span> {order.payer.id}</p>
                    )}
                    {(order.payer.phone?.number || order.customer_phone) && (
                      <p>
                        <span className="font-medium text-stone-600">Teléfono:</span>{' '}
                        {order.payer.phone?.area_code && order.payer.phone?.number
                          ? `+${order.payer.phone.area_code} ${order.payer.phone.number}`
                          : order.customer_phone || order.payer.phone?.number}
                      </p>
                    )}
                    {order.payer.identification?.type && (
                      <p>
                        <span className="font-medium text-stone-600">Documento:</span>{' '}
                        {order.payer.identification.type} {order.payer.identification.number}
                      </p>
                    )}
                    {order.payer.address && Object.keys(order.payer.address).length > 0 && (
                      <p>
                        <span className="font-medium text-stone-600">Dirección:</span>{' '}
                        {[
                          order.payer.address.street_name,
                          order.payer.address.street_number,
                          order.payer.address.city,
                          order.payer.address.zip_code,
                          order.payer.address.federal_unit,
                          order.payer.address.country_name,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="font-medium text-stone-900">{order.customer_name || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-stone-600">Total</label>
                <p className="text-xl font-bold text-stone-900">
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: order.currency || 'ARS',
                  }).format(Number(order.total_amount))}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-stone-600">
                  Estado
                </label>
                <p className="font-medium text-stone-900 capitalize">
                  {order.status}
                </p>
                {order.status_detail && (
                  <p className="text-sm text-stone-600">{order.status_detail}</p>
                )}
              </div>

              {canRefund && (
                <Button
                  onClick={handleRefund}
                  disabled={refunding}
                  variant="outline"
                  className="w-full min-h-[44px] border-amber-300 text-amber-800 hover:bg-amber-50 hover:border-amber-400 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer gap-2 transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  {refunding ? 'Procesando...' : 'Reembolsar orden'}
                </Button>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6 border-stone-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-stone-900">
                Items
              </h3>
              <div className="space-y-2">
                {Array.isArray(order.items) && order.items.length > 0 ? (
                  order.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">
                          {item.title || 'Producto'}
                        </p>
                        <p className="text-sm text-stone-600">
                          Cantidad: {item.quantity || 1}
                        </p>
                      </div>
                      <p className="font-medium text-stone-900">
                        $
                        {Number(item.price || 0).toLocaleString('es-AR', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-500">No hay items</p>
                )}
              </div>
            </Card>

            {order.payment_id && (
              <Card className="p-6 border-stone-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-stone-900">
                  Pago Mercado Pago
                </h3>
                <p className="text-sm text-stone-600 mb-4">
                  Payment ID: <code className="font-mono">{order.payment_id}</code>
                </p>
                {payment ? (
                  <PaymentInfoCard payment={payment} />
                ) : (
                  <p className="text-sm text-stone-500">Sin información de pago en la orden</p>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
