package com.solusinegeri.app

import android.app.Activity
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.graphics.RectF
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.MotionEvent
import android.view.ScaleGestureDetector
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.FileProvider
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.solusinegeri.app.R
import java.io.File
import java.io.FileOutputStream

class CropActivity : Activity() {
    
    private lateinit var imageView: ImageView
    private lateinit var cropOverlay: CropOverlayView
    private lateinit var cropFrame: View
    private lateinit var cropFrameContainer: FrameLayout
    private lateinit var imageContainer: FrameLayout
    private lateinit var toolbar: ViewGroup
    
    // Corner handles
    private lateinit var cornerHandleTopLeft: View
    private lateinit var cornerHandleTopRight: View
    private lateinit var cornerHandleBottomLeft: View
    private lateinit var cornerHandleBottomRight: View
    
    private var imageUri: Uri? = null
    private var originalBitmap: Bitmap? = null
    private var displayBitmap: Bitmap? = null // Bitmap yang ditampilkan (setelah transformasi)
    private var imageMatrix: Matrix = Matrix()
    private var currentScale: Float = 1f
    private var currentTranslateX: Float = 0f
    private var currentTranslateY: Float = 0f
    
    private var lastTouchX: Float = 0f
    private var lastTouchY: Float = 0f
    private var isDragging: Boolean = false
    private var isResizing: Boolean = false
    private var isZooming: Boolean = false
    private var resizeCorner: Int = -1 // 0=TL, 1=TR, 2=BL, 3=BR
    private var initialCropFrameSize: Float = 0f
    private var initialCropFrameX: Float = 0f
    private var initialCropFrameY: Float = 0f
    
    private var cropFrameSize: Float = 0f
    private var cropFrameX: Float = 0f
    private var cropFrameY: Float = 0f
    
    private lateinit var scaleGestureDetector: ScaleGestureDetector
    
    // Transformasi
    private var rotationAngle: Int = 0 // 0, 90, 180, 270
    private var isFlipped: Boolean = false
    
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Get image URI from intent
        imageUri = intent.getParcelableExtra<Uri>("imageUri")
        if (imageUri == null) {
            Toast.makeText(this, "No image provided", Toast.LENGTH_SHORT).show()
            finish()
            return
        }
        
        // Load image
        try {
            val inputStream = contentResolver.openInputStream(imageUri!!)
            originalBitmap = BitmapFactory.decodeStream(inputStream)
            inputStream?.close()
            
            if (originalBitmap == null) {
                Toast.makeText(this, "Failed to load image", Toast.LENGTH_SHORT).show()
                finish()
                return
            }
            
            // Initialize display bitmap
            displayBitmap = originalBitmap
        } catch (e: Exception) {
            Toast.makeText(this, "Error loading image: ${e.message}", Toast.LENGTH_SHORT).show()
            finish()
            return
        }
        
        setupUI()
        setupInsets()
    }
    
    private fun setupInsets() {
        // Enable edge-to-edge
        window.setFlags(
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
        )
        
        // Make status bar transparent
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.statusBarColor = android.graphics.Color.TRANSPARENT
        }
        
        // Make navigation bar transparent
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.navigationBarColor = android.graphics.Color.TRANSPARENT
        }
        
        // Handle insets for toolbar (add top padding for status bar)
        ViewCompat.setOnApplyWindowInsetsListener(toolbar) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val originalPaddingTop = (12 * resources.displayMetrics.density).toInt() // 12dp
            val originalPaddingBottom = (12 * resources.displayMetrics.density).toInt() // 12dp
            v.setPadding(
                v.paddingLeft,
                systemBars.top + originalPaddingTop,
                v.paddingRight,
                systemBars.bottom + originalPaddingBottom
            )
            insets
        }
        
        // Handle insets for image container (add top padding for status bar)
        ViewCompat.setOnApplyWindowInsetsListener(imageContainer) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(
                v.paddingLeft,
                systemBars.top,
                v.paddingRight,
                v.paddingBottom
            )
            insets
        }
    }
    
    private fun setupUI() {
        // Set content view from XML
        setContentView(R.layout.activity_crop)
        
        // Find views
        imageContainer = findViewById(R.id.imageContainer)
        imageView = findViewById(R.id.imageView)
        cropOverlay = findViewById(R.id.cropOverlay)
        cropFrameContainer = findViewById(R.id.cropFrameContainer)
        cropFrame = findViewById(R.id.cropFrame)
        toolbar = findViewById(R.id.toolbar)
        
        // Corner handles
        cornerHandleTopLeft = findViewById(R.id.cornerHandleTopLeft)
        cornerHandleTopRight = findViewById(R.id.cornerHandleTopRight)
        cornerHandleBottomLeft = findViewById(R.id.cornerHandleBottomLeft)
        cornerHandleBottomRight = findViewById(R.id.cornerHandleBottomRight)
        
        // Set image bitmap - image tetap di tengah, tidak bisa digeser
        imageView.scaleType = ImageView.ScaleType.CENTER_INSIDE
        imageView.setImageBitmap(displayBitmap)
        
        // Setup button listeners
        findViewById<View>(R.id.rotateButton).setOnClickListener {
            rotateImage()
        }
        
        findViewById<View>(R.id.cancelButton).setOnClickListener {
            setResult(Activity.RESULT_CANCELED)
            finish()
        }
        
        findViewById<View>(R.id.doneButton).setOnClickListener {
            cropAndSave()
        }
        
        // Setup scale gesture detector for zoom
        scaleGestureDetector = ScaleGestureDetector(this, object : ScaleGestureDetector.SimpleOnScaleGestureListener() {
            override fun onScale(detector: ScaleGestureDetector): Boolean {
                if (!isZooming) {
                    isZooming = true
                    initialCropFrameSize = cropFrameSize
                    initialCropFrameX = cropFrameX
                    initialCropFrameY = cropFrameY
                }
                
                val scaleFactor = detector.scaleFactor
                val newSize = initialCropFrameSize * scaleFactor
                
                // Limit size between 100 and 95% of container
                val minSize = 100f
                val maxSize = minOf(imageContainer.width, imageContainer.height) * 0.95f
                cropFrameSize = newSize.coerceIn(minSize, maxSize)
                
                // Adjust position to keep center at gesture focus point
                val containerLocation = IntArray(2)
                imageContainer.getLocationOnScreen(containerLocation)
                val focusX = detector.focusX - containerLocation[0]
                val focusY = detector.focusY - containerLocation[1]
                
                // Calculate how much size changed
                val sizeDelta = cropFrameSize - initialCropFrameSize
                
                // Adjust position to keep focus point fixed
                cropFrameX = initialCropFrameX - sizeDelta / 2f
                cropFrameY = initialCropFrameY - sizeDelta / 2f
                
                // Keep within bounds
                val maxX = imageContainer.width - cropFrameSize
                val maxY = imageContainer.height - cropFrameSize
                cropFrameX = cropFrameX.coerceIn(0f, maxX)
                cropFrameY = cropFrameY.coerceIn(0f, maxY)
                
                updateCropFramePosition()
                return true
            }
            
            override fun onScaleEnd(detector: ScaleGestureDetector) {
                isZooming = false
            }
        })
        
        // Setup touch listener for crop frame container (move and zoom)
        cropFrameContainer.setOnTouchListener { _, event ->
            scaleGestureDetector.onTouchEvent(event)
            if (!isZooming) {
                handleCropFrameTouch(event, false)
            } else {
                true
            }
        }
        
        // Setup touch listener for corner handles (resize)
        setupCornerHandleTouch(cornerHandleTopLeft, 0) // Top Left
        setupCornerHandleTouch(cornerHandleTopRight, 1) // Top Right
        setupCornerHandleTouch(cornerHandleBottomLeft, 2) // Bottom Left
        setupCornerHandleTouch(cornerHandleBottomRight, 3) // Bottom Right
    }
    
    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            initializeCropFrame()
        }
    }
    
    private fun initializeCropFrame() {
        val availableWidth = imageContainer.width.toFloat()
        val availableHeight = imageContainer.height.toFloat()
        
        // Initialize crop frame size (90% of smaller dimension, square)
        cropFrameSize = (minOf(availableWidth, availableHeight) * 0.9f).coerceAtLeast(100f)
        
        // Center crop frame
        cropFrameX = (availableWidth - cropFrameSize) / 2f
        cropFrameY = (availableHeight - cropFrameSize) / 2f
        
        // Image tetap di tengah, tidak perlu matrix transform
        imageView.scaleType = ImageView.ScaleType.CENTER_INSIDE
        
        updateCropFramePosition()
        updateCropOverlay()
    }
    
    private fun setupCornerHandleTouch(handle: View, corner: Int) {
        handle.setOnTouchListener { _, event ->
            handleCropFrameTouch(event, true, corner)
        }
    }
    
    private fun handleCropFrameTouch(event: MotionEvent, isResize: Boolean, corner: Int = -1): Boolean {
        // Get touch coordinates relative to image container
        val containerLocation = IntArray(2)
        imageContainer.getLocationOnScreen(containerLocation)
        val containerX = event.rawX - containerLocation[0]
        val containerY = event.rawY - containerLocation[1]
        
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                if (isResize) {
                    isResizing = true
                    resizeCorner = corner
                    initialCropFrameSize = cropFrameSize
                    initialCropFrameX = cropFrameX
                    initialCropFrameY = cropFrameY
                    lastTouchX = containerX
                    lastTouchY = containerY
                } else {
                    isDragging = true
                    lastTouchX = containerX
                    lastTouchY = containerY
                }
                return true
            }
            MotionEvent.ACTION_MOVE -> {
                if (isResizing && resizeCorner >= 0) {
                    val deltaX = containerX - lastTouchX
                    val deltaY = containerY - lastTouchY
                    
                    when (resizeCorner) {
                        0 -> { // Top Left
                            val newSize = initialCropFrameSize - deltaX - deltaY
                            val minSize = 100f
                            val maxSize = minOf(imageContainer.width, imageContainer.height) * 0.95f
                            cropFrameSize = newSize.coerceIn(minSize, maxSize)
                            cropFrameX = initialCropFrameX + (initialCropFrameSize - cropFrameSize)
                            cropFrameY = initialCropFrameY + (initialCropFrameSize - cropFrameSize)
                        }
                        1 -> { // Top Right
                            val newSize = initialCropFrameSize + deltaX - deltaY
                            val minSize = 100f
                            val maxSize = minOf(imageContainer.width, imageContainer.height) * 0.95f
                            cropFrameSize = newSize.coerceIn(minSize, maxSize)
                            cropFrameY = initialCropFrameY + (initialCropFrameSize - cropFrameSize)
                        }
                        2 -> { // Bottom Left
                            val newSize = initialCropFrameSize - deltaX + deltaY
                            val minSize = 100f
                            val maxSize = minOf(imageContainer.width, imageContainer.height) * 0.95f
                            cropFrameSize = newSize.coerceIn(minSize, maxSize)
                            cropFrameX = initialCropFrameX + (initialCropFrameSize - cropFrameSize)
                        }
                        3 -> { // Bottom Right
                            val newSize = initialCropFrameSize + deltaX + deltaY
                            val minSize = 100f
                            val maxSize = minOf(imageContainer.width, imageContainer.height) * 0.95f
                            cropFrameSize = newSize.coerceIn(minSize, maxSize)
                        }
                    }
                    
                    // Keep within bounds
                    val maxX = imageContainer.width - cropFrameSize
                    val maxY = imageContainer.height - cropFrameSize
                    cropFrameX = cropFrameX.coerceIn(0f, maxX)
                    cropFrameY = cropFrameY.coerceIn(0f, maxY)
                    
                    updateCropFramePosition()
                    lastTouchX = containerX
                    lastTouchY = containerY
                    return true
                } else if (isDragging) {
                    val deltaX = containerX - lastTouchX
                    val deltaY = containerY - lastTouchY
                    
                    cropFrameX += deltaX
                    cropFrameY += deltaY
                    
                    // Keep crop frame within bounds
                    val maxX = imageContainer.width - cropFrameSize
                    val maxY = imageContainer.height - cropFrameSize
                    
                    cropFrameX = cropFrameX.coerceIn(0f, maxX)
                    cropFrameY = cropFrameY.coerceIn(0f, maxY)
                    
                    updateCropFramePosition()
                    lastTouchX = containerX
                    lastTouchY = containerY
                    return true
                }
                
                lastTouchX = containerX
                lastTouchY = containerY
                return true
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                isDragging = false
                isResizing = false
                resizeCorner = -1
                return true
            }
            else -> return false
        }
    }
    
    private fun updateImageMatrix() {
        imageMatrix.reset()
        imageMatrix.postScale(currentScale, currentScale)
        imageMatrix.postTranslate(currentTranslateX, currentTranslateY)
        imageView.imageMatrix = imageMatrix
    }
    
    private fun updateCropFramePosition() {
        // Update crop frame container position
        val containerParams = cropFrameContainer.layoutParams as android.widget.FrameLayout.LayoutParams
        containerParams.leftMargin = cropFrameX.toInt()
        containerParams.topMargin = cropFrameY.toInt()
        cropFrameContainer.layoutParams = containerParams
        
        // Update crop frame size
        val frameParams = cropFrame.layoutParams as android.widget.FrameLayout.LayoutParams
        frameParams.width = cropFrameSize.toInt()
        frameParams.height = cropFrameSize.toInt()
        cropFrame.layoutParams = frameParams
        
        // Update overlay
        updateCropOverlay()
    }
    
    private fun updateCropOverlay() {
        // Update custom overlay view properties
        cropOverlay.cropFrameX = cropFrameX
        cropOverlay.cropFrameY = cropFrameY
        cropOverlay.cropFrameSize = cropFrameSize
        cropOverlay.invalidate()
    }
    
    
    private fun flipImage() {
        isFlipped = !isFlipped
        applyTransformations()
    }
    
    private fun rotateImage() {
        rotationAngle = (rotationAngle + 90) % 360
        applyTransformations()
    }
    
    private fun applyTransformations() {
        if (originalBitmap == null) return
        
        val matrix = Matrix()
        val centerX = originalBitmap!!.width / 2f
        val centerY = originalBitmap!!.height / 2f
        
        // Apply transformations in correct order: first rotate, then flip
        // Move to center, apply transformations, move back
        matrix.postTranslate(-centerX, -centerY)
        
        // Apply rotation first
        if (rotationAngle != 0) {
            matrix.postRotate(rotationAngle.toFloat())
        }
        
        // Apply flip (horizontal flip)
        if (isFlipped) {
            matrix.postScale(-1f, 1f)
        }
        
        // Move back
        matrix.postTranslate(centerX, centerY)
        
        // Calculate new dimensions after rotation
        val rect = RectF(0f, 0f, originalBitmap!!.width.toFloat(), originalBitmap!!.height.toFloat())
        matrix.mapRect(rect)
        
        val newWidth = rect.width().toInt()
        val newHeight = rect.height().toInt()
        
        // Create transformed bitmap
        displayBitmap = Bitmap.createBitmap(
            newWidth,
            newHeight,
            Bitmap.Config.ARGB_8888
        )
        
        val canvas = android.graphics.Canvas(displayBitmap!!)
        canvas.drawBitmap(originalBitmap!!, matrix, null)
        
        // Update image view
        imageView.setImageBitmap(displayBitmap)
        
        // Reset image position and scale
        val availableWidth = imageContainer.width.toFloat()
        val availableHeight = imageContainer.height.toFloat()
        
        val imageWidth = displayBitmap!!.width.toFloat()
        val imageHeight = displayBitmap!!.height.toFloat()
        
        val scaleX = availableWidth / imageWidth
        val scaleY = availableHeight / imageHeight
        currentScale = maxOf(scaleX, scaleY) * 1.2f
        
        currentTranslateX = (availableWidth - imageWidth * currentScale) / 2f
        currentTranslateY = (availableHeight - imageHeight * currentScale) / 2f
        
        updateImageMatrix()
        
        // Recenter crop frame
        cropFrameSize = (minOf(availableWidth, availableHeight) * 0.9f).coerceAtLeast(100f)
        cropFrameX = (availableWidth - cropFrameSize) / 2f
        cropFrameY = (availableHeight - cropFrameSize) / 2f
        
        updateCropFramePosition()
    }
    
    private fun cropAndSave() {
        try {
            if (displayBitmap == null) {
                Toast.makeText(this, "No image to crop", Toast.LENGTH_SHORT).show()
                return
            }
            
            // Get dimensions
            val containerWidth = imageContainer.width.toFloat()
            val containerHeight = imageContainer.height.toFloat()
            val imageViewWidth = imageView.width.toFloat()
            val imageViewHeight = imageView.height.toFloat()
            val imageBitmapWidth = displayBitmap!!.width.toFloat()
            val imageBitmapHeight = displayBitmap!!.height.toFloat()
            
            // Calculate scale to fit (CENTER_INSIDE)
            val scaleX = imageViewWidth / imageBitmapWidth
            val scaleY = imageViewHeight / imageBitmapHeight
            val scale = minOf(scaleX, scaleY)
            
            // Calculate displayed image size
            val displayedWidth = imageBitmapWidth * scale
            val displayedHeight = imageBitmapHeight * scale
            
            // ImageView fills the container, so image is centered in container
            // Calculate image position relative to container (centered)
            val imageXInContainer = (containerWidth - displayedWidth) / 2f
            val imageYInContainer = (containerHeight - displayedHeight) / 2f
            
            // Crop frame position is relative to container
            val cropRectInContainer = RectF(
                cropFrameX,
                cropFrameY,
                cropFrameX + cropFrameSize,
                cropFrameY + cropFrameSize
            )
            
            // Image bounds in container
            val imageBoundsInContainer = RectF(
                imageXInContainer,
                imageYInContainer,
                imageXInContainer + displayedWidth,
                imageYInContainer + displayedHeight
            )
            
            // Calculate intersection of crop frame with image
            val intersection = RectF()
            if (!intersection.setIntersect(cropRectInContainer, imageBoundsInContainer)) {
                Toast.makeText(this, "Crop area is outside image bounds", Toast.LENGTH_SHORT).show()
                return
            }
            
            // Convert intersection from container coordinates to bitmap coordinates
            // Subtract image position in container, then divide by scale
            val cropX = ((intersection.left - imageBoundsInContainer.left) / scale).toInt().coerceAtLeast(0)
            val cropY = ((intersection.top - imageBoundsInContainer.top) / scale).toInt().coerceAtLeast(0)
            val cropWidth = (intersection.width() / scale).toInt().coerceAtMost(displayBitmap!!.width - cropX)
            val cropHeight = (intersection.height() / scale).toInt().coerceAtMost(displayBitmap!!.height - cropY)
            
            // Ensure we have valid dimensions
            if (cropWidth <= 0 || cropHeight <= 0) {
                Toast.makeText(this, "Invalid crop dimensions", Toast.LENGTH_SHORT).show()
                return
            }
            
            // Crop the bitmap
            val croppedBitmap = Bitmap.createBitmap(
                displayBitmap!!,
                cropX,
                cropY,
                cropWidth,
                cropHeight
            )
            
            // Save cropped image
            val croppedFile = File.createTempFile("cropped_", ".jpg", cacheDir)
            val outputStream = FileOutputStream(croppedFile)
            croppedBitmap.compress(Bitmap.CompressFormat.JPEG, 90, outputStream)
            outputStream.close()
            
            // Create URI for cropped file
            val croppedUri = FileProvider.getUriForFile(
                this,
                "${packageName}.fileprovider",
                croppedFile
            )
            
            // Return result
            val resultIntent = Intent()
            resultIntent.putExtra("croppedImageUri", croppedUri)
            setResult(Activity.RESULT_OK, resultIntent)
            finish()
        } catch (e: Exception) {
            Toast.makeText(this, "Error cropping image: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }
}
