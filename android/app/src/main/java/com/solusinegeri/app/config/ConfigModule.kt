package com.solusinegeri.app.config

import com.facebook.react.bridge.*

/**
 * Config Module
 * 
 * Exposes SecureConfig to React Native, replacing react-native-config
 * All config values are obfuscated and decrypted at runtime
 */
class ConfigModule(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "ConfigModule"
    }

    override fun getName(): String = "ConfigModule"

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun get(key: String): String? {
        return when (key) {
            "API_URL", "API_HOSTNAME" -> SecureConfig.getApiHostname()
            "API_STG_URL", "API_STG_HOSTNAME" -> SecureConfig.getApiStgHostname()
            "API_BASE_URL" -> SecureConfig.getCurrentApiBaseUrl()
            "API_STG_BASE_URL" -> SecureConfig.getApiStgBaseUrl()
            "API_PROD_BASE_URL" -> SecureConfig.getApiBaseUrl()
            "PIN_LEAF_CERT" -> SecureConfig.getPinLeafCert()
            "PIN_INTERMEDIATE" -> SecureConfig.getPinIntermediate()
            "ENV" -> SecureConfig.getEnv()
            else -> null
        }
    }

    /**
     * Get config value async
     */
    @ReactMethod
    fun getAsync(key: String, promise: Promise) {
        try {
            val value = get(key)
            promise.resolve(value)
        } catch (e: Exception) {
            promise.reject("CONFIG_ERROR", "Failed to get config: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getAll(promise: Promise) {
        try {
            val map = Arguments.createMap()
            map.putString("API_URL", SecureConfig.getApiHostname())
            map.putString("API_HOSTNAME", SecureConfig.getApiHostname())
            map.putString("API_STG_URL", SecureConfig.getApiStgHostname())
            map.putString("API_STG_HOSTNAME", SecureConfig.getApiStgHostname())
            map.putString("API_BASE_URL", SecureConfig.getCurrentApiBaseUrl())
            map.putString("API_STG_BASE_URL", SecureConfig.getApiStgBaseUrl())
            map.putString("API_PROD_BASE_URL", SecureConfig.getApiBaseUrl())
            map.putString("PIN_LEAF_CERT", SecureConfig.getPinLeafCert())
            map.putString("PIN_INTERMEDIATE", SecureConfig.getPinIntermediate())
            map.putString("ENV", SecureConfig.getEnv())
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("CONFIG_ERROR", "Failed to get all config: ${e.message}", e)
        }
    }

    override fun getConstants(): Map<String, Any?> {
        return mapOf(
            "API_URL" to SecureConfig.getApiHostname(),
            "API_HOSTNAME" to SecureConfig.getApiHostname(),
            "API_STG_URL" to SecureConfig.getApiStgHostname(),
            "API_STG_HOSTNAME" to SecureConfig.getApiStgHostname(),
            "API_BASE_URL" to SecureConfig.getCurrentApiBaseUrl(),
            "API_STG_BASE_URL" to SecureConfig.getApiStgBaseUrl(),
            "API_PROD_BASE_URL" to SecureConfig.getApiBaseUrl(),
            "PIN_LEAF_CERT" to SecureConfig.getPinLeafCert(),
            "PIN_INTERMEDIATE" to SecureConfig.getPinIntermediate(),
            "ENV" to SecureConfig.getEnv()
        )
    }
}
