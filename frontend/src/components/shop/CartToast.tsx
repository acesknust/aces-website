'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';

const CartToast: React.FC = () => {
    const { lastAddedItem, toastVisible, dismissToast } = useCart();

    useEffect(() => {
        if (toastVisible) {
            const timer = setTimeout(() => {
                dismissToast();
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [toastVisible, dismissToast]);

    const getImageUrl = (img?: string) => {
        if (!img) return 'https://via.placeholder.com/80x80?text=No+Image';
        if (img.startsWith('http')) return img;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aces-backend-pgtot.ondigitalocean.app';
        return `${baseUrl}${img}`;
    };

    return (
        <AnimatePresence>
            {toastVisible && lastAddedItem && (
                <motion.div
                    initial={{ opacity: 0, y: -80 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -80 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center gap-4">
                        {/* Product thumbnail */}
                        <div className="relative h-14 w-14 flex-shrink-0 rounded-xl bg-gray-50 overflow-hidden">
                            <Image
                                src={getImageUrl(lastAddedItem.image)}
                                alt={lastAddedItem.name}
                                fill
                                className="object-contain p-1"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-semibold text-gray-900">Added to cart</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                                {lastAddedItem.name}
                                {lastAddedItem.color && ` · ${lastAddedItem.color}`}
                                {lastAddedItem.size && ` · ${lastAddedItem.size}`}
                            </p>
                        </div>

                        {/* View Cart link */}
                        <Link
                            href="/shop/cart"
                            onClick={dismissToast}
                            className="flex-shrink-0 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
                        >
                            View Cart
                        </Link>

                        {/* Dismiss button */}
                        <button
                            onClick={dismissToast}
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Dismiss notification"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CartToast;
