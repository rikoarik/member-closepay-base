/**
 * Config Native Module
 *
 * Replaces react-native-config
 * All config values are obfuscated and decrypted at runtime for security
 */
import { NativeModules, Platform } from 'react-native';

const { ConfigModule } = NativeModules;

export interface ConfigInterface {
    API_URL: string;
    API_HOSTNAME: string;
    API_STG_URL: string;
    API_STG_HOSTNAME: string;
    API_BASE_URL: string;
    API_STG_BASE_URL: string;
    API_PROD_BASE_URL: string;
    PIN_LEAF_CERT: string;
    PIN_INTERMEDIATE: string;
    ENV: string;
    ANDROID_CERTIFICATE_HASH?: string;
    IOS_APP_TEAM_ID?: string;
    TALSEC_WATCHER_MAIL?: string;
    [key: string]: string | undefined;
}

/**
 * Check if the native module is available
 */
const isAvailable = (): boolean => {
    return Platform.OS === 'android' && ConfigModule !== null;
};

/**
 * Get a single config value
 */
export const getConfig = (key: string): string | undefined => {
    if (!isAvailable()) {
        console.warn('Config is not available on this platform');
        return undefined;
    }
    return ConfigModule.get(key);
};

/**
 * Get config value async
 */
export const getConfigAsync = async (key: string): Promise<string | undefined> => {
    if (!isAvailable()) {
        return undefined;
    }
    return ConfigModule.getAsync(key);
};

/**
 * Get all config values
 */
export const getAllConfig = async (): Promise<ConfigInterface> => {
    if (!isAvailable()) {
        return {} as ConfigInterface;
    }
    return ConfigModule.getAll();
};

/**
 * Config object with all values (synchronous access via getConstants)
 * This mirrors react-native-config behavior
 */
const Config: ConfigInterface = isAvailable()
    ? (ConfigModule.getConstants() as ConfigInterface)
    : ({} as ConfigInterface);

export default Config;
