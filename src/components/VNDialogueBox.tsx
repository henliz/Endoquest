import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface VNDialogueBoxProps {
  characterName: string;
  text: string;
  onContinue?: () => void;
  showContinue?: boolean;
  autoAdvance?: number; // milliseconds before auto-advance
}

export function VNDialogueBox({ 
  characterName, 
  text, 
  onContinue,
  showContinue = true,
  autoAdvance
}: VNDialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    // Text reveal animation
    let currentIndex = 0;
    setDisplayedText('');
    setIsComplete(false);
    setCanContinue(false);

    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        
        // Enable continue after a short delay
        setTimeout(() => {
          setCanContinue(true);
          
          // Auto-advance if specified
          if (autoAdvance && onContinue) {
            setTimeout(onContinue, autoAdvance);
          }
        }, 300);
      }
    }, 20); // Typing speed

    return () => clearInterval(interval);
  }, [text, autoAdvance, onContinue]);

  const handleClick = () => {
    if (!isComplete) {
      // Skip to end of text
      setDisplayedText(text);
      setIsComplete(true);
      setCanContinue(true);
    } else if (canContinue && onContinue) {
      onContinue();
    }
  };

  return (
    <motion.div
      className="mx-4 my-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className="relative backdrop-blur-md bg-gradient-to-br from-white/15 to-white/5 rounded-2xl p-5 border border-[#c9a0dc]/30 shadow-2xl cursor-pointer hover:border-[#c9a0dc]/50 transition-colors"
        onClick={handleClick}
      >
        {/* Frosted glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />
        
        <div className="relative z-10">
          {/* Character portrait and name */}
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className="w-14 h-14 rounded-full bg-gradient-to-br from-[#c9a0dc] to-[#1a1625] border-2 border-[#c9a0dc]/50 flex items-center justify-center overflow-hidden flex-shrink-0"
              whileHover={{ scale: 1.05 }}
            >
              {/* Hooded figure silhouette */}
              <svg width="36" height="36" viewBox="0 0 32 32">
                <path
                  d="M 16 8 Q 12 8, 10 12 Q 10 16, 12 18 Q 14 19, 16 19 Q 18 19, 20 18 Q 22 16, 22 12 Q 20 8, 16 8 Z M 16 4 Q 20 4, 22 6 L 24 8 Q 26 12, 26 16 L 24 18 Q 22 20, 20 20 L 16 22 L 12 20 Q 10 20, 8 18 L 6 16 Q 6 12, 8 8 L 10 6 Q 12 4, 16 4 Z"
                  fill="currentColor"
                  className="text-[#1a1625]"
                />
              </svg>
            </motion.div>
            
            <div className="flex-1">
              <div className="text-sm text-[#f4a261] tracking-wide">
                {characterName}
              </div>
            </div>
          </div>

          {/* Dialogue text with typing effect */}
          <div className="text-sm text-white/90 leading-relaxed font-serif min-h-[4rem] pr-2">
            {displayedText}
            {!isComplete && (
              <motion.span
                className="inline-block w-2 h-4 bg-[#c9a0dc] ml-1"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
          
          {/* Skip hint */}
          {!isComplete && (
            <motion.div
              className="absolute top-2 right-3 text-xs text-white/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1 }}
            >
              tap to skip
            </motion.div>
          )}
        </div>

        {/* Continue indicator */}
        {showContinue && canContinue && (
          <motion.div
            className="absolute bottom-3 right-4 text-[#c9a0dc]/60"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              y: [0, 4, 0]
            }}
            transition={{
              opacity: { duration: 0.3 },
              y: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
