'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Collection } from '@/lib/supabase';
import Image from 'next/image';

type MasonryGridProps = {
  collections: Collection[];
  gridSpacing?: number;
  animationSpeed?: number;
};

export default function MasonryGrid({
  collections,
  gridSpacing = 16,
  animationSpeed = 300,
}: MasonryGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});

  useEffect(() => {
    const intervals: Record<string, NodeJS.Timeout> = {};

    if (hoveredId) {
      const collection = collections.find((c) => c.id === hoveredId);
      if (collection && collection.images.length > 1) {
        intervals[hoveredId] = setInterval(() => {
          setCurrentImageIndex((prev) => ({
            ...prev,
            [hoveredId]: ((prev[hoveredId] || 0) + 1) % collection.images.length,
          }));
        }, animationSpeed * 3);
      }
    }

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [hoveredId, collections, animationSpeed]);

  const handleTouchStart = (id: string) => {
    if (window.innerWidth < 768) {
      setHoveredId(hoveredId === id ? null : id);
    }
  };

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-auto"
      style={{ gap: `${gridSpacing}px` }}
    >
      {collections.map((collection, index) => {
        const currentIndex = currentImageIndex[collection.id] || 0;
        const currentImage = collection.images[currentIndex] || collection.images[0];

        return (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
            style={{ aspectRatio: '3/4' }}
            onMouseEnter={() => setHoveredId(collection.id)}
            onMouseLeave={() => {
              setHoveredId(null);
              setCurrentImageIndex((prev) => ({ ...prev, [collection.id]: 0 }));
            }}
            onTouchStart={() => handleTouchStart(collection.id)}
          >
            <AnimatePresence mode="wait">
              {currentImage && (
                <motion.div
                  key={`${collection.id}-${currentIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: animationSpeed / 1000 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={currentImage.thumbnail_url || currentImage.url}
                    alt={currentImage.alt || collection.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    loading="lazy"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6"
            >
              <h3 className="text-white text-lg font-semibold mb-2">{collection.title}</h3>
              {collection.description && (
                <p className="text-white/90 text-sm line-clamp-2">{collection.description}</p>
              )}
              {collection.images.length > 1 && (
                <div className="flex gap-1 mt-3">
                  {collection.images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        idx === currentIndex ? 'bg-[#bbd922]' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
