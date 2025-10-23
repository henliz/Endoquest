import { motion } from 'motion/react';
import { EnemyDisplay } from './EnemyDisplay';
import { DialogueBox } from './DialogueBox';

interface Choice {
  id: string;
  text: string;
  emotion?: string;
}

interface DialogueChoiceScreenProps {
  enemyName: string;
  flareValue: number;
  clarityValue: number;
  characterName: string;
  dialogueText: string;
  choices: Choice[];
  onChoiceSelect: (choiceId: string) => void;
}

export function DialogueChoiceScreen({
  enemyName,
  flareValue,
  clarityValue,
  characterName,
  dialogueText,
  choices,
  onChoiceSelect,
}: DialogueChoiceScreenProps) {
  return (
    <div className="min-h-screen bg-[#1a1625] flex flex-col">
      {/* Top Third - Enemy Display */}
      <EnemyDisplay
        enemyName={enemyName}
        flareValue={flareValue}
        clarityValue={clarityValue}
      />

      {/* Middle Third - Dialogue */}
      <DialogueBox characterName={characterName} text={dialogueText} />

      {/* Bottom Third - Dialogue Choices */}
      <div className="flex-1 flex flex-col justify-end px-4 pb-8 space-y-3">
        {choices.map((choice, index) => (
          <motion.button
            key={choice.id}
            onClick={() => onChoiceSelect(choice.id)}
            className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 text-left hover:bg-white/10 transition-colors active:scale-98"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Emotion tag if present */}
            {choice.emotion && (
              <div className="text-xs text-[#f4a261] mb-1">
                [{choice.emotion}]
              </div>
            )}
            
            {/* Choice text */}
            <div className="text-sm text-white/90 leading-relaxed font-serif">
              {choice.text}
            </div>

            {/* Subtle arrow indicator */}
            <motion.div
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c9a0dc]/50"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              →
            </motion.div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
