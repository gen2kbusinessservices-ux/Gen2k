'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase, Collection, Category } from '@/lib/supabase';
import { uploadImage } from '@/lib/imageUtils';
import { generateSlug, generateUniqueSlug, generateSeoTitle, generateSeoDescription, generateImageAlt } from '@/lib/seoUtils';
import { 
  Building2, Plus, Edit, Trash2, LogOut, Image as ImageIcon, 
  Save, X, Upload, Copy, BarChart3, Eye, EyeOff, GripVertical,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

type FormMode = 'create' | 'edit' | 'view' | null;
type TabType = 'collections' | 'categories' | 'analytics';

export default function AdminDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  
  // State
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('collections');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category_id: '',
    is_published: false,
    images: [] as any[]
  });
  
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

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

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  async function fetchData() {
    try {
      const [collectionsRes, categoriesRes] = await Promise.all([
        supabase.from('collections').select('*, category:categories(*)').order('order', { ascending: true }),
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

  async function fetchAnalytics() {
    try {
      const res = await fetch('/api/analytics?days=30');
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  async function handleDuplicateCollection(id: string) {
    try {
      const res = await fetch(`/api/collections/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        await fetchData();
        alert('Collection duplicated successfully!');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error duplicating collection:', error);
      alert(error.message || 'Failed to duplicate collection');
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

  function openCollectionForm(mode: 'create' | 'edit', collection?: Collection) {
    setFormMode(mode);
    if (mode === 'edit' && collection) {
      setSelectedCollection(collection);
      setFormData({
        title: collection.title,
        slug: collection.slug,
        description: collection.description || '',
        category_id: collection.category_id || '',
        is_published: collection.is_published,
        images: collection.images || []
      });
    } else {
      setSelectedCollection(null);
      setFormData({
        title: '',
        slug: '',
        description: '',
        category_id: '',
        is_published: false,
        images: []
      });
    }
  }

  function openCategoryForm(mode: 'create' | 'edit', category?: Category) {
    setFormMode(mode);
    if (mode === 'edit' && category) {
      setSelectedCategory(category);
      setCategoryFormData({
        name: category.name,
        slug: category.slug
      });
    } else {
      setSelectedCategory(null);
      setCategoryFormData({
        name: '',
        slug: ''
      });
    }
  }

  async function handleImageUpload(files: FileList) {
    setUploading(true);
    try {
      const newImages = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const path = `collections/${timestamp}_${randomStr}`;
        
        const imageData = await uploadImage(file, 'portfolio-images', path);
        
        newImages.push({
          url: imageData.url,
          thumbnail_url: imageData.thumbnail_url,
          alt: generateImageAlt(formData.title || 'Untitled', formData.images.length + i, formData.description),
          width: imageData.width,
          height: imageData.height
        });
      }
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveCollection() {
    try {
      const existingSlugs = collections.map(c => c.slug).filter(s => s !== selectedCollection?.slug);
      const finalSlug = formData.slug || generateUniqueSlug(formData.title, existingSlugs);
      
      const collectionData = {
        title: formData.title,
        slug: finalSlug,
        description: formData.description,
        seo_title: generateSeoTitle(formData.title, categories.find(c => c.id === formData.category_id)?.name),
        seo_description: generateSeoDescription(formData.description, formData.title),
        category_id: formData.category_id || null,
        images: formData.images,
        is_published: formData.is_published,
        order: selectedCollection?.order || collections.length
      };

      if (formMode === 'edit' && selectedCollection) {
        const { error } = await supabase
          .from('collections')
          .update(collectionData)
          .eq('id', selectedCollection.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('collections')
          .insert(collectionData);
        
        if (error) throw error;
      }
      
      await fetchData();
      setFormMode(null);
      alert('Collection saved successfully!');
    } catch (error: any) {
      console.error('Error saving collection:', error);
      alert(error.message || 'Failed to save collection');
    }
  }

  async function handleSaveCategory() {
    try {
      const existingSlugs = categories.map(c => c.slug).filter(s => s !== selectedCategory?.slug);
      const finalSlug = categoryFormData.slug || generateUniqueSlug(categoryFormData.name, existingSlugs);
      
      const categoryData = {
        name: categoryFormData.name,
        slug: finalSlug,
        order: selectedCategory?.order || categories.length
      };

      if (formMode === 'edit' && selectedCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', selectedCategory.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(categoryData);
        
        if (error) throw error;
      }
      
      await fetchData();
      setFormMode(null);
      alert('Category saved successfully!');
    } catch (error: any) {
      console.error('Error saving category:', error);
      alert(error.message || 'Failed to save category');
    }
  }

  function handleTitleChange(value: string) {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: prev.slug || generateSlug(value)
    }));
  }

  function handleCategoryNameChange(value: string) {
    setCategoryFormData(prev => ({
      ...prev,
      name: value,
      slug: prev.slug || generateSlug(value)
    }));
  }

  // Pagination
  const totalPages = Math.ceil(collections.length / itemsPerPage);
  const paginatedCollections = collections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="admin-loading">
        <div className="animate-spin">
          <Building2 className="w-12 h-12 text-[#bbd922]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-dashboard">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
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
            data-testid="signout-button"
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
            data-testid="tab-collections"
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
            data-testid="tab-categories"
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-[#bbd922] text-black'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            data-testid="tab-analytics"
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Analytics
          </button>
        </div>

        {activeTab === 'collections' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black">Collections</h2>
              <button 
                onClick={() => openCollectionForm('create')}
                className="flex items-center gap-2 px-4 py-2 bg-[#bbd922] text-black rounded-lg hover:bg-[#a5c31e] transition-colors"
                data-testid="new-collection-button"
              >
                <Plus className="w-4 h-4" />
                New Collection
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12" data-testid="collections-loading">
                <div className="animate-spin inline-block">
                  <Building2 className="w-8 h-8 text-[#bbd922]" />
                </div>
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg" data-testid="collections-empty">
                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No collections yet. Create your first one!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="collections-grid">
                  {paginatedCollections.map((collection) => (
                    <motion.div
                      key={collection.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg shadow-md overflow-hidden"
                      data-testid={`collection-card-${collection.id}`}
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
                        <div className="absolute top-2 right-2 flex gap-2">
                          {collection.is_published ? (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Published
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded flex items-center gap-1">
                              <EyeOff className="w-3 h-3" /> Draft
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-black mb-1">{collection.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {collection.description || 'No description'}
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                          {collection.images?.length || 0} images • {collection.view_count || 0} views
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <button 
                            onClick={() => openCollectionForm('edit', collection)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            data-testid={`edit-collection-${collection.id}`}
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDuplicateCollection(collection.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                            data-testid={`duplicate-collection-${collection.id}`}
                          >
                            <Copy className="w-3 h-3" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleDeleteCollection(collection.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                            data-testid={`delete-collection-${collection.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black">Categories</h2>
              <button 
                onClick={() => openCategoryForm('create')}
                className="flex items-center gap-2 px-4 py-2 bg-[#bbd922] text-black rounded-lg hover:bg-[#a5c31e] transition-colors"
                data-testid="new-category-button"
              >
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
              <div className="bg-white rounded-lg shadow-md overflow-hidden" data-testid="categories-table">
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
                        Collections
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => {
                      const collectionCount = collections.filter(c => c.category_id === category.id).length;
                      return (
                        <tr key={category.id} data-testid={`category-row-${category.id}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {category.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {category.slug}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {collectionCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => openCategoryForm('edit', category)}
                              className="text-gray-600 hover:text-black mr-4"
                              data-testid={`edit-category-${category.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-800"
                              data-testid={`delete-category-${category.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div data-testid="analytics-section">
            <h2 className="text-2xl font-bold text-black mb-6">Analytics Overview</h2>
            
            {analytics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Views</h3>
                    <p className="text-3xl font-bold text-black">{analytics.summary?.view || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Collections</h3>
                    <p className="text-3xl font-bold text-black">{collections.length}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Published</h3>
                    <p className="text-3xl font-bold text-black">
                      {collections.filter(c => c.is_published).length}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-black mb-4">Top Viewed Collections</h3>
                  <div className="space-y-3">
                    {analytics.topCollections?.map((col: any, idx: number) => (
                      <div key={col.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-400">#{idx + 1}</span>
                          <span className="text-sm text-gray-900">{col.title}</span>
                        </div>
                        <span className="text-sm font-medium text-[#bbd922]">
                          {col.view_count || 0} views
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin inline-block">
                  <Building2 className="w-8 h-8 text-[#bbd922]" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collection Form Modal */}
      {formMode && activeTab === 'collections' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="collection-form-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-black">
                {formMode === 'edit' ? 'Edit Collection' : 'New Collection'}
              </h3>
              <button
                onClick={() => setFormMode(null)}
                className="text-gray-500 hover:text-black"
                data-testid="close-collection-form"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bbd922] focus:border-transparent"
                  placeholder="Enter collection title"
                  data-testid="collection-title-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bbd922] focus:border-transparent"
                  placeholder="url-friendly-slug"
                  data-testid="collection-slug-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bbd922] focus:border-transparent"
                  rows={4}
                  placeholder="Enter collection description"
                  data-testid="collection-description-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bbd922] focus:border-transparent"
                  data-testid="collection-category-select"
                >
                  <option value="">No category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                  className="w-4 h-4 text-[#bbd922] border-gray-300 rounded focus:ring-[#bbd922]"
                  data-testid="collection-published-checkbox"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                  Publish collection
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                    id="image-upload"
                    data-testid="collection-image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload images</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 50MB</p>
                  </label>
                </div>

                {uploading && (
                  <div className="mt-4 text-center">
                    <div className="animate-spin inline-block">
                      <Building2 className="w-6 h-6 text-[#bbd922]" />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Uploading and optimizing images...</p>
                  </div>
                )}

                {formData.images.length > 0 && (
                  <Reorder.Group
                    axis="y"
                    values={formData.images}
                    onReorder={(newOrder) => setFormData(prev => ({ ...prev, images: newOrder }))}
                    className="mt-4 space-y-2"
                  >
                    {formData.images.map((image, idx) => (
                      <Reorder.Item key={`${image.url}-${idx}`} value={image}>
                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                          <img
                            src={image.thumbnail_url || image.url}
                            alt={image.alt || `Image ${idx + 1}`}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Image {idx + 1}</p>
                            <input
                              type="text"
                              value={image.alt || ''}
                              onChange={(e) => {
                                const newImages = [...formData.images];
                                newImages[idx] = { ...newImages[idx], alt: e.target.value };
                                setFormData(prev => ({ ...prev, images: newImages }));
                              }}
                              className="text-xs text-gray-500 mt-1 w-full px-2 py-1 border border-gray-200 rounded"
                              placeholder="Alt text"
                            />
                          </div>
                          <button
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setFormMode(null)}
                className="px-4 py-2 text-gray-700 hover:text-black transition-colors"
                data-testid="cancel-collection-form"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCollection}
                disabled={!formData.title || uploading}
                className="flex items-center gap-2 px-4 py-2 bg-[#bbd922] text-black rounded-lg hover:bg-[#a5c31e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="save-collection-button"
              >
                <Save className="w-4 h-4" />
                Save Collection
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Category Form Modal */}
      {formMode && activeTab === 'categories' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="category-form-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-black">
                {formMode === 'edit' ? 'Edit Category' : 'New Category'}
              </h3>
              <button
                onClick={() => setFormMode(null)}
                className="text-gray-500 hover:text-black"
                data-testid="close-category-form"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => handleCategoryNameChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bbd922] focus:border-transparent"
                  placeholder="Enter category name"
                  data-testid="category-name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                <input
                  type="text"
                  value={categoryFormData.slug}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bbd922] focus:border-transparent"
                  placeholder="url-friendly-slug"
                  data-testid="category-slug-input"
                />
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setFormMode(null)}
                className="px-4 py-2 text-gray-700 hover:text-black transition-colors"
                data-testid="cancel-category-form"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={!categoryFormData.name}
                className="flex items-center gap-2 px-4 py-2 bg-[#bbd922] text-black rounded-lg hover:bg-[#a5c31e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="save-category-button"
              >
                <Save className="w-4 h-4" />
                Save Category
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
