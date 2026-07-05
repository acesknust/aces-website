'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const getApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://127.0.0.1:8000';
    }
    return 'https://aces-backend-pgtot.ondigitalocean.app';
};

const API_BASE_URL = getApiUrl();

interface OrderItem {
    product_name: string;
    price: string | number;
    quantity: number;
    selected_color?: string;
    selected_size?: string;
}

interface Order {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    address: string;
    total_amount: string | number;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'FULFILLED';
    payment_method: 'MOMO' | 'PAYSTACK';
    momo_sender_name?: string;
    momo_amount_paid?: string | number;
    items: OrderItem[];
    created_at: string;
}

function TrackContent() {
    const searchParams = useSearchParams();
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    // Load from URL params on load if present
    useEffect(() => {
        const urlOrderId = searchParams.get('order_id');
        const urlEmail = searchParams.get('email');
        if (urlOrderId && urlEmail) {
            setOrderId(urlOrderId);
            setEmail(urlEmail);
            trackOrder(urlOrderId, urlEmail);
        }
    }, [searchParams]);

    const trackOrder = async (id: string, mail: string) => {
        if (!id || !mail) return;
        setLoading(true);
        setError('');
        setOrder(null);
        setSearched(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/shop/orders/track/?order_id=${id}&email=${encodeURIComponent(mail)}`
            );
            const data = await response.json();

            if (response.ok) {
                setOrder(data);
            } else {
                setError(data.error || 'No matching order found. Please check your details.');
            }
        } catch (err) {
            setError('Failed to fetch order details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        trackOrder(orderId.trim(), email.trim());
    };

    // Helper to get status color badge
    const getStatusStyles = (status: Order['status']) => {
        switch (status) {
            case 'PENDING':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'PAID':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'FULFILLED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'FAILED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (order: Order) => {
        if (order.status === 'PENDING') {
            if (order.payment_method === 'MOMO' && order.momo_sender_name) {
                return 'Awaiting Verification';
            }
            return 'Pending Payment';
        }
        return order.status.charAt(0) + order.status.slice(1).toLowerCase();
    };

    // Stepper logic
    const getStepIndex = (order: Order) => {
        if (order.status === 'FAILED') return -1;
        if (order.status === 'PENDING') {
            if (order.payment_method === 'MOMO' && order.momo_sender_name) return 1; // verification step
            return 0; // placing order
        }
        if (order.status === 'PAID') return 2; // paid
        if (order.status === 'FULFILLED') return 3; // completed/delivered
        return 0;
    };

    const stepIndex = order ? getStepIndex(order) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white pt-24 pb-16 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <span className="text-4xl">📦</span>
                    <h1 className="mt-4 text-3xl font-extrabold text-gray-900 font-display">Track Your Order</h1>
                    <p className="mt-2 text-gray-500">Enter your order details to check your order progress</p>
                </div>

                {/* Search Form */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                            <label htmlFor="orderId" className="block text-sm font-semibold text-gray-700 mb-1">
                                Order ID
                            </label>
                            <input
                                type="text"
                                id="orderId"
                                required
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm bg-gray-50 focus:bg-white transition-all"
                                placeholder="e.g. 142"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm bg-gray-50 focus:bg-white transition-all"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 text-base font-bold text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? 'Fetching Details...' : 'Track Order Status →'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Section */}
                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-12"
                        >
                            <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="text-gray-500 font-semibold">Retrieving your order details...</p>
                        </motion.div>
                    )}

                    {!loading && error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center"
                        >
                            <span className="text-3xl mb-2 block">🔍❌</span>
                            <h3 className="text-lg font-bold text-red-800">Order Not Found</h3>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        </motion.div>
                    )}

                    {!loading && order && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            {/* Stepper Card */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
                                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Order Date: {new Date(order.created_at).toLocaleDateString()}</p>
                                        <h3 className="text-lg font-bold text-gray-900">Order ID: #{order.id}</h3>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusStyles(order.status)}`}>
                                        {getStatusLabel(order)}
                                    </span>
                                </div>

                                {order.status === 'FAILED' ? (
                                    <div className="bg-red-50 text-red-800 rounded-xl p-4 border border-red-100 flex items-center gap-3">
                                        <span className="text-2xl">⚠️</span>
                                        <div>
                                            <p className="font-bold">Order Cancelled/Failed</p>
                                            <p className="text-sm text-red-600">This order could not be fulfilled. Please contact ACES support for help.</p>
                                        </div>
                                    </div>
                                ) : (
                                    /* Stepper Visuals */
                                    <div className="py-6">
                                        <div className="relative">
                                            {/* Process Line */}
                                            <div className="absolute top-4 left-4 right-4 h-1 bg-gray-100 -z-10 rounded" />
                                            <div
                                                className="absolute top-4 left-4 h-1 bg-blue-600 -z-10 rounded transition-all duration-500"
                                                style={{ width: `${(stepIndex / 3) * 100}%` }}
                                            />

                                            <div className="flex justify-between text-center">
                                                {/* Step 1 */}
                                                <div className="flex flex-col items-center">
                                                    <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                                                        stepIndex >= 0 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                                                    }`}>
                                                        1
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-900 mt-2">Order Placed</span>
                                                </div>

                                                {/* Step 2 */}
                                                <div className="flex flex-col items-center">
                                                    <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                                                        stepIndex >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                                                    }`}>
                                                        2
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-900 mt-2">Paid / Verifying</span>
                                                </div>

                                                {/* Step 3 */}
                                                <div className="flex flex-col items-center">
                                                    <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                                                        stepIndex >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                                                    }`}>
                                                        3
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-900 mt-2">Processing</span>
                                                </div>

                                                {/* Step 4 */}
                                                <div className="flex flex-col items-center">
                                                    <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                                                        stepIndex >= 3 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                                                    }`}>
                                                        4
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-900 mt-2">Ready/Delivered</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* MoMo status notification info */}
                            {order.status === 'PENDING' && order.payment_method === 'MOMO' && !order.momo_sender_name && (
                                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <p className="font-bold text-amber-900">⚠️ Payment Confirmation Missing</p>
                                        <p className="text-sm text-amber-700 mt-1">We haven&apos;t received your MoMo payment details yet.</p>
                                    </div>
                                    <Link
                                        href={`/shop/pay/${order.id}?email=${encodeURIComponent(order.email)}&total=${order.total_amount}`}
                                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-2.5 rounded-full transition-colors whitespace-nowrap"
                                    >
                                        Submit Payment Info →
                                    </Link>
                                </div>
                            )}

                            {order.status === 'PENDING' && order.payment_method === 'MOMO' && order.momo_sender_name && (
                                <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 flex items-start gap-4">
                                    <span className="text-2xl mt-0.5">⏳</span>
                                    <div>
                                        <p className="font-bold text-blue-900">Awaiting Verification</p>
                                        <p className="text-sm text-blue-700 mt-1">
                                            You submitted MoMo account: <span className="font-bold">{order.momo_sender_name}</span> (GHS {parseFloat(order.momo_amount_paid as string).toFixed(2)}). 
                                            Our administrators are verifying the transfer.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Order Details & Summary */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
                                <h3 className="text-lg font-bold text-gray-900 border-b pb-4 mb-4">Order Items</h3>
                                <ul className="divide-y divide-gray-100">
                                    {order.items.map((item, idx) => (
                                        <li key={idx} className="py-4 flex justify-between">
                                            <div>
                                                <p className="font-bold text-gray-900">{item.product_name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Qty: {item.quantity} 
                                                    {item.selected_color && ` | Color: ${item.selected_color}`}
                                                    {item.selected_size && ` | Size: ${item.selected_size}`}
                                                </p>
                                            </div>
                                            <p className="font-semibold text-gray-900">GHS {parseFloat(item.price as string).toFixed(2)}</p>
                                        </li>
                                    ))}
                                </ul>

                                <div className="border-t pt-4 mt-4 space-y-2">
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Payment Method</span>
                                        <span className="font-semibold text-gray-900">{order.payment_method}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-dashed">
                                        <span>Total Amount</span>
                                        <span className="text-blue-600">GHS {parseFloat(order.total_amount as string).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Details */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
                                <h3 className="text-lg font-bold text-gray-900 border-b pb-4 mb-4">Delivery Details</h3>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <dt className="text-gray-500 font-semibold">Recipient Name</dt>
                                        <dd className="text-gray-900 font-medium mt-0.5">{order.full_name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-gray-500 font-semibold">Phone Number</dt>
                                        <dd className="text-gray-900 font-medium mt-0.5">{order.phone}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-gray-500 font-semibold">Delivery Address</dt>
                                        <dd className="text-gray-900 font-medium mt-0.5 whitespace-pre-wrap">{order.address}</dd>
                                    </div>
                                </dl>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function OrderTrackingPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-gray-900 animate-pulse">Loading tracking system...</p>
                </div>
            </div>
        }>
            <TrackContent />
        </Suspense>
    );
}
