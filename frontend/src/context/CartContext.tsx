'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// ... (imports)
export interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    color?: string; // Optional color
    size?: string;  // Optional size
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: number, color?: string, size?: string) => void;
    updateQuantity: (id: number, quantity: number, color?: string, size?: string) => void;
    clearCart: () => void;
    total: number;
}
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart from local storage", e);
            }
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addItem = (newItem: CartItem) => {
        setItems((prevItems) => {
            // Find item with same ID AND same color AND same size
            const existingItemIndex = prevItems.findIndex((item) =>
                item.id === newItem.id && item.color === newItem.color && item.size === newItem.size
            );

            if (existingItemIndex > -1) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
                };
                return updatedItems;
            }
            return [...prevItems, newItem];
        });
    };

    const removeItem = (id: number, color?: string, size?: string) => {
        setItems((prevItems) => prevItems.filter((item) => !(item.id === id && item.color === color && item.size === size)));
    };

    const updateQuantity = (id: number, quantity: number, color?: string, size?: string) => {
        if (quantity < 1) return;
        setItems((prevItems) =>
            prevItems.map((item) =>
                (item.id === id && item.color === color && item.size === size) ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
