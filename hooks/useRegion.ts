"use client";

import { useState, useEffect } from 'react';
import { detectRegion, detectRegionByIP, detectRegionByBrowser, type RegionInfo } from '@/lib/payment/region-detector';

interface UseRegionReturn {
  region: RegionInfo | null;
  loading: boolean;
  error: string | null;
  setRegion: (countryCode: string) => void;
  refreshRegion: () => Promise<void>;
}

export function useRegion(): UseRegionReturn {
  const [region, setRegionState] = useState<RegionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detectar región automáticamente al cargar
  useEffect(() => {
    detectRegionAutomatically();
  }, []);

  const detectRegionAutomatically = async () => {
    setLoading(true);
    setError(null);

    try {
      let detectedRegion: RegionInfo;

      // Usar nuestro endpoint de geolocalización
      try {
        const response = await fetch('/api/geolocation');
        const result = await response.json();
        
        if (result.success) {
          detectedRegion = detectRegion(result.data.country_code);
          console.log('🌍 Región detectada por servidor:', detectedRegion);
        } else {
          throw new Error('Error en la respuesta del servidor');
        }
      } catch (serverError) {
        console.log('⚠️ Error detectando por servidor, usando navegador:', serverError);
        // Fallback a detección por navegador
        detectedRegion = detectRegionByBrowser();
        console.log('🌍 Región detectada por navegador:', detectedRegion);
      }

      setRegionState(detectedRegion);
    } catch (err) {
      console.error('❌ Error detectando región:', err);
      setError('Error detectando tu ubicación');
      // Fallback a Argentina
      setRegionState(detectRegion('AR'));
    } finally {
      setLoading(false);
    }
  };

  const setRegion = (countryCode: string) => {
    const newRegion = detectRegion(countryCode);
    setRegionState(newRegion);
    console.log('🌍 Región cambiada manualmente:', newRegion);
  };

  const refreshRegion = async () => {
    await detectRegionAutomatically();
  };

  return {
    region,
    loading,
    error,
    setRegion,
    refreshRegion
  };
}

