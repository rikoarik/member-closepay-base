/**
 * FnB Item Model
 * Represents a food/beverage item in the marketplace
 */

export interface FnBVariant {
    id: string;
    name: string;
    price: number;
}

export interface FnBAddon {
    id: string;
    name: string;
    price: number;
}

export interface FnBItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    category: string;
    rating?: number;
    sold?: number;
    isAvailable: boolean;
    preparationTime?: number; // in minutes
    variants?: FnBVariant[];
    addons?: FnBAddon[];
}
