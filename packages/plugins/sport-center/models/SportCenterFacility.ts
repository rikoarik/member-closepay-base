/**
 * Sport Center Facility Model
 */

export type SportCenterCategory = 'gym' | 'court' | 'pool';

export type SportType = 'futsal' | 'badminton' | 'tenis' | 'gym' | 'pool';

export interface SportCenterFacility {
  id: string;
  name: string;
  category: SportCenterCategory;
  sportType?: SportType;
  description?: string;
  imageUrl?: string;
  images?: string[];
  rating: number;
  distance: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  address?: string;
  amenities?: string[];
  amenityIcons?: { id: 'toilet' | 'parkir' | 'musholla'; labelKey: string }[];
  courts?: { id: string; name: string }[];
  pricePerSlot?: number;
}
