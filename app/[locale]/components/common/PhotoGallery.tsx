"use client";

import { useMemo, useState } from "react";
import type { Folder } from "../../../types/gallery";
import GalleryCard from "./GalleryCard";
import FullscreenPhotoViewer, { type ViewerPhoto } from "./FullscreenPhotoViewer";

interface PhotoGalleryProps {
  folders: Folder[];
}

function buildSlides(folder: Folder): ViewerPhoto[] {
  const slides: ViewerPhoto[] = [
    {
      kind: "text",
      url: "",
      title: folder.title,
      description: folder.location,
      body: "",
      id: `folder_${folder.id}_text`,
    },
    ...folder.photos.map(
      (photo, index): ViewerPhoto => ({
        kind: "image",
        url: photo.url,
        title: photo.title || folder.title,
        description: photo.description || folder.location,
        id: `folder_${folder.id}_img_${index}`,
      }),
    ),
  ];
  return slides;
}

export default function PhotoGallery({ folders }: PhotoGalleryProps) {
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  const slides = useMemo(
    () => (selectedFolder ? buildSlides(selectedFolder) : []),
    [selectedFolder],
  );

  const showNav = slides.length > 1;

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
        <FullscreenPhotoViewer
          photos={slides}
          onClose={() => setSelectedFolder(null)}
          showNavigation={showNav}
          showCounter={showNav}
        />
      )}
    </div>
  );
}
