import { motion } from 'motion/react';
import { Progress } from './ui/progress';

interface EnemyDisplayProps {
  enemyName: string;
  flareValue: number;
  clarityValue: number;
  phase2?: boolean;
}

export function EnemyDisplay({ enemyName, flareValue, clarityValue, phase2 }: EnemyDisplayProps) {
  return (
    <div className="relative h-[270px] overflow-hidden">
      {/* Misty background with ripple effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1625] via-[#2a1f3d] to-[#1a1625]">
        {/* Ripple overlay */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 50% 100%, rgba(201, 160, 220, 0.3) 0%, transparent 50%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Particle effects */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#c9a0dc] rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Enemy silhouette */}
      <div className="relative z-10 flex flex-col items-center pt-8">
        <motion.div
          className="relative"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 blur-xl opacity-40"
            style={{
              background: 'radial-gradient(circle, #c9a0dc 0%, transparent 70%)',
            }}
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          
          {/* Silhouette */}
          <svg width="120" height="140" viewBox="0 0 120 140" className="relative z-10">
            <defs>
              <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={phase2 ? "#e63946" : "#c9a0dc"} stopOpacity="0.6" />
                <stop offset="100%" stopColor="#1a1625" stopOpacity="0.9" />
              </linearGradient>
              {phase2 && (
                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#1a1625" stopOpacity="0.9" />
                </linearGradient>
              )}
            </defs>
            {/* Feminine silhouette - abstract flowing form */}
            <ellipse cx="60" cy="30" rx="18" ry="22" fill="url(#shadowGradient)" />
            <path
              d="M 60 52 Q 45 70, 40 95 Q 40 120, 45 135 L 50 135 Q 48 110, 50 90 Q 52 75, 60 65 Q 68 75, 70 90 Q 72 110, 70 135 L 75 135 Q 80 120, 80 95 Q 75 70, 60 52 Z"
              fill="url(#shadowGradient)"
            />
            <path
              d="M 60 65 Q 40 75, 30 90 L 35 95 Q 42 85, 55 75 Z"
              fill="url(#shadowGradient)"
              opacity="0.8"
            />
            <path
              d="M 60 65 Q 80 75, 90 90 L 85 95 Q 78 85, 65 75 Z"
              fill="url(#shadowGradient)"
              opacity="0.8"
            />
            
            {/* Phase 2: Shield overlay */}
            {phase2 && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ellipse cx="60" cy="70" rx="35" ry="45" fill="none" stroke="url(#shieldGradient)" strokeWidth="2" opacity="0.5" />
              </motion.g>
            )}
          </svg>
        </motion.div>

        {/* Enemy name */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-[#c9a0dc] tracking-wide mb-1">
            {enemyName}
          </h2>
          <div className="text-xs text-[#c9a0dc]/50 italic font-serif">
            Sector 0 — The Threshold
          </div>
        </motion.div>
      </div>

      {/* Status bars */}
      <div className="absolute bottom-6 left-4 right-4 space-y-3 z-20">
        {/* Flare Bar */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">🩸</span>
            <span className="text-xs text-[#c9a0dc]">Flare</span>
            <span className="ml-auto text-xs text-[#c9a0dc]/70">{flareValue}%</span>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #e63946 0%, #c9a0dc 100%)',
                width: `${flareValue}%`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${flareValue}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Clarity Bar */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">💫</span>
            <span className="text-xs text-[#c9a0dc]">Clarity</span>
            <span className="ml-auto text-xs text-[#c9a0dc]/70">{clarityValue}%</span>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #4a90e2 0%, #ffffff 100%)',
                width: `${clarityValue}%`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${clarityValue}%` }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
