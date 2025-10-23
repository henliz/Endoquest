import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, Leaf, Sparkles, Shield } from 'lucide-react';

interface TooltipContent {
  icon: typeof Eye;
  title: string;
  description: string;
  color: string;
}

interface TutorialOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

const tooltips: TooltipContent[] = [
  {
    icon: Eye,
    title: 'Observe',
    description: 'Study the symptom carefully. Increases Clarity and reveals patterns. Combo: Observe → Probe for major insight boost.',
    color: '#4a90e2',
  },
  {
    icon: Leaf,
    title: 'Soothe',
    description: 'Offer gentleness and rest. Reduces Flare and restores composure. Combo: Resist → Soothe for better recovery.',
    color: '#52b788',
  },
  {
    icon: Sparkles,
    title: 'Probe',
    description: 'Ask difficult questions. Greatly increases Clarity but raises Flare as you dig deeper into truth.',
    color: '#c9a0dc',
  },
  {
    icon: Shield,
    title: 'Resist',
    description: 'Push back against the pain. Reduces Flare quickly but drains Clarity. Use sparingly.',
    color: '#f4a261',
  },
];

export function TutorialOverlay({ isVisible, onClose }: TutorialOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 w-full max-w-sm backdrop-blur-md bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white/90 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-[#f4a261] mb-2">
                How to Navigate the Ache
              </h2>
              <p className="text-sm text-white/70 leading-relaxed mb-3">
                Each action shapes your journey differently. Choose wisely, traveler.
              </p>
              <div className="text-xs text-[#c9a0dc]/70 space-y-1">
                <div>🩸 <span className="text-white/60">Flare</span> = Pain intensity (reduce to 0 to win)</div>
                <div>💫 <span className="text-white/60">Clarity</span> = Understanding (don't let it reach 0)</div>
              </div>
            </div>

            {/* Action tooltips */}
            <div className="space-y-4">
              {tooltips.map((tooltip, index) => {
                const Icon = tooltip.icon;
                return (
                  <motion.div
                    key={tooltip.title}
                    className="backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex gap-3">
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${tooltip.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: tooltip.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white/90 mb-1">
                          {tooltip.title}
                        </div>
                        <div className="text-xs text-white/60 leading-relaxed">
                          {tooltip.description}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer tips */}
            <motion.div
              className="mt-6 pt-4 border-t border-white/10 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-xs text-[#f4a261]/80 text-center font-serif">
                💡 Try chaining actions for combo effects!
              </div>
              <p className="text-xs text-[#c9a0dc] text-center italic">
                Remember: There is no single path to healing, only the one you choose to walk.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
