import UIKit

@objc(ProgressiveBlurView)
class ProgressiveBlurView: UIView {

    private let blurView = UIVisualEffectView(effect: UIBlurEffect(style: .systemThinMaterial))
    private let maskLayer = CAGradientLayer()

    @objc var startBlur: NSNumber = 0 {
        didSet { updateMask() }
    }

    @objc var endBlur: NSNumber = 100 {
        didSet { updateMask() }
    }

    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setup()
    }

    private func setup() {
        blurView.frame = bounds
        blurView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        addSubview(blurView)

        maskLayer.startPoint = CGPoint(x: 0.5, y: 0.0)
        maskLayer.endPoint = CGPoint(x: 0.5, y: 1.0)
        blurView.layer.mask = maskLayer
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        blurView.frame = bounds
        maskLayer.frame = bounds
    }

    private func updateMask() {
        // 0 = transparent, 1 = full blur
        maskLayer.colors = [
            UIColor(white: 1, alpha: 0.0).cgColor,
            UIColor(white: 1, alpha: 1.0).cgColor,
        ]
        maskLayer.locations = [0.0, 1.0]
    }
}
