import { motion } from 'motion/react';

interface Choice {
  id: string;
  text: string;
  emotion?: string;
}

interface ChoicePromptProps {
  choices: Choice[];
  onChoiceSelect: (choiceId: string) => void;
  prompt?: string;
}

export function ChoicePrompt({ choices, onChoiceSelect, prompt }: ChoicePromptProps) {
  return (
    <motion.div
      className="px-4 pb-6 space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {prompt && (
        <motion.div 
          className="text-xs text-[#c9a0dc] text-center mb-3 font-serif italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {prompt}
        </motion.div>
      )}
      
      {choices.map((choice, index) => (
        <motion.button
          key={choice.id}
          onClick={() => onChoiceSelect(choice.id)}
          className="relative w-full backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 text-left hover:bg-white/10 transition-colors"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Emotion tag if present */}
          {choice.emotion && (
            <div className="text-xs text-[#f4a261] mb-1.5">
              [{choice.emotion}]
            </div>
          )}
          
          {/* Choice text */}
          <div className="text-sm text-white/90 leading-relaxed font-serif pr-6">
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
    </motion.div>
  );
}
