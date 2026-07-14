'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    color?: string; // Optional color
    size?: string;  // Optional size
}

export interface AppliedCoupon {
    code: string;
    discount_percent: number;
    discount_amount: number;
    owner_name: string;
    owner_role: string;
}

const getApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://127.0.0.1:8000';
    }
    return 'https://aces-backend-pgtot.ondigitalocean.app';
};

const API_BASE_URL = getApiUrl();

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: number, color?: string, size?: string) => void;
    updateQuantity: (id: number, quantity: number, color?: string, size?: string) => void;
    clearCart: () => void;
    total: number;
    lastAddedItem: CartItem | null;
    toastVisible: boolean;
    dismissToast: () => void;
    isCartDrawerOpen: boolean;
    setCartDrawerOpen: (open: boolean) => void;
    
    // Coupon States & Actions
    appliedCoupon: AppliedCoupon | null;
    couponError: string;
    couponLoading: boolean;
    couponCode: string;
    setCouponCode: (code: string) => void;
    applyCoupon: (code: string) => Promise<boolean>;
    removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [isCartDrawerOpen, setCartDrawerOpen] = useState(false);

    // Coupon states
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

    const hydrated = useRef(false);

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
        hydrated.current = true;
    }, []);

    // Save cart to local storage whenever it changes (only after hydration is complete)
    useEffect(() => {
        if (hydrated.current) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items]);

    const addItem = useCallback((newItem: CartItem) => {
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
        setLastAddedItem(newItem);
        setToastVisible(true);
        setCartDrawerOpen(true);
    }, []);

    const dismissToast = useCallback(() => {
        setToastVisible(false);
    }, []);

    const removeItem = useCallback((id: number, color?: string, size?: string) => {
        setItems((prevItems) => prevItems.filter((item) => !(item.id === id && item.color === color && item.size === size)));
    }, []);

    const updateQuantity = useCallback((id: number, quantity: number, color?: string, size?: string) => {
        if (quantity < 1) return;
        setItems((prevItems) =>
            prevItems.map((item) =>
                (item.id === id && item.color === color && item.size === size) ? { ...item, quantity } : item
            )
        );
    }, []);

    const removeCoupon = useCallback(() => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        removeCoupon();
    }, [removeCoupon]);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
        if (!code.trim()) {
            setCouponError('Please enter a coupon code');
            return false;
        }
        setCouponLoading(true);
        setCouponError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/shop/validate-coupon/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code.trim().toUpperCase(),
                    cart_total: total,
                }),
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                setAppliedCoupon({
                    code: data.code,
                    discount_percent: data.discount_percent,
                    discount_amount: data.discount_amount,
                    owner_name: data.owner_name,
                    owner_role: data.owner_role,
                });
                return true;
            } else {
                setCouponError(data.message || 'Invalid coupon code');
                setAppliedCoupon(null);
                return false;
            }
        } catch (err) {
            setCouponError('Failed to validate coupon code. Please try again.');
            setAppliedCoupon(null);
            return false;
        } finally {
            setCouponLoading(false);
        }
    }, [total]);

    // Re-validate coupon when total changes
    const prevTotalRef = useRef(total);
    useEffect(() => {
        if (appliedCoupon && prevTotalRef.current !== total && total > 0) {
            applyCoupon(appliedCoupon.code);
        }
        prevTotalRef.current = total;
    }, [total, appliedCoupon, applyCoupon]);

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            total,
            lastAddedItem,
            toastVisible,
            dismissToast,
            isCartDrawerOpen,
            setCartDrawerOpen,
            appliedCoupon,
            couponError,
            couponLoading,
            couponCode,
            setCouponCode,
            applyCoupon,
            removeCoupon
        }}>
            {children}
        </CartContext.Provider>
    );
};

// Safe defaults for when useCart is called outside a CartProvider (e.g., header on non-shop pages)
const defaultCartContext: CartContextType = {
    items: [],
    addItem: () => { },
    removeItem: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    total: 0,
    lastAddedItem: null,
    toastVisible: false,
    dismissToast: () => { },
    isCartDrawerOpen: false,
    setCartDrawerOpen: () => { },
    appliedCoupon: null,
    couponError: '',
    couponLoading: false,
    couponCode: '',
    setCouponCode: () => { },
    applyCoupon: async () => false,
    removeCoupon: () => { },
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        return defaultCartContext;
    }
    return context;
};
