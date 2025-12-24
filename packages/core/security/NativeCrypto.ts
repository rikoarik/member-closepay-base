/**
 * Native Crypto Module Bridge
 * 
 * TypeScript wrapper for the NativeCryptoModule native module.
 * Provides secure encryption/decryption using Google Tink AEAD.
 */
import { NativeModules, Platform } from 'react-native';

const { NativeCryptoModule } = NativeModules;

interface NativeCryptoInterface {
    /**
     * Encrypt a plaintext string
     * @param plaintext - The string to encrypt
     * @returns Base64-encoded ciphertext
     */
    encrypt(plaintext: string): Promise<string>;

    /**
     * Decrypt a ciphertext string
     * @param ciphertext - Base64-encoded ciphertext
     * @returns Decrypted plaintext
     */
    decrypt(ciphertext: string): Promise<string>;

    /**
     * Check if native crypto is available
     * @returns true if available
     */
    isAvailable(): Promise<boolean>;
}

/**
 * NativeCrypto service for secure encryption/decryption
 * 
 * Uses Android's native Tink AEAD implementation with keys stored in
 * Android Keystore for hardware-backed security.
 * 
 * @example
 * ```typescript
 * import { NativeCrypto } from '@core/security';
 * 
 * // Encrypt sensitive data
 * const encrypted = await NativeCrypto.encrypt('my-secret');
 * 
 * // Decrypt data
 * const decrypted = await NativeCrypto.decrypt(encrypted);
 * ```
 */
export const NativeCrypto: NativeCryptoInterface = {
    async encrypt(plaintext: string): Promise<string> {
        if (Platform.OS !== 'android') {
            // iOS implementation would go here
            // For now, just return plaintext wrapped to indicate no encryption
            console.warn('[NativeCrypto] Native crypto not available on iOS yet');
            return `UNENCRYPTED:${plaintext}`;
        }

        if (!NativeCryptoModule) {
            console.warn('[NativeCrypto] NativeCryptoModule not available');
            return `UNENCRYPTED:${plaintext}`;
        }

        return NativeCryptoModule.encrypt(plaintext);
    },

    async decrypt(ciphertext: string): Promise<string> {
        if (Platform.OS !== 'android') {
            // Handle unencrypted fallback for iOS
            if (ciphertext.startsWith('UNENCRYPTED:')) {
                return ciphertext.substring(12);
            }
            console.warn('[NativeCrypto] Native crypto not available on iOS yet');
            return ciphertext;
        }

        if (!NativeCryptoModule) {
            // Handle unencrypted fallback
            if (ciphertext.startsWith('UNENCRYPTED:')) {
                return ciphertext.substring(12);
            }
            console.warn('[NativeCrypto] NativeCryptoModule not available');
            return ciphertext;
        }

        return NativeCryptoModule.decrypt(ciphertext);
    },

    async isAvailable(): Promise<boolean> {
        if (Platform.OS !== 'android') {
            return false;
        }

        if (!NativeCryptoModule) {
            return false;
        }

        try {
            return await NativeCryptoModule.isAvailable();
        } catch {
            return false;
        }
    },
};

export default NativeCrypto;
