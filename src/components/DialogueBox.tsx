import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface DialogueBoxProps {
  characterName: string;
  text: string;
  onContinue?: () => void;
}

export function DialogueBox({ characterName, text, onContinue }: DialogueBoxProps) {
  return (
    <motion.div
      className="mx-4 my-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="relative backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/20 shadow-2xl">
        {/* Frosted glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />
        
        <div className="relative z-10 flex gap-3">
          {/* Character portrait */}
          <div className="flex-shrink-0">
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a0dc] to-[#1a1625] border-2 border-[#c9a0dc]/50 flex items-center justify-center overflow-hidden"
              whileHover={{ scale: 1.05 }}
            >
              {/* Hooded figure silhouette */}
              <svg width="32" height="32" viewBox="0 0 32 32">
                <path
                  d="M 16 8 Q 12 8, 10 12 Q 10 16, 12 18 Q 14 19, 16 19 Q 18 19, 20 18 Q 22 16, 22 12 Q 20 8, 16 8 Z M 16 4 Q 20 4, 22 6 L 24 8 Q 26 12, 26 16 L 24 18 Q 22 20, 20 20 L 16 22 L 12 20 Q 10 20, 8 18 L 6 16 Q 6 12, 8 8 L 10 6 Q 12 4, 16 4 Z"
                  fill="currentColor"
                  className="text-[#1a1625]"
                />
              </svg>
            </motion.div>
          </div>

          {/* Dialogue content */}
          <div className="flex-1 space-y-2">
            <div className="text-sm text-[#f4a261] tracking-wide">
              {characterName}
            </div>
            <div className="text-sm text-white/90 leading-relaxed font-serif">
              {text}
            </div>
          </div>
        </div>

        {/* Continue indicator */}
        {onContinue && (
          <motion.button
            onClick={onContinue}
            className="absolute bottom-2 right-3 text-[#c9a0dc]/60 hover:text-[#c9a0dc] transition-colors"
            animate={{
              y: [0, 4, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
