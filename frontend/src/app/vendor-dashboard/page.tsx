'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axios';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Link from 'next/link';
import { Store, Plus, CheckCircle, Clock, ExternalLink, Package, AlertCircle, Edit3, X, Eye, EyeOff, Trash2, ImageIcon } from 'lucide-react';

const CATEGORIES = [
  'Food & Beverages',
  'Fashion & Apparel',
  'Technology & Electronics',
  'Services (Design, Tutoring, etc)',
  'Beauty & Cosmetics',
  'Other',
];

interface ProductType {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  is_available: boolean;
  additional_images?: { id: number; image: string }[];
}

interface BusinessType {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  banner: string | null;
  payment_method: string;
  whatsapp_number: string;
  instagram_handle: string | null;
  is_approved: boolean;
  products: ProductType[];
}

// Inline toast component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-24 right-4 z-50 px-6 py-4 rounded-xl shadow-lg font-medium text-sm flex items-center gap-2 max-w-sm ${
        type === 'success'
          ? 'bg-green-50 text-green-800 border border-green-200'
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}
    >
      {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      {message}
    </motion.div>
  );
}

export default function VendorDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [businesses, setBusinesses] = useState<BusinessType[]>([]);
  const [activeBizIdx, setActiveBizIdx] = useState(0);
  const business = businesses[activeBizIdx] || null;
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [isAddingNewBusiness, setIsAddingNewBusiness] = useState(false);

  // Business creation form
  const [busName, setBusName] = useState('');
  const [busDesc, setBusDesc] = useState('');
  const [busWhatsapp, setBusWhatsapp] = useState('');
  const [busInsta, setBusInsta] = useState('');
  const [busPayment, setBusPayment] = useState('');
  const [busLogo, setBusLogo] = useState<File | null>(null);
  const [busBanner, setBusBanner] = useState<File | null>(null);
  const [busSubmitting, setBusSubmitting] = useState(false);

  // Product creation form
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategory, setProdCategory] = useState(CATEGORIES[0]);
  const [prodPrice, setProdPrice] = useState('');
  const [prodImage, setProdImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [prodSubmitting, setProdSubmitting] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  const fetchMyBusinesses = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/student-businesses/my-businesses/');
      setBusinesses(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      console.error('Failed to fetch businesses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    fetchMyBusinesses();
  }, [router, fetchMyBusinesses]);

  const handleCreateOrUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusSubmitting(true);

    const formData = new FormData();
    formData.append('name', busName.trim());
    formData.append('description', busDesc.trim());
    formData.append('whatsapp_number', busWhatsapp.trim());
    if (busPayment.trim()) formData.append('payment_method', busPayment.trim());
    if (busInsta.trim()) formData.append('instagram_handle', busInsta.trim());
    if (busLogo) formData.append('logo', busLogo);
    if (busBanner) formData.append('banner', busBanner);

    try {
      if (business && isEditingBusiness) {
        await axiosInstance.patch(`/student-businesses/${business.slug}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Business profile updated successfully!', 'success');
        setIsEditingBusiness(false);
      } else {
        await axiosInstance.post('/student-businesses/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Business created! It is now pending approval from executives.', 'success');
        setIsAddingNewBusiness(false);
      }
      fetchMyBusinesses();
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.name?.[0] || 'Failed to save business details.';
      showToast(detail, 'error');
    } finally {
      setBusSubmitting(false);
    }
  };

  const handleEditClick = () => {
    if (!business) return;
    setBusName(business.name);
    setBusDesc(business.description);
    setBusWhatsapp(business.whatsapp_number);
    setBusPayment(business.payment_method || '');
    setBusInsta(business.instagram_handle || '');
    setBusLogo(null);
    setBusBanner(null);
    setIsEditingBusiness(true);
  };

  const handleToggleProduct = async (productId: number, currentStatus: boolean) => {
    try {
      await axiosInstance.patch(`/student-businesses/products/${productId}/`, {
        is_available: !currentStatus
      });
      showToast(`Product marked as ${!currentStatus ? 'Available' : 'Unavailable'}.`, 'success');
      fetchMyBusinesses();
    } catch (err) {
      showToast('Failed to update product status.', 'error');
    }
  };

  const handleDeleteBusiness = async (businessSlug: string) => {
    if (!confirm('Are you absolutely sure you want to delete this business? All its products will be lost forever. This action cannot be undone.')) return;
    
    try {
      await axiosInstance.delete(`/student-businesses/${businessSlug}/`);
      showToast('Business deleted successfully.', 'success');
      setActiveBizIdx(0);
      fetchMyBusinesses();
    } catch (err) {
      showToast('Failed to delete business.', 'error');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
      await axiosInstance.delete(`/student-businesses/products/${productId}/`);
      showToast('Product deleted successfully.', 'success');
      fetchMyBusinesses();
    } catch (err) {
      showToast('Failed to delete product.', 'error');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    if (!prodImage) {
      showToast('Please select a product image.', 'error');
      return;
    }

    setProdSubmitting(true);

    const formData = new FormData();
    formData.append('business', String(business.id));
    formData.append('name', prodName.trim());
    formData.append('category', prodCategory);
    formData.append('description', prodDesc.trim());
    formData.append('price', prodPrice);
    formData.append('image', prodImage);
    additionalImages.forEach((img) => formData.append('additional_images', img));
    formData.append('is_available', 'true');

    try {
      await axiosInstance.post('/student-businesses/products/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Product added successfully!', 'success');
      setProdName('');
      setProdDesc('');
      setProdPrice('');
      setProdImage(null);
      setAdditionalImages([]);
      // Reset file inputs
      const fileInput = document.getElementById('prod-image-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      const extraInput = document.getElementById('prod-extra-images') as HTMLInputElement;
      if (extraInput) extraInput.value = '';
      fetchMyBusinesses();
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.image?.[0] || 'Failed to add product.';
      showToast(detail, 'error');
    } finally {
      setProdSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="min-h-screen bg-gray-50 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Vendor Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your student business and products.</p>
          </div>

          {!business || isAddingNewBusiness ? (
            /* ── BUSINESS REGISTRATION FORM ────────────────────────── */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Store size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{isAddingNewBusiness ? 'Add Another Business' : 'Register Your Business'}</h2>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  {isAddingNewBusiness ? 'Register an additional business under your account.' : 'Fill out these details to list your business on the ACES Marketplace. Executives will review it shortly.'}
                </p>
                {isAddingNewBusiness && (
                  <button onClick={() => setIsAddingNewBusiness(false)} className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    ← Back to my businesses
                  </button>
                )}
              </div>

              <form onSubmit={handleCreateOrUpdateBusiness} className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                  <input
                    required
                    type="text"
                    value={busName}
                    onChange={(e) => setBusName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., Campus Bites"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={busDesc}
                    onChange={(e) => setBusDesc(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Tell customers what your business is about..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
                    <input
                      required
                      type="text"
                      placeholder="23354..."
                      value={busWhatsapp}
                      onChange={(e) => setBusWhatsapp(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Include country code (e.g., 233...)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method / Info</label>
                    <input
                      type="text"
                      placeholder="e.g., MoMo: 054... (Kwame)"
                      value={busPayment}
                      onChange={(e) => setBusPayment(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Handle</label>
                    <input
                      type="text"
                      placeholder="@aces_knust"
                      value={busInsta}
                      onChange={(e) => setBusInsta(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBusLogo(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Banner</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBusBanner(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: 1200x400 or wider for best results.</p>
                </div>
                <button
                  type="submit"
                  disabled={busSubmitting}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {busSubmitting ? 'Submitting...' : (isEditingBusiness ? 'Save Changes' : 'Submit for Approval')}
                </button>
                {isEditingBusiness && (
                  <button
                    type="button"
                    onClick={() => setIsEditingBusiness(false)}
                    className="w-full py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors mt-4"
                  >
                    Cancel Editing
                  </button>
                )}
              </form>
            </motion.div>
          ) : (
            /* ── EXISTING BUSINESS DASHBOARD ────────────────────────── */
            <div className="space-y-8">

              {/* Business Selector (when user has multiple) */}
              {businesses.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {businesses.map((biz, i) => (
                    <button key={biz.id}
                      onClick={() => { setActiveBizIdx(i); setIsEditingBusiness(false); }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border shrink-0 ${
                        i === activeBizIdx
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      <Store size={14} /> {biz.name}
                    </button>
                  ))}
                  <button onClick={() => { setIsAddingNewBusiness(true); setBusName(''); setBusDesc(''); setBusWhatsapp(''); setBusPayment(''); setBusInsta(''); setBusLogo(null); setBusBanner(null); }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors shrink-0">
                    <Plus size={14} /> Add Business
                  </button>
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-5"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {business.logo ? (
                    <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="text-gray-400" size={32} />
                  )}
                </div>
                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900">{business.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">{business.description.substring(0, 100)}{business.description.length > 100 ? '...' : ''}</p>
                </div>
                <div className="flex flex-col items-center gap-2 shrink-0">
                  {business.is_approved ? (
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl font-semibold">
                      <CheckCircle size={20} /> Approved & Live
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl font-semibold">
                      <Clock size={20} /> Pending Approval
                    </div>
                  )}
                  {business.is_approved && (
                    <Link
                      href={`/marketplace/${business.slug}`}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <ExternalLink size={14} /> View Storefront
                    </Link>
                  )}
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    <Edit3 size={14} /> Edit Profile
                  </button>
                  {businesses.length === 1 && (
                    <button
                      onClick={() => { setIsAddingNewBusiness(true); setBusName(''); setBusDesc(''); setBusWhatsapp(''); setBusPayment(''); setBusInsta(''); setBusLogo(null); setBusBanner(null); }}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Plus size={14} /> Add Another Business
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteBusiness(business.slug)}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium mt-1"
                  >
                    <Trash2 size={14} /> Delete Business
                  </button>
                </div>
              </motion.div>

              {/* Editing Form Overlay within Dashboard */}
              {isEditingBusiness && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Edit Business Profile</h3>
                    <button onClick={() => setIsEditingBusiness(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={24} />
                    </button>
                  </div>
                  <form onSubmit={handleCreateOrUpdateBusiness} className="space-y-6 max-w-2xl mx-auto">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                      <input
                        required
                        type="text"
                        value={busName}
                        onChange={(e) => setBusName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea
                        required
                        rows={3}
                        value={busDesc}
                        onChange={(e) => setBusDesc(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
                        <input
                          required
                          type="text"
                          value={busWhatsapp}
                          onChange={(e) => setBusWhatsapp(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method / Info</label>
                        <input
                          type="text"
                          value={busPayment}
                          onChange={(e) => setBusPayment(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Handle</label>
                        <input
                          type="text"
                          value={busInsta}
                          onChange={(e) => setBusInsta(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Update Logo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setBusLogo(e.target.files?.[0] || null)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty to keep current logo.</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Update Store Banner</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBusBanner(e.target.files?.[0] || null)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty to keep current banner.</p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={busSubmitting}
                        className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      >
                        {busSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingBusiness(false)}
                        className="px-6 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Products Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Package size={20} />
                    Your Products
                    <span className="ml-1 bg-gray-100 text-gray-600 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                      {business.products?.length || 0}
                    </span>
                  </h3>
                  {business.is_approved && (
                    <Link href={`/marketplace/${business.slug}`} target="_blank"
                      className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold border border-blue-100 bg-blue-50 px-3 py-1.5 rounded-lg">
                      <ExternalLink size={12} /> View Live Store
                    </Link>
                  )}
                </div>

                {/* Product List */}
                {business.products?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {business.products.map((p) => (
                      <div key={p.id} className="flex gap-3 border border-gray-100 rounded-2xl p-4 bg-white hover:shadow-sm transition-shadow">
                        <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          {(p.additional_images?.length ?? 0) > 0 && (
                            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 py-0.5 rounded flex items-center gap-0.5">
                              <ImageIcon size={9} /> {(p.additional_images?.length ?? 0) + 1}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mb-0.5">{p.name}</h4>
                          <p className="text-blue-600 font-extrabold text-sm mb-2">GH₵{Number(p.price).toLocaleString()}</p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              onClick={() => handleToggleProduct(p.id, p.is_available)}
                              className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-colors ${
                                p.is_available
                                  ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-100'
                                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100'
                              }`}
                            >
                              {p.is_available ? <><Eye size={11}/> Live</> : <><EyeOff size={11}/> Hidden</>}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-100"
                            >
                              <Trash2 size={11} /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mb-8">
                    <p className="text-gray-500">You haven&apos;t added any products yet.</p>
                  </div>
                )}

                {/* Add Product Form */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <Plus size={18} /> Add New Product
                  </h4>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                        <input
                          required
                          type="text"
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <select
                          value={prodCategory}
                          onChange={(e) => setProdCategory(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (GH₵) *</label>
                        <input
                          required
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea
                        required
                        rows={2}
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Main Product Image *</label>
                        <input
                          id="prod-image-input"
                          required
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProdImage(e.target.files?.[0] || null)}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Gallery Images (Optional)</label>
                        <input
                          id="prod-extra-images"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              setAdditionalImages(prev => [...prev, ...Array.from(e.target.files as FileList)]);
                              e.target.value = ''; // Reset so the same file can be selected again
                            }
                          }}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm bg-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">Select multiple files or add them one by one.</p>
                        
                        {additionalImages.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {additionalImages.map((file, idx) => (
                              <div key={idx} className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setAdditionalImages(prev => prev.filter((_, i) => i !== idx))}
                                  className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={prodSubmitting}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                      {prodSubmitting ? 'Uploading...' : 'Upload Product'}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
