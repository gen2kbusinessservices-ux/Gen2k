'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type ProgressiveImageProps = {
  src: string;
  thumbnailSrc: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  aspectRatio?: '3:4' | '4:3' | 'auto';
  priority?: boolean;
  disableDownload?: boolean;
};

export default function ProgressiveImage({
  src,
  thumbnailSrc,
  alt,
  className = '',
  onLoad,
  aspectRatio = 'auto',
  priority = false,
  disableDownload = true
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const img = new window.Image();
    
    // Simulate progress (since we can't get real progress from Image)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    img.onload = () => {
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        setIsLoaded(true);
        onLoad?.();
      }, 150);
    };

    img.onerror = () => {
      clearInterval(progressInterval);
      setIsLoaded(true);
    };

    img.src = src;

    return () => {
      clearInterval(progressInterval);
    };
  }, [src, onLoad]);

  const aspectRatioClass = {
    '3:4': 'aspect-[3/4]',
    '4:3': 'aspect-[4/3]',
    'auto': ''
  }[aspectRatio];

  return (
    <div className={`relative overflow-hidden ${aspectRatioClass} ${className}`}>
      {/* Thumbnail with blur */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoaded ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Image
          src={thumbnailSrc}
          alt={alt}
          fill
          className="object-cover blur-xl scale-110"
          style={{ filter: 'blur(40px) saturate(1.2)' }}
          loading="eager"
        />
      </motion.div>

      {/* Progress bar */}
      {!isLoaded && progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-10">
          <motion.div
            className="h-full bg-[#bbd922]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      )}

      {/* Full image */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          onContextMenu={(e) => disableDownload && e.preventDefault()}
          draggable={false}
          unselectable="on"
        />
      </motion.div>

      {/* Download protection overlay */}
      {disableDownload && (
        <div 
          className="absolute inset-0 pointer-events-none select-none"
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        />
      )}
    </div>
  );
}
