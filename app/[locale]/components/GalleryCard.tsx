import Image from "next/image";
import type { Folder } from "@/types/gallery";

interface GalleryCardProps {
  folder: Folder;
  onClick: () => void;
}

export default function GalleryCard({ folder, onClick }: GalleryCardProps) {
  return (
    <div
      className="cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out"
      onClick={onClick}
    >
      <Image
        src={folder.coverPhoto.src || "/placeholder.svg"}
        alt={folder.coverPhoto.alt}
        width={300}
        height={200}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{folder.name}</h3>
        <p className="text-sm text-gray-500">{folder.photos.length} photos</p>
      </div>
    </div>
  );
}
