'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import {
  Search, Store, ShoppingBag, ChevronRight, ChevronLeft,
  SlidersHorizontal, X, Tag, AlertCircle, ZoomIn, MessageCircle,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface ProductImage { id: number; image: string; }

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  business_name: string;
  business_slug: string;
  is_available: boolean;
  additional_images?: ProductImage[];
}

// ─── Image Carousel ─────────────────────────────────────────────────────────
const ImageCarousel = ({ images, alt }: { images: string[]; alt: string }) => {
  const [idx, setIdx] = useState(0);
  const validImages = images.filter(Boolean);
  if (!validImages.length) {
    return (
      <div className="relative h-52 bg-blue-50 flex items-center justify-center shrink-0">
        <Store className="text-blue-200" size={48} />
      </div>
    );
  }

  const prev = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIdx(i => (i === 0 ? validImages.length - 1 : i - 1)); };
  const next = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIdx(i => (i === validImages.length - 1 ? 0 : i + 1)); };

  return (
    <div className="relative h-52 bg-gray-100 overflow-hidden group/img shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={validImages[idx]} alt={alt} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
      {validImages.length > 1 && (
        <>
          <button onClick={prev} aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-blue-600 p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-all z-10 shadow-sm">
            <ChevronLeft size={14} />
          </button>
          <button onClick={next} aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-blue-600 p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-all z-10 shadow-sm">
            <ChevronRight size={14} />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
            {validImages.map((_, i) => (
              <button key={i} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx(i); }}
                className={`rounded-full transition-all ${i === idx ? 'w-4 h-1.5 bg-blue-600' : 'w-1.5 h-1.5 bg-white/80 hover:bg-blue-300'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Skeleton Card ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-9 bg-gray-200 rounded-xl mt-2" />
      </div>
    </div>
  );
}

// ─── Category config ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'All', emoji: '🏪' },
  { label: 'Food & Beverages', emoji: '🍔' },
  { label: 'Fashion & Apparel', emoji: '👗' },
  { label: 'Technology & Electronics', emoji: '💻' },
  { label: 'Services', emoji: '🛠️' },
  { label: 'Beauty & Cosmetics', emoji: '💄' },
  { label: 'Other', emoji: '📦' },
];

// ─── Product Card ────────────────────────────────────────────────────────────
function ProductCard({ product, onView }: { product: Product; onView: (p: Product) => void }) {
  const allImages = [product.image, ...(product.additional_images?.map(i => i.image) || [])];
  const catEmoji = CATEGORIES.find(c => product.category.includes(c.label.split(' ')[0]))?.emoji || '📦';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col group cursor-pointer"
      onClick={() => onView(product)}
    >
      <div className="relative">
        <ImageCarousel images={allImages} alt={product.name} />
        {/* Category badge */}
        <div className="absolute top-2 left-2 z-10 bg-white/95 px-2 py-0.5 rounded-full text-xs font-semibold text-blue-700 shadow-sm border border-blue-100 flex items-center gap-1">
          <span>{catEmoji}</span>
          <span className="hidden sm:inline">{product.category.split(' ')[0]}</span>
        </div>
        {!product.is_available && (
          <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="px-3 py-1.5 bg-white text-blue-900 font-bold rounded-lg text-sm transform -rotate-6 shadow-lg border border-blue-100">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 flex-grow">{product.name}</h3>
          <span className="text-blue-600 font-extrabold whitespace-nowrap text-sm bg-blue-50 px-2 py-0.5 rounded-lg shrink-0 border border-blue-100">
            GH₵{Number(product.price).toLocaleString()}
          </span>
        </div>

        {product.description && (
          <p className="text-gray-500 text-sm line-clamp-2 flex-grow mb-3">{product.description}</p>
        )}

        <div className="mt-auto pt-3 border-t border-blue-50">
          <Link href={`/marketplace/${product.business_slug}`}
            className="flex items-center justify-between group/link">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <Store size={14} className="text-blue-400 shrink-0" />
              <span className="text-xs font-semibold text-gray-600 truncate group-hover/link:text-blue-600 transition-colors">
                {product.business_name}
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold shrink-0 group-hover/link:gap-2 transition-all">
              View Store <ChevronRight size={14} />
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Product Detail Modal ─────────────────────────────────────────────────────
function ProductDetailModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const allImages = [product.image, ...(product.additional_images?.map(i => i.image) || [])].filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (lightboxSrc) setLightboxSrc(null); else onClose(); } };
    document.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handler); };
  }, [onClose, lightboxSrc]);

  const prev = () => setIdx(i => (i === 0 ? allImages.length - 1 : i - 1));
  const next = () => setIdx(i => (i === allImages.length - 1 ? 0 : i + 1));

  return (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
        >
          <button onClick={onClose} aria-label="Close"
            className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-gray-100 rounded-full p-2 shadow-sm border border-gray-200 transition-colors">
            <X size={20} className="text-gray-600" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image gallery with thumbnails */}
            <div className="p-5 md:p-6">
              <div className="flex flex-col gap-3">
                <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden group/gallery cursor-zoom-in border border-blue-50"
                  onClick={() => setLightboxSrc(allImages[idx])}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={allImages[idx]} alt={product.name} className="w-full h-full object-contain bg-white" />
                  <div className="absolute inset-0 bg-blue-600/0 group-hover/gallery:bg-blue-600/5 transition-colors flex items-center justify-center">
                    <ZoomIn className="text-blue-600 opacity-0 group-hover/gallery:opacity-100 transition-opacity drop-shadow-lg" size={32} />
                  </div>
                  {allImages.length > 1 && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white hover:bg-blue-50 text-blue-600 p-2 rounded-full opacity-0 group-hover/gallery:opacity-100 transition-all z-10 shadow-sm border border-blue-100">
                        <ChevronLeft size={18} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white hover:bg-blue-50 text-blue-600 p-2 rounded-full opacity-0 group-hover/gallery:opacity-100 transition-all z-10 shadow-sm border border-blue-100">
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {allImages.map((src, i) => (
                      <button key={i} onClick={() => setIdx(i)}
                        className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === idx ? 'border-blue-500 shadow-md' : 'border-blue-100 opacity-60 hover:opacity-100'}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product info */}
            <div className="p-5 md:p-6 md:pl-0 flex flex-col">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full self-start border border-blue-100 mb-3">{product.category}</span>
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2">{product.name}</h2>
              <p className="text-2xl font-extrabold text-blue-600 mb-4">GH₵{Number(product.price).toLocaleString()}</p>
              {product.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">{product.description}</p>
              )}
              <div className="flex flex-col gap-3 mt-auto">
                <Link href={`/marketplace/${product.business_slug}`}
                  className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  <Store size={16} /> Visit {product.business_name}
                </Link>
              </div>
              {allImages.length > 1 && (
                <p className="text-xs text-gray-400 mt-3 text-center">{allImages.length} photos · Click image to zoom</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Zoom Lightbox */}
      {lightboxSrc && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxSrc(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxSrc} alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()} />
          <button onClick={() => setLightboxSrc(null)} aria-label="Close"
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-colors backdrop-blur-sm">
            <X size={22} />
          </button>
        </div>
      )}
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Debounce search input
  useEffect(() => {
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setFetchError(false);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const params = new URLSearchParams();
        if (activeCategory !== 'All') params.set('category', activeCategory);
        if (debouncedSearch) params.set('search', debouncedSearch);
        const response = await fetch(`${apiUrl}/api/student-businesses/products/global/?${params}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setProducts(data);
      } catch {
        setFetchError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, debouncedSearch]);

  const productCount = products.length;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="bg-white border-b border-blue-50 pt-28 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 font-semibold text-sm mb-4 border border-blue-100">
                <ShoppingBag size={15} /> Student Marketplace
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-3">
                ACES <span className="text-blue-600">Marketplace</span>
              </h1>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                Discover products &amp; services from fellow KNUST engineering students.
              </p>
            </motion.div>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative flex items-center">
                <Search className="absolute left-4 text-gray-400 pointer-events-none" size={20} />
                <input
                  type="search"
                  placeholder="Search products, stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400 text-base"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 text-gray-400 hover:text-gray-700">
                    <X size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Category filter — desktop horizontal scroll */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mb-6"
          >
            {/* Mobile: compact pill row */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:flex-wrap md:overflow-visible md:mx-0 md:px-0">
              {CATEGORIES.map(({ label, emoji }) => (
                <button
                  key={label}
                  onClick={() => setActiveCategory(label)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border shrink-0 ${
                    activeCategory === label
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  <span>{emoji}</span> {label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Count + Sort row */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">
              {isLoading ? 'Loading…' : `${productCount} product${productCount !== 1 ? 's' : ''} found`}
            </p>
            {activeCategory !== 'All' && (
              <button onClick={() => setActiveCategory('All')}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-100 bg-blue-50 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors">
                <Tag size={12} /> {activeCategory} <X size={12} />
              </button>
            )}
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : fetchError ? (
            <div className="text-center py-24">
              <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Could not load products</h3>
              <p className="text-gray-500 mb-6">Please check your connection and try again.</p>
              <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                Try again
              </button>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {products.map((prod) => <ProductCard key={prod.id} product={prod} onView={setModalProduct} />)}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <SlidersHorizontal className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or category filter.</p>
              <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {modalProduct && (
        <ProductDetailModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}

      <Footer />
    </>
  );
}
