package com.solusinegeri.app

import android.content.Context
import com.facebook.react.modules.network.OkHttpClientFactory
import com.facebook.react.modules.network.OkHttpClientProvider
import okhttp3.OkHttpClient

/**
 * Custom Network Module for OkHttp Configuration
 * 
 * IMPORTANT: Chucker is only enabled in DEBUG builds
 * In RELEASE builds, this will use plain OkHttpClient without any interceptors
 */
class CustomNetworkModule(private val context: Context) : OkHttpClientFactory {
    override fun createNewNetworkModuleClient(): OkHttpClient {
        val builder = OkHttpClientProvider.createClientBuilder()

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
