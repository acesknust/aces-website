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
    return (
        <Link href={`/shop/${product.slug}`} className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ring-1 ring-gray-100">
            <div className="relative h-72 w-full overflow-hidden bg-gray-50">
                <Image
                    src={product.image || 'https://via.placeholder.com/400x400?text=No+Image'}
                    alt={product.name}
                    fill
                    className="object-contain transition duration-500 group-hover:scale-110 p-4"
                />
                {/* Optional: Add 'New' or 'Sale' badge here if data available */}
            </div>

            <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{product.category?.name}</p>
                <h3 className="mt-2 text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {product.name}
                </h3>
                <p className="mt-2 text-lg font-bold text-blue-600">
                    GHS {product.price}
                </p>

                <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:underline">
                    View Details
                    <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
