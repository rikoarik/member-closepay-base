/**
 * Store Data Hook
 * Hook untuk mendapatkan data toko/store terdekat
 */
import { useMemo } from 'react';
import { Store } from '../stores/StoreCard';

const storeNames = [
  'Toko Elektronik Maju',
  'Fashion Store Premium',
  'Warung Makan Sederhana',
  'Apotek Sehat',
  'Toko Olahraga Fit',
  'Salon Cantik',
  'Toko Aksesoris Trendy',
  'Supermarket Indah',
  'Toko Buku Pintar',
  'Toko Mainan Anak',
];

const storeCategories = [
  'Elektronik',
  'Fashion',
  'Makanan & Minuman',
  'Kesehatan',
  'Olahraga',
  'Kecantikan',
  'Aksesoris',
  'Supermarket',
  'Buku & Alat Tulis',
  'Mainan',
];

const generateStores = (count: number): Store[] => {
  const stores: Store[] = [];

  for (let i = 0; i < count; i++) {
    const nameIndex = i % storeNames.length;
    const rating = Math.random() * 1.5 + 3.5;
    const distance = Math.random() * 10 + 0.5;
    const isOpen = Math.random() > 0.2;

    stores.push({
      id: `store-${i + 1}`,
      name: storeNames[nameIndex],
      imageUrl: `https://picsum.photos/id/${2000 + (i % 30)}/200/200`,
      rating: parseFloat(rating.toFixed(1)),
      distance: parseFloat(distance.toFixed(1)),
      address: `Jl. Contoh No. ${i + 1}, Jakarta`,
      category: storeCategories[nameIndex],
      isOpen,
    });
  }

  return stores.sort((a, b) => (a.distance || 0) - (b.distance || 0));
};

/**
 * Hook untuk mendapatkan data toko terdekat
 */
export const useStoreData = (limit: number = 10): Store[] => {
  return useMemo(() => {
    return generateStores(limit);
  }, [limit]);
};
