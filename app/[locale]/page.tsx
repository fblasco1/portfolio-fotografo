"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { imagesSlide } from "@/constants/images";
import { cn } from "@/lib/utils";

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      const interval = setInterval(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % imagesSlide.length
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isMobile]);

  return (
    <div className="relative min-h-screen">
      {!isMobile ? (
        <div className="fixed inset-0 z-0">
          {imagesSlide.map((src, index) => (
            <div
              key={src}
              className={cn(
                "absolute inset-0 w-full h-full transition-opacity duration-1000",
                {
                  "opacity-100": index === currentImageIndex,
                  "opacity-0": index !== currentImageIndex,
                }
              )}
            >
              <div className="absolute inset-0 bg-black/30 z-10" />
              <Image
                src={src}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 pt-24">
          {imagesSlide.map((src, index) => (
            <div
              key={src}
              className={cn(
                "relative w-full",
                index % 5 === 0
                  ? "col-span-2 row-span-2"
                  : "col-span-1 row-span-1"
              )}
            >
              <Image
                src={src}
                alt={`Image ${index + 1}`}
                className="object-cover rounded-lg"
                layout="responsive"
                width={300}
                height={200}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
