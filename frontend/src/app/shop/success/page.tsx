'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

interface Order {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    address: string;
    total_amount: string;
    status: string;
    verification_code: string;
    items: {
        product_name: string;
        quantity: number;
        price: string;
        selected_color?: string;
        selected_size?: string;
    }[];
}


function SuccessContent() {
    const searchParams = useSearchParams();
    const reference = searchParams.get('reference');
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { clearCart } = useCart();
    const router = useRouter();
    const slipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!reference) {
            setError('No payment reference found.');
            setLoading(false);
            return;
        }

        const verifyPayment = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aces-shop-backend-w8ro7.ondigitalocean.app';
                const res = await fetch(`${apiUrl}/api/shop/verify-payment/?reference=${reference}`);

                let data;
                try {
                    data = await res.json();
                } catch (jsonError) {
                    const text = await res.text().catch(() => 'No body');
                    throw new Error(`Invalid JSON response (${res.status}): ${text.substring(0, 200)}`);
                }

                if (res.ok) {
                    setOrder(data.order);
                    clearCart();
                } else {
                    setError(data.error || `Verification failed: ${res.statusText}`);
                }
            } catch (err: any) {
                console.error('Verification error:', err);
                setError(err.message || 'An error occurred while verifying payment.');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [reference, clearCart]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-gray-900 animate-pulse">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md bg-white p-8 rounded-2xl shadow-xl"
                >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h3>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Link href="/shop/cart" className="inline-flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                        Return to Cart
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 print-reset">
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 10mm;
                        size: auto;
                    }
                    /* Hide everything by default except specific print content */
                    body * {
                        visibility: hidden;
                    }
                    /* But better: Collapse layout of hidden items */
                    .no-print {
                        display: none !important;
                    }
                    
                    /* Reset the main container to avoid extra spacing */
                    .print-reset {
                        min-height: 0 !important;
                        height: auto !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: none !important;
                        overflow: visible !important;
                    }

                    /* Make the printable content visible and positioned correctly */
                    .printable-content, .printable-content * {
                        visibility: visible;
                    }
                    .printable-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    
                    /* Ensure icons/images print */
                    img {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto print-reset"
            >
                <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100 print-reset">
                    {/* Header Section - HIDE ON PRINT */}
                    <div className="bg-blue-600 px-8 py-10 text-center relative overflow-hidden no-print">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500"></div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white mb-6 shadow-lg shadow-blue-900/20"
                        >
                            <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </motion.div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">Payment Successful!</h2>
                        <p className="mt-2 text-blue-100 text-lg">Your order has been confirmed.</p>
                    </div>

                    {/* Receipt Section */}
                    <div className="px-8 py-10 print-reset">
                        <div ref={slipRef} className="printable-content bg-gray-50 rounded-2xl p-8 border border-gray-200/60 relative">
                            {/* Logo for Receipt */}
                            <div className="flex justify-center mb-6">
                                <div className="relative h-16 w-16">
                                    <Image
                                        src="/images/aceslogo.png"
                                        alt="ACES Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>

                            {/* Jagged Edge / Receipt styling could go here */}
                            <div className="flex justify-between items-start border-b border-dashed border-gray-300 pb-6 mb-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Receipt for</p>
                                    <h3 className="text-xl font-bold text-gray-900">{order?.full_name}</h3>
                                    <p className="text-sm text-gray-600">{order?.email}</p>
                                    <p className="text-sm text-gray-600 mt-1">{order?.phone}</p>
                                    {order?.address && (
                                        <div className="mt-2">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delivery To</p>
                                            <p className="text-sm text-gray-600 max-w-[200px] leading-snug">{order.address}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Order ID</p>
                                    <p className="text-xl font-mono font-bold text-blue-600">#{order?.id}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-200">
                                    <span>Item</span>
                                    <span>Price</span>
                                </div>
                                {order?.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-start text-sm">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {item.product_name} <span className="text-gray-500 ml-1">x {item.quantity}</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {item.selected_color && <span className="mr-2">Color: {item.selected_color}</span>}
                                                {item.selected_size && <span>Size: {item.selected_size}</span>}
                                            </p>
                                        </div>
                                        <span className="font-semibold text-gray-900">GHS {item.price}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-xl shadow-sm">
                                <span className="font-medium">Total Paid</span>
                                <span className="text-xl font-bold">GHS {order?.total_amount}</span>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-xs text-gray-400">Generated on {new Date().toLocaleString()}</p>
                                <p className="text-xs text-gray-400 mt-1">Association of Computer Engineering Students (ACES)</p>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center no-print">
                            <button
                                onClick={handlePrint}
                                className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                            >
                                <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print Receipt
                            </button>
                            <Link
                                href="/shop"
                                className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-gray-900 animate-pulse">Loading...</p>
                </div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
