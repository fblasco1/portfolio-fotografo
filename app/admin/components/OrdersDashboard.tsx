'use client';

import { useState } from 'react';
import { Card } from '@/app/[locale]/components/ui/card';
import { Button } from '@/app/[locale]/components/ui/button';
import { Search } from 'lucide-react';
import OrdersStats from './OrdersStats';
import OrdersTable from './OrdersTable';

function toYmd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function OrdersDashboard() {
  const defaultBegin = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return toYmd(d);
  })();
  const defaultEnd = toYmd(new Date());

  const [pendingBegin, setPendingBegin] = useState(defaultBegin);
  const [pendingEnd, setPendingEnd] = useState(defaultEnd);
  const [appliedBegin, setAppliedBegin] = useState(defaultBegin);
  const [appliedEnd, setAppliedEnd] = useState(defaultEnd);

  const handleApplyFilter = () => {
    const begin = new Date(pendingBegin + 'T00:00:00.000Z');
    const end = new Date(pendingEnd + 'T00:00:00.000Z');
    const diffDays = Math.ceil((end.getTime() - begin.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 30) {
      const adjusted = new Date(end);
      adjusted.setUTCDate(adjusted.getUTCDate() - 30);
      setPendingBegin(adjusted.toISOString().slice(0, 10));
      setAppliedBegin(adjusted.toISOString().slice(0, 10));
      setAppliedEnd(pendingEnd);
    } else {
      setAppliedBegin(pendingBegin);
      setAppliedEnd(pendingEnd);
    }
  };

  return (
    <>
      <Card className="p-4 mb-6 border-stone-200 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Desde:</label>
            <input
              type="date"
              value={pendingBegin}
              onChange={(e) => setPendingBegin(e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-md text-sm w-full min-w-[140px] focus:ring-2 focus:ring-stone-400 focus:border-stone-400 outline-none transition-shadow"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Hasta:</label>
            <input
              type="date"
              value={pendingEnd}
              onChange={(e) => setPendingEnd(e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-md text-sm w-full min-w-[140px] focus:ring-2 focus:ring-stone-400 focus:border-stone-400 outline-none transition-shadow"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleApplyFilter}
            className="gap-2 min-h-[40px] px-4 cursor-pointer hover:bg-stone-100 active:scale-[0.98] transition-transform"
          >
            <Search className="h-4 w-4" />
            Aplicar filtro
          </Button>
        </div>
        <p className="text-xs text-stone-500 mt-2">Máximo 30 días entre Desde y Hasta</p>
      </Card>

      <OrdersStats beginDate={appliedBegin} endDate={appliedEnd} />
      <OrdersTable beginDate={appliedBegin} endDate={appliedEnd} />
    </>
  );
}
