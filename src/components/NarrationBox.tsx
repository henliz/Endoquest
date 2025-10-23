import { motion } from 'motion/react';

interface NarrationBoxProps {
  text: string;
}

export function NarrationBox({ text }: NarrationBoxProps) {
  return (
    <motion.div
      className="mx-4 my-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative backdrop-blur-sm bg-black/30 rounded-xl p-4 border border-[#c9a0dc]/20">
        <div className="text-xs text-[#c9a0dc]/80 text-center italic font-serif leading-relaxed">
          {text}
        </div>
      </div>
    </motion.div>
  );
}
