import PhotoGallery from "@/components/PhotoGallery";
import { imagesGallery } from "@/constants/images";

export default function Gallery() {
  return (
    <div className="min-h-screen">
      <PhotoGallery folders={imagesGallery} />
    </div>
  );
}
