import React from 'react';
import ProductCard from '@/components/shop/ProductCard';

async function getProducts() {
    // In a real production env, use an environment variable for the API URL
    const res = await fetch('http://127.0.0.1:8000/api/shop/products/', { cache: 'no-store' });

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
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
        <div className="bg-white min-h-screen pt-20"> {/* Added pt-20 for header spacing */}
            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:max-w-7xl lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12">
                    <div className="mb-4 sm:mb-0">
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">ACES Merchandise</h2>
                        <p className="mt-2 text-base text-gray-500">Rep your department with verified merch.</p>
                    </div>
                    {/* Filter/Sort could go here */}
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No products available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                        {products.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
