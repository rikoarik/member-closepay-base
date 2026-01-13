/**
 * Shared Marketplace Data Hook
 * Hook untuk mendapatkan data produk marketplace dengan pagination
 */
import { useMemo } from 'react';
import { Product } from '../products/ProductCard';

const BATCH_SIZE = 20;

const categories = [
  'Semua',
  'Elektronik',
  'Fashion',
  'Makanan',
  'Kesehatan',
  'Olahraga',
  'Perawatan',
  'Aksesoris',
  'Rumah Tangga',
];

const productNames = [
  'Smartphone Samsung Galaxy',
  'Laptop ASUS ROG',
  'Sepatu Running Nike',
  'Tas Ransel Eiger',
  'Kamera Canon DSLR',
  'Headphone Sony',
  'Jam Tangan Casio',
  'Baju Kemeja Pria',
  'Dress Wanita Elegan',
  'Sepatu Sneakers Adidas',
  'Laptop MacBook Pro',
  'Mouse Logitech',
  'Keyboard Mechanical',
  'Monitor LG UltraWide',
  'Speaker JBL Portable',
  'Power Bank Anker',
  'Charger Wireless',
  'Case iPhone Premium',
  'Screen Protector',
  'Kabel USB-C',
  'Router WiFi TP-Link',
  'Smart TV Samsung',
  'Kulkas LG',
  'Mesin Cuci Sharp',
  'Blender Philips',
  'Rice Cooker Cosmos',
  'Set Peralatan Masak',
  'Piring Mangkok Set',
  'Gelas Set',
  'Sprei Bed Cover',
];

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

const generateProductBatch = (startIndex: number, count: number): Product[] => {
  const products: Product[] = [];

  for (let i = startIndex; i < startIndex + count; i++) {
    const categoryIndex = (i % (categories.length - 1)) + 1;
    const category = categories[categoryIndex];
    const nameIndex = i % productNames.length;
    const basePrice = Math.floor(Math.random() * 4900000) + 10000;
    const hasDiscount = Math.random() > 0.6;
    const discount = hasDiscount ? Math.floor(basePrice * 0.1) : 0;
    const price = basePrice - discount;
    const originalPrice = hasDiscount ? basePrice : undefined;
    const rating = Math.random() * 1.5 + 3.5;
    // Generate sold count dengan beberapa produk yang sangat laris (untuk best sellers)
    const sold = i < 10 
      ? Math.floor(Math.random() * 5000) + 1000  // Produk pertama lebih laris
      : Math.floor(Math.random() * 1000);
    const storeName = storeNames[i % storeNames.length];

    products.push({
      id: `product-${i + 1}`,
      name: `${productNames[nameIndex]} ${i + 1}`,
      price,
      originalPrice,
      imageUrl: `https://picsum.photos/id/${1000 + (i % 50)}/400/400`,
      rating: parseFloat(rating.toFixed(1)),
      sold,
      category,
      discount: hasDiscount ? discount : undefined,
      storeName,
    });
  }

  return products;
};

/**
 * Hook untuk mendapatkan data produk marketplace
 * @param limit - Jumlah produk yang diambil
 * @param isActive - Apakah tab aktif (untuk optimasi)
 * @param isVisible - Apakah tab visible (untuk optimasi)
 * @param refreshKey - Key untuk force refresh data (ubah nilai ini untuk refresh)
 */
export const useMarketplaceData = (
  limit?: number,
  isActive: boolean = true,
  isVisible: boolean = true,
  refreshKey?: number
): Product[] => {
  return useMemo(() => {
    if (!isActive && !isVisible) return [];
    
    const products: Product[] = [];
    const batchesToLoad = limit ? Math.ceil(limit / BATCH_SIZE) : 1;
    
    for (let i = 0; i < batchesToLoad; i++) {
      const startIndex = i * BATCH_SIZE;
      const count = limit && (i + 1) * BATCH_SIZE > limit 
        ? limit - i * BATCH_SIZE 
        : BATCH_SIZE;
      products.push(...generateProductBatch(startIndex, count));
    }
    
    return limit ? products.slice(0, limit) : products;
  }, [limit, isActive, isVisible, refreshKey]);
};

/**
 * Get all available categories
 */
export const getCategories = (): string[] => {
  return categories;
};
