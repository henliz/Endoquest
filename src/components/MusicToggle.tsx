import { useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';

interface MusicToggleProps {
  onToggle: (enabled: boolean) => void;
}

export function MusicToggle({ onToggle }: MusicToggleProps) {
  const [musicEnabled, setMusicEnabled] = useState(true);

  const handleToggle = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    onToggle(newState);
  };

  return (
    <motion.button
      onClick={handleToggle}
      className="fixed top-4 left-4 z-40 w-10 h-10 rounded-full backdrop-blur-sm bg-white/10 border border-white/20 flex items-center justify-center text-[#c9a0dc] hover:bg-white/20 transition-colors shadow-lg"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      {musicEnabled ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
    </motion.button>
  );
}
