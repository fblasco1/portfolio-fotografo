import { getScopedI18n } from "@/locales/server";
import { NewsletterForm } from "./NewsletterForm";

export async function NewsletterSection() {
  const t = await getScopedI18n("book");

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-stone-100rounded-lg text-center">
            <h3 className="text-2xl font-semibold mb-4">{t("coming_soon")}</h3>
            <p className="text-lg text-gray-700">{t("availability")}</p>
          </div>
          <div className="mt-8 text-center">
            <NewsletterForm
              placeholder={t("email_placeholder")}
              buttonText={t("subscribe")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
