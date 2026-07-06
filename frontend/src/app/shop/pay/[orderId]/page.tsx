'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

const getApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://127.0.0.1:8000';
    }
    return 'https://aces-backend-pgtot.ondigitalocean.app';
};

const API_BASE_URL = getApiUrl();

const compressImage = (file: File, maxWidth = 1200, quality = 0.85): Promise<Blob> => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || typeof FileReader === 'undefined') {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file);
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        resolve(blob || file);
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
};

function MoMoPaymentContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const orderId = params.orderId;
    const email = searchParams.get('email') || '';
    const totalAmount = searchParams.get('total') || '0.00';

    const [step, setStep] = useState<'instructions' | 'confirm' | 'done'>('instructions');
    const [momoSenderName, setMomoSenderName] = useState('');
    const [momoAmountPaid, setMomoAmountPaid] = useState(totalAmount);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [momoReceiptFile, setMomoReceiptFile] = useState<File | null>(null);

    const momoNumber = '0598899106';
    const momoName = 'Hanz Ofosuhene Sintim';

    const copyNumber = () => {
        navigator.clipboard.writeText(momoNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleConfirmPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!momoReceiptFile) {
            setError('Please upload a screenshot or receipt of your transaction.');
            return;
        }

        setSubmitting(true);

        let fileToUpload: Blob = momoReceiptFile;
        try {
            fileToUpload = await compressImage(momoReceiptFile);
        } catch (compError) {
            console.error("Image compression failed, uploading original file", compError);
        }

        const formData = new FormData();
        formData.append('order_id', String(orderId));
        formData.append('email', email);
        formData.append('momo_sender_name', momoSenderName);
        formData.append('momo_amount_paid', momoAmountPaid);
        formData.append('momo_receipt', fileToUpload, 'receipt.jpg');

        try {
            const response = await fetch(`${API_BASE_URL}/api/shop/orders/confirm-momo/`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setStep('done');
            } else {
                setError(data.error || 'Failed to confirm payment. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white pt-24 pb-16 px-4 sm:px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg mx-auto"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                        <span className="text-3xl">📱</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                        {step === 'done' ? 'Payment Submitted!' : 'Complete Your Payment'}
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Order #{orderId}
                    </p>
                </div>

                {/* Step 1: Payment Instructions */}
                {step === 'instructions' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Amount Card */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center">
                            <p className="text-sm text-gray-500 mb-1">Amount to Pay</p>
                            <p className="text-4xl font-extrabold text-blue-600">GHS {parseFloat(totalAmount).toFixed(2)}</p>
                        </div>

                        {/* MoMo Details Card */}
                        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-xl border border-yellow-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="text-2xl">💳</span> Send Payment Via MoMo
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">MoMo Number</p>
                                    <div className="flex items-center gap-3">
                                        <p className="text-2xl font-bold text-gray-900 tracking-wider">{momoNumber}</p>
                                        <button
                                            onClick={copyNumber}
                                            className="px-3 py-1 bg-white rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                                        >
                                            {copied ? '✓ Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Account Name</p>
                                    <p className="text-lg font-bold text-gray-900">{momoName}</p>
                                </div>
                            </div>

                            <div className="mt-6 p-3 bg-white/60 rounded-xl border border-yellow-200">
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">How to pay:</span> Open your MoMo app or dial <span className="font-bold">*170#</span>, 
                                    select <span className="font-semibold">Transfer Money</span>, enter the number above, 
                                    and send <span className="font-bold text-blue-600">GHS {parseFloat(totalAmount).toFixed(2)}</span>.
                                </p>
                            </div>
                        </div>

                        {/* Next Step Button */}
                        <button
                            onClick={() => setStep('confirm')}
                            className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 text-base font-bold text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                        >
                            I&apos;ve Sent the Payment →
                        </button>

                        <p className="text-center text-xs text-gray-400">
                            After sending the money, click the button above to confirm your payment details.
                        </p>
                    </motion.div>
                )}

                {/* Step 2: Confirm Payment Details */}
                {step === 'confirm' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-1">Confirm Your Payment</h2>
                            <p className="text-sm text-gray-500 mb-6">Enter the details from your MoMo transaction.</p>

                            <form onSubmit={handleConfirmPayment} className="space-y-5">
                                <div>
                                    <label htmlFor="momo_name" className="block text-sm font-semibold text-gray-700 mb-1">
                                        Name on Your MoMo Account
                                    </label>
                                    <input
                                        type="text"
                                        id="momo_name"
                                        required
                                        value={momoSenderName}
                                        onChange={(e) => setMomoSenderName(e.target.value)}
                                        className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm bg-gray-50 focus:bg-white transition-all"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="momo_amount" className="block text-sm font-semibold text-gray-700 mb-1">
                                        Amount Paid (GHS)
                                    </label>
                                    <input
                                        type="number"
                                        id="momo_amount"
                                        required
                                        step="0.01"
                                        value={momoAmountPaid}
                                        onChange={(e) => setMomoAmountPaid(e.target.value)}
                                        className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm bg-gray-50 focus:bg-white transition-all"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="momo_receipt" className="block text-sm font-semibold text-gray-700 mb-1">
                                        Upload Payment Screenshot / Receipt (Required)
                                    </label>
                                    <input
                                        type="file"
                                        id="momo_receipt"
                                        accept="image/*"
                                        required
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setMomoReceiptFile(e.target.files[0]);
                                            }
                                        }}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all border border-gray-200 rounded-lg p-2 bg-gray-50 cursor-pointer"
                                    />
                                </div>

                                {error && (
                                    <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                                        <p className="text-sm font-medium text-red-800">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 text-base font-bold text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        'Confirm Payment ✓'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep('instructions')}
                                    className="w-full text-center text-sm text-gray-500 hover:text-gray-800 font-medium hover:underline"
                                >
                                    ← Back to payment instructions
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Success */}
                {step === 'done' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6"
                    >
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                                <span className="text-4xl">✅</span>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Details Submitted!</h2>
                            <p className="text-gray-500 mb-6">
                                Your order <span className="font-bold text-gray-900">#{orderId}</span> is being verified. 
                                You&apos;ll receive a confirmation once your payment is approved.
                            </p>

                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <p className="text-sm text-blue-800">
                                    <span className="font-bold">📋 Save your Order ID:</span> #{orderId}
                                    <br />
                                    You can track your order status anytime.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href={`/shop/track?order_id=${orderId}&email=${encodeURIComponent(email)}`}
                                className="flex-1 rounded-full bg-blue-600 px-4 py-3 text-sm font-bold text-white text-center hover:bg-blue-700 transition-colors"
                            >
                                Track My Order
                            </Link>
                            <Link
                                href="/shop"
                                className="flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm font-bold text-gray-700 text-center hover:bg-gray-200 transition-colors"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

export default function MoMoPaymentPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-gray-900 animate-pulse">Loading payment system...</p>
                </div>
            </div>
        }>
            <MoMoPaymentContent />
        </Suspense>
    );
}
