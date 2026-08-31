"use client";

import { useEffect, useState, useCallback } from "react";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  title,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
      setIsZoomed(false);
    }
  }, [isOpen, initialIndex, images.length]);

  const handlePrev = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && images.length > 1) {
        handlePrev();
      } else if (e.key === "ArrowRight" && images.length > 1) {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Agrandir l'image"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Bar Header */}
      <div
        className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          {title && (
            <span className="text-sm font-semibold text-white/90 truncate max-w-xs sm:max-w-md">
              {title}
            </span>
          )}
          {images.length > 1 && (
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-white/80 backdrop-blur-xs border border-white/10">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom toggle button */}
          <button
            type="button"
            onClick={() => setIsZoomed((prev) => !prev)}
            className="rounded-xl bg-white/10 p-2 text-white/90 hover:bg-white/20 hover:text-white transition-all backdrop-blur-xs border border-white/10"
            title={isZoomed ? "Réduire le zoom" : "Zoomer"}
          >
            {isZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 p-2 text-white/90 hover:bg-white/20 hover:text-white transition-all backdrop-blur-xs border border-white/10"
            title="Fermer (Échap)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="relative flex items-center justify-center h-full w-full p-4 sm:p-12 select-none overflow-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage}
          alt={title || "Image agrandie"}
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed((prev) => !prev);
          }}
          className={`rounded-xl object-contain transition-all duration-300 shadow-2xl ${
            isZoomed
              ? "max-h-none max-w-none scale-125 cursor-zoom-out"
              : "max-h-[82vh] max-w-[92vw] cursor-zoom-in"
          }`}
        />
      </div>

      {/* Navigation Arrows (if multiple images) */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 rounded-2xl bg-black/50 p-3 text-white hover:bg-black/80 hover:scale-105 transition-all backdrop-blur-sm border border-white/15 shadow-xl"
            title="Image précédente (Flèche gauche)"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 rounded-2xl bg-black/50 p-3 text-white hover:bg-black/80 hover:scale-105 transition-all backdrop-blur-sm border border-white/15 shadow-xl"
            title="Image suivante (Flèche droite)"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Bottom Thumbnails */}
          <div
            className="absolute bottom-4 inset-x-0 z-10 flex justify-center items-center gap-2 px-4 overflow-x-auto py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-2 p-1.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 max-w-[90vw] overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsZoomed(false);
                    setCurrentIndex(idx);
                  }}
                  className={`relative h-12 w-16 sm:h-14 sm:w-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    idx === currentIndex
                      ? "border-[#E0AF62] scale-105 shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Vignette ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
