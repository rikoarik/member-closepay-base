/**
 * useFnBFavorites Hook
 * Manages favorite FnB products with AsyncStorage persistence
 */

import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FnBItem } from '../models';

const FAVORITES_STORAGE_KEY = '@fnb_favorites';
const FAVORITES_ITEMS_STORAGE_KEY = '@fnb_favorites_items';

interface FavoriteItemData {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    rating?: number;
}

interface UseFnBFavoritesReturn {
    favorites: string[]; // Array of favorite item IDs
    favoriteItems: FavoriteItemData[]; // Array of favorite item data for display
    isFavorite: (itemId: string) => boolean;
    toggleFavorite: (item: FnBItem) => void;
    addFavorite: (item: FnBItem) => void;
    removeFavorite: (itemId: string) => void;
    clearFavorites: () => void;
    favoritesCount: number;
}

export const useFnBFavorites = (): UseFnBFavoritesReturn => {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [favoriteItems, setFavoriteItems] = useState<FavoriteItemData[]>([]);

    // Load favorites from storage on mount
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const [storedIds, storedItems] = await Promise.all([
                    AsyncStorage.getItem(FAVORITES_STORAGE_KEY),
                    AsyncStorage.getItem(FAVORITES_ITEMS_STORAGE_KEY),
                ]);
                console.log('[useFnBFavorites] Loaded from storage:', {
                    storedIds,
                    storedItems,
                });
                if (storedIds) {
                    const parsedIds = JSON.parse(storedIds);
                    console.log('[useFnBFavorites] Parsed IDs:', parsedIds);
                    setFavorites(parsedIds);
                }
                if (storedItems) {
                    const parsedItems = JSON.parse(storedItems);
                    console.log('[useFnBFavorites] Parsed Items:', parsedItems);
                    setFavoriteItems(parsedItems);
                }
            } catch (error) {
                console.error('Failed to load favorites:', error);
            }
        };
        loadFavorites();
    }, []);

    // Save to storage
    const saveFavorites = useCallback(async (newFavorites: string[], newItems: FavoriteItemData[]) => {
        try {
            await Promise.all([
                AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites)),
                AsyncStorage.setItem(FAVORITES_ITEMS_STORAGE_KEY, JSON.stringify(newItems)),
            ]);
        } catch (error) {
            console.error('Failed to save favorites:', error);
        }
    }, []);

    const isFavorite = useCallback(
        (itemId: string): boolean => {
            return favorites.includes(itemId);
        },
        [favorites]
    );

    const addFavorite = useCallback(
        (item: FnBItem) => {
            if (!favorites.includes(item.id)) {
                const newFavorites = [...favorites, item.id];
                const newItem: FavoriteItemData = {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    rating: item.rating,
                };
                const newItems = [...favoriteItems, newItem];
                setFavorites(newFavorites);
                setFavoriteItems(newItems);
                saveFavorites(newFavorites, newItems);
            }
        },
        [favorites, favoriteItems, saveFavorites]
    );

    const removeFavorite = useCallback(
        (itemId: string) => {
            const newFavorites = favorites.filter((id) => id !== itemId);
            const newItems = favoriteItems.filter((item) => item.id !== itemId);
            setFavorites(newFavorites);
            setFavoriteItems(newItems);
            saveFavorites(newFavorites, newItems);
        },
        [favorites, favoriteItems, saveFavorites]
    );

    const toggleFavorite = useCallback(
        (item: FnBItem) => {
            if (isFavorite(item.id)) {
                removeFavorite(item.id);
            } else {
                addFavorite(item);
            }
        },
        [isFavorite, addFavorite, removeFavorite]
    );

    const clearFavorites = useCallback(() => {
        setFavorites([]);
        setFavoriteItems([]);
        saveFavorites([], []);
    }, [saveFavorites]);

    return {
        favorites,
        favoriteItems,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        clearFavorites,
        favoritesCount: favorites.length,
    };
};

export default useFnBFavorites;
