import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    image: string;
    category: {
        name: string;
        slug: string;
    };
}

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    // Helper to resolve image URL
    const getImageUrl = (img?: string) => {
        if (!img) return 'https://via.placeholder.com/400x400?text=No+Image';
        if (img.startsWith('http')) return img;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aces-shop-backend-w8ro7.ondigitalocean.app';
        return `${baseUrl}${img}`;
    };

    return (
        <Link href={`/shop/${product.slug}`} className="group block overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ring-1 ring-gray-100 hover:ring-gray-200">
            <div className="relative h-80 w-full overflow-hidden bg-gray-100/50">
                <Image
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    fill
                    className="object-contain transition duration-500 group-hover:scale-110 p-6 mix-blend-multiply"
                />
                <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        New Arrival
                    </span>
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{product.category?.name}</p>
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {product.name}
                </h3>
                <div className="mt-4 flex items-end justify-between">
                    <p className="text-2xl font-bold text-gray-900">
                        <span className="text-sm text-gray-500 font-normal align-top">GHS</span> {product.price}
                    </p>
                    <div className="rounded-full bg-blue-50 p-2 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
