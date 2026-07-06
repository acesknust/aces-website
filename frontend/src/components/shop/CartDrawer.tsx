'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { useCart } from '@/context/CartContext';

const CartDrawer: React.FC = () => {
    const { items, isCartDrawerOpen, setCartDrawerOpen, updateQuantity, removeItem, total } = useCart();

    const getImageUrl = (img?: string) => {
        if (!img) return 'https://via.placeholder.com/80x80?text=No+Image';
        if (img.startsWith('http')) return img;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aces-backend-pgtot.ondigitalocean.app';
        return `${baseUrl}${img}`;
    };

    return (
        <Drawer
            open={isCartDrawerOpen}
            onClose={() => setCartDrawerOpen(false)}
            direction="right"
            className="w-full max-w-md bg-white shadow-2xl flex flex-col z-[150]"
            style={{ width: '100%', maxWidth: '450px' }}
        >
            <div className="h-full flex flex-col bg-white">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            {items.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                    </div>
                    <button
                        onClick={() => setCartDrawerOpen(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close cart"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center pb-12">
                            <span className="text-5xl mb-4">🛒</span>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Your cart is empty</h3>
                            <p className="text-sm text-gray-500 max-w-[250px] mb-6">
                                Add some ACES gear to rep your department!
                            </p>
                            <button
                                onClick={() => setCartDrawerOpen(false)}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {items.map((item) => (
                                <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                                    {/* Thumbnail */}
                                    <div className="relative h-20 w-20 flex-shrink-0 rounded-xl bg-gray-50 overflow-hidden border border-gray-100">
                                        <Image
                                            src={getImageUrl(item.image)}
                                            alt={item.name}
                                            fill
                                            className="object-contain p-1"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm truncate leading-tight mb-0.5">
                                                {item.name}
                                            </h4>
                                            <p className="text-xs text-gray-500 mb-2">
                                                {item.color && `Color: ${item.color}`}
                                                {item.color && item.size && ' · '}
                                                {item.size && `Size: ${item.size}`}
                                            </p>
                                        </div>

                                        {/* Qty & Price controls */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center border border-gray-200 rounded-lg">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.color, item.size)}
                                                    className="px-2.5 py-1 text-gray-500 hover:text-gray-700 transition-colors"
                                                    aria-label="Decrease quantity"
                                                >
                                                    -
                                                </button>
                                                <span className="px-2 text-sm font-bold text-gray-900 min-w-[20px] text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.color, item.size)}
                                                    className="px-2.5 py-1 text-gray-500 hover:text-gray-700 transition-colors"
                                                    aria-label="Increase quantity"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p className="font-extrabold text-sm text-gray-900">
                                                GHS {(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        onClick={() => removeItem(item.id, item.color, item.size)}
                                        className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0 h-fit"
                                        aria-label="Remove item"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Summary & Checkout */}
                {items.length > 0 && (
                    <div className="px-6 py-6 bg-gray-50 border-t border-gray-100 space-y-4">
                        <div className="flex items-center justify-between text-base font-bold text-gray-900">
                            <span>Subtotal</span>
                            <span className="text-xl font-extrabold text-blue-600">GHS {total.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-normal">
                            Shipping and coupon discounts will be calculated during checkout.
                        </p>

                        <div className="space-y-3 pt-2">
                            <Link
                                href="/shop/cart"
                                onClick={() => setCartDrawerOpen(false)}
                                className="block w-full text-center bg-blue-600 text-white rounded-full py-4 text-base font-bold shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all"
                            >
                                Checkout details →
                            </Link>
                            <button
                                onClick={() => setCartDrawerOpen(false)}
                                className="block w-full text-center text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Drawer>
    );
};

export default CartDrawer;
