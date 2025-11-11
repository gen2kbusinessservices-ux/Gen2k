'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase, Collection, Category } from '@/lib/supabase';
import { Building2, Plus, Edit, Trash2, LogOut, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'collections' | 'categories'>('collections');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    try {
      const [collectionsRes, categoriesRes] = await Promise.all([
        supabase.from('collections').select('*').order('order', { ascending: true }),
        supabase.from('categories').select('*').order('order', { ascending: true }),
      ]);

      if (collectionsRes.data) setCollections(collectionsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCollection(id: string) {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      const { error } = await supabase.from('collections').delete().eq('id', id);
      if (error) throw error;
      setCollections(collections.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection');
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Building2 className="w-12 h-12 text-[#bbd922]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#bbd922]" />
            <div>
              <h1 className="text-2xl font-bold text-black">JVA Designs</h1>
              <p className="text-sm text-gray-600">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-black transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'collections'
                ? 'bg-[#bbd922] text-black'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Collections
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-[#bbd922] text-black'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Categories
          </button>
        </div>

        {activeTab === 'collections' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black">Collections</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#bbd922] text-black rounded-lg hover:bg-[#a5c31e] transition-colors">
                <Plus className="w-4 h-4" />
                New Collection
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin inline-block">
                  <Building2 className="w-8 h-8 text-[#bbd922]" />
                </div>
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No collections yet. Create your first one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="aspect-video bg-gray-100 relative">
                      {collection.images[0] ? (
                        <img
                          src={collection.images[0].thumbnail_url || collection.images[0].url}
                          alt={collection.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      {collection.is_published && (
                        <span className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                          Published
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-black mb-1">{collection.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {collection.description || 'No description'}
                      </p>
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCollection(collection.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black">Categories</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#bbd922] text-black rounded-lg hover:bg-[#a5c31e] transition-colors">
                <Plus className="w-4 h-4" />
                New Category
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin inline-block">
                  <Building2 className="w-8 h-8 text-[#bbd922]" />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {category.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {category.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {category.order}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-gray-600 hover:text-black mr-4">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
