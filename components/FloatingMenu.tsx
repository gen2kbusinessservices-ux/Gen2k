'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Mail } from 'lucide-react';
import { Category } from '@/lib/supabase';
import Link from 'next/link';

type FloatingMenuProps = {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
};

export default function FloatingMenu({
  categories,
  selectedCategory,
  onCategorySelect,
}: FloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={toggleMenu}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-[#bbd922] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={toggleMenu}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-40 overflow-y-auto"
            >
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-8 text-black">Menu</h2>

                <div className="space-y-6">
                  <button
                    onClick={() => {
                      onCategorySelect(null);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 text-black hover:text-[#bbd922] transition-colors w-full text-left"
                  >
                    <Home className="w-5 h-5" />
                    <span className="font-medium">Back to Home</span>
                  </button>

                  <Link
                    href="/contact"
                    className="flex items-center gap-3 text-black hover:text-[#bbd922] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">Contact</span>
                  </Link>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                      Categories
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          onCategorySelect(null);
                          setIsOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          selectedCategory === null
                            ? 'bg-[#bbd922] text-black font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        All Projects
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            onCategorySelect(category.id);
                            setIsOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-[#bbd922] text-black font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
