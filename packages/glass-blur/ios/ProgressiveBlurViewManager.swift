import Foundation
import React

@objc(ProgressiveBlurViewManager)
class ProgressiveBlurViewManager: RCTViewManager {
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func view() -> UIView! {
        return ProgressiveBlurView()
    }
}
