package com.solusinegeri.app.imagepicker

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.provider.MediaStore
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import java.io.File

class ImagePickerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {
    
    companion object {
        @Volatile
        private var instance: ImagePickerModule? = null
        
        fun getInstance(): ImagePickerModule? = instance
    }
    
    init {
        reactContext.addActivityEventListener(this)
        instance = this
    }

    private var promise: Promise? = null
    private val PICK_IMAGE_REQUEST = 1001
    private val TAKE_PHOTO_REQUEST = 1002
    private val CROP_IMAGE_REQUEST = 1003

    override fun getName(): String {
        return "ImagePickerModule"
    }

    @ReactMethod
    fun pickImage(options: ReadableMap, promise: Promise) {
        this.promise = promise
        
        val currentActivity = reactApplicationContext.currentActivity
        if (currentActivity == null) {
            promise.reject("NO_ACTIVITY", "No current activity found")
            return
        }

        try {
            val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            intent.type = "image/*"
            
            val chooser = Intent.createChooser(intent, "Select Image")
            currentActivity.startActivityForResult(chooser, PICK_IMAGE_REQUEST)
        } catch (e: Exception) {
            promise.reject("PICK_IMAGE_ERROR", "Failed to open image picker", e)
            this.promise = null
        }
    }

    private var photoUri: Uri? = null
    
    @ReactMethod
    fun takePicture(options: ReadableMap, promise: Promise) {
        this.promise = promise
        
        val currentActivity = reactApplicationContext.currentActivity
        if (currentActivity == null) {
            promise.reject("NO_ACTIVITY", "No current activity found")
            return
        }

        try {
            val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
            
            // Create temp file for photo
            val photoFile = File.createTempFile("photo_", ".jpg", currentActivity.cacheDir)
            photoUri = FileProvider.getUriForFile(
                currentActivity,
                "${currentActivity.packageName}.fileprovider",
                photoFile
            )
            
            intent.putExtra(MediaStore.EXTRA_OUTPUT, photoUri)
            intent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            currentActivity.startActivityForResult(intent, TAKE_PHOTO_REQUEST)
        } catch (e: Exception) {
            promise.reject("TAKE_PHOTO_ERROR", "Failed to open camera", e)
            this.promise = null
            photoUri = null
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        handleActivityResult(requestCode, resultCode, data)
    }
    
    override fun onNewIntent(intent: Intent) {
        // Not needed for image picker
    }
    
    private fun handleActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        when (requestCode) {
            PICK_IMAGE_REQUEST -> {
                if (resultCode == Activity.RESULT_OK && data != null) {
                    val imageUri = data.data
                    if (imageUri != null) {
                        startCropActivity(imageUri)
                    } else {
                        promise?.reject("NO_IMAGE", "No image selected")
                        promise = null
                    }
                } else {
                    promise?.reject("CANCELLED", "User cancelled image selection")
                    promise = null
                }
            }
            TAKE_PHOTO_REQUEST -> {
                if (resultCode == Activity.RESULT_OK && photoUri != null) {
                    startCropActivity(photoUri!!)
                    photoUri = null
                } else {
                    promise?.reject("CANCELLED", "User cancelled camera")
                    promise = null
                    photoUri = null
                }
            }
            CROP_IMAGE_REQUEST -> {
                if (resultCode == Activity.RESULT_OK) {
                    // Try to get cropped URI from intent
                    val croppedUri = if (data != null) {
                        data.getParcelableExtra<Uri>("croppedImageUri")
                    } else {
                        null
                    }
                    
                    if (croppedUri != null) {
                        val result = WritableNativeMap()
                        result.putString("uri", croppedUri.toString())
                        promise?.resolve(result)
                    } else {
                        // Fallback: Check if output file exists
                        val currentActivity = reactApplicationContext.currentActivity
                        val cacheDir = currentActivity?.cacheDir
                        if (cacheDir != null) {
                            // Find the cropped file
                            val files = cacheDir.listFiles { _, name -> name.startsWith("cropped_") && name.endsWith(".jpg") }
                            if (files != null && files.isNotEmpty()) {
                                val croppedFile = files[0]
                                val croppedUri = FileProvider.getUriForFile(
                                    currentActivity,
                                    "${currentActivity.packageName}.fileprovider",
                                    croppedFile
                                )
                                val result = WritableNativeMap()
                                result.putString("uri", croppedUri.toString())
                                promise?.resolve(result)
                            } else {
                                promise?.reject("CROP_ERROR", "Failed to get cropped image")
                            }
                        } else {
                            promise?.reject("CROP_ERROR", "Failed to get cropped image")
                        }
                    }
                    promise = null
                } else {
                    promise?.reject("CANCELLED", "User cancelled crop")
                    promise = null
                }
            }
        }
    }

    private fun startCropActivity(imageUri: Uri) {
        val currentActivity = reactApplicationContext.currentActivity
        if (currentActivity == null) {
            promise?.reject("NO_ACTIVITY", "No current activity found")
            promise = null
            return
        }

        try {
            // Convert file:// URI to FileProvider URI if needed
            var inputUri = imageUri
            if (imageUri.scheme == "file") {
                val file = File(imageUri.path ?: "")
                if (file.exists()) {
                    inputUri = FileProvider.getUriForFile(
                        currentActivity,
                        "${currentActivity.packageName}.fileprovider",
                        file
                    )
                }
            }
            
            // Use custom crop activity directly
            val cropIntent = Intent(currentActivity, CropActivity::class.java)
            cropIntent.putExtra("imageUri", inputUri)
            cropIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            currentActivity.startActivityForResult(cropIntent, CROP_IMAGE_REQUEST)
        } catch (e: Exception) {
            promise?.reject("CROP_ERROR", "Failed to start crop activity: ${e.message}", e)
            promise = null
        }
    }
    
    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        // Clear singleton when module is destroyed
        instance = null
    }
}
