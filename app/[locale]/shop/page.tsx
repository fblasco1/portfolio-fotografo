import PhotoStore from "@/components/PhotoStore";
import { products } from "@/constants/images";

export default function StorePage() {
  return (
    <div className="min-h-screen">
      <PhotoStore items={products} />
    </div>
  );
}
