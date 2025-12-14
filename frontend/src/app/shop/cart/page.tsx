'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://localhost:8000';

export default function CartPage() {
    const { items, removeItem, updateQuantity, total, clearCart } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const orderData = {
                ...formData,
                items: items.map(item => ({ id: item.id, quantity: item.quantity })),
            };

            const response = await fetch(`${API_BASE_URL}/api/shop/orders/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || errData.detail || `Failed to create order: ${response.statusText}`);
            }

            const data = await response.json();

            // Redirect to Paystack
            if (data.authorization_url) {
                // Clear cart before redirecting? Maybe better to clear on success.
                // For now, let's keep it until success.
                window.location.href = data.authorization_url;
            } else {
                alert('Payment initialization failed');
            }

        } catch (error) {
            console.error('Checkout error:', error);

            let errorMessage = 'Something went wrong. Please try again.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            alert(`Checkout Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="bg-white min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto text-center flex flex-col items-center justify-center min-h-[50vh]">
                    <div className="relative h-40 w-40 mb-6 bg-blue-50 rounded-full flex items-center justify-center">
                        <svg className="h-20 w-20 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Your Cart is Empty</h2>
                    <p className="mt-4 text-lg text-gray-500 max-w-sm mx-auto">Looks like you haven't discovered our awesome merch yet.</p>
                    <div className="mt-10">
                        <Link href="/shop" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-full text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl transition-all duration-200">
                            Start Shopping &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pt-24 pb-16">
            <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>

                <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
                    <section aria-labelledby="cart-heading" className="lg:col-span-7 rounded-2xl bg-white px-4 py-6 sm:p-6 lg:p-8 shadow-xl border border-gray-100">
                        <h2 id="cart-heading" className="text-xl font-bold text-gray-900 border-b pb-4 mb-4">Items in your cart</h2>

                        <ul role="list" className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <li key={item.id} className="flex py-6">
                                    <div className="flex-shrink-0">
                                        <div className="relative h-28 w-28 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden shrink-0">
                                            <Image
                                                src={item.image || 'https://via.placeholder.com/400x400?text=No+Image'}
                                                alt={item.name}
                                                fill
                                                className="object-contain object-center p-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="ml-6 flex flex-1 flex-col justify-between">
                                        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                            <div>
                                                <div className="flex justify-between">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        <Link href={`/shop/${item.id}`} className="hover:text-blue-600 transition-colors">
                                                            {item.name}
                                                        </Link>
                                                    </h3>
                                                </div>
                                                <div className="mt-1 flex text-sm">
                                                    <p className="text-gray-500 border-r border-gray-200 pr-2 mr-2">
                                                        {item.color ? (
                                                            <span className="inline-flex items-center">
                                                                <span className="mr-1.5 h-2 w-2 rounded-full bg-gray-400"></span>
                                                                {item.color}
                                                            </span>
                                                        ) : 'Standard'}
                                                    </p>
                                                </div>
                                                <p className="mt-2 text-lg font-bold text-blue-600">GHS {item.price}</p>
                                            </div>

                                            <div className="mt-4 sm:mt-0 sm:pr-9">
                                                <label htmlFor={`quantity-${item.id}`} className="sr-only">
                                                    Quantity, {item.name}
                                                </label>
                                                <select
                                                    id={`quantity-${item.id}-${item.color || 'def'}`}
                                                    name={`quantity-${item.id}`}
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value), item.color)}
                                                    className="max-w-full rounded-md border border-gray-200 py-1.5 text-left text-base font-medium leading-5 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                                >
                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                                        <option key={num} value={num}>{num}</option>
                                                    ))}
                                                </select>

                                                <div className="absolute right-0 top-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.id, item.color)}
                                                        className="-m-2 inline-flex p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <span className="sr-only">Remove</span>
                                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Order Summary & Checkout Form */}
                    <section
                        aria-labelledby="summary-heading"
                        className="mt-16 rounded-2xl bg-white px-4 py-6 sm:p-6 lg:col-span-12 xl:col-span-5 lg:mt-0 lg:p-10 shadow-xl border border-gray-100"
                    >
                        <h2 id="summary-heading" className="text-xl font-bold text-gray-900 border-b pb-4">
                            Order Summary
                        </h2>

                        <dl className="mt-6 space-y-4">
                            <div className="flex items-center justify-between pt-2">
                                <dt className="text-base font-medium text-gray-500">Subtotal</dt>
                                <dd className="text-base font-medium text-gray-900">GHS {total.toFixed(2)}</dd>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <dt className="text-lg font-bold text-gray-900">Order Total</dt>
                                <dd className="text-2xl font-bold text-blue-600">GHS {total.toFixed(2)}</dd>
                            </div>
                        </dl>

                        {!isCheckingOut ? (
                            <div className="mt-8">
                                <button
                                    onClick={() => setIsCheckingOut(true)}
                                    className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 text-base font-bold text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleCheckout} className="mt-8 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                        <input type="text" name="full_name" id="full_name" required value={formData.full_name} onChange={handleInputChange}
                                            className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-gray-50 focus:bg-white transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                        <input type="email" name="email" id="email" required value={formData.email} onChange={handleInputChange}
                                            className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-gray-50 focus:bg-white transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                                        <input type="tel" name="phone" id="phone" required value={formData.phone} onChange={handleInputChange}
                                            className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-gray-50 focus:bg-white transition-all"
                                            placeholder="024 XXX XXXX"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-1">Delivery Location</label>
                                        <textarea name="address" id="address" required value={formData.address} onChange={handleInputChange} rows={2}
                                            className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-gray-50 focus:bg-white transition-all resize-none"
                                            placeholder="Hostel Name, Room Number"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 text-base font-bold text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Pay with Paystack <span aria-hidden="true">&rarr;</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsCheckingOut(false)}
                                        className="w-full text-center text-sm text-gray-500 hover:text-gray-800 font-medium mt-4 hover:underline"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
