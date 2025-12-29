package com.solusinegeri.app.storage

import android.content.Context
import android.content.SharedPreferences
import android.util.Base64
import com.facebook.react.bridge.*
import com.google.crypto.tink.Aead
import com.solusinegeri.app.security.NativeCryptoModule

/**
 * Secure Storage Module
 * 
 * Unified secure storage replacing:
 * - @react-native-async-storage/async-storage
 * - react-native-encrypted-storage
 * 
 * All data is encrypted using Tink AEAD (AES-256-GCM)
 * Keys stored in Android Keystore (hardware-backed)
 */
class SecureStorageModule(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "SecureStorageModule"
        private const val PREFS_NAME = "closepay_secure_storage"
        private const val KEY_PREFIX = "encrypted_"
        
        // Migration prefixes for backward compatibility
        private const val ASYNC_STORAGE_PREFS = "RN_AsyncStorage"
        private const val ENCRYPTED_STORAGE_PREFS = "RNEncryptedStorage"
    }
    
    private val prefs: SharedPreferences by lazy {
        reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
    
    private val aead: Aead by lazy {
        NativeCryptoModule.getAead(reactContext)
    }

    override fun getName(): String = "SecureStorageModule"

    /**
     * Set an item with encryption
     */
    @ReactMethod
    fun setItem(key: String, value: String, promise: Promise) {
        try {
            val encrypted = encrypt(value)
            prefs.edit().putString(KEY_PREFIX + key, encrypted).apply()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SET_ERROR", "Failed to set item: ${e.message}", e)
        }
    }

    /**
     * Get an item and decrypt
     */
    @ReactMethod
    fun getItem(key: String, promise: Promise) {
        try {
            val encrypted = prefs.getString(KEY_PREFIX + key, null)
            if (encrypted == null) {
                // Try migration from old storage
                val migrated = migrateFromOldStorage(key)
                promise.resolve(migrated)
                return
            }
            val decrypted = decrypt(encrypted)
            promise.resolve(decrypted)
        } catch (e: Exception) {
            // If decryption fails, try migration (might be old unencrypted data)
            try {
                val migrated = migrateFromOldStorage(key)
                promise.resolve(migrated)
            } catch (e2: Exception) {
                promise.reject("GET_ERROR", "Failed to get item: ${e.message}", e)
            }
        }
    }

    /**
     * Remove an item
     */
    @ReactMethod
    fun removeItem(key: String, promise: Promise) {
        try {
            prefs.edit().remove(KEY_PREFIX + key).apply()
            // Also remove from old storage if exists
            removeFromOldStorage(key)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("REMOVE_ERROR", "Failed to remove item: ${e.message}", e)
        }
    }

    /**
     * Clear all stored items
     */
    @ReactMethod
    fun clear(promise: Promise) {
        try {
            prefs.edit().clear().apply()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("CLEAR_ERROR", "Failed to clear storage: ${e.message}", e)
        }
    }

    /**
     * Get all keys
     */
    @ReactMethod
    fun getAllKeys(promise: Promise) {
        try {
            val keys = prefs.all.keys
                .filter { it.startsWith(KEY_PREFIX) }
                .map { it.removePrefix(KEY_PREFIX) }
            
            val array = Arguments.createArray()
            keys.forEach { array.pushString(it) }
            promise.resolve(array)
        } catch (e: Exception) {
            promise.reject("KEYS_ERROR", "Failed to get keys: ${e.message}", e)
        }
    }

    /**
     * Multi-get items
     */
    @ReactMethod
    fun multiGet(keys: ReadableArray, promise: Promise) {
        try {
            val result = Arguments.createArray()
            for (i in 0 until keys.size()) {
                val key = keys.getString(i)
                val pair = Arguments.createArray()
                pair.pushString(key)
                
                val encrypted = prefs.getString(KEY_PREFIX + key, null)
                if (encrypted != null) {
                    pair.pushString(decrypt(encrypted))
                } else {
                    pair.pushNull()
                }
                result.pushArray(pair)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("MULTI_GET_ERROR", "Failed to multi-get: ${e.message}", e)
        }
    }

    /**
     * Multi-set items
     */
    @ReactMethod
    fun multiSet(keyValuePairs: ReadableArray, promise: Promise) {
        try {
            val editor = prefs.edit()
            for (i in 0 until keyValuePairs.size()) {
                val pair = keyValuePairs.getArray(i)
                val key = pair?.getString(0) ?: continue
                val value = pair.getString(1) ?: continue
                val encrypted = encrypt(value)
                editor.putString(KEY_PREFIX + key, encrypted)
            }
            editor.apply()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("MULTI_SET_ERROR", "Failed to multi-set: ${e.message}", e)
        }
    }

    /**
     * Multi-remove items
     */
    @ReactMethod
    fun multiRemove(keys: ReadableArray, promise: Promise) {
        try {
            val editor = prefs.edit()
            for (i in 0 until keys.size()) {
                val key = keys.getString(i)
                editor.remove(KEY_PREFIX + key)
            }
            editor.apply()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("MULTI_REMOVE_ERROR", "Failed to multi-remove: ${e.message}", e)
        }
    }

    // ==================== Encryption Helpers ====================

    private fun encrypt(plaintext: String): String {
        val ciphertext = aead.encrypt(
            plaintext.toByteArray(Charsets.UTF_8),
            ByteArray(0) // No associated data
        )
        return Base64.encodeToString(ciphertext, Base64.NO_WRAP)
    }

    private fun decrypt(ciphertext: String): String {
        val decoded = Base64.decode(ciphertext, Base64.NO_WRAP)
        val plaintext = aead.decrypt(decoded, ByteArray(0))
        return String(plaintext, Charsets.UTF_8)
    }

    // ==================== Migration Helpers ====================

    /**
     * Migrate data from old AsyncStorage or EncryptedStorage
     */
    private fun migrateFromOldStorage(key: String): String? {
        // Try AsyncStorage first
        val asyncPrefs = reactContext.getSharedPreferences(ASYNC_STORAGE_PREFS, Context.MODE_PRIVATE)
        var value = asyncPrefs.getString(key, null)
        
        if (value == null) {
            // Try EncryptedStorage
            val encryptedPrefs = reactContext.getSharedPreferences(ENCRYPTED_STORAGE_PREFS, Context.MODE_PRIVATE)
            value = encryptedPrefs.getString(key, null)
        }
        
        if (value != null) {
            // Migrate to new encrypted storage
            val encrypted = encrypt(value)
            prefs.edit().putString(KEY_PREFIX + key, encrypted).apply()
            
            // Remove from old storage
            removeFromOldStorage(key)
        }
        
        return value
    }

    /**
     * Remove from old storage systems
     */
    private fun removeFromOldStorage(key: String) {
        try {
            val asyncPrefs = reactContext.getSharedPreferences(ASYNC_STORAGE_PREFS, Context.MODE_PRIVATE)
            asyncPrefs.edit().remove(key).apply()
            
            val encryptedPrefs = reactContext.getSharedPreferences(ENCRYPTED_STORAGE_PREFS, Context.MODE_PRIVATE)
            encryptedPrefs.edit().remove(key).apply()
        } catch (e: Exception) {
            // Ignore errors during cleanup
        }
    }
}
