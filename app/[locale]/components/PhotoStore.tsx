"use client";

import { useState } from "react";
import Image from "next/image";
import type { StoreItem } from "@/app/types/store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useScopedI18n } from "@/locales/client";
import { Eye, ShoppingCart, X } from "lucide-react";

interface Products {
  photos: StoreItem[];
  postcards: StoreItem[];
}

export default function PhotoStore({ items }: { items: Products }) {
  const t = useScopedI18n("shop");
  const [cart, setCart] = useState<StoreItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const addToCart = (product: StoreItem) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-16">
      <Tabs defaultValue="photos">
        <TabsList className="flex justify-center mb-4 border-b">
          <TabsTrigger
            value="photos"
            className="px-4 pb-2 border-b-2 data-[state=active]:border-black"
          >
            {t("tabs.photos")}
          </TabsTrigger>
          <TabsTrigger
            value="postcards"
            className="px-4 pb-2 border-b-2 data-[state=active]:border-black"
          >
            {t("tabs.postcards")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photos">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {items.photos.map((product) => (
              <Card key={product.id}>
                <CardContent className="flex flex-col h-full">
                  {/* Modal para mostrar la imagen en pantalla completa */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="relative w-full h-48 cursor-pointer group">
                        <Image
                          src={product.url}
                          alt={t(product.titleKey)}
                          fill
                          className="object-cover rounded-md"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye size={24} className="text-white" />
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="fixed w-full max-w-4xl h-full max-h-[80vh] flex items-center justify-center border-none">
                      {/* Título accesible (oculto visualmente) */}
                      <DialogTitle className="sr-only">
                        {t(product.titleKey)}
                      </DialogTitle>
                      {/* Contenedor que limita el tamaño de la imagen */}
                      <div className="max-w-screen max-h-screen">
                        <Image
                          src={product.url}
                          alt={t(product.titleKey)}
                          fill={true}
                          objectFit="contain"
                        />
                      </div>
                      {/* Botón de cierre */}
                      <DialogClose asChild>
                        <button className="absolute top-4 right-4 p-2 text-white">
                          <X size={24} />
                          <span className="sr-only">Close</span>
                        </button>
                      </DialogClose>
                    </DialogContent>
                  </Dialog>

                  {/* Resto del contenido de la Card */}
                  <CardTitle className="mt-2">{t(product.titleKey)}</CardTitle>
                  <p className="text-sm text-gray-500 mb-4">
                    {t(product.subtitle)}
                  </p>
                  <Button
                    className="mt-auto bg-green-600 text-white hover:bg-green-400"
                    onClick={() => addToCart(product)}
                  >
                    {t("addToCart")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="postcards">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {items.postcards.map((product) => (
              <Card key={product.id}>
                <CardContent className="flex flex-col h-full">
                  {/* Modal para mostrar la imagen en pantalla completa */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="relative w-full h-48 cursor-pointer group">
                        <Image
                          src={product.url}
                          alt={t(product.titleKey)}
                          fill
                          className="object-cover rounded-md"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye size={24} className="text-white" />
                        </div>
                      </div>
                    </DialogTrigger>

                    <DialogContent className="fixed w-full max-w-4xl h-full max-h-[80vh] flex items-center justify-center border-none">
                      {/* Título accesible (oculto visualmente) */}
                      <DialogTitle className="sr-only">
                        {t(product.titleKey)}
                      </DialogTitle>
                      {/* Contenedor que limita el tamaño de la imagen */}
                      <div className="max-w-screen max-h-screen">
                        <Image
                          src={product.url}
                          alt={t(product.titleKey)}
                          fill={true}
                          objectFit="contain"
                        />
                      </div>
                      {/* Botón de cierre */}
                      <DialogClose asChild>
                        <button className="absolute top-4 right-4 p-2 text-white">
                          <X size={24} />
                          <span className="sr-only">Close</span>
                        </button>
                      </DialogClose>
                    </DialogContent>
                  </Dialog>
                  {/* Resto del contenido de la Card */}
                  <CardTitle className="mt-2">{t(product.titleKey)}</CardTitle>
                  <p className="text-sm text-gray-500 mb-4">
                    {t(product.subtitle)}
                  </p>
                  <Button
                    className="mt-auto bg-green-600 text-white hover:bg-green-400"
                    onClick={() => addToCart(product)}
                  >
                    {t("addToCart")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Carrito */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-white hover:bg-stone shadow-lg flex items-center justify-center"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="p-4">
          <h2 className="text-xl font-bold mb-4">{t("cart.title")}</h2>
          {cart.length === 0 ? (
            <p>{t("cart.empty")}</p>
          ) : (
            <ul>
              {cart.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center mb-2"
                >
                  {t(item.titleKey)}
                  <Button
                    className="bg-red-600 text-white hover:bg-red-400"
                    size="sm"
                    onClick={() => removeFromCart(index)}
                  >
                    {t("remove")}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
