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
        <Link href={`/shop/${product.slug}`} className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-lg">
            <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                <Image
                    src={product.image || 'https://via.placeholder.com/400x400?text=No+Image'}
                    alt={product.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                />
            </div>

            <div className="p-4">
                <p className="text-xs text-gray-500">{product.category?.name}</p>
                <h3 className="mt-1 text-lg font-medium text-gray-900 group-hover:text-blue-600">
                    {product.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                    GHS {product.price}
                </p>

                <button className="mt-4 w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                    View Details
                </button>
            </div>
        </Link>
    );
};

export default ProductCard;
