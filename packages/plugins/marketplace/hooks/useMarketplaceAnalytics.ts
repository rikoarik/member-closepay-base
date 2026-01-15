import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = '@marketplace_search_history';
const USER_PREFS_KEY = '@marketplace_user_prefs';

interface UserPreferences {
    frequentCategories: Record<string, number>; // Category ID -> Count
    recentCategories: string[]; // List of recently viewed category IDs
}

export const useMarketplaceAnalytics = () => {
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [userPrefs, setUserPreferences] = useState<UserPreferences>({
        frequentCategories: {},
        recentCategories: [],
    });

    // Load data on mount
    useEffect(() => {
        loadAnalyticsData();
    }, []);

    const loadAnalyticsData = async () => {
        try {
            const [historyJson, prefsJson] = await Promise.all([
                AsyncStorage.getItem(SEARCH_HISTORY_KEY),
                AsyncStorage.getItem(USER_PREFS_KEY),
            ]);

            if (historyJson) {
                setSearchHistory(JSON.parse(historyJson));
            }

            if (prefsJson) {
                setUserPreferences(JSON.parse(prefsJson));
            }
        } catch (error) {
            console.error('Failed to load marketplace analytics', error);
        }
    };

    const trackSearch = useCallback(async (keyword: string) => {
        if (!keyword.trim()) return;

        try {
            const normalizedKeyword = keyword.trim();

            setSearchHistory(prev => {
                // Remove existing if present to move it to top
                const filtered = prev.filter(k => k.toLowerCase() !== normalizedKeyword.toLowerCase());
                // Add to front, limit to 10
                const updated = [normalizedKeyword, ...filtered].slice(0, 10);

                AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
                return updated;
            });
        } catch (error) {
            console.error('Failed to save search history', error);
        }
    }, []);

    const clearSearchHistory = useCallback(async () => {
        try {
            await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
            setSearchHistory([]);
        } catch (error) {
            console.error('Failed to clear search history', error);
        }
    }, []);

    const trackViewProduct = useCallback(async (categoryId: string) => {
        if (!categoryId) return;

        try {
            setUserPreferences(prev => {
                const newFreq = { ...prev.frequentCategories };
                newFreq[categoryId] = (newFreq[categoryId] || 0) + 1;

                const newRecent = [categoryId, ...prev.recentCategories.filter(c => c !== categoryId)].slice(0, 5);

                const updated = {
                    frequentCategories: newFreq,
                    recentCategories: newRecent,
                };

                AsyncStorage.setItem(USER_PREFS_KEY, JSON.stringify(updated));
                return updated;
            });
        } catch (error) {
            console.error('Failed to track product view', error);
        }
    }, []);

    const getRecommendations = useCallback(() => {
        // Simple recommendation algorithm:
        // 1. Return recent categories as "Trending for you"
        // 2. We could map category IDs to names if we had the master list here,
        //    but for now we'll just expose the IDs or rely on the caller to map them.

        // Suggest top 3 most visited categories
        const topCategories = Object.entries(userPrefs.frequentCategories)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([id]) => id);

        return {
            history: searchHistory,
            topCategories,
            recentCategories: userPrefs.recentCategories,
        };
    }, [searchHistory, userPrefs]);

    return {
        searchHistory,
        trackSearch,
        clearSearchHistory,
        trackViewProduct,
        getRecommendations,
    };
};
