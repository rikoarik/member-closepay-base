package com.solusinegeri.app.security

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import com.facebook.react.bridge.*
import com.google.crypto.tink.Aead
import com.google.crypto.tink.KeyTemplates
import com.google.crypto.tink.aead.AeadConfig
import com.google.crypto.tink.integration.android.AndroidKeysetManager
import java.security.KeyStore
import android.util.Base64

/**
 * Native Crypto Module
 * 
 * Provides secure encryption/decryption using Google Tink AEAD.
 * Keys are stored in Android Keystore (hardware-backed on supported devices).
 */
class NativeCryptoModule(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        // Volatile AEAD instance
        @Volatile
        private var aeadInstance: Aead? = null
        private val lock = Any()
        
        // Get names from native layer if available
        private fun getKeysetName(): String = 
            if (NativeSecurityModule.isAvailable()) NativeSecurityModule.getKeysetName() 
            else "cp_ks_v2"
        
        private fun getPreferenceFile(): String = 
            if (NativeSecurityModule.isAvailable()) NativeSecurityModule.getPreferenceFile() 
            else "cp_pf_v2"
        
        private fun getMasterKeyUri(): String = 
            if (NativeSecurityModule.isAvailable()) NativeSecurityModule.getMasterKeyUri() 
            else "android-keystore://cp_mk_v2"
        
        fun getAead(context: Context): Aead {
            return aeadInstance ?: synchronized(lock) {
                aeadInstance ?: createAead(context).also { aeadInstance = it }
            }
        }
        
        private fun createAead(context: Context): Aead {
            AeadConfig.register()
            
            val keysetHandle = AndroidKeysetManager.Builder()
                .withSharedPref(context, getKeysetName(), getPreferenceFile())
                .withKeyTemplate(KeyTemplates.get("AES256_GCM"))
                .withMasterKeyUri(getMasterKeyUri())
                .build()
                .keysetHandle
            
            return keysetHandle.getPrimitive(Aead::class.java)
        }
    }

    override fun getName(): String = "NativeCryptoModule"

    @ReactMethod
    fun encrypt(plaintext: String, promise: Promise) {
        try {
            val aead = getAead(reactContext)
            val ciphertext = aead.encrypt(
                plaintext.toByteArray(Charsets.UTF_8),
                ByteArray(0)
            )
            val encoded = Base64.encodeToString(ciphertext, Base64.NO_WRAP)
            promise.resolve(encoded)
        } catch (e: Exception) {
            promise.reject("E_ENCRYPT", e.message, e)
        }
    }

    @ReactMethod
    fun decrypt(ciphertext: String, promise: Promise) {
        try {
            val aead = getAead(reactContext)
            val decoded = Base64.decode(ciphertext, Base64.NO_WRAP)
            val plaintext = aead.decrypt(decoded, ByteArray(0))
            promise.resolve(String(plaintext, Charsets.UTF_8))
        } catch (e: Exception) {
            promise.reject("E_DECRYPT", e.message, e)
        }
    }

    @ReactMethod
    fun isAvailable(promise: Promise) {
        try {
            getAead(reactContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }
    
    fun encryptSync(plaintext: String): String {
        val aead = getAead(reactContext)
        val ciphertext = aead.encrypt(
            plaintext.toByteArray(Charsets.UTF_8),
            ByteArray(0)
        )
        return Base64.encodeToString(ciphertext, Base64.NO_WRAP)
    }
    
    fun decryptSync(ciphertext: String): String {
        val aead = getAead(reactContext)
        val decoded = Base64.decode(ciphertext, Base64.NO_WRAP)
        val plaintext = aead.decrypt(decoded, ByteArray(0))
        return String(plaintext, Charsets.UTF_8)
    }
}
