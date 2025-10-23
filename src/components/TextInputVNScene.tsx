import { useState } from 'react';
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

  // Cycle through character images if multiple provided
  const displayImage = characterImages 
    ? characterImages[currentImageIndex % characterImages.length]
    : characterImage;

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
    <div className="min-h-screen w-full flex items-end justify-center relative overflow-hidden">
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

      {/* Character sprite */}
      <AnimatePresence mode="wait">
        {displayImage && (
          <motion.div
            key={displayImage}
            className="absolute bottom-32 md:bottom-40 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ImageWithFallback
              src={displayImage}
              alt={characterName}
              className="max-h-[300px] md:max-h-[400px] w-auto object-contain drop-shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogue + Input Container */}
      <motion.div
        className="relative z-20 w-full max-w-4xl mx-auto px-4 pb-6 md:pb-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* Character name tag */}
        <motion.div
          className="mb-2 ml-4 inline-block px-4 py-1.5 bg-gradient-to-r from-[#c9a0dc]/90 to-[#9b7bb5]/90 rounded-t-xl backdrop-blur-sm border-t-2 border-x-2 border-[#c9a0dc]/50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-white tracking-wide drop-shadow-md">
            {characterName}
          </span>
        </motion.div>

        {/* Dialogue box with Archivist's question */}
        <motion.div
          className="bg-gradient-to-br from-[#2a1f3d]/95 to-[#1a1625]/95 backdrop-blur-md rounded-2xl p-6 md:p-8 border-2 border-[#c9a0dc]/50 shadow-2xl mb-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Archivist's text */}
          <motion.div
            className="text-white/90 leading-relaxed mb-6 font-serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {text}
          </motion.div>

          {/* Input form */}
          <form onSubmit={handleSubmit}>
            <div className="relative">
              {/* Textarea */}
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                maxLength={maxLength}
                className="w-full min-h-[100px] max-h-[200px] p-4 pr-12 bg-black/40 border-2 border-[#c9a0dc]/30 rounded-xl text-white placeholder:text-white/40 focus:border-[#c9a0dc]/60 focus:outline-none focus:ring-2 focus:ring-[#c9a0dc]/20 transition-all resize-y disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />

              {/* Character count */}
              <div className="absolute bottom-2 right-14 text-xs text-white/40">
                {userInput.length}/{maxLength}
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={!userInput.trim() || isLoading}
                className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-[#c9a0dc] to-[#9b7bb5] rounded-lg hover:from-[#d4b3e8] hover:to-[#a889c1] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </motion.button>
            </div>

            {/* Helper text */}
            <motion.div
              className="mt-2 text-xs text-white/50 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Press Enter to send • Shift+Enter for new line
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
