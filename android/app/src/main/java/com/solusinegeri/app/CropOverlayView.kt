package com.solusinegeri.app

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.util.AttributeSet
import android.view.View

class CropOverlayView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {
    
    private val paint = Paint().apply {
        color = android.graphics.Color.argb(180, 0, 0, 0)
        style = Paint.Style.FILL
    }
    
    var cropFrameX: Float = 0f
    var cropFrameY: Float = 0f
    var cropFrameSize: Float = 0f
    
    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        
        val path = Path()
        // Full overlay
        path.addRect(0f, 0f, width.toFloat(), height.toFloat(), Path.Direction.CW)
        // Cut out crop frame area
        path.addRect(
            cropFrameX,
            cropFrameY,
            cropFrameX + cropFrameSize,
            cropFrameY + cropFrameSize,
            Path.Direction.CCW
        )
        canvas.drawPath(path, paint)
    }
}
