import { useScopedI18n } from "@/locales/client";
import Image from "next/image";
import type { StoreItem } from "@/types/store";

interface CartProps {
  items: StoreItem[];
  onRemove: (id: number) => void;
  onCheckout: () => void;
}

export default function Cart({ items, onRemove, onCheckout }: CartProps) {
  const t = useScopedI18n("shop");

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-xl font-bold mb-2">{t("cart.title")}</h2>
      <div className="max-h-32 overflow-y-auto">
        {items.map((item, index) => (
          <div key={index} className="flex items-center mb-2">
            <Image
              src={item.url || "/placeholder.svg"}
              alt={t(item.titleKey)}
              width={50}
              height={50}
              className="object-cover mr-2"
            />
            <span className="text-sm">{t(item.titleKey)}</span>
            <button
              onClick={() => onRemove(item.id)}
              className="px-4 py-1 mx-4 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              {t("remove")}
            </button>
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <button
          onClick={onCheckout}
          className="w-full px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
        >
          {t("cart.checkout")}
        </button>
      )}
    </div>
  );
}
