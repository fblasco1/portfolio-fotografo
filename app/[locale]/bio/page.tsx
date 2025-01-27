import Image from "next/image"
import { getScopedI18n } from "@/locales/server"

export default async function Bio() {
  const t = await getScopedI18n("bio")

  return (
    <div className="relative z-20 min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 pt-28 pb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-gray-900">
            {t("title")}
          </h1>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="flex justify-center">
              <Image
                src="https://res.cloudinary.com/dnc5bzm8o/image/upload/v1737639045/cristian-pirovano_gbsiqd.jpg"
                alt="Cristian Pirovano Profile"
                width={500}
                height={400}
                className="rounded-lg shadow-md w-full max-w-md h-auto object-cover"
              />
            </div>
            <div className="space-y-4 text-gray-700 text-sm sm:text-base">
              <p>{t("p1")}</p>
              <p>{t("p2")}</p>
              <p className="mt-4">{t("p3")}</p>
            </div>
          </div>
            
          <div className="mt-6 sm:mt-8">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src="https://www.youtube.com/embed/zMoT7R-bMSE"
                title="¡YALLAH! ¡YALLAH! Trailer oficial English subtitle"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-[200px] sm:h-[300px] md:h-[400px] rounded-lg shadow-lg"
              ></iframe>
            </div>          
          </div>
        </div>
      </div>
    </div>
  )
}

