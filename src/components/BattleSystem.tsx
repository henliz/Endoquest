import { motion, AnimatePresence } from 'motion/react';
import { Eye, Leaf, Sparkles, Shield } from 'lucide-react';

interface BattleAction {
  id: 'observe' | 'soothe' | 'probe' | 'resist';
  icon: typeof Eye;
  name: string;
  subtitle: string;
  color: string;
  glowColor: string;
}

interface BattleSystemProps {
  flare: number;
  clarity: number;
  onActionSelect: (actionId: string) => void;
  disabled?: boolean;
  lastAction?: string;
  showCombo?: boolean;
}

const actions: BattleAction[] = [
  {
    id: 'observe',
    icon: Eye,
    name: 'Observe',
    subtitle: 'Watch the pattern',
    color: '#4a90e2',
    glowColor: 'rgba(74, 144, 226, 0.3)',
  },
  {
    id: 'soothe',
    icon: Leaf,
    name: 'Soothe',
    subtitle: 'Gentle warmth',
    color: '#52b788',
    glowColor: 'rgba(82, 183, 136, 0.3)',
  },
  {
    id: 'probe',
    icon: Sparkles,
    name: 'Probe',
    subtitle: 'Ask deeper',
    color: '#c9a0dc',
    glowColor: 'rgba(201, 160, 220, 0.3)',
  },
  {
    id: 'resist',
    icon: Shield,
    name: 'Resist',
    subtitle: 'Stand firm',
    color: '#f4a261',
    glowColor: 'rgba(244, 162, 97, 0.3)',
  },
];

export function BattleSystem({ flare, clarity, onActionSelect, disabled, lastAction, showCombo }: BattleSystemProps) {
  return (
    <div className="space-y-4">
      {/* Battle prompt */}
      <div className="text-center mb-2">
        <motion.div
          className="text-xs text-[#f4a261] font-serif italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Choose your response...
        </motion.div>
        
        {/* Combo indicator */}
        {showCombo && (
          <motion.div
            className="text-xs text-[#c9a0dc] mt-2 font-serif"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            ✨ Insight blooms! ✨
          </motion.div>
        )}
      </div>

      {/* Status Bars */}
      <div className="space-y-3">
        {/* Flare Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">🩸</span>
              <span className="text-sm text-[#c9a0dc]">Flare</span>
            </div>
            <span className="text-sm text-[#c9a0dc]/70">{flare}%</span>
          </div>
          <div className="h-3 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #e63946 0%, #c9a0dc 100%)',
                width: `${flare}%`,
              }}
              animate={{ width: `${flare}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Clarity Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">💫</span>
              <span className="text-sm text-[#c9a0dc]">Clarity</span>
            </div>
            <span className="text-sm text-[#c9a0dc]/70">{clarity}%</span>
          </div>
          <div className="h-3 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #4a90e2 0%, #ffffff 100%)',
                width: `${clarity}%`,
              }}
              animate={{ width: `${clarity}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              onClick={() => !disabled && onActionSelect(action.id)}
              className="relative min-h-[100px] rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              disabled={disabled}
            >
              {/* Glow effect on hover */}
              {!disabled && (
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 blur-xl"
                  style={{ backgroundColor: action.glowColor }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <motion.div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${action.color}20` }}
                  whileHover={!disabled ? { rotate: 5 } : {}}
                >
                  <Icon className="w-5 h-5" style={{ color: action.color }} />
                </motion.div>
                
                <div className="text-center">
                  <div className="text-sm text-white/90">
                    {action.name}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">
                    {action.subtitle}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
