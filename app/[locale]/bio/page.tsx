import Image from "next/image"
import { getScopedI18n } from "@/locales/server"

export default async function Bio() {
  const t = await getScopedI18n("bio")

  return (
    <div className="relative z-20 min-h-screen">
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">{t("title")}</h1>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <Image
                src="https://res.cloudinary.com/dnc5bzm8o/image/upload/v1737639045/cristian-pirovano_gbsiqd.jpg"
                alt="Cristian Pirovano Profile"
                width={500}
                height={400}
                className="rounded-lg shadow-md"
              />
            </div>
            <div className="space-y-4 text-gray-700">
              <p>{t("p1")}</p>
              <p>{t("p2")}</p>
            </div>
          </div>
          <div className="mt-8">
            <p className="mt-4 text-gray-700">{t("p3")}</p>
            <div className="mt-8 aspect-w-16 aspect-h-9">
              <iframe
                src="https://www.youtube.com/embed/zMoT7R-bMSE"
                title="¡YALLAH! ¡YALLAH! Trailer oficial English subtitle"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-[400px] rounded-lg shadow-lg"
              />
            </div>          
          </div>
        </div>
      </div>
    </div>
  )
}

