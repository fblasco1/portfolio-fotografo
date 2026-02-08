'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/app/[locale]/components/ui/card';
import { Button } from '@/app/[locale]/components/ui/button';
import { Eye, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import type { Order } from '@/app/types/admin';

interface OrdersTableProps {
  beginDate: string;
  endDate: string;
}

export default function OrdersTable({ beginDate, endDate }: OrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set('begin_date', beginDate);
      params.set('end_date', endDate);
      if (filter !== 'all') params.set('status', filter);
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error('Error al cargar órdenes');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [beginDate, endDate, filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: 'bg-emerald-100 text-emerald-800',
      pending: 'bg-amber-100 text-amber-800',
      rejected: 'bg-red-100 text-red-800',
      in_process: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-stone-100 text-stone-800',
      refunded: 'bg-purple-100 text-purple-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status] || 'bg-stone-100 text-stone-800'
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <Card className="p-8 border-stone-200 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-300 border-t-stone-600" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-stone-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-stone-900">Órdenes</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setLoading(true); fetchOrders(); }}
          disabled={loading}
          className="gap-2 min-h-[36px] cursor-pointer hover:bg-stone-100"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refrescar
        </Button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
            className="min-h-[36px] px-3 cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
            aria-pressed={filter === status}
          >
            {status === 'all'
              ? 'Todas'
              : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="text-left p-3 text-sm font-medium text-stone-600">
                ID
              </th>
              <th className="text-left p-3 text-sm font-medium text-stone-600">
                Total
              </th>
              <th className="text-left p-3 text-sm font-medium text-stone-600">
                Estado
              </th>
              <th className="text-left p-3 text-sm font-medium text-stone-600">
                Fecha
              </th>
              <th className="text-left p-3 text-sm font-medium text-stone-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-stone-500">
                  No hay órdenes
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-stone-100 hover:bg-stone-50"
                >
                  <td className="p-3">
                    <code className="text-xs text-stone-700">
                      {order.id.length > 12 ? `${order.id.slice(0, 12)}...` : order.id}
                    </code>
                  </td>
                  <td className="p-3 text-stone-900">
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: order.currency || 'ARS',
                    }).format(Number(order.total_amount))}
                  </td>
                  <td className="p-3">{getStatusBadge(order.status)}</td>
                  <td className="p-3 text-sm text-stone-600">
                    {new Date(order.created_at).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/admin/orders/${encodeURIComponent(order.id)}`}
                      className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md hover:bg-stone-100 active:bg-stone-200 transition-colors"
                      aria-label="Ver detalle de la orden"
                    >
                      <Button variant="ghost" size="sm" className="cursor-pointer hover:bg-stone-100">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
