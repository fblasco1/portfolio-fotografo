import PhotoGallery from "@/components/PhotoGallery";
import { imagesGallery } from "@/constants/images";

export default function Gallery() {
  return (
    <div className="min-h-screen bg-gray-100">
      <PhotoGallery folders={imagesGallery} />
    </div>
  );
}
