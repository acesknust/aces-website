import React from 'react';
import { notFound } from 'next/navigation';
import ProductDetails from '@/components/shop/ProductDetails';

async function getProduct(slug: string) {
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/shop/products/${slug}/`, { cache: 'no-store' });
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
                <ProductDetails product={product} />
            </div>
        </div>
    );
}
