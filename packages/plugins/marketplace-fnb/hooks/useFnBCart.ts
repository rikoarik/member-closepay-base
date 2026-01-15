/**
 * useFnBCart Hook
 * Manages cart state for FnB ordering
 */

import { useState, useCallback, useMemo } from 'react';
import type { FnBItem, FnBVariant, FnBAddon, FnBOrderItem, OrderType, EntryPoint } from '../models';
import { getAvailableOrderTypes } from '../models';

export interface CartItem extends FnBOrderItem {
    cartId: string; // Unique ID for cart management
}

interface UseFnBCartReturn {
    cartItems: CartItem[];
    itemCount: number;
    subtotal: number;
    addItem: (
        item: FnBItem,
        quantity: number,
        variant?: FnBVariant,
        addons?: FnBAddon[],
        notes?: string
    ) => void;
    removeItem: (cartId: string) => void;
    updateQuantity: (cartId: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: (deliveryFee?: number, serviceFee?: number) => number;
    availableOrderTypes: OrderType[];
    // New: Simple item quantity management by item ID
    getItemQuantity: (itemId: string) => number;
    incrementItem: (item: FnBItem) => void;
    decrementItem: (itemId: string) => void;
    updateItem: (
        cartId: string,
        quantity: number,
        variant?: FnBVariant,
        addons?: FnBAddon[],
        notes?: string
    ) => void;
}

export const useFnBCart = (entryPoint: EntryPoint = 'browse'): UseFnBCartReturn => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const availableOrderTypes = useMemo(() => {
        return getAvailableOrderTypes(entryPoint);
    }, [entryPoint]);

    const calculateSubtotal = useCallback(
        (item: FnBItem, quantity: number, variant?: FnBVariant, addons?: FnBAddon[]): number => {
            let itemPrice = item.price;

            // Add variant price
            if (variant) {
                itemPrice += variant.price;
            }

            // Add addons price
            if (addons && addons.length > 0) {
                const addonsTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
                itemPrice += addonsTotal;
            }

            return itemPrice * quantity;
        },
        []
    );

    const addItem = useCallback(
        (
            item: FnBItem,
            quantity: number,
            variant?: FnBVariant,
            addons?: FnBAddon[],
            notes?: string
        ) => {
            const cartId = `${item.id}-${Date.now()}`;
            const subtotal = calculateSubtotal(item, quantity, variant, addons);

            const newCartItem: CartItem = {
                cartId,
                item,
                quantity,
                variant,
                addons,
                notes,
                subtotal,
            };

            setCartItems((prev) => [...prev, newCartItem]);
        },
        [calculateSubtotal]
    );

    const removeItem = useCallback((cartId: string) => {
        setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
    }, []);

    const updateQuantity = useCallback(
        (cartId: string, quantity: number) => {
            if (quantity <= 0) {
                removeItem(cartId);
                return;
            }

            setCartItems((prev) =>
                prev.map((cartItem) => {
                    if (cartItem.cartId === cartId) {
                        const newSubtotal = calculateSubtotal(
                            cartItem.item,
                            quantity,
                            cartItem.variant,
                            cartItem.addons
                        );
                        return { ...cartItem, quantity, subtotal: newSubtotal };
                    }
                    return cartItem;
                })
            );
        },
        [calculateSubtotal, removeItem]
    );

    // Update item details (variant, addons, notes)
    const updateItem = useCallback(
        (
            cartId: string,
            quantity: number,
            variant?: FnBVariant,
            addons?: FnBAddon[],
            notes?: string
        ) => {
            setCartItems((prev) =>
                prev.map((cartItem) => {
                    if (cartItem.cartId === cartId) {
                        const newSubtotal = calculateSubtotal(
                            cartItem.item,
                            quantity,
                            variant,
                            addons
                        );
                        return {
                            ...cartItem,
                            quantity,
                            variant,
                            addons,
                            notes,
                            subtotal: newSubtotal,
                        };
                    }
                    return cartItem;
                })
            );
        },
        [calculateSubtotal]
    );

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    // Get total quantity of a specific item (by item ID, not cart ID)
    const getItemQuantity = useCallback(
        (itemId: string): number => {
            return cartItems
                .filter((cartItem) => cartItem.item.id === itemId)
                .reduce((sum, cartItem) => sum + cartItem.quantity, 0);
        },
        [cartItems]
    );

    // Simple increment - adds 1 to existing item or creates new cart entry
    const incrementItem = useCallback(
        (item: FnBItem) => {
            // Find existing cart item without variants/addons
            const existingItem = cartItems.find(
                (cartItem) =>
                    cartItem.item.id === item.id &&
                    !cartItem.variant &&
                    (!cartItem.addons || cartItem.addons.length === 0)
            );

            if (existingItem) {
                updateQuantity(existingItem.cartId, existingItem.quantity + 1);
            } else {
                addItem(item, 1);
            }
        },
        [cartItems, updateQuantity, addItem]
    );

    // Simple decrement - removes 1 from existing item
    const decrementItem = useCallback(
        (itemId: string) => {
            // Find existing cart item without variants/addons
            const existingItem = cartItems.find(
                (cartItem) =>
                    cartItem.item.id === itemId &&
                    !cartItem.variant &&
                    (!cartItem.addons || cartItem.addons.length === 0)
            );

            if (existingItem) {
                if (existingItem.quantity <= 1) {
                    removeItem(existingItem.cartId);
                } else {
                    updateQuantity(existingItem.cartId, existingItem.quantity - 1);
                }
            }
        },
        [cartItems, updateQuantity, removeItem]
    );

    const itemCount = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }, [cartItems]);

    const subtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    }, [cartItems]);

    const getTotal = useCallback(
        (deliveryFee: number = 0, serviceFee: number = 0): number => {
            return subtotal + deliveryFee + serviceFee;
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
        availableOrderTypes,
        getItemQuantity,
        incrementItem,
        decrementItem,
        updateItem,
    };
};
