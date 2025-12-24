/**
 * SecureStorage Native Module
 *
 * Unified secure storage replacing:
 * - @react-native-async-storage/async-storage
 * - react-native-encrypted-storage
 *
 * All data is encrypted using Tink AEAD (AES-256-GCM)
 */
import { NativeModules, Platform } from 'react-native';

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
 * Check if the native module is available
 */
const isAvailable = (): boolean => {
    return Platform.OS === 'android' && SecureStorageModule !== null;
};

/**
 * SecureStorage API
 */
const SecureStorage: SecureStorageInterface = {
    /**
     * Set an item (encrypted)
     */
    async setItem(key: string, value: string): Promise<void> {
        if (!isAvailable()) {
            throw new Error('SecureStorage is not available on this platform');
        }
        return SecureStorageModule.setItem(key, value);
    },

    /**
     * Get an item (decrypted)
     * Returns null if key doesn't exist
     */
    async getItem(key: string): Promise<string | null> {
        if (!isAvailable()) {
            throw new Error('SecureStorage is not available on this platform');
        }
        return SecureStorageModule.getItem(key);
    },

    /**
     * Remove an item
     */
    async removeItem(key: string): Promise<void> {
        if (!isAvailable()) {
            throw new Error('SecureStorage is not available on this platform');
        }
        return SecureStorageModule.removeItem(key);
    },

    /**
     * Clear all stored items
     */
    async clear(): Promise<void> {
        if (!isAvailable()) {
            throw new Error('SecureStorage is not available on this platform');
        }
        return SecureStorageModule.clear();
    },

    /**
     * Get all stored keys
     */
    async getAllKeys(): Promise<string[]> {
        if (!isAvailable()) {
            throw new Error('SecureStorage is not available on this platform');
        }
        return SecureStorageModule.getAllKeys();
    },

    /**
     * Get multiple items at once
     */
    async multiGet(keys: string[]): Promise<[string, string | null][]> {
        if (!isAvailable()) {
            throw new Error('SecureStorage is not available on this platform');
        }
        return SecureStorageModule.multiGet(keys);
    },

    /**
     * Set multiple items at once
     */
    async multiSet(keyValuePairs: [string, string][]): Promise<void> {
        if (!isAvailable()) {
            throw new Error('SecureStorage is not available on this platform');
        }
        return SecureStorageModule.multiSet(keyValuePairs);
    },

    /**
     * Remove multiple items at once
     */
    async multiRemove(keys: string[]): Promise<void> {
        if (!isAvailable()) {
            throw new Error('SecureStorage is not available on this platform');
        }
        return SecureStorageModule.multiRemove(keys);
    },
};

export default SecureStorage;
