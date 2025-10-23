import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSound } from './AudioManager';
import { getCharacterImagePosition, getCharacterImageHeight, getCharacterImageFit, getCharacterImageWidth, getCharacterImageClipPath, getCharacterImageTransform } from './imageUtils';

interface Choice {
  id: string;
  text: string;
  emotion?: string;
}

interface VNChoiceSceneProps {
  backgroundImage?: string;
  characterImage?: string;
  characterImages?: string[]; // NEW: Support multiple portraits
  characterName: string;
  text: string;
  choices: Choice[];
  onChoiceSelect: (choiceId: string) => void;
}

export function VNChoiceScene({ 
  backgroundImage, 
  characterImage,
  characterImages, // NEW
  characterName, 
  text,
  choices,
  onChoiceSelect
}: VNChoiceSceneProps) {
  // Select portrait image (prefer array if provided)
  const displayImage = characterImages 
    ? characterImages[Math.floor(Math.random() * characterImages.length)]
    : characterImage;
  // Uncomment to add click sound effect:
  // const playClick = useSound('YOUR_CLICK_SOUND_URL_HERE');
  
  const handleChoiceClick = (choiceId: string) => {
    // playClick(); // Uncomment to play sound
    onChoiceSelect(choiceId);
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
      {displayImage && (
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex items-end justify-center"
          style={{ 
            height: '90vh', 
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
            src={displayImage}
            alt={characterName}
            className={`object-${getCharacterImageFit(displayImage)} object-bottom drop-shadow-2xl`}
            style={{ 
              filter: 'drop-shadow(0 0 60px rgba(201, 160, 220, 0.4))',
              height: getCharacterImageHeight(displayImage, '88vh', '78vh'),
              width: getCharacterImageWidth(displayImage),
              maxWidth: 'none',
              objectPosition: getCharacterImagePosition(displayImage),
              clipPath: getCharacterImageClipPath(displayImage),
              transform: getCharacterImageTransform(displayImage)
            }}
          />
        </motion.div>
      )}

      {/* Prompt and choices */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={text}
          className="absolute bottom-0 left-0 right-0 z-20 pb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {/* Question prompt */}
          <div className="mx-4 mb-4 p-4 backdrop-blur-xl bg-gradient-to-br from-black/85 to-black/70 rounded-xl border border-[#c9a0dc]/30">
            <div className="text-xs text-[#f4a261] mb-2 tracking-wide">
              {characterName}
            </div>
            <div className="text-sm text-white/95 font-serif leading-relaxed">
              {text}
            </div>
          </div>

        {/* Choices */}
        <div className="mx-4 space-y-2">
          {choices.map((choice, index) => (
            <motion.button
              key={choice.id}
              onClick={() => handleChoiceClick(choice.id)}
              className="w-full backdrop-blur-md bg-black/60 border border-white/10 rounded-xl p-3 text-left hover:bg-black/70 hover:border-[#c9a0dc]/40 transition-all"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {choice.emotion && (
                <div className="text-xs text-[#f4a261] mb-1">
                  [{choice.emotion}]
                </div>
              )}
              <div className="text-sm text-white/90 leading-relaxed font-serif">
                {choice.text}
              </div>
            </motion.button>
          ))}
        </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
