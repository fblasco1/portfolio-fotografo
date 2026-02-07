'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/app/[locale]/components/ui/card';
import {
  DollarSign,
  ShoppingCart,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { Order } from '@/app/types/admin';

interface OrdersStatsProps {
  beginDate: string;
  endDate: string;
}

export default function OrdersStats({ beginDate, endDate }: OrdersStatsProps) {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const params = new URLSearchParams({
          limit: '50',
          begin_date: beginDate,
          end_date: endDate,
        });
        const res = await fetch(`/api/admin/orders?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        const orders: Order[] = data.orders || [];

        const approved = orders.filter((o) => o.status === 'approved');
        const pending = orders.filter((o) => o.status === 'pending');
        const rejected = orders.filter((o) => o.status === 'rejected');
        const totalRevenue = approved.reduce(
          (sum, o) => sum + Number(o.total_amount || 0),
          0
        );

        setStats({
          total: orders.length,
          approved: approved.length,
          pending: pending.length,
          rejected: rejected.length,
          totalRevenue,
        });
      } catch {
        // Silently fail
      }
    };

    fetchStats();
  }, [beginDate, endDate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card className="p-6 border-stone-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-600 font-medium">Total Órdenes</p>
            <p className="text-2xl font-bold text-stone-900">{stats.total}</p>
          </div>
          <ShoppingCart className="h-8 w-8 text-stone-400" />
        </div>
      </Card>

      <Card className="p-6 border-stone-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-600 font-medium">Aprobadas</p>
            <p className="text-2xl font-bold text-emerald-600">
              {stats.approved}
            </p>
          </div>
          <CheckCircle className="h-8 w-8 text-emerald-500" />
        </div>
      </Card>

      <Card className="p-6 border-stone-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-600 font-medium">Pendientes</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </div>
          <ShoppingCart className="h-8 w-8 text-amber-500" />
        </div>
      </Card>

      <Card className="p-6 border-stone-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-600 font-medium">Rechazadas</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
      </Card>

      <Card className="p-6 md:col-span-4 border-stone-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-600 font-medium">
              Ingresos Totales
            </p>
            <p className="text-2xl font-bold text-stone-900">
              ${stats.totalRevenue.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-emerald-500" />
        </div>
      </Card>
    </div>
  );
}
