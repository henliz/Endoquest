import { useState } from 'react';
import { TextInputVNScene } from './TextInputVNScene';
import { VNScene } from './VNScene';
import { AnimatePresence, motion } from 'motion/react';

interface AITextInputSceneProps {
  backgroundImage?: string;
  characterImage?: string;
  characterImages?: string[];
  characterName: string;
  promptText: string;
  placeholder?: string;
  sceneId: string;
  playerData?: {
    combatActions?: string[];
    flare?: number;
    clarity?: number;
    turnCount?: number;
  };
  onAdvance: (userInput: string, aiResponse: string) => void;
  apiUrl?: string;
}

/**
 * AITextInputScene - Combines TextInputVNScene with AI backend
 *
 * Flow:
 * 1. Show prompt with text input
 * 2. Player types response
 * 3. Call AI backend with sceneId + userInput (shows loading in input box)
 * 4. Show AI response in VNScene with smooth transition
 * 5. On continue, call onAdvance
 */
export function AITextInputScene({
  backgroundImage,
  characterImage,
  characterImages,
  characterName,
  promptText,
  placeholder,
  sceneId,
  playerData,
  onAdvance,
  apiUrl = 'http://localhost:3001'
}: AITextInputSceneProps) {
  const [phase, setPhase] = useState<'input' | 'response'>('input');
  const [aiResponse, setAiResponse] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (input: string) => {
    setUserInput(input);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/ai/scene-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId,
          userInput: input,
          playerData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      setAiResponse(data.response);
      setPhase('response');
    } catch (err) {
      console.error('AI response error:', err);
      setError('The Archivist seems distant... perhaps try again?');

      // Fallback response
      setAiResponse('The archives ripple with your words. The world is listening.');
      setPhase('response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    onAdvance(userInput, aiResponse);
  };

  return (
    <AnimatePresence mode="wait">
      {phase === 'input' ? (
        <motion.div
          key="input"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <TextInputVNScene
            backgroundImage={backgroundImage}
            characterImage={characterImage}
            characterImages={characterImages}
            characterName={characterName}
            text={promptText}
            placeholder={placeholder}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </motion.div>
      ) : (
        <motion.div
          key="response"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <VNScene
            backgroundImage={backgroundImage}
            characterImage={characterImage}
            characterImages={characterImages}
            characterName={characterName}
            text={aiResponse}
            onContinue={handleContinue}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}