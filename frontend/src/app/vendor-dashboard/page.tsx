'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Store, Plus, CheckCircle, Clock } from 'lucide-react';

const CATEGORIES = [
  'Food & Beverages',
  'Fashion & Apparel',
  'Technology & Electronics',
  'Services (Design, Tutoring, etc)',
  'Beauty & Cosmetics',
  'Other'
];

export default function VendorDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);

  // Forms state
  const [busName, setBusName] = useState('');
  const [busDesc, setBusDesc] = useState('');
  const [busWhatsapp, setBusWhatsapp] = useState('');
  const [busInsta, setBusInsta] = useState('');
  const [busPayment, setBusPayment] = useState('');
  const [busLogo, setBusLogo] = useState<File | null>(null);
  const [busBanner, setBusBanner] = useState<File | null>(null);

  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategory, setProdCategory] = useState(CATEGORIES[0]);
  const [prodPrice, setProdPrice] = useState('');
  const [prodImage, setProdImage] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchMyBusiness();
  }, [router]);

  const fetchMyBusiness = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${apiUrl}/api/student-businesses/my-businesses/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setBusiness(data[0]); // Just pick the first one for simplicity
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    const formData = new FormData();
    formData.append('name', busName);
    formData.append('description', busDesc);
    formData.append('whatsapp_number', busWhatsapp);
    if (busPayment) formData.append('payment_method', busPayment);
    if (busInsta) formData.append('instagram_handle', busInsta);
    if (busLogo) formData.append('logo', busLogo);
    if (busBanner) formData.append('banner', busBanner);

    try {
      const res = await fetch(`${apiUrl}/api/student-businesses/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        alert('Business created! It is now pending approval from executives.');
        fetchMyBusiness();
      } else {
        alert('Failed to create business.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    
    const token = localStorage.getItem('access_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    const formData = new FormData();
    formData.append('business', business.id);
    formData.append('name', prodName);
    formData.append('category', prodCategory);
    formData.append('description', prodDesc);
    formData.append('price', prodPrice);
    if (prodImage) formData.append('image', prodImage);

    try {
      const res = await fetch(`${apiUrl}/api/student-businesses/products/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        alert('Product added successfully!');
        setProdName('');
        setProdDesc('');
        setProdPrice('');
        setProdImage(null);
        fetchMyBusiness(); // Refresh to show new product
      } else {
        alert('Failed to add product. Please make sure you attached an image.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Vendor Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your student business and products.</p>
          </div>

          {!business ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Store size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Register Your Business</h2>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">Fill out these details to list your business on the ACES Marketplace. Executives will review it shortly.</p>
              </div>

              <form onSubmit={handleCreateBusiness} className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input required type="text" value={busName} onChange={e => setBusName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea required rows={3} value={busDesc} onChange={e => setBusDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method / Info</label>
                    <input type="text" placeholder="e.g., MoMo: 054... (Kwame)" value={busPayment} onChange={e => setBusPayment(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                    <input required type="text" placeholder="23354..." value={busWhatsapp} onChange={e => setBusWhatsapp(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Handle (Optional)</label>
                    <input type="text" placeholder="@aces_knust" value={busInsta} onChange={e => setBusInsta(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Logo</label>
                    <input type="file" accept="image/*" onChange={e => setBusLogo(e.target.files?.[0] || null)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Banner (Optional)</label>
                  <input type="file" accept="image/*" onChange={e => setBusBanner(e.target.files?.[0] || null)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm" />
                </div>
                <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors">
                  Submit for Approval
                </button>
              </form>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Business Status Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {business.logo ? <img src={business.logo} alt={business.name} className="w-full h-full object-cover" /> : <Store className="text-gray-400" size={32} />}
                </div>
                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-900">{business.name}</h2>
                  <p className="text-gray-500">{business.category}</p>
                </div>
                <div className="shrink-0">
                  {business.is_approved ? (
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl font-semibold">
                      <CheckCircle size={20} /> Approved & Live
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl font-semibold">
                      <Clock size={20} /> Pending Approval
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Products Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Your Products ({business.products?.length || 0})</h3>
                
                {/* Product List */}
                {business.products?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {business.products.map((p: any) => (
                      <div key={p.id} className="flex gap-4 border border-gray-100 rounded-2xl p-4 bg-gray-50">
                        <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 line-clamp-1">{p.name}</h4>
                          <p className="text-blue-600 font-semibold text-sm">GH₵{p.price}</p>
                          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{p.description}</p>
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
                  <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4"><Plus size={18} /> Add New Product</h4>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input required type="text" value={prodName} onChange={e => setProdName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select value={prodCategory} onChange={e => setProdCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (GH₵)</label>
                        <input required type="number" step="0.01" value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea required rows={2} value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                      <input required type="file" accept="image/*" onChange={e => setProdImage(e.target.files?.[0] || null)} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm bg-white" />
                    </div>
                    <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                      Upload Product
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
