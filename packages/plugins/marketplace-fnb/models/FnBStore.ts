/**
 * FnB Store Model
 * Represents a food/beverage store with operating hours and delivery settings
 */

import type { OrderType } from './FnBOrder';

export interface OperatingHour {
    dayOfWeek: number; // 0=Sunday, 1=Monday, 2=Tuesday...
    openTime: string; // "08:00"
    closeTime: string; // "22:00"
    isClosed: boolean; // for holidays
}

export interface DeliverySettings {
    enabled: boolean;
    radius?: number; // in km, null = no limit
    fee: number;
    freeDeliveryMinAmount?: number;
}

export interface FnBStore {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    address: string;
    operatingHours: OperatingHour[];
    isOpen: boolean; // calculated based on current time
    delivery: DeliverySettings;
    orderTypes: OrderType[];
}

/**
 * QR Code data format (1 QR per store)
 */
export interface FnBQRData {
    type: 'fnb-store';
    storeId: string;
    storeName: string;
}

/**
 * Check if store is currently open based on operating hours
 */
export const isStoreOpen = (store: FnBStore): boolean => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const todayHours = store.operatingHours.find((h) => h.dayOfWeek === dayOfWeek);

    if (!todayHours || todayHours.isClosed) {
        return false;
    }

    return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
};

/**
 * Parse QR code string to FnBQRData
 */
export const parseFnBQRCode = (qrString: string): FnBQRData | null => {
    try {
        // Try URL format: closepay://fnb/store-id
        if (qrString.startsWith('closepay://fnb/')) {
            const storeId = qrString.replace('closepay://fnb/', '').split('/')[0];
            return {
                type: 'fnb-store',
                storeId,
                storeName: '', // Will be fetched from API
            };
        }

        // Try JSON format
        const data = JSON.parse(qrString);
        if (data.type === 'fnb-store' && data.storeId) {
            return data as FnBQRData;
        }

        return null;
    } catch {
        return null;
    }
};
