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
    setAppliedBegin(pendingBegin);
    setAppliedEnd(pendingEnd);
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
              className="px-3 py-1.5 border border-stone-200 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Hasta:</label>
            <input
              type="date"
              value={pendingEnd}
              onChange={(e) => setPendingEnd(e.target.value)}
              className="px-3 py-1.5 border border-stone-200 rounded-md text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleApplyFilter}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Aplicar filtro
          </Button>
        </div>
      </Card>

      <OrdersStats beginDate={appliedBegin} endDate={appliedEnd} />
      <OrdersTable beginDate={appliedBegin} endDate={appliedEnd} />
    </>
  );
}
