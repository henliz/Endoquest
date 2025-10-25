import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getCharacterImagePosition, getCharacterImageHeight, getCharacterImageFit, getCharacterImageWidth, getCharacterImageClipPath, getCharacterImageTransform } from './imageUtils';

interface VNSceneProps {
  backgroundImage?: string;
  characterImage?: string;
  characterImages?: string[]; // NEW: Support multiple portraits that rotate
  characterName: string;
  text: string;
  onContinue?: () => void;
  showContinue?: boolean;
}

// Counter to track portrait rotation across component instances
let portraitRotationIndex = 0;

export function VNScene({
  backgroundImage,
  characterImage,
  characterImages, // NEW
  characterName,
  text,
  onContinue,
  showContinue = true
}: VNSceneProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [canContinue, setCanContinue] = useState(false);

  // NEW: Select which portrait to show
  const [currentCharacterImage, setCurrentCharacterImage] = useState<string>('');

  useEffect(() => {
    // Determine which image to use
    if (characterImages && characterImages.length > 0) {
      // Rotate through images sequentially (change every 2 dialogue boxes)
      const dialogueCounter = Math.floor(portraitRotationIndex / 2);
      const imageIndex = dialogueCounter % characterImages.length;
      setCurrentCharacterImage(characterImages[imageIndex]);
      portraitRotationIndex++;
    } else if (characterImage) {
      setCurrentCharacterImage(characterImage);
    }
  }, [text, characterImage, characterImages]);

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

        setTimeout(() => {
          setCanContinue(true);
        }, 300);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [text]);

  const handleClick = () => {
    if (!isComplete) {
      setDisplayedText(text);
      setIsComplete(true);
      setCanContinue(true);
    } else if (canContinue && onContinue) {
      onContinue();
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1625] flex flex-col relative overflow-hidden">
      {/* Background image */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <ImageWithFallback
            src={backgroundImage}
            alt="Background"
            className="w-full h-full object-cover opacity-40"
            style={{ objectPosition: '60% center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1625]/60 via-[#1a1625]/40 to-[#1a1625]/90" />
        </div>
      )}

      {/* Character portrait - VN style centered HUGE */}
      {currentCharacterImage && (
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex items-end justify-center"
          style={{
            height: '100vh',
            width: '100vw'
          }}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            y: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <img
            src={currentCharacterImage}
            alt={characterName}
            className={`object-${getCharacterImageFit(currentCharacterImage)} object-bottom drop-shadow-2xl`}
            style={{
              filter: 'drop-shadow(0 0 60px rgba(201, 160, 220, 0.4))',
              height: getCharacterImageHeight(currentCharacterImage, '95vh', '85vh'),
              width: getCharacterImageWidth(currentCharacterImage),
              maxWidth: 'none',
              objectPosition: getCharacterImagePosition(currentCharacterImage),
              clipPath: getCharacterImageClipPath(currentCharacterImage),
              transform: getCharacterImageTransform(currentCharacterImage)
            }}
          />
        </motion.div>
      )}

      {/* Dialogue box */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <motion.div
          className="mx-4 mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div
            className="relative backdrop-blur-xl bg-gradient-to-br from-black/85 to-black/70 rounded-2xl p-6 border border-[#c9a0dc]/30 shadow-2xl cursor-pointer"
            onClick={handleClick}
          >
            {/* Character name tag */}
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

            {/* Dialogue text */}
            <div className="text-sm text-white/95 leading-relaxed font-serif min-h-[5rem] pt-2">
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
                className="absolute top-2 right-4 text-xs text-white/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1 }}
              >
                tap to skip
              </motion.div>
            )}

            {/* Continue indicator */}
            {showContinue && canContinue && (
              <motion.div
                className="absolute bottom-3 right-4 text-[#c9a0dc]"
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
      </div>
    </div>
  );
}
