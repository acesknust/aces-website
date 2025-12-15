'use client';

import React, { useState } from 'react';
import { useCart, CartItem } from '@/context/CartContext';

interface AddToCartButtonProps {
    product: {
        id: number;
        name: string;
        price: string;
        image: string;
    };
    selectedColor?: string;
    selectedSize?: string;
    disabled?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product, selectedColor, selectedSize, disabled }) => {
    const { addItem } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        if (disabled) return;

        const item: CartItem = {
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image: product.image,
            quantity: 1,
            color: selectedColor,
            size: selectedSize,
        };
        addItem(item);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000); // Reset after 2 seconds
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={disabled}
            className={`group relative flex w-full max-w-xs items-center justify-center overflow-hidden rounded-full px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-full ${disabled
                ? 'bg-gray-300 cursor-not-allowed shadow-none'
                : isAdded
                    ? 'bg-green-500 ring-green-500'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 ring-blue-500 hover:from-blue-700 hover:to-indigo-700'
                }`}
        >
            <span className="relative z-10 flex items-center gap-2">
                {isAdded ? (
                    <>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Added to Cart
                    </>
                ) : (
                    <>
                        <svg className="h-5 w-5 transition-transform group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {disabled ? 'Select Option' : 'Add to Cart'}
                    </>
                )}
            </span>
        </button>
    );
};

export default AddToCartButton;
