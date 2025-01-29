import PhotoStore from "@/components/PhotoStore";
import { imagesShop } from "@/constants/images";

export default function StorePage() {
  return (
    <div className="min-h-screen bg-gray-100 pt-32">
      <PhotoStore items={imagesShop} />
    </div>
  );
}
