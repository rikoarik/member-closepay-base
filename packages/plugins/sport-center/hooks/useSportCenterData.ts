/**
 * useSportCenterData Hook
 * Fetches and manages Sport Center facility data with mock data
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SportCenterFacility, SportCenterCategory } from '../models';

export type SportCenterFilterCategory = SportCenterCategory | 'all' | 'futsal' | 'badminton' | 'tenis';

const MOCK_FACILITIES: SportCenterFacility[] = [
  {
    id: 'f1',
    name: 'Fitness First Premium',
    category: 'gym',
    sportType: 'gym',
    description: 'Gym lengkap dengan peralatan modern',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c149e?w=400',
    ],
    amenityIcons: [
      { id: 'toilet', labelKey: 'sportCenter.toilet' },
      { id: 'parkir', labelKey: 'sportCenter.parkir' },
      { id: 'musholla', labelKey: 'sportCenter.musholla' },
    ],
    rating: 4.8,
    distance: '0.5 km',
    isOpen: true,
    openTime: '06:00',
    closeTime: '22:00',
    address: 'Jl. Sudirman No. 123',
    amenities: ['AC', 'Shower', 'Locker'],
    pricePerSlot: 50000,
  },
  {
    id: 'f2',
    name: 'Gym Indo Sehat',
    category: 'gym',
    sportType: 'gym',
    description: 'Gym terjangkau dengan trainer profesional',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149e?w=400',
    rating: 4.5,
    distance: '1.2 km',
    isOpen: true,
    openTime: '07:00',
    closeTime: '21:00',
    address: 'Jl. Pahlawan No. 45',
    amenities: ['AC', 'Shower'],
    pricePerSlot: 35000,
  },
  {
    id: 'f3',
    name: 'Lapangan Bulutangkis Elite',
    category: 'court',
    sportType: 'badminton',
    description: 'Lapangan bulutangkis standar nasional',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24b4a8e?w=400',
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24b4a8e?w=400',
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
    ],
    amenityIcons: [
      { id: 'toilet', labelKey: 'sportCenter.toilet' },
      { id: 'parkir', labelKey: 'sportCenter.parkir' },
      { id: 'musholla', labelKey: 'sportCenter.musholla' },
    ],
    courts: [{ id: 'c1', name: 'Lapangan 1' }, { id: 'c2', name: 'Lapangan 2' }],
    rating: 4.7,
    distance: '0.8 km',
    isOpen: true,
    openTime: '08:00',
    closeTime: '20:00',
    address: 'Komplek Olahraga Kota',
    amenities: ['Parkir', 'Rental raket'],
    pricePerSlot: 80000,
  },
  {
    id: 'f4',
    name: 'Tenis Court Pro',
    category: 'court',
    sportType: 'tenis',
    description: 'Lapangan tenis berpendingin',
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
    rating: 4.9,
    distance: '2.0 km',
    isOpen: false,
    openTime: '09:00',
    closeTime: '18:00',
    address: 'Sports Complex Jaya',
    amenities: ['AC', 'Cafe'],
    pricePerSlot: 120000,
  },
  {
    id: 'f7',
    name: 'Lapangan Futsal Champion',
    category: 'court',
    sportType: 'futsal',
    description: 'Lapangan futsal sintetis berkualitas',
    imageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
    images: [
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
      'https://images.unsplash.com/photo-1626224583764-f87db24b4a8e?w=400',
    ],
    amenityIcons: [
      { id: 'toilet', labelKey: 'sportCenter.toilet' },
      { id: 'parkir', labelKey: 'sportCenter.parkir' },
      { id: 'musholla', labelKey: 'sportCenter.musholla' },
    ],
    courts: [{ id: 'c1', name: 'Lapangan 1' }, { id: 'c2', name: 'Lapangan 2' }],
    rating: 4.6,
    distance: '0.4 km',
    isOpen: true,
    openTime: '06:00',
    closeTime: '22:00',
    address: 'Jl. Olahraga No. 10',
    amenities: ['Parkir', 'Toilet', 'Musholla'],
    pricePerSlot: 60000,
  },
  {
    id: 'f5',
    name: 'Kolam Renang Keluarga',
    category: 'pool',
    sportType: 'pool',
    description: 'Kolam renang indoor dengan berbagai kedalaman',
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400',
    rating: 4.6,
    distance: '0.3 km',
    isOpen: true,
    openTime: '06:00',
    closeTime: '21:00',
    address: 'Jl. Bahari No. 78',
    amenities: ['Locker', 'Shower', 'Kursi santai'],
    pricePerSlot: 25000,
  },
  {
    id: 'f6',
    name: 'Aqua Sport Center',
    category: 'pool',
    sportType: 'pool',
    description: 'Kolam renang Olimpiade & kolam anak',
    imageUrl: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400',
    rating: 4.8,
    distance: '1.5 km',
    isOpen: true,
    openTime: '07:00',
    closeTime: '19:00',
    address: 'Water Park Boulevard',
    amenities: ['Kolam anak', 'Slide', 'Cafe'],
    pricePerSlot: 45000,
  },
];

export const getFacilities = (): SportCenterFacility[] => MOCK_FACILITIES;

export const getFacilitiesByCategory = (
  category: SportCenterFilterCategory
): SportCenterFacility[] => {
  if (category === 'all') return MOCK_FACILITIES;
  if (category === 'futsal' || category === 'badminton' || category === 'tenis') {
    return MOCK_FACILITIES.filter((f) => f.sportType === category);
  }
  return MOCK_FACILITIES.filter((f) => f.category === category);
};

export const getFacilityById = (id: string): SportCenterFacility | undefined => {
  return MOCK_FACILITIES.find((f) => f.id === id);
};

export const getNearbyFacilities = (limit = 3): SportCenterFacility[] => {
  return [...MOCK_FACILITIES].slice(0, limit);
};

export function useSportCenterData(
  selectedCategory: SportCenterFilterCategory = 'all',
  enabled = true
) {
  const [facilities, setFacilities] = useState<SportCenterFacility[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFacilities = useCallback(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const data = getFacilitiesByCategory(selectedCategory);
      setFacilities(data);
      setLoading(false);
    }, 300);
  }, [selectedCategory, enabled]);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  const refresh = useCallback(() => {
    loadFacilities();
  }, [loadFacilities]);

  const nearbyFacilities = useMemo(() => getNearbyFacilities(3), []);

  return {
    facilities,
    loading,
    refresh,
    nearbyFacilities,
    getFacilityById,
  };
}
