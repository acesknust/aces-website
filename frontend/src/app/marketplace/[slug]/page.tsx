'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Store, Instagram, MessageCircle, ArrowLeft, PackageSearch } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  is_available: boolean;
}

interface Business {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  banner: string | null;
  payment_method: string;
  whatsapp_number: string;
  instagram_handle: string | null;
  owner_name: string;
  products: Product[];
}

export default function BusinessStorefront() {
  const params = useParams();
  const slug = params.slug as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/student-businesses/${slug}/`);
        if (response.ok) {
          const data = await response.json();
          setBusiness(data);
        }
      } catch (error) {
        console.error('Failed to fetch business:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchBusiness();
    }
  }, [slug]);

  const handleWhatsAppBuy = (product: Product) => {
    if (!business?.whatsapp_number) return;
    
    // Format number: remove + and leading 0 if needed
    let phone = business.whatsapp_number.replace(/\+/g, '');
    if (phone.startsWith('0')) {
      phone = '233' + phone.substring(1); // Default to GH format if starts with 0
    }

    const message = encodeURIComponent(
      `Hi ${business.owner_name}, I saw your product *${product.name}* (GH₵${product.price}) on the ACES Website Marketplace. Is it still available?`
    );
    
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Store Not Found</h1>
        <Link href="/marketplace" className="text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-28 pb-20">
        
        {/* Business Header Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 font-medium text-sm">
            <ArrowLeft size={16} /> Back to Marketplace
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden"
          >
            {/* Background Banner */}
            {business.banner ? (
              <div 
                className="absolute inset-0 z-0 opacity-20 object-cover w-full h-full"
                style={{ backgroundImage: `url(${business.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              ></div>
            ) : (
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-teal-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60 z-0"></div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/80 z-0"></div>

            <div 
              className="w-48 h-48 md:w-64 md:h-64 rounded-3xl bg-white border-4 border-white overflow-hidden flex items-center justify-center shrink-0 shadow-lg z-10 cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => business.logo && setIsImageModalOpen(true)}
            >
              {business.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={business.logo} alt={business.name} className="w-full h-full object-contain bg-gray-50" />
              ) : (
                <Store className="text-gray-300" size={80} />
              )}
            </div>
            
            <div className="flex-grow z-10">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{business.name}</h1>
              </div>
              
              <p className="text-gray-600 mb-4 max-w-2xl text-lg leading-relaxed">
                {business.description}
              </p>

              {business.payment_method && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl inline-block">
                  <p className="text-sm font-semibold text-blue-900">Payment Methods</p>
                  <p className="text-sm text-blue-800">{business.payment_method}</p>
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-4">
                <a 
                  href={`https://wa.me/${business.whatsapp_number.replace(/\+/g, '')}`} 
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
                >
                  <MessageCircle size={18} /> Chat with {business.owner_name}
                </a>
                
                {business.instagram_handle && (
                  <a 
                    href={`https://instagram.com/${business.instagram_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-semibold transition-colors"
                  >
                    <Instagram size={18} className="text-pink-600" /> Instagram
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Our Products</h2>
            <div className="h-px bg-gray-200 flex-grow ml-4"></div>
          </div>

          {business.products && business.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {business.products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  <div className="relative h-60 bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    {!product.is_available && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="px-4 py-2 bg-gray-900 text-white font-bold rounded-lg transform -rotate-12">OUT OF STOCK</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">{product.name}</h3>
                      <span className="text-blue-600 font-extrabold whitespace-nowrap bg-blue-50 px-2 py-1 rounded-md text-sm">
                        GH₵{product.price}
                      </span>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow">
                      {product.description}
                    </p>
                    
                    <button
                      onClick={() => handleWhatsAppBuy(product)}
                      disabled={!product.is_available}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-auto ${
                        product.is_available 
                          ? 'bg-gray-900 text-white hover:bg-[#25D366] hover:shadow-md' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <MessageCircle size={18} /> 
                      {product.is_available ? 'Buy via WhatsApp' : 'Unavailable'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <PackageSearch className="text-gray-300" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500">This business hasn&apos;t listed any products yet. Check back later!</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Image Modal Overlay */}
      {isImageModalOpen && business?.logo && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={business.logo} 
              alt={business.name} 
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
            <button 
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
