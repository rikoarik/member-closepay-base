package com.reactnativeglassblur

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

class ProgressiveBlurViewManager : SimpleViewManager<ProgressiveBlurView>() {

  override fun getName() = "ProgressiveBlurView"

  override fun createViewInstance(reactContext: ThemedReactContext): ProgressiveBlurView {
    return ProgressiveBlurView(reactContext)
  }
}
