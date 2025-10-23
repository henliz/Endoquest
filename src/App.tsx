import { useState } from 'react';
import { StartScreen } from './components/StartScreen';
import { TutorialEncounter } from './components/TutorialEncounter';
import { TutorialOverlay } from './components/TutorialOverlay';
import { AudioManager } from './components/AudioManager';
import { HelpCircle } from 'lucide-react';

type Screen = 'start' | 'tutorial';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [showTutorial, setShowTutorial] = useState(false);

  const handleTutorialComplete = (data: any) => {
    console.log('Tutorial complete with data:', data);
    // Return to start menu
    setCurrentScreen('start');
  };

  const handleStart = () => {
    setCurrentScreen('tutorial');
  };

  return (
    <div className="relative min-h-screen bg-[#1a1625] overflow-hidden">
      {/* Background music - add your audio URL here */}
      {/* <AudioManager bgmUrl="YOUR_AUDIO_URL_HERE" volume={0.3} /> */}
      
      {/* Mobile viewport container */}
      <div className="mx-auto max-w-[375px] min-h-screen relative">
        {/* Vignette effect */}
        <div className="fixed inset-0 pointer-events-none z-30" style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(26, 22, 37, 0.6) 100%)'
        }} />
        {/* Help button - show during tutorial on combat screens */}
        {currentScreen === 'tutorial' && (
          <button
            onClick={() => setShowTutorial(true)}
            className="fixed top-4 right-4 z-40 w-10 h-10 rounded-full backdrop-blur-sm bg-white/10 border border-white/20 flex items-center justify-center text-[#c9a0dc] hover:bg-white/20 transition-colors shadow-lg"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        )}

        {/* Render current screen */}
        {currentScreen === 'start' && (
          <StartScreen onStart={handleStart} />
        )}

        {currentScreen === 'tutorial' && (
          <TutorialEncounter onComplete={handleTutorialComplete} />
        )}

        {/* Tutorial overlay */}
        <TutorialOverlay isVisible={showTutorial} onClose={() => setShowTutorial(false)} />
      </div>
    </div>
  );
}
