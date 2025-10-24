// src/components/StartScreen.tsx
import { motion } from 'motion/react';
import { BackgroundParticles } from './BackgroundParticles';
import { WebAudioManager } from '@/audio/WebAudioManager';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="min-h-screen bg-[#1a1625] flex items-center justify-center relative overflow-hidden">
      {/* Title music: pure Web Audio (20s offset baked in) */}

      <BackgroundParticles />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1a1625]/80" />

      <div className="relative z-10 text-center px-8 max-w-md">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h1
            className="text-[#c9a0dc] mb-3 tracking-wider"
            animate={{
              textShadow: [
                '0 0 20px rgba(201, 160, 220, 0.3)',
                '0 0 30px rgba(201, 160, 220, 0.5)',
                '0 0 20px rgba(201, 160, 220, 0.3)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            EndoQuest
          </motion.h1>
          <motion.p
            className="text-sm text-white/60 font-serif italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            The Ache Beneath
          </motion.p>
        </motion.div>

        <motion.div
          className="mb-8 space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-xs text-[#f4a261]/80 font-serif">Sector 0 — The Threshold</p>
          <p className="text-sm text-white/70 leading-relaxed font-serif">
            Before the Foglands twist into regions unknown, there's a shallow basin — silent, pulsing with a heartbeat not your own.
          </p>
        </motion.div>

        <motion.button
          onClick={onStart}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#c9a0dc]/20 to-[#f4a261]/20 border-2 border-[#c9a0dc]/40 text-white/90 hover:border-[#c9a0dc]/60 transition-all backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(201, 160, 220, 0.3)' }}
          whileTap={{ scale: 0.95 }}
        >
          Begin Journey
        </motion.button>

        <motion.p
          className="mt-8 text-xs text-white/40 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          A narrative experience about naming pain
        </motion.p>
      </div>
    </div>
  );
}
