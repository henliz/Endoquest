import { useState } from 'react';
import { motion } from 'motion/react';
import { BackgroundParticles } from './BackgroundParticles';
import { BattleSystem } from './BattleSystem';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CombatEncounterProps {
  enemyName: string;
  enemyImage: string;
  flare: number;
  clarity: number;
  onActionSelect: (actionId: string) => void;
  phase2?: boolean;
}

export function CombatEncounter({
  enemyName,
  enemyImage,
  flare,
  clarity,
  onActionSelect,
  phase2
}: CombatEncounterProps) {
  return (
    <div className="min-h-screen bg-[#1a1625] flex flex-col relative">
      <BackgroundParticles />

      {/* Enemy display area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 pt-12">
        {/* Location tag */}
        <motion.div
          className="text-xs text-[#c9a0dc]/50 italic font-serif mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Sector 0 — The Threshold
        </motion.div>

        {/* Enemy */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 blur-2xl opacity-40 -z-10"
            style={{
              background: phase2 
                ? 'radial-gradient(circle, #e63946 0%, transparent 70%)'
                : 'radial-gradient(circle, #c9a0dc 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />

          {/* Enemy image */}
          <div className="w-40 h-40 rounded-lg overflow-hidden border-2 border-[#c9a0dc]/30 relative">
            <ImageWithFallback
              src={enemyImage}
              alt={enemyName}
              className="w-full h-full object-cover object-center"
            />
            
            {/* Phase 2 overlay */}
            {phase2 && (
              <motion.div
                className="absolute inset-0 bg-[#e63946]/20"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>

        {/* Enemy name */}
        <motion.h2
          className="text-[#c9a0dc] tracking-wide mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {enemyName}
        </motion.h2>

        {/* Phase indicator */}
        {phase2 && (
          <motion.div
            className="text-xs text-[#e63946] font-serif italic"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            ⚠️ The Ache Awakens ⚠️
          </motion.div>
        )}
      </div>

      {/* Battle UI */}
      <div className="relative z-10 pb-6 px-4">
        <BattleSystem
          flare={flare}
          clarity={clarity}
          onActionSelect={onActionSelect}
        />
      </div>
    </div>
  );
}
