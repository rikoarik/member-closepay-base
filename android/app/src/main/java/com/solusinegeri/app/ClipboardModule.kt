package com.solusinegeri.app

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import com.facebook.react.bridge.*

/**
 * Native Clipboard Module
 * 
 * Simple clipboard wrapper to replace @react-native-clipboard/clipboard
 * Note: Clipboard data is NOT encrypted as it needs to interop with other apps
 */
class ClipboardModule(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "ClipboardModule"
        private const val CLIP_LABEL = "Closepay"
    }

    private val clipboardManager: ClipboardManager by lazy {
        reactContext.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    }

    override fun getName(): String = "ClipboardModule"

    /**
     * Set string to clipboard
     */
    @ReactMethod
    fun setString(text: String) {
        val clip = ClipData.newPlainText(CLIP_LABEL, text)
        clipboardManager.setPrimaryClip(clip)
    }

    /**
     * Get string from clipboard
     */
    @ReactMethod
    fun getString(promise: Promise) {
        try {
            val clip = clipboardManager.primaryClip
            if (clip != null && clip.itemCount > 0) {
                val text = clip.getItemAt(0).coerceToText(reactContext).toString()
                promise.resolve(text)
            } else {
                promise.resolve("")
            }
        } catch (e: Exception) {
            promise.reject("CLIPBOARD_ERROR", "Failed to get clipboard: ${e.message}", e)
        }
    }

    /**
     * Check if clipboard has string content
     */
    @ReactMethod
    fun hasString(promise: Promise) {
        try {
            val hasClip = clipboardManager.hasPrimaryClip()
            val isText = clipboardManager.primaryClipDescription?.hasMimeType("text/plain") == true
            promise.resolve(hasClip && isText)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    /**
     * Check if clipboard has URL
     */
    @ReactMethod
    fun hasURL(promise: Promise) {
        try {
            val clip = clipboardManager.primaryClip
            if (clip != null && clip.itemCount > 0) {
                val text = clip.getItemAt(0).coerceToText(reactContext).toString()
                val hasUrl = text.startsWith("http://") || text.startsWith("https://")
                promise.resolve(hasUrl)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }
}
