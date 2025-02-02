import { useScopedI18n } from "@/locales/client";
import Image from "next/image";
import { useState } from "react";
import type { StoreItem } from "../../types/store";
import { countries } from "@/constants/store";

interface CartProps {
  items: StoreItem[];
  onRemove: (id: number) => void;
}

export default function Cart({ items, onRemove }: CartProps) {
  const t = useScopedI18n("shop");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buyerData, setBuyerData] = useState({
    name: "",
    country: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setBuyerData({ ...buyerData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/send-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...buyerData, items }),
    });

    setLoading(false);

    if (response.ok) {
      setMessage("¡Orden enviada con éxito! Revisa tu email.");
      setTimeout(() => setIsModalOpen(false), 2000);
      items = [];
    } else {
      setMessage("Hubo un error al enviar la orden. Inténtalo nuevamente.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-xl font-bold mb-2">{t("cart.title")}</h2>
      <div className="max-h-32 overflow-y-auto">
        {items.map((item, index) => (
          <div key={index} className="flex items-center mb-2">
            <Image
              src={item.url}
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
          onClick={() => setIsModalOpen(true)}
          className="w-full px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
        >
          {t("cart.checkout")}
        </button>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">{t("checkout.title")}</h2>

            <label className="block mb-2">
              {t("checkout.name")}
              <input
                type="text"
                name="name"
                value={buyerData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </label>

            <label className="block mb-2">
              {t("checkout.country")}
              <select
                name="country"
                value={buyerData.country}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="">{t("checkout.selectCountry")}</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>

            <label className="block mb-4">
              {t("checkout.email")}
              <input
                type="email"
                name="email"
                value={buyerData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </label>

            {/* Listado de artículos */}
            <h3 className="text-lg font-semibold mb-2">
              {t("checkout.items")}
            </h3>
            <ul className="mb-4 max-h-24 overflow-y-auto">
              {items.map((item, index) => (
                <li key={index} className="text-sm border-b py-1">
                  {t(item.titleKey)}
                </li>
              ))}
            </ul>

            {message && <p className="text-green-600 mb-2">{message}</p>}

            <div className="flex justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
              >
                {t("checkout.cancel")}
              </button>
              <button
                onClick={handleCheckout}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={loading}
              >
                {loading ? t("checkout.submitting") : t("checkout.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
