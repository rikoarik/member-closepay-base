package com.solusinegeri.app

import android.content.Context
import android.util.Base64
import com.google.crypto.tink.Aead
import com.google.crypto.tink.KeyTemplates
import com.google.crypto.tink.aead.AeadConfig
import com.google.crypto.tink.integration.android.AndroidKeysetManager

/**
 * Secure Configuration Storage
 * 
 * Runtime secret retrieval with native layer priority.
 * Falls back to Kotlin if native library unavailable.
 */
object SecureConfig {
    
    // Fallback data (used only if native lib fails to load)
    private object FallbackData {
        fun getApiProd() = "api.solusiuntuknegeri.com"
        fun getApiStg() = "api.stg.solusiuntuknegeri.com"
        fun getPin1() = "sha256/cCZ/uMd/qFD4cMVMg8y5w99JpiGeT/sSTiPeB1mu/Ec="
        fun getPin2() = "sha256/9Fk6HgfMnM7/vtnBHcUhg1b3gU2bIpSd50XmKZkMbGA="
    }
    
    /**
     * Get the production API hostname
     */
    fun getApiHostname(): String {
        return try {
            if (NativeSecurityModule.isAvailable()) {
                NativeSecurityModule.getApiHostname("production")
            } else {
                FallbackData.getApiProd()
            }
        } catch (e: Exception) {
            FallbackData.getApiProd()
        }
    }
    
    /**
     * Get the staging API hostname
     */
    fun getApiStgHostname(): String {
        return try {
            if (NativeSecurityModule.isAvailable()) {
                NativeSecurityModule.getApiHostname("staging")
            } else {
                FallbackData.getApiStg()
            }
        } catch (e: Exception) {
            FallbackData.getApiStg()
        }
    }
    
    /**
     * Get the leaf certificate pin
     */
    fun getPinLeafCert(): String {
        return try {
            if (NativeSecurityModule.isAvailable()) {
                NativeSecurityModule.getCertificatePins()[0]
            } else {
                FallbackData.getPin1()
            }
        } catch (e: Exception) {
            FallbackData.getPin1()
        }
    }
    
    /**
     * Get the intermediate certificate pin
     */
    fun getPinIntermediate(): String {
        return try {
            if (NativeSecurityModule.isAvailable()) {
                NativeSecurityModule.getCertificatePins()[1]
            } else {
                FallbackData.getPin2()
            }
        } catch (e: Exception) {
            FallbackData.getPin2()
        }
    }
    
    /**
     * Get the full API base URL (production)
     */
    fun getApiBaseUrl(): String {
        return "https://" + getApiHostname()
    }
    
    /**
     * Get the full API base URL (staging)
     */
    fun getApiStgBaseUrl(): String {
        return "https://" + getApiStgHostname()
    }
    
    /**
     * Get current environment based on build variant
     */
    fun getEnv(): String {
        return if (BuildConfig.DEBUG) {
            "staging"
        } else {
            try {
                val flavor = BuildConfig::class.java.getField("FLAVOR").get(null) as? String
                if (flavor?.contains("staging", ignoreCase = true) == true) {
                    "staging"
                } else {
                    "production"
                }
            } catch (e: Exception) {
                "production"
            }
        }
    }
    
    /**
     * Get current API base URL based on environment
     */
    fun getCurrentApiBaseUrl(): String {
        return if (getEnv() == "staging") {
            getApiStgBaseUrl()
        } else {
            getApiBaseUrl()
        }
    }
}
