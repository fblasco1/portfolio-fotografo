"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScopedI18n } from "@/locales/client";
import { countries } from "@/constants/store";
import type { CartItem } from "./Cart";

interface OrderFormProps {
  cart: CartItem[];
  onClose: () => void;
  setCart: (cart: CartItem[]) => void;
}

export default function OrderForm({ cart, onClose, setCart }: OrderFormProps) {
  const t = useScopedI18n("shop");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    const response = await fetch("/api/send-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, country, cart }),
    });

    const result = await response.json();
    setLoading(false);

    if (result.success) {
      setCart([]);
      alert(t("order.success"));
      onClose();
    } else {
      alert(t("order.error"));
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="p-6 bg-white shadow-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>{t("order.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder={t("order.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            placeholder={t("order.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Select onValueChange={setCountry}>
            <SelectTrigger>
              <SelectValue placeholder={t("order.selectCountry")} />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Listado de productos en el carrito */}
          <div className="border rounded-lg p-3 bg-gray-100">
            <h3 className="text-sm font-semibold">{t("order.items")}</h3>
            <ul className="text-sm">
              {cart.map((item) => (
                <li key={item.id}>
                  {t(item.titleKey)} x{item.quantity}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter className="flex justify-between mt-4">
          <Button
            variant="destructive"
            onClick={onClose}
            className="bg-red-600 text-white hover:bg-red-500"
          >
            {t("order.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 text-white hover:bg-green-500"
          >
            {loading ? t("order.submitting") : t("order.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
