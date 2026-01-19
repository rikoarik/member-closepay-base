/**
 * useMarketplaceCart Hook
 * Manages cart state for marketplace products with AsyncStorage persistence
 * Implements observer pattern for real-time updates across components
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from '../components/shared/ProductCard';

const CART_STORAGE_KEY = '@marketplace_cart';

export interface CartItem {
    cartId: string;
    product: Product;
    quantity: number;
    subtotal: number;
}

interface UseMarketplaceCartReturn {
    cartItems: CartItem[];
    itemCount: number;
    subtotal: number;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (cartId: string) => void;
    updateQuantity: (cartId: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: (shippingFee?: number) => number;
    getItemQuantity: (productId: string) => number;
    incrementItem: (product: Product) => void;
    decrementItem: (productId: string) => void;
}

// Global state
let memoryCart: CartItem[] = [];
let listeners: Array<() => void> = [];
let isInitialized = false;

// Broadcast changes to all listeners
const broadcast = () => {
    listeners.forEach((listener) => listener());
};

// Helper to save cart to storage and update global state
const saveCartToStorage = async (items: CartItem[]) => {
    try {
        memoryCart = items;
        broadcast(); // Notify immediately
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.error('Failed to save cart:', error);
    }
};

export const useMarketplaceCart = (): UseMarketplaceCartReturn => {
    const [cartItems, setCartItems] = useState<CartItem[]>(memoryCart);

    // Initial load from storage
    useEffect(() => {
        const initCart = async () => {
            if (!isInitialized) {
                isInitialized = true; // Mark as initialized to prevent double loading
                try {
                    const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
                    if (stored) {
                        memoryCart = JSON.parse(stored);
                        broadcast();
                    }
                } catch (error) {
                    console.error('Failed to load cart:', error);
                }
            }
        };

        initCart();
    }, []);

    // Subscribe to global state changes
    useEffect(() => {
        const listener = () => {
            setCartItems(memoryCart);
        };

        // Add listener
        listeners.push(listener);

        // Update local state in case it changed before listener was added
        listener();

        // Cleanup
        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    }, []);

    const calculateSubtotal = useCallback(
        (product: Product, quantity: number): number => {
            return product.price * quantity;
        },
        []
    );

    const addItem = useCallback(
        (product: Product, quantity: number = 1) => {
            const currentItems = [...memoryCart];

            // Check if product already exists in cart
            const existingItem = currentItems.find(
                (item) => item.product.id === product.id
            );

            if (existingItem) {
                // Update quantity
                const newQuantity = existingItem.quantity + quantity;
                const newSubtotal = calculateSubtotal(product, newQuantity);

                const newItems = currentItems.map((item) =>
                    item.cartId === existingItem.cartId
                        ? { ...item, quantity: newQuantity, subtotal: newSubtotal }
                        : item
                );
                saveCartToStorage(newItems);
            } else {
                // Add new item
                const cartId = `${product.id}-${Date.now()}`;
                const subtotal = calculateSubtotal(product, quantity);
                const newItem: CartItem = {
                    cartId,
                    product,
                    quantity,
                    subtotal,
                };
                const newItems = [...currentItems, newItem];
                saveCartToStorage(newItems);
            }
        },
        [calculateSubtotal]
    );

    const removeItem = useCallback(
        (cartId: string) => {
            const newItems = memoryCart.filter((item) => item.cartId !== cartId);
            saveCartToStorage(newItems);
        },
        []
    );

    const updateQuantity = useCallback(
        (cartId: string, quantity: number) => {
            if (quantity <= 0) {
                removeItem(cartId);
                return;
            }

            const newItems = memoryCart.map((item) => {
                if (item.cartId === cartId) {
                    const newSubtotal = calculateSubtotal(item.product, quantity);
                    return { ...item, quantity, subtotal: newSubtotal };
                }
                return item;
            });
            saveCartToStorage(newItems);
        },
        [calculateSubtotal, removeItem]
    );

    const clearCart = useCallback(() => {
        saveCartToStorage([]);
    }, []);

    const getItemQuantity = useCallback(
        (productId: string): number => {
            const item = memoryCart.find((item) => item.product.id === productId);
            return item ? item.quantity : 0;
        },
        [cartItems] // Depend on cartItems to force re-render when state changes
    );

    const incrementItem = useCallback(
        (product: Product) => {
            addItem(product, 1);
        },
        [addItem]
    );

    const decrementItem = useCallback(
        (productId: string) => {
            const existingItem = memoryCart.find(
                (item) => item.product.id === productId
            );

            if (existingItem) {
                if (existingItem.quantity <= 1) {
                    removeItem(existingItem.cartId);
                } else {
                    updateQuantity(existingItem.cartId, existingItem.quantity - 1);
                }
            }
        },
        [removeItem, updateQuantity]
    );

    const itemCount = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }, [cartItems]);

    const subtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    }, [cartItems]);

    const getTotal = useCallback(
        (shippingFee: number = 0): number => {
            return subtotal + shippingFee;
        },
        [subtotal]
    );

    return {
        cartItems,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemQuantity,
        incrementItem,
        decrementItem,
    };
};

export default useMarketplaceCart;
