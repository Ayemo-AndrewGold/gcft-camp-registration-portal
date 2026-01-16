"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Trash2,
  X,
  FolderPlus,
  CheckCircle,
  XCircle,
  Loader,
  Eye,
  Search,
} from 'lucide-react';

const API_BASE = "https://gcft-camp.onrender.com/api/v1";

interface Category {
  id: number;
  category_name: string;
}

interface ImageItem {
  id: number;
  image_name: string;
  image_url: string;
  category_id: number;
  status: string;
}

const ImageUpload = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewImage, setViewImage] = useState<ImageItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories/`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('Failed to load categories', 'error');
    }
  };

  const fetchImages = async (categoryId: number) => {
    setLoading(true);
    try {
      console.log('Fetching images for category:', categoryId);
      const res = await fetch(`${API_BASE}/${categoryId}/images/`);
      
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched images:', data);
        console.log('Number of images:', data.length);
        setImages(data);
      } else {
        const errorText = await res.text();
        console.error('Failed to fetch images:', res.status, errorText);
        showToast(`Failed to load images: ${res.status}`, 'error');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      showToast('Failed to load images', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchImages(selectedCategory);
    }
  }, [selectedCategory]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      showToast('Please enter a category name', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/categories/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_name: newCategoryName }),
      });

      if (res.ok) {
        showToast('Category created successfully!', 'success');
        setNewCategoryName('');
        setShowCategoryModal(false);
        fetchCategories();
      } else {
        showToast('Failed to create category', 'error');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showToast('Error creating category', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImageName(file.name.split('.')[0]);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedCategory) {
      showToast('Please select a category first', 'error');
      return;
    }
    if (!selectedImage) {
      showToast('Please select an image', 'error');
      return;
    }
    if (!imageName.trim()) {
      showToast('Please enter an image name', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      console.log('Uploading to category:', selectedCategory);
      console.log('Image name:', imageName);
      console.log('File:', selectedImage.name, selectedImage.size, selectedImage.type);

      const uploadUrl = `${API_BASE}/${selectedCategory}/add_image/?image_name=${encodeURIComponent(imageName)}`;
      console.log('Upload URL:', uploadUrl);

      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', res.status);
      console.log('Upload response ok:', res.ok);

      if (res.ok) {
        const result = await res.json();
        console.log('Upload result:', result);
        showToast('Image uploaded successfully!', 'success');
        setShowImageModal(false);
        setSelectedImage(null);
        setPreviewUrl('');
        setImageName('');
        
        // Refresh images after a short delay
        setTimeout(() => {
          fetchImages(selectedCategory);
        }, 500);
      } else {
        const errorText = await res.text();
        console.error('Upload failed:', res.status, errorText);
        showToast(errorText || 'Failed to upload image', 'error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('Error uploading image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      const res = await fetch(`${API_BASE}/images/${imageId}/`, {
        method: 'DELETE',
      });

      console.log('Delete image response status:', res.status);

      if (res.status === 204 || res.status === 200) {
        showToast('Image deleted successfully!', 'success');
        if (selectedCategory) fetchImages(selectedCategory);
      } else {
        const errorText = await res.text();
        console.error('Delete failed:', res.status, errorText);
        showToast(`Failed to delete image: ${res.status}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      showToast('Network error. Please check your connection.', 'error');
    }
  };

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete the category "${categoryName}"?\n\nWarning: This will also delete all images in this category!`)) return;

    try {
      const res = await fetch(`${API_BASE}/categories/${categoryId}`, {
        method: 'DELETE',
      });

      console.log('Delete category response status:', res.status);

      if (res.status === 204 || res.status === 200) {
        showToast('Category deleted successfully!', 'success');
        
        // If deleted category was selected, clear selection
        if (selectedCategory === categoryId) {
          setSelectedCategory(null);
          setImages([]);
        }
        
        // Refresh categories list
        fetchCategories();
      } else {
        const errorText = await res.text();
        console.error('Delete category failed:', res.status, errorText);
        showToast(`Failed to delete category: ${res.status}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Network error. Please check your connection.', 'error');
    }
  };

  const filteredImages = images.filter((img) =>
    img.image_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-2 sm:p-6 lg:p-8 bg-gradient-to-br from-green-50 via-white to-green-100 w-full sm:mt-4 rounded-lg shadow-md font-sans">
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <section className="bg-white min-h-screen rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
        <div className="mb-8 pb-6 border-b-2 border-green-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                🖼️ Image Gallery Manager
              </h1>
              <p className="text-gray-600">Easter Camp Meeting 2026 - Upload & Manage Gallery Images</p>
            </div>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg font-semibold"
            >
              <FolderPlus className="w-5 h-5" />
              New Category
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-green-600" />
            Categories
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <div 
                key={cat.id}
                className="relative group"
              >
                <button
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-green-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.category_name}
                </button>
                
                {/* Delete Category Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(cat.id, cat.category_name);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  title="Delete Category"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-gray-500 italic">No categories yet. Create one to get started!</p>
            )}
          </div>
        </div>

        {selectedCategory && (
          <>
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search images..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowImageModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg font-semibold"
              >
                <Upload className="w-5 h-5" />
                Upload Image
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader className="w-12 h-12 text-green-600 animate-spin" />
              </div>
            ) : filteredImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={img.image_url}
                        alt={img.image_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 truncate">{img.image_name}</h3>
                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          img.status === 'in-use' || img.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {img.status}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setViewImage(img)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-8xl mb-4">📷</div>
                <p className="text-gray-500 text-lg">No images in this category yet</p>
                <button
                  onClick={() => setShowImageModal(true)}
                  className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
                >
                  Upload First Image
                </button>
              </div>
            )}
          </>
        )}

        {!selectedCategory && (
          <div className="text-center py-20">
            <div className="text-8xl mb-4">📁</div>
            <p className="text-gray-500 text-lg">Select a category to view and manage images</p>
          </div>
        )}
      </section>

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Create New Category</h2>
                <button onClick={() => setShowCategoryModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Opening Service, Worship Night"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleCreateCategory}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}

      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl sticky top-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Upload Image</h2>
                <button onClick={() => setShowImageModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">Click to upload image</p>
                      <p className="text-gray-400 text-sm mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image Name</label>
                <input
                  type="text"
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                  placeholder="e.g., Opening Prayer"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleUploadImage}
                disabled={uploading || !selectedImage}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    Uploading...
                  </div>
                ) : (
                  'Upload Image'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-5xl w-full">
            <button
              onClick={() => setViewImage(null)}
              className="absolute -top-12 right-0 p-2 bg-white rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={viewImage.image_url}
              alt={viewImage.image_name}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-4 bg-white rounded-lg p-4">
              <h3 className="text-xl font-bold text-gray-800">{viewImage.image_name}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;