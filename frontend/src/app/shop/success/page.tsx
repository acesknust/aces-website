'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface Order {
    id: number;
    full_name: string;
    email: string;
    total_amount: string;
    status: string;
    verification_code: string;
    items: {
        product_name: string;
        quantity: number;
        price: string;
    }[];
}

export default function SuccessPage() {
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
                const res = await fetch(`http://127.0.0.1:8000/api/shop/verify-payment/?reference=${reference}`);

                let data;
                try {
                    data = await res.json();
                } catch (jsonError) {
                    // If JSON parsing fails, try to read text to show as error
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
        const printContent = slipRef.current;
        if (printContent) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Reload to restore event listeners
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-gray-900">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Payment Failed</h3>
                    <p className="mt-1 text-gray-500">{error}</p>
                    <div className="mt-6">
                        <Link href="/shop/cart" className="text-blue-600 hover:text-blue-500 font-medium">
                            Return to Cart
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Payment Successful</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">Thank you for your purchase!</p>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Print Slip
                        </button>
                    </div>

                    {/* Verification Slip Area */}
                    <div ref={slipRef} className="border-t border-gray-200 px-4 py-5 sm:p-0">
                        <div className="p-8 bg-white border-4 border-double border-gray-200 m-4">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-blue-900 uppercase tracking-wider">ACES Shop Receipt</h1>
                                <p className="text-sm text-gray-500">Association of Computer Engineering Students</p>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-start mb-8">
                                <div>
                                    <p className="text-sm text-gray-500">Order ID</p>
                                    <p className="font-medium text-gray-900">#{order?.id}</p>

                                    <p className="text-sm text-gray-500 mt-4">Customer</p>
                                    <p className="font-medium text-gray-900">{order?.full_name}</p>
                                    <p className="text-sm text-gray-600">{order?.email}</p>
                                </div>
                                <div className="mt-6 md:mt-0 text-center">
                                    <div className="inline-block p-4 bg-green-50 rounded-full border border-green-100">
                                        <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-xs text-green-600 mt-2 font-medium">Verified Paid</p>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="text-sm font-medium text-gray-900 border-b pb-2 mb-4">Items</h4>
                                <ul className="divide-y divide-gray-200">
                                    {order?.items.map((item, index) => (
                                        <li key={index} className="py-2 flex justify-between">
                                            <span className="text-gray-600">{item.product_name} x {item.quantity}</span>
                                            <span className="font-medium text-gray-900">GHS {item.price}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total Paid</span>
                                <span className="text-xl font-bold text-blue-600">GHS {order?.total_amount}</span>
                            </div>

                            <div className="mt-8 text-center text-xs text-gray-400">
                                <p>This is a computer-generated receipt.</p>
                                <p>{new Date().toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-center">
                        <Link href="/shop" className="text-blue-600 hover:text-blue-500 font-medium">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
