/**
 * SecureStorage Native Module
 *
 * Unified secure storage with iOS fallback to AsyncStorage.
 * - Android: Uses native encrypted storage (Tink AEAD AES-256-GCM)
 * - iOS: Falls back to AsyncStorage
 */
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { SecureStorageModule } = NativeModules;

export interface SecureStorageInterface {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    getAllKeys(): Promise<string[]>;
    multiGet(keys: string[]): Promise<[string, string | null][]>;
    multiSet(keyValuePairs: [string, string][]): Promise<void>;
    multiRemove(keys: string[]): Promise<void>;
}

/**
 * Check if the native module is available (Android only)
 */
const isNativeAvailable = (): boolean => {
    return Platform.OS === 'android' && SecureStorageModule !== null;
};

/**
 * SecureStorage API with iOS fallback to AsyncStorage
 */
const SecureStorage: SecureStorageInterface = {
    /**
     * Set an item (encrypted on Android, AsyncStorage on iOS)
     */
    async setItem(key: string, value: string): Promise<void> {
        if (isNativeAvailable()) {
            return SecureStorageModule.setItem(key, value);
        }
        // iOS fallback to AsyncStorage
        return AsyncStorage.setItem(key, value);
    },

    /**
     * Get an item (decrypted on Android, AsyncStorage on iOS)
     * Returns null if key doesn't exist
     */
    async getItem(key: string): Promise<string | null> {
        if (isNativeAvailable()) {
            return SecureStorageModule.getItem(key);
        }
        // iOS fallback to AsyncStorage
        return AsyncStorage.getItem(key);
    },

    /**
     * Remove an item
     */
    async removeItem(key: string): Promise<void> {
        if (isNativeAvailable()) {
            return SecureStorageModule.removeItem(key);
        }
        // iOS fallback to AsyncStorage
        return AsyncStorage.removeItem(key);
    },

    /**
     * Clear all stored items
     */
    async clear(): Promise<void> {
        if (isNativeAvailable()) {
            return SecureStorageModule.clear();
        }
        // iOS fallback to AsyncStorage
        return AsyncStorage.clear();
    },

    /**
     * Get all stored keys
     */
    async getAllKeys(): Promise<string[]> {
        if (isNativeAvailable()) {
            return SecureStorageModule.getAllKeys();
        }
        // iOS fallback to AsyncStorage
        const keys = await AsyncStorage.getAllKeys();
        return keys as string[];
    },

    /**
     * Get multiple items at once
     */
    async multiGet(keys: string[]): Promise<[string, string | null][]> {
        if (isNativeAvailable()) {
            return SecureStorageModule.multiGet(keys);
        }
        // iOS fallback to AsyncStorage
        const result = await AsyncStorage.multiGet(keys);
        return result as [string, string | null][];
    },

    /**
     * Set multiple items at once
     */
    async multiSet(keyValuePairs: [string, string][]): Promise<void> {
        if (isNativeAvailable()) {
            return SecureStorageModule.multiSet(keyValuePairs);
        }
        // iOS fallback to AsyncStorage
        return AsyncStorage.multiSet(keyValuePairs);
    },

    /**
     * Remove multiple items at once
     */
    async multiRemove(keys: string[]): Promise<void> {
        if (isNativeAvailable()) {
            return SecureStorageModule.multiRemove(keys);
        }
        // iOS fallback to AsyncStorage
        return AsyncStorage.multiRemove(keys);
    },
};

export default SecureStorage;
