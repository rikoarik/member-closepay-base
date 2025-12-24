/**
 * Clipboard Native Module
 *
 * Replaces @react-native-clipboard/clipboard
 * Note: Clipboard is NOT encrypted as it needs to interop with other apps
 */
import { NativeModules, Platform } from 'react-native';

const { ClipboardModule } = NativeModules;

export interface ClipboardInterface {
    setString(text: string): void;
    getString(): Promise<string>;
    hasString(): Promise<boolean>;
    hasURL(): Promise<boolean>;
}

/**
 * Check if the native module is available
 */
const isAvailable = (): boolean => {
    return Platform.OS === 'android' && ClipboardModule !== null;
};

/**
 * Clipboard API
 */
const Clipboard: ClipboardInterface = {
    /**
     * Set string to clipboard
     */
    setString(text: string): void {
        if (!isAvailable()) {
            console.warn('Clipboard is not available on this platform');
            return;
        }
        ClipboardModule.setString(text);
    },

    /**
     * Get string from clipboard
     */
    async getString(): Promise<string> {
        if (!isAvailable()) {
            return '';
        }
        return ClipboardModule.getString();
    },

    /**
     * Check if clipboard has string content
     */
    async hasString(): Promise<boolean> {
        if (!isAvailable()) {
            return false;
        }
        return ClipboardModule.hasString();
    },

    /**
     * Check if clipboard has URL
     */
    async hasURL(): Promise<boolean> {
        if (!isAvailable()) {
            return false;
        }
        return ClipboardModule.hasURL();
    },
};

export default Clipboard;
