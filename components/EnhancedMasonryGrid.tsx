'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Collection } from '@/lib/supabase';
import ProgressiveImage from './ProgressiveImage';
import ImageLightbox from './ImageLightbox';
import SkeletonLoader from './SkeletonLoader';
import { Eye, Image as ImageIcon } from 'lucide-react';

type EnhancedMasonryGridProps = {
  collections: Collection[];
  gridSpacing?: number;
  animationSpeed?: number;
  enableInfiniteScroll?: boolean;
  itemsPerPage?: number;
};

export default function EnhancedMasonryGrid({
  collections,
  gridSpacing = 16,
  animationSpeed = 300,
  enableInfiniteScroll = true,
  itemsPerPage = 12
}: EnhancedMasonryGridProps) {
  const [displayedItems, setDisplayedItems] = useState(itemsPerPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Infinite scroll observer
  useEffect(() => {
    if (!enableInfiniteScroll || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedItems < collections.length) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [displayedItems, collections.length, enableInfiniteScroll]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || displayedItems >= collections.length) return;

    setIsLoadingMore(true);
    
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      setDisplayedItems(prev => Math.min(prev + itemsPerPage, collections.length));
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, displayedItems, collections.length, itemsPerPage]);

  const handleImageClick = (collection: Collection, imageIndex: number = 0) => {
    setSelectedCollection(collection);
    setSelectedImageIndex(imageIndex);
    setLightboxOpen(true);

    // Track analytics
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collection_id: collection.id,
        event_type: 'view'
      })
    }).catch(console.error);
  };

  const visibleCollections = collections.slice(0, displayedItems);
  const hasMore = displayedItems < collections.length;

  // Get aspect ratio for each collection based on first image dimensions
  const getAspectRatio = (collection: Collection): '3:4' | '4:3' => {
    const firstImage = collection.images[0];
    if (!firstImage || !firstImage.width || !firstImage.height) return '3:4';
    
    const ratio = firstImage.width / firstImage.height;
    return ratio > 1 ? '4:3' : '3:4';
  };

  return (
    <>
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-auto"
        style={{ gap: `${gridSpacing}px` }}
        data-testid="enhanced-masonry-grid"
      >
        {visibleCollections.map((collection, index) => {
          const aspectRatio = getAspectRatio(collection);
          const currentImage = collection.images[0];
          
          // Parallax effect for every 3rd item
          const shouldParallax = index % 3 === 0;
          const y = shouldParallax 
            ? useTransform(scrollY, [0, 1000], [0, -50])
            : 0;

          return (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              style={{ y: shouldParallax ? y : 0 }}
              className="group cursor-pointer"
              onClick={() => handleImageClick(collection, 0)}
              data-testid={`collection-item-${collection.id}`}
            >
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300">
                {currentImage ? (
                  <ProgressiveImage
                    src={currentImage.url}
                    thumbnailSrc={currentImage.thumbnail_url || currentImage.url}
                    alt={currentImage.alt || collection.title}
                    aspectRatio={aspectRatio}
                    priority={index < 4}
                    disableDownload={true}
                  />
                ) : (
                  <div className={`${aspectRatio === '3:4' ? 'aspect-[3/4]' : 'aspect-[4/3]'} bg-gray-100 flex items-center justify-center`}>
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}

                {/* Hover overlay with details */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-6"
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-white text-base md:text-lg font-semibold mb-1">
                      {collection.title}
                    </h3>
                    {collection.description && (
                      <p className="text-white/90 text-xs md:text-sm line-clamp-2 mb-2">
                        {collection.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-white/80">
                      {collection.category && (
                        <span className="px-2 py-1 bg-white/20 rounded-full">
                          {collection.category.name}
                        </span>
                      )}
                      {collection.images.length > 1 && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {collection.images.length}
                        </span>
                      )}
                      {collection.view_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {collection.view_count}
                        </span>
                      )}
                    </div>

                    {/* Image indicators */}
                    {collection.images.length > 1 && (
                      <div className="flex gap-1 mt-3">
                        {collection.images.slice(0, 5).map((_, idx) => (
                          <div
                            key={idx}
                            className="h-1 flex-1 rounded-full bg-white/30"
                          />
                        ))}
                        {collection.images.length > 5 && (
                          <span className="text-white/60 text-xs ml-1">
                            +{collection.images.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                </motion.div>

                {/* Subtle shine effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%', y: '-100%' }}
                  whileHover={{ x: '100%', y: '100%' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{ pointerEvents: 'none' }}
                />
              </div>
            </motion.div>
          );
        })}

        {/* Loading skeletons */}
        {isLoadingMore && <SkeletonLoader count={4} />}
      </div>

      {/* Infinite scroll trigger */}
      {enableInfiniteScroll && hasMore && (
        <div 
          ref={loadMoreRef} 
          className="h-20 flex items-center justify-center mt-8"
          data-testid="infinite-scroll-trigger"
        >
          {isLoadingMore && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <ImageIcon className="w-8 h-8 text-[#bbd922]" />
            </motion.div>
          )}
        </div>
      )}

      {/* Show more button (fallback if infinite scroll disabled) */}
      {!enableInfiniteScroll && hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="px-6 py-3 bg-[#bbd922] text-black font-semibold rounded-lg hover:bg-[#a5c31e] transition-colors disabled:opacity-50"
            data-testid="load-more-button"
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Lightbox */}
      {selectedCollection && (
        <ImageLightbox
          images={selectedCollection.images}
          initialIndex={selectedImageIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          collectionTitle={selectedCollection.title}
          disableDownload={true}
        />
      )}
    </>
  );
}
