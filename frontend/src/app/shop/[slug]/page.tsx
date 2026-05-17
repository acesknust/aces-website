import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductDetails from '@/components/shop/ProductDetails';

async function getProduct(slug: string) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aces-shop-backend-w8ro7.ondigitalocean.app';
        const res = await fetch(`${apiUrl}/api/shop/products/${slug}/`, { cache: 'no-store' });
        if (!res.ok) {
            return null;
        }
        return res.json();
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return null; // Return null to trigger 404/Not Found instead of crashing
    }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
    const product = await getProduct(params.slug);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white pt-24 pb-16">
            <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                {/* Back Button */}
                <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 mb-6 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 hover:text-blue-600 transition-all duration-200"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Shop
                </Link>

                <ProductDetails product={product} />
            </div>
        </div>
    );
}
