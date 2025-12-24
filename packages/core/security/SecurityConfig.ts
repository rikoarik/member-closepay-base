import { TalsecConfig } from 'freerasp-react-native';

import Config from '../native/Config';

/**
 * Security Configuration for Talsec (FreeRASP)
 * 
 * IMPORTANT: You must update the 'certificateHashes' and 'appTeamId' 
 * with your actual production keys for this to work correctly in Release mode.
 * 
 * To get your signing certificate hash:
 * 1. Run: keytool -list -v -keystore your_keystore.keystore -alias your_key_alias
 * 2. Copy the SHA-256 fingerprint
 * 3. Remove colons and convert to Base64:
 *    echo -n "SHA256_FINGERPRINT_WITHOUT_COLONS" | xxd -r -p | base64
 */
export const securityConfig: TalsecConfig = {
  androidConfig: {
    packageName: Config.ENV === 'staging' ? 'com.solusinegeri.app.staging' : 'com.solusinegeri.app',
    // Certificate hash from environment variable (Base64 format)
    certificateHashes: Config.ANDROID_CERTIFICATE_HASH ? [Config.ANDROID_CERTIFICATE_HASH] : [],
    // Supported app stores (Google Play and Huawei AppGallery are built-in)
    supportedAlternativeStores: [
      'com.android.vending',             // Google Play Store (for manual addition)
      'com.huawei.appmarket',            // Huawei AppGallery
      'com.sec.android.app.samsungapps', // Samsung Galaxy Store
    ],
    // Optional: Malware detection configuration
    malwareConfig: {
      // Add package names of known malware apps to blacklist
      blacklistedPackageNames: [],
      // Add SHA-256 hashes of known malware apps to blacklist
      blacklistedHashes: [],
      // Define suspicious permission combinations that may indicate malware
      suspiciousPermissions: [
        ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'],
        ['android.permission.READ_SMS', 'android.permission.SEND_SMS'],
      ],
      // Whitelist trusted installation sources for malware scanning
      whitelistedInstallationSources: [
        'com.android.vending',
        'com.huawei.appmarket',
      ],
    },
  },
  iosConfig: {
    appBundleId: 'com.solusinegeri.app',
    appTeamId: Config.IOS_APP_TEAM_ID || '',
  },
  watcherMail: Config.TALSEC_WATCHER_MAIL || '',
  isProd: Config.ENV === 'production', // true for production builds, false for development
};
