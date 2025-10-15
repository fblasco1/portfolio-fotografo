'use client';

import { Label } from '@/app/[locale]/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/[locale]/components/ui/select';
import type { Installment } from '@/app/types/payment';

interface InstallmentSelectorProps {
  installments: Installment[];
  selectedInstallment: number;
  onSelect: (installments: number) => void;
  currency?: string;
}

export function InstallmentSelector({
  installments,
  selectedInstallment,
  onSelect,
  currency = 'ARS',
}: InstallmentSelectorProps) {
  if (installments.length === 0) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="installments">Cuotas</Label>
      <Select
        value={selectedInstallment.toString()}
        onValueChange={(value) => onSelect(parseInt(value))}
      >
        <SelectTrigger id="installments">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {installments.map((installment) => {
            const isInterestFree = installment.installment_rate === 0;
            return (
              <SelectItem
                key={installment.installments}
                value={installment.installments.toString()}
              >
                <div className="flex justify-between items-center w-full">
                  <span>
                    {installment.installments}x {formatCurrency(installment.installment_amount)}
                  </span>
                  {isInterestFree && installment.installments > 1 && (
                    <span className="text-green-600 text-xs ml-2">Sin interés</span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {/* Resumen de cuotas */}
      {selectedInstallment > 0 && (
        <div className="text-sm text-gray-600 mt-2">
          {(() => {
            const selected = installments.find(
              (i) => i.installments === selectedInstallment
            );
            if (!selected) return null;

            const isInterestFree = selected.installment_rate === 0;
            const totalAmount = selected.total_amount;

            return (
              <div className="space-y-1">
                <p>
                  <strong>{selected.installments} cuotas</strong> de{' '}
                  {formatCurrency(selected.installment_amount)}
                </p>
                {!isInterestFree && (
                  <p className="text-xs">
                    Total: {formatCurrency(totalAmount)} (TEA: {selected.installment_rate.toFixed(2)}%)
                  </p>
                )}
                {isInterestFree && selected.installments > 1 && (
                  <p className="text-xs text-green-600">
                    ✓ Sin interés
                  </p>
                )}
                {selected.recommended_message && (
                  <p className="text-xs text-blue-600">
                    {selected.recommended_message}
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

