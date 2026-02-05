'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ProfileGalleryProps {
  images: string[];
  videos: string[];
  name: string;
  /** Número de imágenes privadas (solo para mostrar placeholders desenfocados). */
  privateImagesCount?: number;
  /** Número de vídeos privados (solo para mostrar placeholders desenfocados). */
  privateVideosCount?: number;
  /** Si true, se muestran placeholders desenfocados para el contenido privado (visitantes sin login). */
  showPrivateBlurred?: boolean;
}

const PrivatePlaceholder = ({
  type,
  className,
}: {
  type: 'image' | 'video';
  className?: string;
}) => (
  <div
    className={cn(
      'relative flex flex-col items-center justify-center rounded-lg text-muted-foreground select-none',
      'bg-muted/90 backdrop-blur-xl border border-border/60',
      type === 'video' && 'aspect-video',
      className
    )}
    aria-hidden
  >
    <Lock className="w-8 h-8 sm:w-10 sm:h-10 mb-2 opacity-90" />
    <span className="text-xs sm:text-sm font-medium">Contenido privado</span>
    <span className="text-[10px] sm:text-xs mt-0.5 opacity-80">Inicia sesión para ver</span>
  </div>
);

export const ProfileGallery = ({
  images,
  videos,
  name,
  privateImagesCount = 0,
  privateVideosCount = 0,
  showPrivateBlurred = false,
}: ProfileGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const hasPrivateImages = showPrivateBlurred && privateImagesCount > 0;
  const hasPrivateVideos = showPrivateBlurred && privateVideosCount > 0;
  const hasVideos = videos.length > 0 || hasPrivateVideos;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextLightbox = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevLightbox = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] rounded-xl overflow-hidden group">
        <img
          src={images[currentIndex]}
          alt={`${name} - Foto ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
          onClick={() => openLightbox(currentIndex)}
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails (públicas + placeholders de contenido privado) */}
      {(images.length > 1 || hasPrivateImages) && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden transition-all",
                currentIndex === index
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <img
                src={img}
                alt={`${name} - Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {hasPrivateImages &&
            Array.from({ length: privateImagesCount }).map((_, i) => (
              <div
                key={`private-img-${i}`}
                className="flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden"
              >
                <PrivatePlaceholder type="image" className="w-full h-full" />
              </div>
            ))}
        </div>
      )}

      {/* Videos Section (públicos + placeholders de contenido privado) */}
      {hasVideos && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" />
            Vídeos ({videos.length + (hasPrivateVideos ? privateVideosCount : 0)})
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {videos.map((video, index) => (
              <div key={index} className="relative rounded-xl overflow-hidden bg-muted">
                <video
                  controls
                  className="w-full aspect-video"
                  poster={images[0]}
                >
                  <source src={video} type="video/mp4" />
                  Tu navegador no soporta vídeos.
                </video>
              </div>
            ))}
            {hasPrivateVideos &&
              Array.from({ length: privateVideosCount }).map((_, i) => (
                <PrivatePlaceholder key={`private-vid-${i}`} type="video" className="min-h-[180px]" />
              ))}
          </div>
        </div>
      )}

      {/* Mensaje para visitantes: hay contenido privado */}
      {showPrivateBlurred && (privateImagesCount > 0 || privateVideosCount > 0) && (
        <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
          <Lock className="w-4 h-4 inline-block mr-1.5 align-middle" />
          Este perfil tiene contenido exclusivo para usuarios registrados.
          <Link href="/auth" className="ml-1.5 font-medium text-primary hover:underline">
            Inicia sesión
          </Link>
          {' '}para verlo.
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-background/95 backdrop-blur-xl border-border">
          <div className="relative flex items-center justify-center min-h-[60vh]">
            <img
              src={images[lightboxIndex]}
              alt={`${name} - Foto ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain"
            />
            
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  onClick={prevLightbox}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  onClick={nextLightbox}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
