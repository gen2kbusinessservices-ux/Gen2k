'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import Image from 'next/image';
import { CollectionImage } from '@/lib/supabase';

type ImageLightboxProps = {
  images: CollectionImage[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  collectionTitle: string;
  disableDownload?: boolean;
};

export default function ImageLightbox({
  images,
  initialIndex,
  isOpen,
  onClose,
  collectionTitle,
  disableDownload = true
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
  }, [initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '+':
        case '=':
          setZoom(prev => Math.min(prev + 0.5, 3));
          break;
        case '-':
          setZoom(prev => Math.max(prev - 0.5, 1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
  }, [images.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
  }, [images.length]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      handlePrevious();
    } else if (info.offset.x < -swipeThreshold) {
      handleNext();
    }
    setIsDragging(false);
  };

  const currentImage = images[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black"
          data-testid="image-lightbox"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white text-xl font-semibold">{collectionTitle}</h3>
                <p className="text-white/70 text-sm mt-1">
                  {currentIndex + 1} / {images.length}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-[#bbd922] transition-colors p-2"
                data-testid="close-lightbox"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
          </div>

          {/* Main image area */}
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-20">
            <motion.div
              key={currentIndex}
              drag={zoom === 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: zoom }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-full max-h-full cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
            >
              <Image
                src={currentImage.url}
                alt={currentImage.alt || `${collectionTitle} - Image ${currentIndex + 1}`}
                width={1920}
                height={1080}
                className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
                priority
                onContextMenu={(e) => disableDownload && e.preventDefault()}
                draggable={false}
                unselectable="on"
              />
            </motion.div>
          </div>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-[#bbd922] transition-colors p-3 bg-black/50 rounded-full backdrop-blur-sm"
                data-testid="previous-image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-[#bbd922] transition-colors p-3 bg-black/50 rounded-full backdrop-blur-sm"
                data-testid="next-image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex justify-center items-center gap-4">
              {/* Zoom controls */}
              <button
                onClick={() => setZoom(prev => Math.max(prev - 0.5, 1))}
                disabled={zoom === 1}
                className="text-white hover:text-[#bbd922] transition-colors p-2 disabled:opacity-30"
                data-testid="zoom-out"
              >
                <ZoomOut className="w-6 h-6" />
              </button>
              <span className="text-white text-sm">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(prev => Math.min(prev + 0.5, 3))}
                disabled={zoom === 3}
                className="text-white hover:text-[#bbd922] transition-colors p-2 disabled:opacity-30"
                data-testid="zoom-in"
              >
                <ZoomIn className="w-6 h-6" />
              </button>
            </div>

            {/* Image caption */}
            {currentImage.alt && (
              <p className="text-white/90 text-center text-sm mt-4 max-w-2xl mx-auto">
                {currentImage.alt}
              </p>
            )}
          </div>

          {/* Thumbnail strip */}
          <div className="absolute bottom-24 left-0 right-0 z-10">
            <div className="flex gap-2 overflow-x-auto px-6 pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentIndex
                      ? 'border-[#bbd922] scale-110'
                      : 'border-white/20 hover:border-white/50'
                  }`}
                >
                  <Image
                    src={img.thumbnail_url || img.url}
                    alt=""
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Download protection */}
          {disableDownload && (
            <div 
              className="absolute inset-0 pointer-events-none select-none"
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
