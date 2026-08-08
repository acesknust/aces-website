'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { useCart } from '@/context/CartContext';

const CartDrawer: React.FC = () => {
    const { 
        items, 
        isCartDrawerOpen, 
        setCartDrawerOpen, 
        updateQuantity, 
        removeItem, 
        total,
        appliedCoupon,
        couponError,
        couponLoading,
        couponCode,
        setCouponCode,
        applyCoupon,
        removeCoupon
    } = useCart();

    const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
    const finalTotal = Math.max(0, total - discountAmount);

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
                        
                        {/* Coupon Code Section inside Cart Drawer */}
                        <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-sm text-xs">
                            <label className="block font-semibold text-gray-700 mb-1.5">
                                🎟️ Coupon Code
                            </label>
                            {appliedCoupon ? (
                                <div className="flex items-center justify-between bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg border border-blue-100 font-medium">
                                    <span className="truncate">
                                        Applied: <strong className="font-bold">{appliedCoupon.code}</strong> (-{appliedCoupon.discount_percent}%)
                                    </span>
                                    <button
                                        onClick={removeCoupon}
                                        className="text-blue-500 hover:text-blue-700 ml-2 font-extrabold focus:outline-none shrink-0"
                                        title="Remove Coupon"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-gray-50 focus:bg-white uppercase font-medium placeholder:normal-case"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => applyCoupon(couponCode)}
                                        disabled={couponLoading || !couponCode.trim()}
                                        className="px-3 py-1.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
                                    >
                                        {couponLoading ? '...' : 'Apply'}
                                    </button>
                                </div>
                            )}
                            {couponError && (
                                <p className="mt-1.5 text-[11px] text-red-600 font-semibold">{couponError}</p>
                            )}
                        </div>

                        {/* Totals Breakdown */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-semibold text-gray-900">GHS {total.toFixed(2)}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex items-center justify-between text-sm text-blue-600 font-medium">
                                    <span>Discount ({appliedCoupon.code})</span>
                                    <span>- GHS {discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-base font-bold text-gray-900 pt-2 border-t border-dashed border-gray-200">
                                <span>Total Amount</span>
                                <span className="text-xl font-extrabold text-blue-600">GHS {finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <p className="text-[11px] text-gray-500 leading-normal">
                            Shipping discounts and details will be completed during checkout.
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
