import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { VNScene } from './VNScene';
import { YourAcheMenu } from './YourAcheMenu';
import { BackgroundParticles } from './BackgroundParticles';
import { Scroll, Sparkles } from 'lucide-react';

const CAMPFIRE_BG = 'https://i.pinimg.com/736x/60/fe/74/60fe7447268dda76b8202f15b70f9f2b.jpg';

// Archivist VN portraits - rotate between these during dialogue
const ARCHIVIST_PORTRAITS = [
  'https://64.media.tumblr.com/6ac9c73c28d6ce9ab4e74e7202871951/3f2885bda6ac220c-1d/s1280x1920/5400143058374ff9dad6debaf0434fbc7dc4caaf.png',
  'https://aniyuki.com/wp-content/uploads/2022/06/aniyuki-xiao-png-16.png',
  'https://www.pngall.com/wp-content/uploads/15/Xiao-PNG-Images.png'
];

// Campfire scene sprite - smaller chibi style
const ARCHIVIST_CAMPFIRE_SPRITE = 'https://i.redd.it/37fefho26sf61.gif';
const ACHE_ICON = 'https://64.media.tumblr.com/tumblr_mcchojgkjR1rreqgwo1_500.gif';

interface PostCombatSceneProps {
  onContinue: () => void;
}

type ScenePhase = 
  | 'scroll_obtained'
  | 'dialogue_1'
  | 'dialogue_2' 
  | 'dialogue_3'
  | 'dialogue_4'
  | 'dialogue_5'
  | 'dialogue_6'
  | 'free_explore';

export function PostCombatScene({ onContinue }: PostCombatSceneProps) {
  const [phase, setPhase] = useState<ScenePhase>('scroll_obtained');
  const [showMenu, setShowMenu] = useState(false);

  // Generate diagnostic fragment text (same logic as App.tsx)
  const getFragmentText = () => {
    return "Pattern recognized: Early and severe cyclical pain, resistant to first-line management. Emotional markers: Repeated dismissal, self-suppression under distress. Recommendation: Gynecological evaluation for possible endometriosis per SOGC guidelines.";
  };

  const renderScene = () => {
    switch (phase) {
      case 'scroll_obtained':
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
                  Doctor Scroll Fragment
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
                    {getFragmentText()}
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
                  onClick={() => setPhase('dialogue_1')}
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

      case 'dialogue_1':
        return (
          <VNScene
            backgroundImage={CAMPFIRE_BG}
            characterImages={ARCHIVIST_PORTRAITS}
            characterName="The Archivist"
            text="Well fought, traveler. The Ache... it still lives within you, but you've learned to see it. To name it."
            onContinue={() => setPhase('dialogue_2')}
          />
        );

      case 'dialogue_2':
        return (
          <VNScene
            backgroundImage={CAMPFIRE_BG}
            characterImages={ARCHIVIST_PORTRAITS}
            characterName="The Archivist"
            text="That scroll fragment you found—the one that felt like your own words written by someone else? It's not just paper. It's a piece of the Lumen Archives."
            onContinue={() => setPhase('dialogue_3')}
          />
        );

      case 'dialogue_3':
        return (
          <VNScene
            backgroundImage={CAMPFIRE_BG}
            characterImages={ARCHIVIST_PORTRAITS}
            characterName="The Archivist"
            text="The Archives remember every pain, every journey, every person who learned to see their Ache. And now, you've added your story to them."
            onContinue={() => setPhase('dialogue_4')}
          />
        );

      case 'dialogue_4':
        return (
          <VNScene
            backgroundImage={CAMPFIRE_BG}
            characterImages={ARCHIVIST_PORTRAITS}
            characterName="The Archivist"
            text="But the scroll fragment is only part of what you carry. Your Ache—the one you just faced—it's become something... else. Something you can work with."
            onContinue={() => setPhase('dialogue_5')}
          />
        );

      case 'dialogue_5':
        return (
          <VNScene
            backgroundImage={CAMPFIRE_BG}
            characterImages={ARCHIVIST_PORTRAITS}
            characterName="The Archivist"
            text="Your Ache—the one you just faced—it's become something... else. Something you can work with. Here, let me show you."
            onContinue={() => setPhase('dialogue_6')}
          />
        );

      case 'dialogue_6':
        return (
          <VNScene
            backgroundImage={CAMPFIRE_BG}
            characterImages={ARCHIVIST_PORTRAITS}
            characterName="The Archivist"
            text="You can now *know* your Ache. Speak to it, learn from it. It holds three kinds of wisdom: healing words for doctors, gentle remedies for home, and paths to those who can help."
            onContinue={() => setPhase('free_explore')}
          />
        );

      case 'free_explore':
        return (
          <div className="min-h-screen bg-[#1a1625] flex flex-col relative overflow-hidden">
            {/* Background - shifted RIGHT to see fire better */}
            <div className="absolute inset-0 z-0">
              <ImageWithFallback
                src={CAMPFIRE_BG}
                alt="Forest campfire at night"
                className="w-full h-full object-cover"
                style={{
                  objectPosition: '60% center',
                  filter: 'brightness(0.8) saturate(1.3)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a1625]/50 via-transparent to-[#1a1625]/70" />
            </div>

            <BackgroundParticles />

            {/* Campfire glow effect */}
            <motion.div
              className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-64 h-64 z-5"
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.15, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                background: 'radial-gradient(circle, rgba(244,162,97,0.4) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}
            />

            {/* Archivist chibi sprite - left of campfire, cropped to left half, EVEN LARGER (1.5x) */}
            <motion.div
              className="absolute left-[10%] bottom-[28%] z-10"
              animate={{ 
                y: [0, -6, 0],
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="relative" style={{ width: '180px', height: '270px', overflow: 'hidden' }}>
                <ImageWithFallback
                  src={ARCHIVIST_CAMPFIRE_SPRITE}
                  alt="The Archivist"
                  className="object-cover object-left"
                  style={{ 
                    filter: 'drop-shadow(0 0 20px rgba(201, 160, 220, 0.5))',
                    width: '360px',
                    height: '270px',
                    objectPosition: '0% center',
                    clipPath: 'inset(0 0 25% 0)'
                  }}
                />
              </div>
            </motion.div>

            {/* Your Ache sprite - right of campfire, LARGER, NO LABEL */}
            <motion.div
              className="absolute right-[10%] bottom-[28%] z-10"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <motion.button
                onClick={() => setShowMenu(true)}
                className="relative group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  y: [0, -6, 0]
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{
                    background: 'radial-gradient(circle, rgba(201,160,220,0.6) 0%, rgba(244,162,97,0.4) 50%, transparent 70%)'
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 0.8, 0.6]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />

                {/* The Ache GIF - LARGER */}
                <ImageWithFallback
                  src={ACHE_ICON}
                  alt="Your Ache"
                  className="relative w-32 h-32 object-contain"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(201, 160, 220, 0.8))'
                  }}
                />
              </motion.button>
            </motion.div>

            {/* Tooltip at top of screen */}
            <motion.div
              className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10 text-center"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <div className="px-4 py-2 bg-black/60 backdrop-blur-sm rounded-xl border border-white/20">
                <p className="text-white/80 text-xs font-serif">Click to talk to your companions</p>
              </div>
            </motion.div>

            {/* Location indicator */}
            <motion.div
              className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center">
                <p className="text-white/80 text-sm font-serif mb-1">🔥 Campfire - That Evening</p>
                <p className="text-white/60 text-xs">The Foglands, Edge of the Lumen Archives</p>
              </div>
            </motion.div>

            {/* Bottom UI */}
            {!showMenu && (
              <motion.div
                className="absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center gap-4 px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <button
                  onClick={onContinue}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500/90 to-orange-500/90 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl transition-all flex items-center gap-2 backdrop-blur-sm"
                >
                  Continue Your Journey →
                </button>

                <p className="text-white/60 text-xs text-center font-serif">
                  Interact with Your Ache, or venture onward when you're ready
                </p>
              </motion.div>
            )}

            {/* Your Ache Menu */}
            <AnimatePresence>
              {showMenu && (
                <YourAcheMenu onClose={() => setShowMenu(false)} />
              )}
            </AnimatePresence>
          </div>
        );

      default:
        return null;
    }
  };

  return <>{renderScene()}</>;
}
