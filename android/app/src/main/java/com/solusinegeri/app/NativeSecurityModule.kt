package com.solusinegeri.app

/**
 * Native Security Module
 * 
 * DISABLED: Native C++ library removed for simplicity.
 * All config now uses Kotlin fallback in SecureConfig.kt
 */
object NativeSecurityModule {
    
    /**
     * Always returns false - native library disabled
     */
    fun isAvailable(): Boolean = false
    
    // Stub implementations (never called since isAvailable() = false)
    fun getApiHostname(env: String): String = ""
    fun getCertificatePins(): Array<String> = emptyArray()
    fun getKeysetName(): String = ""
    fun getPreferenceFile(): String = ""
    fun getMasterKeyUri(): String = ""
    fun verifyIntegrity(context: android.content.Context): Boolean = true
}

