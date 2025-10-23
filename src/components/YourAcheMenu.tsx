import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Scroll, Home, FileText, Sparkles } from 'lucide-react';
import { HealersChronicle } from './HealersChronicle';
import { WaysideComforts } from './WaysideComforts';
import { GuildOfRestoration } from './GuildOfRestoration';
import { AcheDialogue } from './AcheDialogue';

interface YourAcheMenuProps {
  onClose: () => void;
}

type MenuOption = 'dialogue' | 'main' | 'healers_chronicle' | 'wayside_comforts' | 'guild_restoration';

export function YourAcheMenu({ onClose }: YourAcheMenuProps) {
  const [currentView, setCurrentView] = useState<MenuOption>('dialogue');
  const [hasMetAche, setHasMetAche] = useState(false);

  const menuOptions = [
    {
      id: 'healers_chronicle' as MenuOption,
      title: "The Healer's Chronicle",
      subtitle: "A scroll for those who mend",
      description: "Your journey, written in the language of healers. Share this with physicians and caregivers who will listen.",
      icon: <Scroll className="w-8 h-8" />,
      color: "from-blue-500/20 to-cyan-500/20 border-blue-400/50"
    },
    {
      id: 'wayside_comforts' as MenuOption,
      title: "Wayside Comforts",
      subtitle: "Remedies for the road",
      description: "Gentle wisdom for managing pain at home. Small magics that ease the journey.",
      icon: <Home className="w-8 h-8" />,
      color: "from-green-500/20 to-emerald-500/20 border-green-400/50"
    },
    {
      id: 'guild_restoration' as MenuOption,
      title: "Guild of Restoration",
      subtitle: "Where support awaits",
      description: "The Guild's resources are yours. Healers, counselors, and aids matched to your needs.",
      icon: <FileText className="w-8 h-8" />,
      color: "from-purple-500/20 to-pink-500/20 border-purple-400/50"
    }
  ];

  const handleBack = () => {
    // If returning from a submenu, go to dialogue with hasMetBefore=true
    setCurrentView('dialogue');
  };

  const handleMenuChoice = (choice: 'healers_chronicle' | 'wayside_comforts' | 'guild_restoration') => {
    setCurrentView(choice);
  };

  // For dialogue view, use full screen
  if (currentView === 'dialogue') {
    return (
      <motion.div
        className="absolute inset-0 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <AcheDialogue
          onMenuChoice={handleMenuChoice}
          onClose={onClose}
          hasMetBefore={hasMetAche}
          onMarkAsMet={() => setHasMetAche(true)}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-2xl max-h-[90vh] mx-4 bg-gradient-to-br from-[#2a1f3d]/98 to-[#1a1625]/98 border-2 border-[#c9a0dc]/50 rounded-2xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <AnimatePresence mode="wait">
          {currentView === 'healers_chronicle' ? (
            <HealersChronicle onBack={handleBack} />
          ) : currentView === 'wayside_comforts' ? (
            <WaysideComforts onBack={handleBack} />
          ) : currentView === 'guild_restoration' ? (
            <GuildOfRestoration onBack={handleBack} />
          ) : null}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
