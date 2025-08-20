"use client";

import { useI18n } from "@/locales/client";
import Image from "next/image";
import type { Folder } from "../../types/gallery";

interface GalleryCardProps {
  folder: Folder;
  onClick: () => void;
}

export default function GalleryCard({ folder, onClick }: GalleryCardProps) {
  const t = useI18n();

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out bg-white"
      onClick={onClick}
    >
      <Image
        src={folder.cover || "/placeholder.svg"}
        alt={folder.title}
        width={300}
        height={200}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{t(folder.title)}</h3>
        <p className="text-sm text-gray-500">{folder.location}</p>
      </div>
    </div>
  );
}
