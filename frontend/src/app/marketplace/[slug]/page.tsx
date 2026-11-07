'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import {
  Store, Instagram, MessageCircle, ArrowLeft, PackageSearch,
  ChevronLeft, ChevronRight, Phone, MapPin, X, ZoomIn, Ghost, Users,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ProductImage { id: number; image: string; }

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  is_available: boolean;
  category: string;
  additional_images?: ProductImage[];
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
  whatsapp_group_link: string | null;
  instagram_handle: string | null;
  snapchat_handle: string | null;
  owner_name: string;
  products: Product[];
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()} />
      <button onClick={onClose} aria-label="Close"
        className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-colors backdrop-blur-sm">
        <X size={22} />
      </button>
    </div>
  );
}

// ─── Product Image Gallery ────────────────────────────────────────────────────
const ImageSlider = ({ images, name }: { images: string[]; name: string }) => {
  const [idx, setIdx] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const validImages = images.filter(Boolean);

  if (!validImages.length) {
    return (
      <div className="relative aspect-square bg-blue-50 rounded-2xl flex items-center justify-center">
        <Store className="text-blue-200" size={64} />
      </div>
    );
  }

  const prev = () => setIdx(i => (i === 0 ? validImages.length - 1 : i - 1));
  const next = () => setIdx(i => (i === validImages.length - 1 ? 0 : i + 1));

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden group/gallery cursor-zoom-in border border-blue-50"
          onClick={() => setLightboxSrc(validImages[idx])}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={validImages[idx]} alt={name} className="w-full h-full object-contain bg-white" />
          <div className="absolute inset-0 bg-blue-600/0 group-hover/gallery:bg-blue-600/5 transition-colors flex items-center justify-center">
            <ZoomIn className="text-blue-600 opacity-0 group-hover/gallery:opacity-100 transition-opacity drop-shadow-lg" size={32} />
          </div>
          {validImages.length > 1 && (
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

        {validImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {validImages.map((src, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === idx ? 'border-blue-500 shadow-md' : 'border-blue-100 opacity-60 hover:opacity-100'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxSrc && <Lightbox src={lightboxSrc} alt={name} onClose={() => setLightboxSrc(null)} />}
    </>
  );
}

// ─── Product Detail Modal ─────────────────────────────────────────────────────
function ProductDetailModal({ product, onClose, onBuy }: { product: Product; onClose: () => void; onBuy: (p: Product) => void }) {
  const allImages = [product.image, ...(product.additional_images?.map(i => i.image) || [])].filter(Boolean);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handler); };
  }, [onClose]);

  return (
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
          {/* Image gallery */}
          <div className="p-5 md:p-6">
            <ImageSlider images={allImages} name={product.name} />
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
              <button
                onClick={() => onBuy(product)}
                disabled={!product.is_available}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all ${
                  product.is_available
                    ? 'bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <MessageCircle size={16} />
                {product.is_available ? 'Buy via WhatsApp' : 'Currently Unavailable'}
              </button>
            </div>
            {allImages.length > 1 && (
              <p className="text-xs text-gray-400 mt-3 text-center">{allImages.length} photos · Click image to zoom</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Product Card (Storefront) ────────────────────────────────────────────────
function StorefrontProductCard({ product, onBuy, onView }: { product: Product; onBuy: (p: Product) => void; onView: (p: Product) => void }) {
  const allImages = [product.image, ...(product.additional_images?.map(i => i.image) || [])].filter(Boolean);
  const [imgIdx, setImgIdx] = useState(0);

  const prevImg = (e: React.MouseEvent) => { e.stopPropagation(); setImgIdx(i => (i === 0 ? allImages.length - 1 : i - 1)); };
  const nextImg = (e: React.MouseEvent) => { e.stopPropagation(); setImgIdx(i => (i === allImages.length - 1 ? 0 : i + 1)); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-50 hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer"
      onClick={() => onView(product)}
    >
      {/* Image carousel */}
      <div className="relative h-52 bg-gray-50 overflow-hidden group/img border-b border-blue-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={allImages[imgIdx] || ''} alt={product.name} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
        {!product.is_available && (
          <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="px-3 py-1.5 bg-white text-blue-900 font-bold rounded-lg text-xs transform -rotate-6 shadow-lg border border-blue-100">Out of Stock</span>
          </div>
        )}
        {allImages.length > 1 && (
          <>
            <button onClick={prevImg} aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-blue-600 p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-all z-20 shadow-sm">
              <ChevronLeft size={14} />
            </button>
            <button onClick={nextImg} aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-blue-600 p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition-all z-20 shadow-sm">
              <ChevronRight size={14} />
            </button>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
              {allImages.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                  className={`rounded-full transition-all ${i === imgIdx ? 'w-4 h-1.5 bg-blue-600' : 'w-1.5 h-1.5 bg-white/80 hover:bg-blue-300'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 flex-grow">{product.name}</h3>
          <span className="text-blue-600 font-extrabold text-sm bg-blue-50 px-2 py-0.5 rounded-lg shrink-0 whitespace-nowrap border border-blue-100">
            GH₵{Number(product.price).toLocaleString()}
          </span>
        </div>
        {product.description && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">{product.description}</p>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onBuy(product); }}
          disabled={!product.is_available}
          className={`mt-auto w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all ${
            product.is_available
              ? 'bg-blue-600 text-white hover:bg-[#25D366] hover:shadow-md'
              : 'bg-blue-50 text-blue-300 cursor-not-allowed border border-blue-100'
          }`}
        >
          <MessageCircle size={16} />
          {product.is_available ? 'Buy via WhatsApp' : 'Unavailable'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Storefront Skeleton ─────────────────────────────────────────────────────
function StorefrontSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-5 w-32 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 mb-10 animate-pulse">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-40 h-40 bg-gray-200 rounded-3xl shrink-0" />
            <div className="space-y-3 flex-grow">
              <div className="h-8 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="flex gap-3 pt-2">
                <div className="h-10 w-36 bg-gray-200 rounded-xl" />
                <div className="h-10 w-28 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
              <div className="h-52 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-9 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Storefront Page ─────────────────────────────────────────────────────
export default function BusinessStorefront() {
  const params = useParams();
  const slug = params.slug as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchBusiness = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/student-businesses/${slug}/`);
        if (response.status === 404) { setNotFound(true); return; }
        if (response.ok) setBusiness(await response.json());
        else setNotFound(true);
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBusiness();
  }, [slug]);

  const formatPhone = (raw: string) => {
    let phone = raw.replace(/\D/g, ''); // strip all non-digits
    if (phone.startsWith('0')) phone = '233' + phone.substring(1);
    return phone;
  };

  const handleWhatsAppBuy = (product: Product) => {
    if (!business?.whatsapp_number) return;
    const phone = formatPhone(business.whatsapp_number);
    const msg = encodeURIComponent(
      `Hi! I saw *${product.name}* (GH₵${product.price}) on the ACES Marketplace. Is it available?`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const handleWhatsAppGeneral = () => {
    if (!business?.whatsapp_number) return;
    const phone = formatPhone(business.whatsapp_number);
    const msg = encodeURIComponent(`Hi ${business.owner_name}! I found your store on the ACES Marketplace.`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  // Product lightbox images
  const selectedImages = selectedProduct
    ? [selectedProduct.image, ...(selectedProduct.additional_images?.map(i => i.image) || [])]
    : [];

  if (isLoading) return <><Header /><StorefrontSkeleton /><Footer /></>;

  if (notFound) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4 pt-28">
          <PackageSearch className="text-gray-300" size={64} />
          <h1 className="text-2xl font-bold text-gray-900">Store Not Found</h1>
          <p className="text-gray-500">This business might have been removed or the link is incorrect.</p>
          <Link href="/marketplace" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
            <ArrowLeft size={16} /> Back to Marketplace
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  if (!business) return null;

  const availableProducts = business.products.filter(p => p.is_available);
  const unavailableProducts = business.products.filter(p => !p.is_available);
  const allProducts = [...availableProducts, ...unavailableProducts];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-20">

        {/* Business Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <Link href="/marketplace"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 font-medium text-sm">
            <ArrowLeft size={16} /> Back to Marketplace
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Banner */}
            <div className="h-32 md:h-48 relative">
              {business.banner ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={business.banner} alt="Store banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent" />
            </div>

            {/* Business Info */}
            <div className="px-6 md:px-10 pb-8">
              {/* Logo overlapping banner */}
              <div className="flex items-end gap-6 -mt-16 mb-5 relative z-10">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-white shadow-xl bg-white overflow-hidden shrink-0">
                  {business.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={business.logo} alt={business.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Store className="text-gray-400" size={48} />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div className="flex-grow">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">{business.name}</h1>
                  <p className="text-gray-600 text-base leading-relaxed max-w-2xl">{business.description}</p>
                  {business.payment_method && (
                    <div className="mt-4 inline-flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
                      <Phone size={15} className="text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-blue-900 mb-0.5">Payment Method</p>
                        <p className="text-sm text-blue-800">{business.payment_method}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                  <button onClick={handleWhatsAppGeneral}
                    className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm text-sm">
                    <MessageCircle size={18} /> Chat with Vendor
                  </button>
                  {business.whatsapp_group_link && (
                    <a
                      href={business.whatsapp_group_link}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-6 py-3 rounded-xl font-bold transition-colors text-sm">
                      <Users size={16} className="text-[#25D366]" /> Join WhatsApp Group
                    </a>
                  )}
                  {business.instagram_handle && (
                    <a
                      href={`https://instagram.com/${business.instagram_handle.replace('@', '')}`}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-6 py-3 rounded-xl font-bold transition-colors text-sm">
                      <Instagram size={16} className="text-pink-600" />
                      {business.instagram_handle.replace('@', '')}
                    </a>
                  )}
                  {business.snapchat_handle && (
                    <a
                      href={`https://snapchat.com/add/${business.snapchat_handle.replace('@', '')}`}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-[#FFFC00] text-gray-900 border border-yellow-300 hover:bg-[#e6e200] px-6 py-3 rounded-xl font-bold transition-colors text-sm">
                      <Ghost size={16} className="text-gray-900" />
                      {business.snapchat_handle.replace('@', '')}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-7">
            <h2 className="text-xl font-extrabold text-gray-900">
              Products
              <span className="ml-2 text-sm font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                {business.products.length}
              </span>
            </h2>
            <div className="h-px bg-blue-100 flex-grow" />
          </div>

          {allProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {allProducts.map((product) => (
                <StorefrontProductCard
                  key={product.id}
                  product={product}
                  onBuy={handleWhatsAppBuy}
                  onView={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <PackageSearch className="mx-auto text-gray-300 mb-4" size={56} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500">This store hasn&apos;t listed any products yet. Check back soon!</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuy={handleWhatsAppBuy}
        />
      )}

      <Footer />
    </>
  );
}
