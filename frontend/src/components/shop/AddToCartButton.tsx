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
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product }) => {
    const { addItem } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        const item: CartItem = {
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image: product.image,
            quantity: 1,
        };
        addItem(item);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000); // Reset after 2 seconds
    };

    return (
        <button
            onClick={handleAddToCart}
            className={`flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-full transition-colors duration-200 ${isAdded ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
        >
            {isAdded ? 'Added to Cart!' : 'Add to Cart'}
        </button>
    );
};

export default AddToCartButton;
