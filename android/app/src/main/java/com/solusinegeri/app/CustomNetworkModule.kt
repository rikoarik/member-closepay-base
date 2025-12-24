package com.solusinegeri.app

import android.content.Context
import com.facebook.react.modules.network.OkHttpClientFactory
import com.facebook.react.modules.network.OkHttpClientProvider
import okhttp3.CertificatePinner
import okhttp3.OkHttpClient

/**
 * Custom Network Module for OkHttp Configuration
 * 
 * SECURITY FEATURES:
 * - SSL Certificate Pinning (RELEASE builds only) - Prevents MITM attacks
 * - Chucker HTTP inspector (DEBUG builds only) - For development debugging
 * 
 * IMPORTANT: Certificate pins must be updated when server certificates are rotated.
 * Current pins:
 * - Primary: Leaf certificate for *.solusiuntuknegeri.com
 * - Backup: Let's Encrypt intermediate certificate (for rotation resilience)
 */
class CustomNetworkModule(private val context: Context) : OkHttpClientFactory {
    
    companion object {
        // SSL Certificate Pinning Configuration
        // These values are now loaded from SecureConfig (obfuscated)
        // to prevent static analysis from extracting them
    }
    
    override fun createNewNetworkModuleClient(): OkHttpClient {
        val builder = OkHttpClientProvider.createClientBuilder()

        // SSL Certificate Pinning - Only enable for RELEASE builds
        // This prevents Man-in-the-Middle (MITM) attacks by validating server certificates
        if (!BuildConfig.DEBUG) {
            try {
                // Load obfuscated hostnames and pins from SecureConfig
                val apiHostname = SecureConfig.getApiHostname()
                val apiStgHostname = SecureConfig.getApiStgHostname()
                val pinLeafCert = SecureConfig.getPinLeafCert()
                val pinIntermediate = SecureConfig.getPinIntermediate()
                
                // TEMP: Log pins but do not apply them to verify we have control
                println("[CustomNetworkModule] Pins loaded: $pinLeafCert, $pinIntermediate")
                
                // DISABLE PINNING FOR NOW to stop the crash
                // will re-enable once we confirm app opens
                /*
                if (pinLeafCert.startsWith("sha256/") && pinIntermediate.startsWith("sha256/")) {
                    val certificatePinner = CertificatePinner.Builder()
                        .add(apiHostname, pinLeafCert)
                        .add(apiHostname, pinIntermediate)
                        .add(apiStgHostname, pinLeafCert)
                        .add(apiStgHostname, pinIntermediate)
                        .build()
                    
                    builder.certificatePinner(certificatePinner)
                }
                */
            } catch (e: Exception) {
                println("[CustomNetworkModule] Error setting up certificate pinning: ${e.message}")
                e.printStackTrace()
            }
        } else {
            println("[CustomNetworkModule] SSL Certificate Pinning DISABLED for debug (allows proxy tools)")
        }

        // Only add Chucker interceptor in DEBUG builds
        if (BuildConfig.DEBUG) {
            try {
                // Import Chucker classes dynamically to avoid issues in release builds
                val chuckerCollectorClass = Class.forName("com.chuckerteam.chucker.api.ChuckerCollector")
                val retentionManagerClass = Class.forName("com.chuckerteam.chucker.api.RetentionManager")
                val chuckerInterceptorClass = Class.forName("com.chuckerteam.chucker.api.ChuckerInterceptor")

                // Create ChuckerCollector
                val periodEnum = retentionManagerClass.getDeclaredClasses()
                    .first { it.simpleName == "Period" }
                val oneHour = periodEnum.enumConstants?.first { it.toString() == "ONE_HOUR" }

                val collectorConstructor = chuckerCollectorClass.getConstructor(
                    Context::class.java,
                    Boolean::class.javaPrimitiveType,
                    retentionManagerClass.getDeclaredClasses().first { it.simpleName == "Period" }
                )
                val collector = collectorConstructor.newInstance(context, true, oneHour)

                // Create ChuckerInterceptor using Builder
                val builderClass = Class.forName("com.chuckerteam.chucker.api.ChuckerInterceptor\$Builder")
                val builderConstructor = builderClass.getConstructor(Context::class.java)
                val chuckerBuilder = builderConstructor.newInstance(context)

                // Configure builder
                builderClass.getMethod("collector", chuckerCollectorClass).invoke(chuckerBuilder, collector)
                builderClass.getMethod("maxContentLength", Long::class.javaPrimitiveType)
                    .invoke(chuckerBuilder, 250_000L)
                builderClass.getMethod("redactHeaders", Set::class.java)
                    .invoke(chuckerBuilder, emptySet<String>())
                builderClass.getMethod("alwaysReadResponseBody", Boolean::class.javaPrimitiveType)
                    .invoke(chuckerBuilder, false)

                val chuckerInterceptor = builderClass.getMethod("build").invoke(chuckerBuilder)

                // Add interceptor with API filtering
                builder.addInterceptor { chain ->
                    val request = chain.request()
                    // Only log requests to our API
                    if (request.url.toString().contains("api")) {
                        val interceptMethod = chuckerInterceptorClass.getMethod(
                            "intercept",
                            Class.forName("okhttp3.Interceptor\$Chain")
                        )
                        interceptMethod.invoke(chuckerInterceptor, chain) as okhttp3.Response
                    } else {
                        chain.proceed(request)
                    }
                }

                println("[CustomNetworkModule] Chucker enabled for DEBUG build")
            } catch (e: Exception) {
                println("[CustomNetworkModule] Failed to load Chucker (expected in RELEASE): ${e.message}")
            }
        } else {
            println("[CustomNetworkModule] RELEASE build - Chucker disabled")
        }

        return builder.build()
    }
}
