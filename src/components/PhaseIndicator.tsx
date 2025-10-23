import { motion } from 'motion/react';

interface PhaseIndicatorProps {
  currentPhase: number;
  totalPhases: number;
}

export function PhaseIndicator({ currentPhase, totalPhases }: PhaseIndicatorProps) {
  return (
    <div className="fixed top-4 left-4 z-30 flex gap-1.5">
      {Array.from({ length: totalPhases }, (_, i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < currentPhase 
              ? 'bg-[#c9a0dc]' 
              : i === currentPhase 
              ? 'bg-[#f4a261]' 
              : 'bg-white/20'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}
