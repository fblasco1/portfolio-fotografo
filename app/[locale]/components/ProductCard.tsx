import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Eye, X } from "lucide-react";

export default function ProductCard({ product, t, addToCart }) {
  return (
    <Card key={product.id}>
      <CardContent className="flex flex-col h-full">
        {/* Modal para mostrar imagen en pantalla completa */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative w-full h-48 cursor-pointer group">
              <Image
                src={product.url}
                alt={t(product.titleKey)}
                fill
                className="object-cover rounded-md"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye size={24} className="text-white" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="fixed w-full max-w-4xl h-full max-h-[80vh] flex items-center justify-center border-none">
            <DialogTitle className="sr-only">{t(product.titleKey)}</DialogTitle>
            <div className="max-w-screen max-h-screen">
              <Image
                src={product.url}
                alt={t(product.titleKey)}
                fill
                objectFit="contain"
              />
            </div>
            <DialogClose asChild>
              <button className="absolute top-4 right-4 p-2 text-white">
                <X size={24} />
                <span className="sr-only">Close</span>
              </button>
            </DialogClose>
          </DialogContent>
        </Dialog>

        {/* Título y botón */}
        <CardTitle className="mt-2">{t(product.titleKey)}</CardTitle>
        <p className="text-sm text-gray-500 mb-4">{t(product.subtitle)}</p>
        <Button
          className="mt-auto bg-green-600 text-white hover:bg-green-400"
          onClick={() => addToCart(product)}
        >
          {t("addToCart")}
        </Button>
      </CardContent>
    </Card>
  );
}
