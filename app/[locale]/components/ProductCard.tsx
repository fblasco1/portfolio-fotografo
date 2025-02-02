"use client";

import Image from "next/image";
import { useState } from "react";
import { useScopedI18n } from "@/locales/client";
import type { StoreItem } from "../../types/store";

interface ProductCardProps {
  item: StoreItem;
  onAddToCart: (item: StoreItem) => void;
}

export default function ProductCard({ item, onAddToCart }: ProductCardProps) {
  const t = useScopedI18n("shop");
  const [showFullImage, setShowFullImage] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <div className="cursor-pointer" onClick={() => setShowFullImage(true)}>
        <Image
          src={item.url}
          alt={t(item.titleKey)}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{t(item.titleKey)}</h3>
        <p className="text-sm text-gray-500">{item.subtitle}</p>
      </div>
      <div className="p-4 mt-auto">
        <button
          onClick={() => onAddToCart(item)}
          className="w-full px-6 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {t("addToCart")}
        </button>
      </div>
      {showFullImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowFullImage(false)}
        >
          <Image
            src={item.url || "/placeholder.svg"}
            alt={t(item.titleKey)}
            layout="fill"
            objectFit="contain"
          />
        </div>
      )}
    </div>
  );
}
