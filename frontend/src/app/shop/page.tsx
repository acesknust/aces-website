import React from 'react';
import ProductGrid from '@/components/shop/ProductGrid';

// ISR: Revalidate product data every 60 seconds (was: force-dynamic + no-store)
export const revalidate = 60;

async function getProducts() {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
        if (process.env.NODE_ENV === 'development') {
            apiUrl = 'http://127.0.0.1:8000';
        } else {
            apiUrl = 'https://aces-shop-backend-w8ro7.ondigitalocean.app';
        }
    }
    const res = await fetch(`${apiUrl}/api/shop/products/`, {
        next: { revalidate: 60 }  // Cache for 60s, then refresh in background
    });

    if (!res.ok) {
        throw new Error('Failed to fetch products');
    }

    return res.json();
}

export default async function ShopPage() {
    let products = [];
    try {
        products = await getProducts();
    } catch (error) {
        console.error("Error fetching products:", error);
        // Handle error gracefully, maybe show empty state or error message
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white pt-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                        <span className="block xl:inline">ACES</span>{' '}
                        <span className="block text-blue-600 xl:inline">Merchandise</span>
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
                        Rep your department with premium, verified gear. Designed for engineers, by engineers.
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No products available at the moment.</p>
                    </div>
                ) : (
                    <ProductGrid products={products} />
                )}
            </div>
        </div>
    );
}
