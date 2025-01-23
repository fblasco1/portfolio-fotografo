"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { imagesSlide } from "@/constants/images"

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imagesSlide.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-screen bg-slate-900">
       {/* Image Container */}
      <div className="fixed inset-0 z-0">
        {imagesSlide.map((src, index) => (
          <div
            key={src}
            className="absolute inset-0 w-full h-full transition-opacity duration-1000"
            style={{
              opacity: index === currentImageIndex ? 1 : 0,
            }}
          >
            <div className="absolute inset-0 bg-black/30 z-10" />
            <Image
              src={src || "/placeholder.svg"}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

