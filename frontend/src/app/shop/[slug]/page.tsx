import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/shop/AddToCartButton';

async function getProduct(slug: string) {
    const res = await fetch(`http://127.0.0.1:8000/api/shop/products/${slug}/`, { cache: 'no-store' });
    if (!res.ok) {
        return null;
    }
    return res.json();
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
    const product = await getProduct(params.slug);

    if (!product) {
        notFound();
    }

    return (
        <div className="bg-white min-h-screen pt-24 pb-16">
            <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
                    {/* Image gallery */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 sm:aspect-[2/3]">
                        <Image
                            src={product.image || 'https://via.placeholder.com/600x600?text=No+Image'}
                            alt={product.name}
                            fill
                            className="object-cover object-center"
                            priority
                        />
                    </div>

                    {/* Product info */}
                    <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>

                        <div className="mt-3">
                            <h2 className="sr-only">Product information</h2>
                            <p className="text-3xl tracking-tight text-gray-900">GHS {product.price}</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="space-y-6 text-base text-gray-700" dangerouslySetInnerHTML={{ __html: product.description }} />
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center">
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${product.is_active ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                                    {product.is_active ? 'In Stock' : 'Out of Stock'}
                                </span>
                                <span className="ml-2 text-sm text-gray-500">Category: {product.category?.name}</span>
                            </div>
                        </div>

                        <div className="mt-10 flex">
                            <AddToCartButton product={{
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                image: product.image
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
