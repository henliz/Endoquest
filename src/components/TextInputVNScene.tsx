import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BackgroundParticles } from './BackgroundParticles';

interface TextInputVNSceneProps {
  backgroundImage?: string;
  characterImage?: string;
  characterImages?: string[];
  characterName: string;
  text: string;
  placeholder?: string;
  onSubmit: (userInput: string) => void;
  isLoading?: boolean;
  maxLength?: number;
}

export function TextInputVNScene({
  backgroundImage,
  characterImage,
  characterImages,
  characterName,
  text,
  placeholder = "Type your response...",
  onSubmit,
  isLoading = false,
  maxLength = 500
}: TextInputVNSceneProps) {
  const [userInput, setUserInput] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [characterPushDown, setCharacterPushDown] = useState(0);
  const dialogueBoxRef = useRef<HTMLDivElement>(null);
  const characterImgRef = useRef<HTMLImageElement>(null);

  // Cycle through character images if multiple provided
  const displayImage = characterImages
    ? characterImages[currentImageIndex % characterImages.length]
    : characterImage;

  // Measure dialogue box and character image to detect actual overlap
  // Only check ONCE after typing completes to avoid stuttering
  useEffect(() => {
    const checkOverlap = () => {
      if (dialogueBoxRef.current && characterImgRef.current) {
        const dialogueRect = dialogueBoxRef.current.getBoundingClientRect();
        const characterRect = characterImgRef.current.getBoundingClientRect();

        // Get dialogue box bottom edge
        const dialogueBottom = dialogueRect.bottom;

        // Get character's "head" position (top 10% of the character image)
        const characterTop = characterRect.top;
        const characterHeight = characterRect.height;
        const characterHeadPosition = characterTop + (characterHeight * 0.1);

        // If dialogue bottom is below character's head, they're clipping
        const overlap = Math.max(0, dialogueBottom - characterHeadPosition);

        // Add extra padding to clear forehead (50px base + 10% of overlap)
        const pushDown = overlap > 0 ? overlap + 50 + (overlap * 0.1) : 0;

        setCharacterPushDown(pushDown);
      }
    };

    // Only check after typing completes OR when loading state changes
    if (isTypingComplete || isLoading) {
      // Small delay to let dialogue box fully render
      const timeoutId = setTimeout(checkOverlap, 100);
      return () => clearTimeout(timeoutId);
    }

    // Also check on window resize
    window.addEventListener('resize', checkOverlap);
    return () => window.removeEventListener('resize', checkOverlap);
  }, [isTypingComplete, isLoading]);

  // Typing animation for the question text
  useEffect(() => {
    let currentIndex = 0;
    setDisplayedText('');
    setIsTypingComplete(false);

    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTypingComplete(true);
      }
    }, 20); // Typing speed

    return () => clearInterval(interval);
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isLoading) {
      onSubmit(userInput.trim());
      setUserInput('');

      // Cycle to next image on submit
      if (characterImages) {
        setCurrentImageIndex(prev => prev + 1);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (but allow Shift+Enter for new lines)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden">
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={backgroundImage}
            alt="Scene background"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
      )}

      {/* Background particles */}
      <BackgroundParticles />

      {/* Character sprite - with wrapper div that can be pushed down */}
      <AnimatePresence mode="wait">
        {displayImage && (
          <div
            className="absolute bottom-0 left-1/2 z-10 pointer-events-none"
            style={{
              // Push the entire wrapper down AND center it
              transform: `translateX(-50%) translateY(${characterPushDown + 50}px)`,
              transition: 'transform 0.3s ease-out',
              width: '100vw'
            }}
          >
            <motion.div
              key={displayImage}
              className="flex items-end justify-center"
              style={{
                height: '100vh',
                width: '100%'
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                y: [0, -8, 0], // Floating animation
              }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.3 },
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <img
                ref={characterImgRef}
                src={displayImage}
                alt={characterName}
                className="object-contain object-bottom drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 0 60px rgba(201, 160, 220, 0.4))',
                  height: '95vh',
                  width: 'auto',
                  maxWidth: 'none'
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Question Dialogue Box - Stuck to top */}
      <motion.div
        className="relative z-20 pt-4 px-4"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="max-w-4xl mx-auto mt-4">
          {/* Main dialogue box */}
          <div
            ref={dialogueBoxRef}
            className="relative backdrop-blur-xl bg-gradient-to-br from-black/85 to-black/70 rounded-2xl p-4 border border-[#c9a0dc]/30 shadow-2xl"
          >
            {/* Character name pill - sticks out at the top */}
            <motion.div
              className="absolute -top-4 left-6 px-4 py-1 bg-gradient-to-r from-[#c9a0dc] to-[#f4a261] rounded-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-xs text-white tracking-wide">
                {characterName}
              </span>
            </motion.div>

            {/* Show loading state OR dialogue text */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-[#c9a0dc] animate-spin" />
              </div>
            ) : (
              /* Dialogue text with typing effect */
              <div className="text-sm text-white/95 leading-relaxed font-serif pt-2">
                {displayedText}
                {!isTypingComplete && (
                  <motion.span
                    className="inline-block w-2 h-4 bg-[#c9a0dc] ml-1"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Spacer to push input to bottom */}
      <div className="flex-1" />

      {/* iMessage-style Input Bar - Stuck to bottom - HIDE when loading */}
      {!isLoading && (
        <motion.div
          className="relative z-20 px-4 pb-6 md:pb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative backdrop-blur-md bg-gradient-to-br from-[#2a2a2a]/95 to-[#1a1a1a]/95 rounded-3xl border border-white/10 shadow-2xl p-3 pr-14 flex items-end">
              {/* Auto-expanding textarea */}
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                maxLength={maxLength}
                rows={1}
                className="flex-1 bg-transparent text-white placeholder:text-white/40 px-2 py-2 outline-none border-none resize-none max-h-[120px] overflow-y-auto font-serif focus:outline-none focus:ring-0"
                style={{
                  minHeight: '44px',
                  height: 'auto'
                }}
                onInput={(e) => {
                  // Auto-expand textarea
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />

              {/* Character count */}
              <div className="absolute bottom-2 left-4 text-xs text-white/30">
                {userInput.length}/{maxLength}
              </div>

              {/* Send button with gradient pill styling */}
              <motion.button
                type="submit"
                disabled={!userInput.trim() || isLoading}
                className="absolute right-3 bottom-3 flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#c9a0dc] to-[#f4a261] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Helper text */}
            <motion.div
              className="mt-2 text-xs text-white/40 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Press Enter to send • Shift+Enter for new line
            </motion.div>
          </form>
        </motion.div>
      )}
    </div>
  );
}