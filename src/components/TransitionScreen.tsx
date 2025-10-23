import { motion } from 'motion/react';

interface TransitionScreenProps {
  text: string;
  subtext?: string;
  onComplete?: () => void;
  duration?: number;
}

export function TransitionScreen({ text, subtext, onComplete, duration = 2000 }: TransitionScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1625]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => {
        if (onComplete) {
          setTimeout(onComplete, duration);
        }
      }}
    >
      <div className="text-center px-8">
        <motion.div
          className="text-[#c9a0dc] mb-4 font-serif"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.div>
        
        {subtext && (
          <motion.div
            className="text-sm text-white/60 font-serif italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {subtext}
          </motion.div>
        )}

        {/* Pulsing effect */}
        <motion.div
          className="mt-8 w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#c9a0dc] to-[#f4a261] opacity-30 blur-xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </div>
    </motion.div>
  );
}
