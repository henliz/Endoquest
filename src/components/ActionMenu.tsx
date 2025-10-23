import { motion } from 'motion/react';
import { Eye, Leaf, Sparkles, Shield } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Action {
  id: string;
  icon: LucideIcon;
  name: string;
  subtitle: string;
  color: string;
  glowColor: string;
}

interface ActionMenuProps {
  onActionSelect: (actionId: string) => void;
}

const actions: Action[] = [
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

export function ActionMenu({ onActionSelect }: ActionMenuProps) {
  return (
    <div className="px-4 pb-8">
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              onClick={() => onActionSelect(action.id)}
              className="relative min-h-[100px] rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10 p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Glow effect on hover */}
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 blur-xl"
                style={{ backgroundColor: action.glowColor }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <motion.div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${action.color}20` }}
                  whileHover={{ rotate: 5 }}
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
