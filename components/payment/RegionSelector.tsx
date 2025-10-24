"use client";

import { useState } from 'react';
import { useRegion } from '@/contexts/RegionContext';

const LATIN_AMERICA_COUNTRIES = [
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
];

interface RegionSelectorProps {
  className?: string;
  showLabel?: boolean;
}

export default function RegionSelector({ className = '', showLabel = true }: RegionSelectorProps) {
  const { region, loading, setRegion } = useRegion();
  const [isOpen, setIsOpen] = useState(false);

  const handleCountrySelect = (countryCode: string) => {
    setRegion(countryCode);
    setIsOpen(false);
  };

  const currentCountry = LATIN_AMERICA_COUNTRIES.find(c => c.code === region?.country);

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        <span className="text-sm text-gray-600">Detectando ubicación...</span>
      </div>
    );
  }

  // Si la región detectada no es de Latinoamérica, mostrar mensaje
  if (region && !region.isSupported) {
    return (
      <div className={`${className}`}>
        {showLabel && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ubicación
          </label>
        )}
        <div className="p-3 border border-orange-300 rounded-md bg-orange-50">
          <div className="flex items-center space-x-2">
            <span className="text-orange-600">⚠️</span>
            <div>
              <p className="text-sm font-medium text-orange-800">
                Región no soportada
              </p>
              <p className="text-xs text-orange-600">
                Actualmente solo soportamos pagos en Latinoamérica. Selecciona un país de la región.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ubicación
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{currentCountry?.flag}</span>
          <span className="text-sm font-medium text-gray-900">
            {currentCountry?.name || 'Seleccionar país'}
          </span>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="py-1">
            {LATIN_AMERICA_COUNTRIES.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountrySelect(country.code)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm hover:bg-gray-100 ${
                  region?.country === country.code ? 'bg-stone-50 text-stone-900' : 'text-gray-900'
                }`}
              >
                <span className="text-lg">{country.flag}</span>
                <span>{country.name}</span>
                {region?.country === country.code && (
                  <svg className="h-4 w-4 text-stone-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {region && region.isSupported && (
        <div className="mt-2 text-xs text-gray-500">
          <span>Moneda: {region.currencyName} ({region.currency})</span>
          <span className="mx-2">•</span>
          <span>Proveedor: Mercado Pago</span>
        </div>
      )}
    </div>
  );
}

