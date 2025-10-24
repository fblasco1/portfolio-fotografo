"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { X, Play } from "lucide-react";

interface VideoModalProps {
  videoUrl: string;
  title: string;
  children: React.ReactNode;
}

export default function VideoModal({ videoUrl, title, children }: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Función para convertir URL de YouTube a URL embebida
  const getEmbedUrl = (url: string) => {
    // Si ya es una URL embebida, la devolvemos tal como está
    if (url.includes('/embed/')) {
      return url;
    }
    
    // Extraer el ID del video de diferentes formatos de URL de YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    // Si no es una URL de YouTube válida, devolver la URL original
    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
      >
        <Play className="w-4 h-4 mr-2" />
        {children}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-white hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="p-6 pt-0">
            <div className="aspect-video w-full">
              <iframe
                src={embedUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
