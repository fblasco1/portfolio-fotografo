import { getScopedI18n } from "@/locales/server";

export async function HeroSection() {
  const t = await getScopedI18n("book");

  return (
    <div className="relative min-h-[50vh] lg:min-h-[60vh]">
      {/* Contenido */}
      <div className="container mx-auto px-4 h-full pt-36 lg:pt-32 flex flex-col justify-center items-start">
        <h1 className="text-2xl md:text-4xl font-bold">{t("title")}</h1>
        <h2 className="text-md md:text-lg mb-4 lg:mb-6">{t("author")}</h2>
        <div className="bg-white/90 p-4 md:p-6 lg:p-8 max-w-2xl rounded-lg">
          <p className="text-base md:text-lg lg:text-xl text-gray-800 leading-relaxed">
            {t("description")}
          </p>
        </div>
      </div>
    </div>
  );
}
