import { useState } from 'react';
import { StartScreen } from './components/StartScreen';
import { TutorialEncounter } from './components/TutorialEncounter';
import { VictoryScreen } from './components/VictoryScreen';
import { TutorialOverlay } from './components/TutorialOverlay';
import { AudioManager } from './components/AudioManager';
import { HelpCircle } from 'lucide-react';

type Screen = 'start' | 'tutorial' | 'victory';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [showTutorial, setShowTutorial] = useState(false);
  const [encounterData, setEncounterData] = useState<any>(null);

  const handleTutorialComplete = (data: any) => {
    console.log('Tutorial complete with data:', data);
    setEncounterData(data);
    setCurrentScreen('victory');
  };

  const handleVictoryContinue = () => {
    // Return to start for demo
    setCurrentScreen('start');
    setEncounterData(null);
  };

  const handleStart = () => {
    setCurrentScreen('tutorial');
  };

  // Generate victory text based on player choices
  const getVictoryText = () => {
    if (!encounterData) {
      return "The body remembers what the mind tries to forget. To name the ache is to begin the journey of understanding.";
    }
    
    const choices = encounterData.choices;
    let text = "Pattern recognized: ";
    
    if (choices.includes('early_onset')) {
      text += "Early and severe cyclical pain, resistant to first-line management. ";
    } else if (choices.includes('progressive')) {
      text += "Progressive symptom development over time. ";
    } else if (choices.includes('chronic')) {
      text += "Chronic baseline pain with consistent presentation. ";
    }
    
    if (choices.includes('dismissed') || choices.includes('unheard')) {
      text += "Emotional markers: Repeated dismissal, self-suppression under distress. ";
    }
    
    text += "Recommendation: Gynecological evaluation for possible endometriosis per SOGC guidelines.";
    
    return text;
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

        {currentScreen === 'victory' && (
          <VictoryScreen
            title="Doctor Scroll Fragment"
            fragmentText={getVictoryText()}
            onContinue={handleVictoryContinue}
          />
        )}

        {/* Tutorial overlay */}
        <TutorialOverlay isVisible={showTutorial} onClose={() => setShowTutorial(false)} />
      </div>
    </div>
  );
}
