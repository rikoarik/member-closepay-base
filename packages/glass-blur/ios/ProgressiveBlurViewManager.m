#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(ProgressiveBlurViewManager, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(startBlur, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(endBlur, NSNumber)
@end
