"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { detectRegion, detectRegionByBrowser, type RegionInfo } from '@/lib/payment/region-detector';

interface RegionContextType {
  region: RegionInfo | null;
  loading: boolean;
  error: string | null;
  setRegion: (countryCode: string) => void;
  refreshRegion: () => Promise<void>;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

// Variable global para cachear la región y evitar múltiples llamadas
let cachedRegion: RegionInfo | null = null;
let regionPromise: Promise<RegionInfo> | null = null;

interface RegionProviderProps {
  children: ReactNode;
}

export function RegionProvider({ children }: RegionProviderProps) {
  const [region, setRegionState] = useState<RegionInfo | null>(cachedRegion);
  const [loading, setLoading] = useState(!cachedRegion);
  const [error, setError] = useState<string | null>(null);

  // Detectar región automáticamente al cargar (solo una vez)
  useEffect(() => {
    if (!cachedRegion && !regionPromise) {
      detectRegionAutomatically();
    }
  }, []);

  const detectRegionAutomatically = async () => {
    // Si ya hay una promesa en curso, esperarla
    if (regionPromise) {
      try {
        const result = await regionPromise;
        setRegionState(result);
        return;
      } catch (err) {
        // La promesa falló, intentar de nuevo
        regionPromise = null;
      }
    }

    setLoading(true);
    setError(null);

    // Crear una nueva promesa para evitar llamadas duplicadas
    regionPromise = (async () => {
      try {
        let detectedRegion: RegionInfo;

        // Intentar cargar desde localStorage primero
        try {
          const savedRegion = localStorage.getItem('user_region');
          if (savedRegion) {
            const parsed = JSON.parse(savedRegion);
            const timestamp = parsed.timestamp || 0;
            const cacheAge = Date.now() - timestamp;
            
            // Cache válido por 1 hora
            if (cacheAge < 60 * 60 * 1000) {
              console.log('🌍 Usando región desde localStorage (cache)');
              detectedRegion = parsed.region;
              cachedRegion = detectedRegion;
              setRegionState(detectedRegion);
              setLoading(false);
              return detectedRegion;
            }
          }
        } catch (localStorageError) {
          console.log('⚠️ Error leyendo región desde localStorage:', localStorageError);
        }

        // Usar nuestro endpoint de geolocalización
        try {
          const response = await fetch('/api/geolocation');
          const result = await response.json();
          
          detectedRegion = detectRegion(result.data.country_code);
          console.log('🌍 Región detectada por servidor:', detectedRegion);
          
          // Guardar en localStorage
          try {
            localStorage.setItem('user_region', JSON.stringify({
              region: detectedRegion,
              timestamp: Date.now()
            }));
          } catch (storageError) {
            console.warn('⚠️ No se pudo guardar región en localStorage');
          }
          
        } catch (serverError) {
          console.log('⚠️ Error detectando por servidor, usando navegador:', serverError);
          // Fallback a detección por navegador
          detectedRegion = detectRegionByBrowser();
          console.log('🌍 Región detectada por navegador:', detectedRegion);
        }

        cachedRegion = detectedRegion;
        setRegionState(detectedRegion);
        setLoading(false);
        return detectedRegion;
      } catch (err) {
        console.error('❌ Error detectando región:', err);
        setError('Error detectando tu ubicación');
        // Fallback a Argentina
        const fallbackRegion = detectRegion('AR');
        cachedRegion = fallbackRegion;
        setRegionState(fallbackRegion);
        setLoading(false);
        return fallbackRegion;
      }
    })();

    try {
      await regionPromise;
    } catch (err) {
      console.error('Error en detectRegionAutomatically:', err);
    } finally {
      regionPromise = null;
    }
  };

  const setRegion = (countryCode: string) => {
    const newRegion = detectRegion(countryCode);
    cachedRegion = newRegion;
    setRegionState(newRegion);
    
    // Guardar en localStorage
    try {
      localStorage.setItem('user_region', JSON.stringify({
        region: newRegion,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('⚠️ No se pudo guardar región en localStorage');
    }
    
    console.log('🌍 Región cambiada manualmente:', newRegion);
  };

  const refreshRegion = async () => {
    // Limpiar cache
    cachedRegion = null;
    regionPromise = null;
    localStorage.removeItem('user_region');
    await detectRegionAutomatically();
  };

  return (
    <RegionContext.Provider value={{ region, loading, error, setRegion, refreshRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion(): RegionContextType {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion debe ser usado dentro de un RegionProvider');
  }
  return context;
}

