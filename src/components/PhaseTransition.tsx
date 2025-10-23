import { motion } from 'motion/react';

interface PhaseTransitionProps {
  text: string;
  onComplete: () => void;
}

export function PhaseTransition({ text, onComplete }: PhaseTransitionProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1625]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => {
        setTimeout(onComplete, 1500);
      }}
    >
      <motion.div
        className="text-center px-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="text-[#c9a0dc] font-serif tracking-wide mb-4"
          animate={{
            textShadow: [
              '0 0 20px rgba(201, 160, 220, 0.3)',
              '0 0 30px rgba(201, 160, 220, 0.5)',
              '0 0 20px rgba(201, 160, 220, 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.div>

        {/* Animated dots */}
        <motion.div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#c9a0dc]"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
