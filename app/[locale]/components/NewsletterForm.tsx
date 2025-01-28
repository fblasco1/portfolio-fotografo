"use client";

type NewsletterFormProps = {
  placeholder: string;
  buttonText: string;
};

export function NewsletterForm({
  placeholder,
  buttonText,
}: NewsletterFormProps) {
  return (
    <form className="max-w-md mx-auto">
      <div className="flex gap-2">
        <input
          type="email"
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
}
