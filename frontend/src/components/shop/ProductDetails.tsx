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
        stock: number;
        is_active: boolean;
        category?: { name: string };
        images?: ProductImage[]; // Variant images
    };
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
    // Determine initial image (main image)
    const [selectedImage, setSelectedImage] = useState(product.image);
    const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);

    // Collect all available images including main
    const allImages = [
        { id: -1, image: product.image, color: 'Main' },
        ...(product.images || [])
    ];

    // Check if product has color variants
    const hasVariants = product.images && product.images.some(img => img.color);

    const handleImageClick = (img: string, color?: string) => {
        setSelectedImage(img);
        if (color && color !== 'Main') {
            setSelectedColor(color);
        } else {
            // If clicking main image, clear color unless main implies a color? 
            // Ideally main image = default color. For now, let's keep it flexible.
            // If user explicitly clicks a variant, select that color.
        }
    };

    const handleColorSelect = (color: string, img: string) => {
        setSelectedColor(color);
        setSelectedImage(img);
    };

    return (
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
            {/* Image Gallery */}
            <div className="flex flex-col gap-4">
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 shadow-sm sm:aspect-[2/3]">
                    <Image
                        src={selectedImage || 'https://via.placeholder.com/600x600?text=No+Image'}
                        alt={product.name}
                        fill
                        className="object-contain object-center transition-all duration-300 p-4"
                        priority
                    />
                </div>

                {/* Thumbnails */}
                {allImages.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide snap-x">
                        {allImages.map((img) => (
                            <button
                                key={img.id}
                                onClick={() => handleImageClick(img.image, img.color)}
                                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 snap-start transition-all duration-200 ${selectedImage === img.image
                                    ? 'border-blue-600 ring-2 ring-blue-100 ring-offset-1'
                                    : 'border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                <div className="absolute inset-0 bg-gray-50">
                                    <Image
                                        src={img.image}
                                        alt={img.color || 'Product Image'}
                                        fill
                                        className="object-contain p-1"
                                    />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="mt-8 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                <div className="border-b border-gray-200 pb-6">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{product.name}</h1>
                    <div className="mt-4 flex items-end justify-between">
                        <p className="text-3xl font-bold tracking-tight text-blue-600">GHS {product.price}</p>
                        <div className="flex items-center">
                            <div className={`h-2.5 w-2.5 rounded-full ${product.is_active && product.stock > 0 ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                            <span className="text-sm font-medium text-gray-500">
                                {product.is_active && product.stock > 0 ? 'In Stock' : (product.stock === 0 ? 'Sold Out' : 'Unavailable')}
                            </span>
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Category: <span className="font-medium text-gray-900">{product.category?.name}</span></p>
                </div>

                {/* Variants / Color Selection */}
                {hasVariants && (
                    <div className="mt-8">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Select Option</h3>
                        <div className="flex flex-wrap gap-3">
                            {product.images?.filter(img => img.color).map((variant) => (
                                <button
                                    key={variant.id}
                                    onClick={() => handleColorSelect(variant.color!, variant.image)}
                                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm ${selectedColor === variant.color
                                        ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {variant.color}
                                </button>
                            ))}
                        </div>
                        {!selectedColor && (
                            <p className="mt-3 text-sm text-amber-600 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Please select an option above
                            </p>
                        )}
                    </div>
                )}

                <div className="mt-8">
                    <h3 className="sr-only">Description</h3>
                    <div className="prose prose-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>

                {/* Add to Cart Section - Sticky styling could be added if requested, keeping it standard for now */}
                <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col gap-4">
                    <AddToCartButton
                        product={{
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: selectedImage // Add variant image to cart instead of main image if selected
                        }}
                        selectedColor={selectedColor}
                        disabled={hasVariants && !selectedColor}
                    />
                    {hasVariants && !selectedColor && (
                        <p className="text-center text-xs text-gray-400">Select an option to enable checkout</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
