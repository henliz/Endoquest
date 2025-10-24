// src/App.tsx
import { useState } from 'react';
import { StartScreen } from './components/StartScreen';
import { TutorialEncounter } from './components/TutorialEncounter';
import { TutorialOverlay } from './components/TutorialOverlay';
// import { AudioManager } from './components/AudioManager'; // not needed with Howler manager
import { HelpCircle } from 'lucide-react';
import { AudioGate } from '@/audio/AudioGate';

type Screen = 'start' | 'tutorial';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [showTutorial, setShowTutorial] = useState(false);

  const handleTutorialComplete = (data: any) => {
    console.log('Tutorial complete with data:', data);
    setCurrentScreen('start');
  };

  const handleStart = () => {
    setCurrentScreen('tutorial');
  };

  return (
    <div className="relative min-h-screen bg-[#1a1625] overflow-hidden">
      {/* One-time, invisible: unlocks audio globally after first gesture */}
      <AudioGate />

      <div className="mx-auto max-w-[375px] min-h-screen relative">
        <div
          className="fixed inset-0 pointer-events-none z-30"
          style={{ background: 'radial-gradient(circle at center, transparent 40%, rgba(26, 22, 37, 0.6) 100%)' }}
        />
        {currentScreen === 'tutorial' && (
          <button
            onClick={() => setShowTutorial(true)}
            className="fixed top-4 right-4 z-40 w-10 h-10 rounded-full backdrop-blur-sm bg-white/10 border border-white/20 flex items-center justify-center text-[#c9a0dc] hover:bg-white/20 transition-colors shadow-lg"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        )}

        {currentScreen === 'start' && <StartScreen onStart={handleStart} />}
        {currentScreen === 'tutorial' && <TutorialEncounter onComplete={handleTutorialComplete} />}

        <TutorialOverlay isVisible={showTutorial} onClose={() => setShowTutorial(false)} />
      </div>
    </div>
  );
}
