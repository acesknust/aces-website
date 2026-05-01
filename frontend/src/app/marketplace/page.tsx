'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Search, Store, Instagram, ChevronRight, Filter } from 'lucide-react';

interface Business {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  logo: string | null;
  whatsapp_number: string;
  instagram_handle: string | null;
  owner_name: string;
}

const CATEGORIES = [
  'All',
  'Food & Beverages',
  'Fashion & Apparel',
  'Technology & Electronics',
  'Services (Design, Tutoring, etc)',
  'Beauty & Cosmetics',
  'Other'
];

export default function MarketplacePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/student-businesses/`);
        if (response.ok) {
          const data = await response.json();
          setBusinesses(data);
        }
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const filteredBusinesses = businesses.filter((bus) => {
    const matchesSearch = bus.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          bus.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || bus.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-28 pb-20">
        
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-2"
            >
              <Store size={16} />
              <span>Student Enterprise Hub</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight"
            >
              ACES <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Marketplace</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600"
            >
              Discover and support amazing businesses built by Computer Engineering students.
            </motion.p>
          </div>

          {/* Search & Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 max-w-4xl mx-auto"
          >
            <div className="relative flex items-center mb-6">
              <Search className="absolute left-4 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for businesses or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 justify-center">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cat.split(' ')[0]}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Business Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white h-72 rounded-3xl animate-pulse border border-gray-100 shadow-sm" />
              ))}
            </div>
          ) : filteredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {filteredBusinesses.map((bus, idx) => (
                  <motion.div
                    key={bus.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 group flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                        {bus.logo ? (
                          <Image src={bus.logo} alt={bus.name} width={64} height={64} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="text-gray-400" size={28} />
                        )}
                      </div>
                      <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100">
                        {bus.category.split(' ')[0]}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {bus.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow">
                      {bus.description}
                    </p>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-auto">
                      <Link 
                        href={`/marketplace/${bus.slug}`}
                        className="flex-1 bg-gray-900 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        Visit Store <ChevronRight size={16} />
                      </Link>
                      {bus.instagram_handle && (
                        <a 
                          href={`https://instagram.com/${bus.instagram_handle.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-100 transition-colors shrink-0"
                        >
                          <Instagram size={20} />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No businesses found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We couldn't find any businesses matching your search criteria. Try selecting a different category.
              </p>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
