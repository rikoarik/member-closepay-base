/**
 * useFnBData Hook
 * Fetches and manages FnB menu data with mock data for development
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FnBItem, FnBCategory, FnBStore, EntryPoint } from '../models';

// Mock data for development
const MOCK_CATEGORIES: FnBCategory[] = [
    { id: 'all', name: 'Semua', itemCount: 20 },
    { id: 'food', name: 'Makanan', icon: '🍔', itemCount: 12 },
    { id: 'drink', name: 'Minuman', icon: '🥤', itemCount: 6 },
    { id: 'snack', name: 'Snack', icon: '🍿', itemCount: 2 },
];

const MOCK_ITEMS: FnBItem[] = [
    {
        id: '1',
        name: 'Nasi Goreng Spesial',
        description: 'Nasi goreng dengan telur, ayam, dan sayuran segar',
        price: 25000,
        imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
        category: 'food',
        rating: 4.8,
        sold: 150,
        isAvailable: true,
        preparationTime: 15,
        variants: [
            { id: 'v1', name: 'Porsi Reguler', price: 0 },
            { id: 'v2', name: 'Porsi Jumbo', price: 10000 },
        ],
        addons: [
            { id: 'a1', name: 'Telur Mata Sapi', price: 5000 },
            { id: 'a2', name: 'Kerupuk', price: 3000 },
        ],
    },
    {
        id: '2',
        name: 'Mie Ayam Bakso',
        description: 'Mie ayam dengan bakso sapi dan pangsit',
        price: 20000,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        category: 'food',
        rating: 4.6,
        sold: 120,
        isAvailable: true,
        preparationTime: 10,
    },
    {
        id: '3',
        name: 'Ayam Geprek',
        description: 'Ayam crispy dengan sambal geprek pedas',
        price: 22000,
        imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400',
        category: 'food',
        rating: 4.7,
        sold: 200,
        isAvailable: true,
        preparationTime: 12,
        variants: [
            { id: 'v1', name: 'Level 1', price: 0 },
            { id: 'v2', name: 'Level 2', price: 0 },
            { id: 'v3', name: 'Level 3', price: 2000 },
        ],
    },
    {
        id: '4',
        name: 'Sate Ayam',
        description: '10 tusuk sate ayam dengan bumbu kacang',
        price: 30000,
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
        category: 'food',
        rating: 4.9,
        sold: 180,
        isAvailable: true,
        preparationTime: 20,
    },
    {
        id: '5',
        name: 'Es Teh Manis',
        description: 'Teh manis dingin segar',
        price: 8000,
        imageUrl: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400',
        category: 'drink',
        rating: 4.5,
        sold: 300,
        isAvailable: true,
        preparationTime: 3,
    },
    {
        id: '6',
        name: 'Es Jeruk',
        description: 'Jus jeruk segar dengan es',
        price: 12000,
        imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
        category: 'drink',
        rating: 4.6,
        sold: 150,
        isAvailable: true,
        preparationTime: 5,
    },
    {
        id: '7',
        name: 'Kopi Susu',
        description: 'Kopi dengan susu segar',
        price: 15000,
        imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
        category: 'drink',
        rating: 4.7,
        sold: 250,
        isAvailable: true,
        preparationTime: 5,
    },
    {
        id: '8',
        name: 'Kentang Goreng',
        description: 'French fries crispy dengan saus',
        price: 18000,
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
        category: 'snack',
        rating: 4.4,
        sold: 80,
        isAvailable: true,
        preparationTime: 8,
    },
    {
        id: '9',
        name: 'Burger Classic',
        description: 'Burger daging sapi dengan keju dan sayuran',
        price: 35000,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        category: 'food',
        rating: 4.8,
        sold: 95,
        isAvailable: true,
        preparationTime: 15,
        variants: [
            { id: 'v1', name: 'Single Patty', price: 0 },
            { id: 'v2', name: 'Double Patty', price: 15000 },
        ],
    },
    {
        id: '10',
        name: 'Pizza Margherita',
        description: 'Pizza dengan tomat, mozzarella, dan basil',
        price: 50000,
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
        category: 'food',
        rating: 4.9,
        sold: 70,
        isAvailable: false, // Sold out
        preparationTime: 25,
    },
];

const MOCK_STORE: FnBStore = {
    id: 'store-001',
    name: 'Warung Makan Sederhana',
    description: 'Menyajikan makanan rumahan dengan cita rasa autentik',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
    address: 'Jl. Contoh No. 123, Jakarta',
    operatingHours: [
        { dayOfWeek: 0, openTime: '10:00', closeTime: '21:00', isClosed: false },
        { dayOfWeek: 1, openTime: '08:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 2, openTime: '08:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 3, openTime: '08:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 4, openTime: '08:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 5, openTime: '08:00', closeTime: '23:00', isClosed: false },
        { dayOfWeek: 6, openTime: '08:00', closeTime: '23:00', isClosed: false },
    ],
    isOpen: true,
    delivery: {
        enabled: true,
        radius: 10,
        fee: 10000,
        freeDeliveryMinAmount: 100000,
    },
    orderTypes: ['dine-in', 'take-away', 'delivery'],
};

interface UseFnBDataReturn {
    items: FnBItem[];
    categories: FnBCategory[];
    store: FnBStore | null;
    loading: boolean;
    error: string | null;
    selectedCategory: string;
    setSelectedCategory: (categoryId: string) => void;
    filteredItems: FnBItem[];
    refresh: () => Promise<void>;
    entryPoint: EntryPoint;
    setEntryPoint: (entry: EntryPoint) => void;
}

export const useFnBData = (initialEntryPoint: EntryPoint = 'browse'): UseFnBDataReturn => {
    const [items, setItems] = useState<FnBItem[]>([]);
    const [categories, setCategories] = useState<FnBCategory[]>([]);
    const [store, setStore] = useState<FnBStore | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [entryPoint, setEntryPoint] = useState<EntryPoint>(initialEntryPoint);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Simulate API call
            await new Promise<void>((resolve) => setTimeout(resolve, 800));

            setItems(MOCK_ITEMS);
            setCategories(MOCK_CATEGORIES);
            setStore(MOCK_STORE);
        } catch (err) {
            setError('Gagal memuat data menu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredItems = useMemo(() => {
        if (selectedCategory === 'all') {
            return items;
        }
        return items.filter((item) => item.category === selectedCategory);
    }, [items, selectedCategory]);

    const refresh = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    return {
        items,
        categories,
        store,
        loading,
        error,
        selectedCategory,
        setSelectedCategory,
        filteredItems,
        refresh,
        entryPoint,
        setEntryPoint,
    };
};
