"use client";

import { useState } from "react";

type NewsletterFormProps = {
  placeholder: string;
  buttonText: string;
};

export function NewsletterForm({
  placeholder,
  buttonText,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("¡Te has suscrito con éxito!");
      setEmail("");
    } else {
      setMessage(data.error || "Hubo un problema, intenta nuevamente.");
    }
  };

  return (
    <form className="max-w-md mx-auto" onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-500"
          required
        />
        <button
          type="submit"
          className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
        >
          {buttonText}
        </button>
      </div>
      {message && <p className="text-sm text-center mt-2">{message}</p>}
    </form>
  );
}
