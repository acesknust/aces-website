'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import AddToCartButton from './AddToCartButton';

interface ProductImage {
    id: number;
    image: string;
    color?: string;
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
        category?: { name: string };
        images?: ProductImage[]; // Variant images
    };
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
    // Determine main color name (explicit DB field or fallback)
    const mainImageColor = product.image_color || 'Standard';

    // Determine initial image (main image)
    const [selectedImage, setSelectedImage] = useState(product.image);
    // Initialize selectedColor to the main color so the button is highlighted by default
    const [selectedColor, setSelectedColor] = useState<string | undefined>(mainImageColor);
    const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);

    // Collect all available images including main
    const allImages = [
        { id: -1, image: product.image, color: mainImageColor },
        ...(product.images || [])
    ];

    // Check if product has color variants
    const hasVariants = product.images && product.images.some(img => img.color);

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

    // Helper to resolve image URL
    const getImageUrl = (img?: string) => {
        if (!img) return 'https://via.placeholder.com/600x600?text=No+Image';
        if (img.startsWith('http')) return img;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aces-shop-backend-w8ro7.ondigitalocean.app';
        return `${baseUrl}${img}`;
    };

    return (
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12">
            {/* Image Gallery */}
            <div className="flex flex-col gap-6">
                <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-gray-100/50 border border-gray-100 shadow-sm sm:aspect-[4/5]">
                    <Image
                        src={getImageUrl(selectedImage)}
                        alt={product.name}
                        fill
                        className="object-contain object-center transition-all duration-300 p-8 mix-blend-multiply hover:scale-105"
                        priority
                    />
                    {product.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10">
                            <span className="bg-gray-900 text-white px-6 py-2 rounded-full text-lg font-bold tracking-widest uppercase">Sold Out</span>
                        </div>
                    )}
                </div>

                {/* Thumbnails */}
                {allImages.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x">
                        {allImages.map((img) => (
                            <button
                                key={img.id}
                                onClick={() => handleImageClick(img.image, img.color)}
                                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 snap-start transition-all duration-200 ${selectedImage === img.image
                                    ? 'border-blue-600 ring-2 ring-blue-100 ring-offset-2 scale-105'
                                    : 'border-transparent bg-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                <div className="absolute inset-0 bg-gray-100 mix-blend-multiply">
                                    <Image
                                        src={getImageUrl(img.image)}
                                        alt={img.color || 'Product Image'}
                                        fill
                                        className="object-contain p-2 mix-blend-multiply"
                                    />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                <div className="border-b border-gray-100 pb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-blue-600 mb-1">{product.category?.name}</p>
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">{product.name}</h1>
                        </div>
                        {/* New Price Badge if intended, or just keep layout clean */}
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
                    {hasVariants && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-900">Select Style</h3>
                                {selectedColor && <span className="text-sm text-blue-600 font-medium">{selectedColor}</span>}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {/* Main Image Button */}
                                <button
                                    onClick={() => handleColorSelect(mainImageColor, product.image)}
                                    className={`group relative flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2 overflow-hidden ${selectedColor === mainImageColor
                                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
                                        }`}
                                >
                                    <span className="relative z-10">{mainImageColor}</span>
                                </button>

                                {product.images?.filter(img => img.color).map((variant) => (
                                    <button
                                        key={variant.id}
                                        onClick={() => handleColorSelect(variant.color!, variant.image)}
                                        className={`group relative flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2 overflow-hidden ${selectedColor === variant.color
                                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
                                            }`}
                                    >
                                        <span className="relative z-10">{variant.color}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-900">Select Size</h3>
                            <a href="#" className="text-sm text-blue-600 hover:underline">Size Guide</a>
                        </div>
                        <div className="grid grid-cols-5 gap-3 sm:flex sm:flex-wrap">
                            {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`h-12 w-full sm:w-14 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 border-2 ${selectedSize === size
                                        ? 'border-gray-900 bg-gray-900 text-white shadow-md transform scale-105'
                                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Warning Message */}
                    {(!selectedColor && hasVariants) || !selectedSize ? (
                        <div className="rounded-xl bg-amber-50 p-4 border border-amber-100 flex items-start gap-3 animate-pulse">
                            <div className="p-1 rounded-full bg-amber-100 text-amber-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-sm text-amber-800 font-medium pt-0.5">
                                Please select {hasVariants && !selectedColor ? 'a style' : ''} {hasVariants && !selectedColor && !selectedSize ? 'and' : ''} {!selectedSize ? 'a size' : ''} to continue.
                            </p>
                        </div>
                    ) : null}

                    <div className="prose prose-blue prose-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-6">
                        <div dangerouslySetInnerHTML={{ __html: product.description }} />
                    </div>

                    {/* Add to Cart Section */}
                    <div className="pt-2 sticky bottom-0 bg-white/80 backdrop-blur-md pb-4 sm:static sm:bg-transparent sm:pb-0">
                        <AddToCartButton
                            product={{
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                image: selectedImage
                            }}
                            selectedColor={selectedColor}
                            selectedSize={selectedSize}
                            disabled={(hasVariants && !selectedColor) || !selectedSize}
                        />
                        <p className="mt-3 text-center text-xs text-gray-400">Secure payment via Paystack • 24/7 Support</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
