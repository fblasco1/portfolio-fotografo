import Image from "next/image";
import { client, urlFor } from "@/lib/sanity";
import { bioQuery } from "@/lib/queries";

interface BioPageProps {
  params: Promise<{ locale: string }>;
}

export default async function Bio({ params }: BioPageProps) {
  const { locale } = await params;
  
  // Obtener datos de biografía desde Sanity
  const bio = await client.fetch(bioQuery);
  
  // Obtener contenido según el idioma
  const content = bio?.content?.[locale as keyof typeof bio.content] || bio?.content?.es;
  
  // Fallback si no hay contenido en Sanity
  const title = content?.title || "Acerca de Cristian Pirovano";
  const paragraphs = content?.paragraphs || [];

  return (
    <div className="relative z-20 flex-1 flex flex-col">
      <div className="px-4 sm:px-6 lg:px-8 pt-28 pb-8 flex-1">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-gray-900">
            {title}
          </h1>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="flex justify-center">
                <Image
                  src={urlFor(bio.profileImage).url()}
                  alt="Cristian Pirovano Profile"
                  width={400}
                  height={150}
                  className="rounded-lg shadow-md h-auto object-cover"
                />
            </div>
            <div className="space-y-4 text-gray-700 text-sm sm:text-base">
              { paragraphs.map((paragraph: string, index: number) => (
                  <p key={index} className={index === paragraphs.length - 1 ? "mt-4" : ""}>
                    {paragraph}
                  </p>
                ))
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
