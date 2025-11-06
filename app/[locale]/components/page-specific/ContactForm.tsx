"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useScopedI18n, useCurrentLocale } from "@/locales/client";

interface FormData {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

const ContactForm: React.FC = () => {
  const t = useScopedI18n("contact");
  const locale = useCurrentLocale() as 'es' | 'en';
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
    subject: "",
  });

  // Leer parámetros de la URL y prellenar el formulario
  useEffect(() => {
    const subject = searchParams.get("subject");
    const productType = searchParams.get("productType");
    const productName = searchParams.get("productName");

    if (subject && productName) {
      // Si viene desde una solicitud de tamaño personalizado, prellenar el mensaje
      const customMessage = locale === 'es'
        ? `Hola,\n\nMe gustaría solicitar la ${productType === 'photos' ? 'foto' : 'postal'} "${productName}" en un tamaño personalizado.\n\nPor favor, proporciona los detalles del tamaño que deseas y cualquier otra información relevante:`
        : `Hello,\n\nI would like to request the ${productType === 'photos' ? 'photo' : 'postcard'} "${productName}" in a custom size.\n\nPlease provide the details of the size you want and any other relevant information:`;
      
      setFormData((prev) => ({
        ...prev,
        subject: subject,
        message: customMessage,
      }));
    } else if (subject) {
      // Si solo hay asunto, usarlo como mensaje inicial
      setFormData((prev) => ({
        ...prev,
        subject: subject,
        message: subject,
      }));
    }
  }, [searchParams, t, locale]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (prev[name as keyof FormData] === value) return prev;
      return { ...prev, [name]: value };
    });
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    // Validación simple
    if (!validateEmail(formData.email)) {
      setError(t("invalidEmail"));
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: formData.subject || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");

      setSuccess(true);
      setFormData({ name: "", email: "", message: "", subject: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        {t("title")}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            {t("name")}
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:outline-hidden focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            {t("email")}
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:outline-hidden focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700"
          >
            {t("message")}
          </label>
          <textarea
            name="message"
            id="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:outline-hidden focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{t("success")}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm 
                      text-sm font-medium text-white bg-stone-800 hover:bg-stone-700 
                      focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                      ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isSubmitting ? t("submitting") : t("submit")}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
