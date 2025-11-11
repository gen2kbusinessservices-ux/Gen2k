'use client';

import { motion } from 'framer-motion';

type SkeletonLoaderProps = {
  count?: number;
  aspectRatio?: '3:4' | '4:3';
};

export default function SkeletonLoader({ count = 8, aspectRatio = '3:4' }: SkeletonLoaderProps) {
  const aspectRatioClass = aspectRatio === '3:4' ? 'aspect-[3/4]' : 'aspect-[4/3]';

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          className={`${aspectRatioClass} bg-gray-200 rounded-2xl overflow-hidden relative`}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </motion.div>
      ))}
    </>
  );
}
