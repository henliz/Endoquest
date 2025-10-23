import { motion } from 'motion/react';
import { Scroll, Sparkles } from 'lucide-react';

interface VictoryScreenProps {
  title: string;
  fragmentText: string;
  onContinue: () => void;
}

export function VictoryScreen({ title, fragmentText, onContinue }: VictoryScreenProps) {
  return (
    <div className="min-h-screen bg-[#1a1625] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Particle celebration */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: i % 2 === 0 ? '#c9a0dc' : '#f4a261',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            y: [-50, 50],
          }}
          transition={{
            duration: 2,
            delay: i * 0.1,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      ))}

      <motion.div
        className="relative z-10 max-w-sm w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 blur-3xl opacity-30"
          style={{
            background: 'radial-gradient(circle, #f4a261 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />

        {/* Scroll container */}
        <div className="relative backdrop-blur-md bg-gradient-to-b from-amber-100/10 to-amber-50/5 rounded-3xl p-8 border-2 border-[#f4a261]/30 shadow-2xl">
          {/* Parchment texture overlay */}
          <div
            className="absolute inset-0 rounded-3xl opacity-5 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Icon */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ rotate: -10, y: -20 }}
            animate={{ rotate: 0, y: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Scroll className="w-16 h-16 text-[#f4a261]" />
          </motion.div>

          {/* Title */}
          <motion.h2
            className="text-center text-[#f4a261] tracking-wide mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {title}
          </motion.h2>

          {/* Fragment text */}
          <motion.div
            className="text-center text-sm text-white/80 leading-relaxed mb-6 px-2 font-serif max-h-[200px] overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="mb-3 text-[#f4a261]/70 text-xs">DIAGNOSTIC FRAGMENT</div>
            <div className="text-left">
              {fragmentText}
            </div>
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#f4a261]/30 to-transparent" />
            <Sparkles className="w-3 h-3 text-[#f4a261]/50" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#f4a261]/30 to-transparent" />
          </div>

          {/* Continue button */}
          <motion.button
            onClick={onContinue}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f4a261]/20 to-[#c9a0dc]/20 border border-[#f4a261]/40 text-white/90 hover:bg-[#f4a261]/30 transition-colors text-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <span className="block text-center w-full">Continue Journey</span>
          </motion.button>
          
          {/* Small subtext */}
          <motion.div
            className="text-xs text-center text-[#c9a0dc]/50 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Tutorial Complete
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
