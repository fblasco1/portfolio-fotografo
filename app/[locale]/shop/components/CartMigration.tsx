"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CartMigrationProps {
  locale: string;
  onToggle: (useEnhanced: boolean) => void;
  useEnhanced: boolean;
}

export default function CartMigration({ locale, onToggle, useEnhanced }: CartMigrationProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getText = (key: string) => {
    const texts = {
      title: {
        es: "Sistema de Carrito",
        en: "Cart System"
      },
      description: {
        es: "Elige entre el carrito básico o el sistema mejorado con pagos",
        en: "Choose between basic cart or enhanced system with payments"
      },
      basic: {
        es: "Carrito Básico",
        en: "Basic Cart"
      },
      enhanced: {
        es: "Carrito Mejorado",
        en: "Enhanced Cart"
      },
      basicDescription: {
        es: "Carrito simple con formulario de contacto",
        en: "Simple cart with contact form"
      },
      enhancedDescription: {
        es: "Carrito con integración de pagos Mercado Pago",
        en: "Cart with Mercado Pago payment integration"
      },
      features: {
        es: "Características",
        en: "Features"
      },
      basicFeatures: {
        es: [
          "Formulario de contacto simple",
          "Envío por email",
          "Sin procesamiento de pagos",
          "Compatible con sistema actual"
        ],
        en: [
          "Simple contact form",
          "Email delivery",
          "No payment processing",
          "Compatible with current system"
        ]
      },
      enhancedFeatures: {
        es: [
          "Integración con Mercado Pago",
          "Detección automática de región",
          "Cálculo de precios por moneda local",
          "Formulario de checkout completo",
          "Validación de región soportada",
          "Persistencia del carrito",
          "Estados visuales mejorados"
        ],
        en: [
          "Mercado Pago integration",
          "Automatic region detection",
          "Local currency pricing",
          "Complete checkout form",
          "Supported region validation",
          "Cart persistence",
          "Enhanced visual states"
        ]
      },
      toggle: {
        es: "Usar carrito mejorado",
        en: "Use enhanced cart"
      },
      details: {
        es: "Ver detalles",
        en: "View details"
      },
      hideDetails: {
        es: "Ocultar detalles",
        en: "Hide details"
      },
      new: {
        es: "NUEVO",
        en: "NEW"
      }
    };
    return texts[key as keyof typeof texts]?.[locale as keyof typeof texts[key]] || texts[key as keyof typeof texts]?.es;
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>{getText("title")}</span>
              {useEnhanced && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {getText("new")}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {getText("description")}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="cart-toggle" className="text-sm">
              {getText("toggle")}
            </Label>
            <Switch
              id="cart-toggle"
              checked={useEnhanced}
              onCheckedChange={onToggle}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Carrito Básico */}
          <div className={`p-4 rounded-lg border-2 transition-colors ${
            !useEnhanced 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <h3 className="font-semibold text-gray-900 mb-2">
              {getText("basic")}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {getText("basicDescription")}
            </p>
            <div className="text-xs text-gray-500">
              {getText("basicFeatures")[locale === 'es' ? 0 : 1]} • {getText("basicFeatures")[locale === 'es' ? 1 : 1]} • {getText("basicFeatures")[locale === 'es' ? 2 : 2]}
            </div>
          </div>

          {/* Carrito Mejorado */}
          <div className={`p-4 rounded-lg border-2 transition-colors ${
            useEnhanced 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <span>{getText("enhanced")}</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                {getText("new")}
              </Badge>
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {getText("enhancedDescription")}
            </p>
            <div className="text-xs text-gray-500">
              {getText("enhancedFeatures")[locale === 'es' ? 0 : 1]} • {getText("enhancedFeatures")[locale === 'es' ? 1 : 1]} • {getText("enhancedFeatures")[locale === 'es' ? 2 : 2]}
            </div>
          </div>
        </div>

        {/* Botón para ver detalles */}
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? getText("hideDetails") : getText("details")}
          </Button>
        </div>

        {/* Detalles expandidos */}
        {showDetails && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                {getText("basic")} - {getText("features")}
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {getText("basicFeatures").map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                {getText("enhanced")} - {getText("features")}
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {getText("enhancedFeatures").map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
