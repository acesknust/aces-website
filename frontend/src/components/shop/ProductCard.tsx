import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    image: string;
    stock?: number;
    category: {
        name: string;
        slug: string;
    };
}

interface ProductCardProps {
    product: Product;
}

const LOW_STOCK_THRESHOLD = 5;

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const getImageUrl = (img?: string) => {
        if (!img) return null;
        if (img.startsWith('http')) return img;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ||
            (process.env.NODE_ENV === 'development'
                ? 'http://127.0.0.1:8000'
                : 'https://aces-backend-pgtot.ondigitalocean.app');
        return `${baseUrl}${img}`;
    };

    const imageUrl = getImageUrl(product.image);
    const stock = product.stock;
    const isSoldOut = typeof stock === 'number' && stock <= 0;
    const isLowStock = typeof stock === 'number' && stock > 0 && stock <= LOW_STOCK_THRESHOLD;
    const numericPrice = Number(product.price);
    const price = Number.isFinite(numericPrice) ? numericPrice.toFixed(2) : product.price;

    return (
        <Link
            href={`/shop/${product.slug}`}
            className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-gray-200/80 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_-18px_rgba(17,24,39,0.25)] hover:ring-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:scale-[0.99]"
        >
            {/* Media */}
            <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-slate-50 via-gray-50 to-gray-100 sm:aspect-[4/5]">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, (max-width: 1280px) 30vw, 22vw"
                        className={`object-contain object-center p-3 transition-transform duration-700 ease-out group-hover:scale-105 sm:p-4 ${isSoldOut ? 'opacity-60 grayscale' : 'mix-blend-multiply'}`}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <svg className="h-14 w-14 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0l-2.25-3.375A2.25 2.25 0 0016.125 3h-8.25a2.25 2.25 0 00-1.875 1.125L3.75 7.5m16.5 0h-16.5" />
                        </svg>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
                    {product.category?.name ? (
                        <span className="rounded-full bg-white/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-600 shadow-sm ring-1 ring-black/5 backdrop-blur">
                            {product.category.name}
                        </span>
                    ) : (
                        <span />
                    )}
                    {isSoldOut ? (
                        <span className="rounded-full bg-gray-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                            Sold out
                        </span>
                    ) : isLowStock ? (
                        <span className="rounded-full bg-amber-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                            Only {stock} left
                        </span>
                    ) : null}
                </div>

                {/* Hover cue */}
                <div className="pointer-events-none absolute inset-x-4 bottom-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="flex items-center justify-center gap-2 rounded-full bg-gray-900/90 px-4 py-2.5 text-xs font-semibold tracking-wide text-white shadow-lg backdrop-blur">
                        View product
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </span>
                </div>
            </div>

            {/* Details */}
            <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
                <h3 className="line-clamp-2 text-base font-bold leading-snug tracking-tight text-gray-900 transition-colors group-hover:text-blue-700 sm:text-lg">
                    {product.name}
                </h3>

                <div className="mt-auto flex items-end justify-between gap-3">
                    <p className="flex items-baseline gap-1 text-gray-900">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">GHS</span>
                        <span className="text-xl font-extrabold tracking-tight sm:text-2xl">{price}</span>
                    </p>
                    <span
                        aria-hidden="true"
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 transition-all duration-300 ${isSoldOut
                            ? 'bg-gray-50 text-gray-300 ring-gray-200'
                            : 'bg-blue-50 text-blue-600 ring-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600 group-hover:shadow-md group-hover:shadow-blue-500/30'
                            }`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </span>
                </div>
            </div>

            {/* Accent underline on hover */}
            <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 transition-transform duration-500 group-hover:scale-x-100"
            />
        </Link>
    );
};

export default ProductCard;
