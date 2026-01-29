package com.reactnativeglassblur

import android.content.Context
import android.graphics.*
import android.os.Build
import android.widget.FrameLayout

class ProgressiveBlurView(context: Context) : FrameLayout(context) {

  private val maskPaint = Paint()
  private var gradient: LinearGradient? = null

  init {
    setWillNotDraw(false)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      setRenderEffect(
        RenderEffect.createBlurEffect(50f, 50f, Shader.TileMode.CLAMP)
      )
    }
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)

    gradient = LinearGradient(
      0f, 0f, 0f, h.toFloat(),
      intArrayOf(Color.TRANSPARENT, Color.WHITE),
      floatArrayOf(0f, 1f),
      Shader.TileMode.CLAMP
    )
    maskPaint.shader = gradient
  }

  override fun dispatchDraw(canvas: Canvas) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val save = canvas.saveLayer(null, null)

      super.dispatchDraw(canvas)

      maskPaint.xfermode = PorterDuffXfermode(PorterDuff.Mode.DST_IN)
      canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), maskPaint)
      maskPaint.xfermode = null

      canvas.restoreToCount(save)
    } else {
      super.dispatchDraw(canvas)
    }
  }
}
