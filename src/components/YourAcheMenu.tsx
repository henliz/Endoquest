// YourAcheMenu.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { HealersChronicle } from './HealersChronicle';
import { WaysideComforts } from './WaysideComforts';
import { GuildOfRestoration } from './GuildOfRestoration';
import { AcheDialogue } from './AcheDialogue';
import type { ReportJSON } from '../api';

interface YourAcheMenuProps {
  onClose: () => void;
  reportPhysician?: ReportJSON | null;
  reportHome?: ReportJSON | null;
  requestReport?: (audience?: 'physician' | 'home') => Promise<void>;
  reportLoading?: boolean;
  reportError?: string | null;
}

type MenuOption = 'dialogue' | 'healers_chronicle' | 'wayside_comforts' | 'guild_restoration';

export function YourAcheMenu({ onClose, reportPhysician, reportHome, requestReport }: YourAcheMenuProps) {
  const [currentView, setCurrentView] = useState<MenuOption>('dialogue');
  const [hasMetAche, setHasMetAche] = useState(false);

  const handleBack = () => setCurrentView('dialogue');

  const handleMenuChoice = (choice: MenuOption) => {
    if (choice === 'healers_chronicle' && !reportPhysician) {
      requestReport?.('physician');
    }
    if (choice === 'wayside_comforts' && !reportHome) {
      requestReport?.('home');
    }
    setCurrentView(choice);
  };

  if (currentView === 'dialogue') {
    return (
      <motion.div className="absolute inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <AcheDialogue
          onMenuChoice={(c) => handleMenuChoice(c as MenuOption)}
          onClose={onClose}
          hasMetBefore={hasMetAche}
          onMarkAsMet={() => setHasMetAche(true)}
        />
      </motion.div>
    );
  }

  return (
    <motion.div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="relative w-full max-w-[420px] h-[90vh] bg-gradient-to-br from-[#2a1f3d]/98 to-[#1a1625]/98 border-2 border-[#c9a0dc]/50 rounded-2xl shadow-2xl flex flex-col min-h-0 overflow-hidden mx-auto"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full">
          <X className="w-5 h-5 text-white" />
        </button>

        <AnimatePresence mode="wait">
          <div className="flex justify-center px-4 w-full">
            <div className="w-full max-w-[420px] mx-auto">
              {currentView === 'healers_chronicle' ? (
                <HealersChronicle key="healers" onBack={handleBack} report={reportPhysician ?? null} />
              ) : currentView === 'wayside_comforts' ? (
                <WaysideComforts key="wayside" onBack={handleBack} report={reportHome ?? undefined} />
              ) : currentView === 'guild_restoration' ? (
                <GuildOfRestoration key="guild" onBack={handleBack} />
              ) : null}
            </div>
          </div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
