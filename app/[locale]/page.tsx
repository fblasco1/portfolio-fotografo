import { client } from "@/lib/sanity";
import { settingsQuery } from "@/lib/queries";
import SlideshowClient from "@/components/SlideshowClient";

export default async function Home() {
  // Obtener datos desde Sanity
  const settings = await client.fetch(settingsQuery);
  const slideshowImages = settings?.homeSlideshow || [];

  return (
    <div className="relative min-h-screen">
      <SlideshowClient images={slideshowImages} />
    </div>
  );
}
