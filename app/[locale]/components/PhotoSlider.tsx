"use client";

import { useState } from "react";
import Image from "next/image";
import type { Photo } from "@/types/gallery";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PhotoSliderProps {
  photos: Photo[];
  onClose: () => void;
}

export default function PhotoSlider({ photos, onClose }: PhotoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <button className="absolute top-4 right-4 text-white" onClick={onClose}>
        <X size={24} />
      </button>
      <button className="absolute left-4 text-white" onClick={goToPrevious}>
        <ChevronLeft size={24} />
      </button>
      <div className="relative w-full max-w-4xl h-full max-h-[80vh]">
        <Image
          src={photos[currentIndex].url || "/placeholder.svg"}
          alt={photos[currentIndex].description}
          layout="fill"
          objectFit="contain"
        />
      </div>
      <button className="absolute right-4 text-white" onClick={goToNext}>
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
