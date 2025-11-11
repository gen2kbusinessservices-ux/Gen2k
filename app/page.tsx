'use client';

import { useState, useEffect } from 'react';
import { supabase, Collection, Category, Settings } from '@/lib/supabase';
import MasonryGrid from '@/components/MasonryGrid';
import FloatingMenu from '@/components/FloatingMenu';
import Preloader from '@/components/Preloader';
import { Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({
    gridSpacing: 16,
    animationSpeed: 300,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [collectionsRes, categoriesRes, settingsRes] = await Promise.all([
        supabase
          .from('collections')
          .select('*')
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Building2 className="w-12 h-12 text-[#bbd922]" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100"
      >
        <div className="max-w-[1600px] mx-auto px-6 py-6 flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black tracking-tight flex items-center gap-3 justify-center">
              <Building2 className="w-8 h-8 text-[#bbd922]" />
              JVA Designs
            </h1>
            <p className="text-sm text-gray-600 mt-1">Architecture & Design</p>
          </div>
        </div>
      </motion.header>

      <div className="max-w-[1600px] mx-auto px-6 py-12">
        {filteredCollections.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No projects available yet.</p>
          </div>
        ) : (
          <MasonryGrid
            collections={filteredCollections}
            gridSpacing={settings.gridSpacing}
            animationSpeed={settings.animationSpeed}
          />
        )}
      </div>

      <FloatingMenu
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
    </main>
  );
}
