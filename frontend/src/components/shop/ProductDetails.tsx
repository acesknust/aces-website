'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import AddToCartButton from './AddToCartButton';

interface ProductImage {
    id: number;
    image: string;
    color?: string;
}

interface ProductSize {
    id: number;
    name: string;
    is_available: boolean;
}

interface ProductDetailsProps {
    product: {
        id: number;
        name: string;
        price: string;
        description: string;
        image: string; // Main image
        image_color?: string; // Explicit color for main image
        stock: number;
        is_active: boolean;
        has_sizes?: boolean;
        category?: { name: string };
        images?: ProductImage[]; // Variant images
        sizes?: ProductSize[]; // Custom sizes from admin
    };
}

// ─── Thumbnail Label Helper ───
function getThumbnailLabel(index: number, total: number): string {
    if (total <= 1) return '';
    if (index === 0) return 'Front';
    if (index === 1) return 'Back';
    return `View ${index + 1}`;
}

// ─── Hover Zoom Component (Desktop Only) ───
const HoverZoom: React.FC<{
    src: string;
    alt: string;
    onOpenLightbox: () => void;
}> = ({ src, alt, onOpenLightbox }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [lensPosition, setLensPosition] = useState({ x: 50, y: 50 });

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setLensPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full cursor-zoom-in"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
            onClick={onOpenLightbox}
        >
            <Image
                src={src}
                alt={alt}
                fill
                sizes="50vw"
                className="object-contain object-center p-8 mix-blend-multiply transition-opacity duration-300"
                priority
            />
            {/* Magnified overlay */}
            {isHovering && (
                <div
                    className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-3xl"
                    style={{
                        backgroundImage: `url(${src})`,
                        backgroundSize: '200%',
                        backgroundPosition: `${lensPosition.x}% ${lensPosition.y}%`,
                        backgroundRepeat: 'no-repeat',
                    }}
                />
            )}
            {/* Subtle zoom hint icon */}
            <div className="absolute bottom-4 right-4 z-20 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-sm opacity-60 pointer-events-none">
                <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
            </div>
        </div>
    );
};

// ─── Fullscreen Lightbox Component ───
const Lightbox: React.FC<{
    images: { src: string; label: string }[];
    initialIndex: number;
    onClose: () => void;
}> = ({ images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') setCurrentIndex(i => Math.min(i + 1, images.length - 1));
            if (e.key === 'ArrowLeft') setCurrentIndex(i => Math.max(i - 1, 0));
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKey);
        };
    }, [onClose, images.length]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-white flex items-center justify-center"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-3 text-gray-800 transition-colors shadow-sm"
                aria-label="Close fullscreen view"
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Image counter */}
            {images.length > 1 && (
                <div className="absolute top-4 left-4 z-10 bg-gray-100 rounded-full px-4 py-2 text-gray-800 text-sm font-medium shadow-sm">
                    {currentIndex + 1} / {images.length}
                </div>
            )}

            {/* Main image (pinch-to-zoom via touch-action) */}
            <div
                className="relative w-full h-full max-w-4xl max-h-[85vh] mx-4"
                onClick={(e) => e.stopPropagation()}
                style={{ touchAction: 'pinch-zoom' }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full h-full"
                    >
                        <Image
                            src={images[currentIndex].src}
                            alt={images[currentIndex].label}
                            fill
                            sizes="100vw"
                            className="object-contain"
                            priority
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Label */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-100 backdrop-blur-md rounded-full px-4 py-1.5 text-gray-800 text-sm font-semibold shadow-sm">
                    {images[currentIndex].label}
                </div>
            </div>

            {/* Navigation arrows */}
            {images.length > 1 && (
                <>
                    {currentIndex > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(i => i - 1); }}
                            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 bg-gray-100/80 hover:bg-gray-200/90 rounded-full p-3 text-gray-800 transition-colors shadow-md"
                            aria-label="Previous image"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    {currentIndex < images.length - 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(i => i + 1); }}
                            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 bg-gray-100/80 hover:bg-gray-200/90 rounded-full p-3 text-gray-800 transition-colors shadow-md"
                            aria-label="Next image"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </>
            )}
        </motion.div>
    );
};


// ─── Main ProductDetails Component ───
const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
    // Determine main color name (explicit DB field or fallback)
    const mainImageColor = product.image_color || 'Standard';

    // Determine initial image (main image)
    const [selectedImage, setSelectedImage] = useState(product.image);
    // Initialize selectedColor to the main color
    const [selectedColor, setSelectedColor] = useState<string>(mainImageColor);
    const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Sticky CTA visibility
    const ctaRef = useRef<HTMLDivElement>(null);
    const [showStickyBar, setShowStickyBar] = useState(false);

    // Intersection Observer for sticky CTA
    useEffect(() => {
        const el = ctaRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setShowStickyBar(!entry.isIntersecting),
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Collect all available images including main
    const allImages = [
        { id: -1, image: product.image, color: mainImageColor },
        ...(product.images || [])
    ].filter(img => img.image);

    // Get all unique colors, normalized for casing
    const uniqueColorsMap = new Map<string, { name: string; firstImage: string }>();
    
    // Add main color
    if (product.image) {
        uniqueColorsMap.set(mainImageColor.toLowerCase(), { name: mainImageColor, firstImage: product.image });
    }
    
    // Add variant colors
    (product.images || []).forEach(img => {
        if (img.image && img.color) {
            const normalized = img.color.toLowerCase();
            if (!uniqueColorsMap.has(normalized)) {
                uniqueColorsMap.set(normalized, { name: img.color, firstImage: img.image });
            }
        }
    });

    const uniqueColors = Array.from(uniqueColorsMap.values());
    const hasMultipleStyles = uniqueColors.length > 1;

    // Filter images to only show the ones matching the selected color
    const filteredImages = allImages.filter(img => {
        const imgColor = img.color || mainImageColor;
        return imgColor.toLowerCase() === selectedColor.toLowerCase();
    });

    // Prepare lightbox images
    const lightboxImages = filteredImages.map((img, i) => ({
        src: getImageUrl(img.image),
        label: getThumbnailLabel(i, filteredImages.length),
    }));

    const handleImageClick = (img: string, color?: string) => {
        setSelectedImage(img);
        if (color) {
            setSelectedColor(color);
        }
    };

    const handleColorSelect = (color: string, img: string) => {
        setSelectedColor(color);
        setSelectedImage(img);
    };

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    // Helper to resolve image URL
    function getImageUrl(img?: string): string {
        if (!img) return 'https://via.placeholder.com/600x600?text=No+Image';
        if (img.startsWith('http')) return img;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aces-backend-pgtot.ondigitalocean.app';
        return `${baseUrl}${img}`;
    }

    // Find selected image index in filtered images for lightbox
    const selectedFilteredIndex = Math.max(0, filteredImages.findIndex(img => img.image === selectedImage));

    return (
        <>
            {/* Fullscreen Lightbox */}
            <AnimatePresence>
                {lightboxOpen && (
                    <Lightbox
                        images={lightboxImages}
                        initialIndex={lightboxIndex}
                        onClose={() => setLightboxOpen(false)}
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12"
            >
                {/* ═══ Image Gallery ═══ */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-col gap-4 lg:gap-6"
                >
                    {/* ─── Mobile: Swiper Carousel ─── */}
                    <div className="lg:hidden">
                        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 shadow-sm sm:aspect-[4/5]">
                            {filteredImages.length > 1 ? (
                                <Swiper
                                    modules={[Pagination]}
                                    pagination={{ clickable: true }}
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    className="w-full h-full shop-swiper"
                                >
                                    {filteredImages.map((img, i) => (
                                        <SwiperSlide key={img.id}>
                                            <div
                                                className="relative w-full h-full"
                                                onClick={() => openLightbox(i)}
                                            >
                                                <Image
                                                    src={getImageUrl(img.image)}
                                                    alt={`${product.name} - ${getThumbnailLabel(i, filteredImages.length)}`}
                                                    fill
                                                    sizes="100vw"
                                                    className="object-contain object-center p-6 mix-blend-multiply"
                                                    priority={i === 0}
                                                />
                                                {/* Label overlay (top-left to avoid Swiper pagination dot conflict) */}
                                                <div 
                                                    style={{ backgroundColor: 'rgba(17, 24, 39, 0.85)', color: '#ffffff' }}
                                                    className="absolute top-3 left-3 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full z-20 shadow-sm"
                                                >
                                                    {getThumbnailLabel(i, filteredImages.length)}
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            ) : (
                                <div
                                    className="relative w-full h-full"
                                    onClick={() => openLightbox(0)}
                                >
                                    <Image
                                        src={getImageUrl(selectedImage)}
                                        alt={product.name}
                                        fill
                                        sizes="100vw"
                                        className="object-contain object-center p-6 mix-blend-multiply"
                                        priority
                                    />
                                </div>
                            )}
                            {product.stock === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10">
                                    <span className="bg-gray-900 text-white px-6 py-2 rounded-full text-lg font-bold tracking-widest uppercase">Sold Out</span>
                                </div>
                            )}
                            {/* Tap to zoom hint (mobile) */}
                            <div className="absolute top-3 right-3 z-20 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm opacity-50">
                                <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* ─── Desktop: Static Image + Hover Zoom ─── */}
                    <div className="hidden lg:block">
                        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-gray-100/50 border border-gray-100 shadow-sm sm:aspect-[4/5]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-0"
                                >
                                    <HoverZoom
                                        src={getImageUrl(selectedImage)}
                                        alt={product.name}
                                        onOpenLightbox={() => openLightbox(selectedFilteredIndex)}
                                    />
                                </motion.div>
                            </AnimatePresence>
                            {product.stock === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10">
                                    <span className="bg-gray-900 text-white px-6 py-2 rounded-full text-lg font-bold tracking-widest uppercase">Sold Out</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── Desktop Thumbnails with Labels ─── */}
                    {filteredImages.length > 1 && (
                        <div className="hidden lg:flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x">
                            {filteredImages.map((img, i) => (
                                <button
                                    key={img.id}
                                    onClick={() => handleImageClick(img.image, img.color)}
                                    aria-label={`View ${getThumbnailLabel(i, filteredImages.length)} image`}
                                    className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 snap-start transition-all duration-200 ${selectedImage === img.image
                                        ? 'border-blue-600 ring-2 ring-blue-100 ring-offset-2 scale-105'
                                        : 'border-transparent bg-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-gray-100 mix-blend-multiply">
                                        <Image
                                            src={getImageUrl(img.image)}
                                            alt={`${product.name} ${getThumbnailLabel(i, filteredImages.length)}`}
                                            fill
                                            className="object-contain p-2 mix-blend-multiply"
                                        />
                                    </div>
                                    {/* Label pill */}
                                    <span 
                                        style={{ backgroundColor: 'rgba(17, 24, 39, 0.85)', color: '#ffffff' }}
                                        className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-2 py-0.5 rounded-full z-10 whitespace-nowrap"
                                    >
                                        {getThumbnailLabel(i, filteredImages.length)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* ═══ Product Info ═══ */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-8 px-4 sm:mt-12 sm:px-0 lg:mt-0"
                >
                    <div className="border-b border-gray-100 pb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-blue-600 mb-1">{product.category?.name}</p>
                                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">{product.name}</h1>
                            </div>
                        </div>

                        <div className="mt-6 flex items-end justify-between">
                            <p className="text-4xl font-extrabold tracking-tight text-gray-900">
                                <span className="text-lg text-gray-500 font-medium align-top">GHS</span> {product.price}
                            </p>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${product.is_active && product.stock > 0
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                {product.is_active && product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-8">
                        {/* Variants / Color Selection */}
                        {hasMultipleStyles && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-900">Select Style</h3>
                                    {selectedColor && <span className="text-sm text-blue-600 font-medium">{selectedColor}</span>}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {uniqueColors.map((colorObj) => (
                                        <button
                                            key={colorObj.name}
                                            onClick={() => handleColorSelect(colorObj.name, colorObj.firstImage)}
                                            aria-pressed={selectedColor.toLowerCase() === colorObj.name.toLowerCase()}
                                            className={`group relative flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2 overflow-hidden active:scale-95 ${selectedColor.toLowerCase() === colorObj.name.toLowerCase()
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
                                                }`}
                                        >
                                            <span className="relative z-10">{colorObj.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Selection (conditional) */}
                        {product.has_sizes !== false && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-900">Select Size</h3>
                                    <span className="text-sm text-gray-400">Size Guide</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {/* Use custom sizes if defined, otherwise fallback to defaults */}
                                    {(product.sizes && product.sizes.length > 0
                                        ? product.sizes.filter(s => s.is_available).map(size => size.name)
                                        : ['S', 'M', 'L', 'XL', 'XXL']
                                    ).map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            aria-pressed={selectedSize === size}
                                            className={`h-12 px-5 min-w-[3.5rem] rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 border-2 active:scale-95 ${selectedSize === size
                                                ? 'border-gray-900 bg-gray-900 text-white shadow-md transform scale-105'
                                                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Warning Message */}
                        {((!selectedColor && hasMultipleStyles) || (product.has_sizes !== false && !selectedSize)) ? (
                            <div className="rounded-xl bg-amber-50 p-4 border border-amber-100 flex items-start gap-3 animate-pulse">
                                <div className="p-1 rounded-full bg-amber-100 text-amber-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-amber-800 font-medium pt-0.5">
                                    Please select {hasMultipleStyles && !selectedColor ? 'a style' : ''} {hasMultipleStyles && !selectedColor && (product.has_sizes !== false && !selectedSize) ? 'and' : ''} {(product.has_sizes !== false && !selectedSize) ? 'a size' : ''} to continue.
                                </p>
                            </div>
                        ) : null}

                        <div className="prose prose-blue prose-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-6">
                            <div dangerouslySetInnerHTML={{ __html: product.description }} />
                        </div>

                        {/* Add to Cart Section — ref'd for Intersection Observer */}
                        <div ref={ctaRef} className="pt-2">
                            <AddToCartButton
                                product={{
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: selectedImage
                                }}
                                selectedColor={selectedColor}
                                selectedSize={selectedSize}
                                isOutOfStock={!product.is_active || product.stock <= 0}
                                disabled={!product.is_active || product.stock <= 0 || (hasMultipleStyles && !selectedColor) || (product.has_sizes !== false && !selectedSize)}
                            />
                            <p className="mt-3 text-center text-xs text-gray-400">Secure payment via Paystack • 24/7 Support</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* ═══ Mobile Sticky CTA Bar ═══ */}
            <AnimatePresence>
                {showStickyBar && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
                    >
                        <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 safe-area-bottom">
                            <div className="flex items-center gap-4 max-w-lg mx-auto">
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-extrabold text-gray-900">
                                        <span className="text-xs text-gray-500 font-medium">GHS</span> {product.price}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {selectedColor}{selectedSize ? ` · ${selectedSize}` : ''}
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <AddToCartButton
                                        product={{
                                            id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            image: selectedImage
                                        }}
                                        selectedColor={selectedColor}
                                        selectedSize={selectedSize}
                                        isOutOfStock={!product.is_active || product.stock <= 0}
                                        disabled={!product.is_active || product.stock <= 0 || (hasMultipleStyles && !selectedColor) || (product.has_sizes !== false && !selectedSize)}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ProductDetails;
