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

export default function OrderDetail({ orderId }: OrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(null);
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
              <Button variant="outline" className="gap-2">
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
          <Button variant="ghost" className="mb-4 gap-2">
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
                <label className="text-sm font-medium text-stone-600">Cliente</label>
                <p className="font-medium text-stone-900">
                  {order.customer_name || 'N/A'}
                </p>
                <p className="text-sm text-stone-600">{order.customer_email}</p>
                {order.customer_phone && (
                  <p className="text-sm text-stone-600">{order.customer_phone}</p>
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
                  className="w-full border-amber-300 text-amber-800 hover:bg-amber-50 gap-2"
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
                <p className="text-sm text-stone-600">
                  Payment ID: <code className="font-mono">{order.payment_id}</code>
                </p>
                <p className="text-xs text-stone-500 mt-2">
                  Puedes verificar el estado en el panel de Mercado Pago
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
