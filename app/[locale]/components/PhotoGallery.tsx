"use client";

import { useState } from "react";
import type { Folder } from "../../types/gallery";
import GalleryCard from "./GalleryCard";
import PhotoSlider from "./PhotoSlider";

interface PhotoGalleryProps {
  folders: Folder[];
}

export default function PhotoGallery({ folders }: PhotoGalleryProps) {
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  return (
    <div className="container mx-auto px-4 pt-32 pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <GalleryCard
            key={folder.id}
            folder={folder}
            onClick={() => setSelectedFolder(folder)}
          />
        ))}
      </div>
      {selectedFolder && (
        <PhotoSlider
          photos={selectedFolder.photos}
          onClose={() => setSelectedFolder(null)}
        />
      )}
    </div>
  );
}
