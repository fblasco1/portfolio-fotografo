'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/app/[locale]/components/ui/input';
import { Label } from '@/app/[locale]/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/[locale]/components/ui/select';
import type { IdentificationType } from '@/app/types/payment';

interface CardFormData {
  cardNumber: string;
  cardholderName: string;
  cardExpirationMonth: string;
  cardExpirationYear: string;
  expiryDate: string;
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
}

interface CardFormProps {
  identificationTypes: IdentificationType[];
  onDataChange: (data: CardFormData) => void;
  onBinChange: (bin: string) => void;
  errors?: Partial<Record<keyof CardFormData, string>>;
}

export function CardForm({ identificationTypes, onDataChange, onBinChange, errors }: CardFormProps) {
  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: '',
    cardholderName: '',
    cardExpirationMonth: '',
    cardExpirationYear: '',
    expiryDate: '',
    securityCode: '',
    identificationType: identificationTypes[0]?.id || '',
    identificationNumber: '',
  });

  useEffect(() => {
    if (identificationTypes.length > 0 && !formData.identificationType) {
      setFormData(prev => ({ ...prev, identificationType: identificationTypes[0].id }));
    }
  }, [identificationTypes, formData.identificationType]);

  const handleChange = (field: keyof CardFormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);

    // Si cambió el número de tarjeta y tiene al menos 6 dígitos, extraer BIN
    if (field === 'cardNumber' && value.length >= 6) {
      const bin = value.substring(0, 6);
      onBinChange(bin);
    }
  };

  const formatCardNumber = (value: string) => {
    // Eliminar espacios y caracteres no numéricos
    const cleaned = value.replace(/\D/g, '');
    // Limitar a 16 dígitos
    const limited = cleaned.substring(0, 16);
    // Agregar espacios cada 4 dígitos
    return limited.match(/.{1,4}/g)?.join(' ') || limited;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    const cleaned = formatted.replace(/\s/g, '');
    handleChange('cardNumber', cleaned);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return month.toString().padStart(2, '0');
  });

  return (
    <div className="space-y-4">
      {/* Número de Tarjeta */}
      <div className="space-y-2">
        <Label htmlFor="cardNumber">Número de tarjeta</Label>
        <Input
          id="cardNumber"
          type="text"
          placeholder="1234 5678 9012 3456"
          value={formatCardNumber(formData.cardNumber)}
          onChange={handleCardNumberChange}
          maxLength={19} // 16 dígitos + 3 espacios
          className={errors?.cardNumber ? 'border-red-500' : ''}
        />
        {errors?.cardNumber && (
          <p className="text-sm text-red-500">{errors.cardNumber}</p>
        )}
      </div>

      {/* Nombre del Titular */}
      <div className="space-y-2">
        <Label htmlFor="cardholderName">Nombre del titular</Label>
        <Input
          id="cardholderName"
          type="text"
          placeholder="Como aparece en la tarjeta"
          value={formData.cardholderName}
          onChange={(e) => handleChange('cardholderName', e.target.value.toUpperCase())}
          className={errors?.cardholderName ? 'border-red-500' : ''}
        />
        {errors?.cardholderName && (
          <p className="text-sm text-red-500">{errors.cardholderName}</p>
        )}
      </div>

      {/* Vencimiento y CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Vencimiento</Label>
          <Input
            id="expiryDate"
            type="text"
            placeholder="MM/AA"
            maxLength={5}
            value={formData.expiryDate || ''}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              
              // Aplicar formato MM/AA automáticamente
              if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
              }
              
              // Crear nuevo objeto de datos
              const newData = { ...formData, expiryDate: value };
              
              // Si está completo (MM/AA), extraer mes y año
              if (value.length === 5 && value.includes('/')) {
                const [month, year] = value.split('/');
                if (month && year && month.length === 2 && year.length === 2) {
                  newData.cardExpirationMonth = month;
                  newData.cardExpirationYear = '20' + year;
                }
              }
              
              // Actualizar estado y notificar cambios
              setFormData(newData);
              onDataChange(newData);
            }}
            className={errors?.cardExpirationMonth || errors?.cardExpirationYear ? 'border-red-500' : ''}
          />
          {(errors?.cardExpirationMonth || errors?.cardExpirationYear) && (
            <p className="text-sm text-red-500">
              {errors.cardExpirationMonth || errors.cardExpirationYear}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="securityCode">CVV</Label>
          <Input
            id="securityCode"
            type="text"
            placeholder="123"
            maxLength={4}
            value={formData.securityCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              handleChange('securityCode', value);
            }}
            className={errors?.securityCode ? 'border-red-500' : ''}
          />
          {errors?.securityCode && (
            <p className="text-sm text-red-500">{errors.securityCode}</p>
          )}
        </div>
      </div>

      {/* Tipo de Documento */}
      <div className="space-y-2">
        <Label htmlFor="identificationType">Tipo de documento</Label>
        <Select
          value={formData.identificationType}
          onValueChange={(value) => handleChange('identificationType', value)}
        >
          <SelectTrigger id="identificationType" className={errors?.identificationType ? 'border-red-500' : ''}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {identificationTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.identificationType && (
          <p className="text-sm text-red-500">{errors.identificationType}</p>
        )}
      </div>

      {/* Número de Documento */}
      <div className="space-y-2">
        <Label htmlFor="identificationNumber">Número de documento</Label>
        <Input
          id="identificationNumber"
          type="text"
          placeholder="12345678"
          value={formData.identificationNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            handleChange('identificationNumber', value);
          }}
          className={errors?.identificationNumber ? 'border-red-500' : ''}
        />
        {errors?.identificationNumber && (
          <p className="text-sm text-red-500">{errors.identificationNumber}</p>
        )}
      </div>
    </div>
  );
}

