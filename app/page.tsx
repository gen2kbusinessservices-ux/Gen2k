'use client';

import { useState, useEffect } from 'react';
import { supabase, Collection, Category, Settings } from '@/lib/supabase';
import EnhancedMasonryGrid from '@/components/EnhancedMasonryGrid';
import FloatingMenu from '@/components/FloatingMenu';
import MobileBottomNav from '@/components/MobileBottomNav';
import Preloader from '@/components/Preloader';
import PageTransition from '@/components/PageTransition';
import { Building2 } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState<any>({
    gridSpacing: 16,
    animationSpeed: 300,
  });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Prevent right-click on entire page
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
      }
    };
    
    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, []);

  async function fetchData() {
    try {
      const [collectionsRes, categoriesRes, settingsRes] = await Promise.all([
        supabase
          .from('collections')
          .select('*, category:categories(*)')
          .eq('is_published', true)
          .order('order', { ascending: true }),
        supabase.from('categories').select('*').order('order', { ascending: true }),
        supabase.from('settings').select('*'),
      ]);

      if (collectionsRes.data) {
        setCollections(collectionsRes.data);
      }

      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      if (settingsRes.data) {
        const themeSettings = settingsRes.data.find((s) => s.key === 'theme');
        if (themeSettings) {
          setSettings(themeSettings.value);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCollections = selectedCategory
    ? collections.filter((c) => c.category_id === selectedCategory)
    : collections;

  if (showPreloader) {
    return <Preloader onComplete={() => setShowPreloader(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-state">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Building2 className="w-12 h-12 text-[#bbd922]" />
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-white pb-20 md:pb-0">
        {/* Scroll progress bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-[#bbd922] origin-left z-50"
          style={{ scaleX }}
          data-testid="scroll-progress"
        />

        {/* Header with parallax */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100"
          data-testid="main-header"
        >
          <div className="max-w-[1600px] mx-auto px-6 py-4 md:py-6 flex justify-center items-center">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight flex items-center gap-2 md:gap-3 justify-center">
                <Building2 className="w-6 h-6 md:w-8 md:h-8 text-[#bbd922]" />
                JVA Designs
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-1">Architecture & Design</p>
            </div>
          </div>
        </motion.header>

        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8 md:py-12">
          {filteredCollections.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
              data-testid="empty-state"
            >
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No projects available yet.</p>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mt-4 text-[#bbd922] hover:underline"
                >
                  View all projects
                </button>
              )}
            </motion.div>
          ) : (
            <EnhancedMasonryGrid
              collections={filteredCollections}
              gridSpacing={settings.gridSpacing}
              animationSpeed={settings.animationSpeed}
              enableInfiniteScroll={true}
              itemsPerPage={12}
            />
          )}
        </div>

        {/* Desktop floating menu */}
        <div className="hidden md:block">
          <FloatingMenu
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>

        {/* Mobile bottom navigation */}
        <div className="md:hidden">
          <MobileBottomNav onMenuClick={() => setMenuOpen(true)} />
        </div>

        {/* Mobile menu overlay */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-bold mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedCategory === null
                      ? 'bg-[#bbd922] text-black font-medium'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  All Projects
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-[#bbd922] text-black font-medium'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </PageTransition>
  );
}
