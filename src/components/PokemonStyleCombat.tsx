import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BackgroundParticles } from './BackgroundParticles';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Shield, Heart, Search, Sparkles } from 'lucide-react';

const COMBAT_BG = 'https://64.media.tumblr.com/ed870d2f0519b3088903d112822634dd/b38864c912b46d59-70/s2048x3072/8295c8c91ec218372abc8431372161bed0b23dad.jpg';

interface PokemonStyleCombatProps {
  enemyName: string;
  enemyImage: string;
  playerFlare: number;
  playerClarity: number;
  enemyHealth: number;
  onActionSelect: (actionId: string) => void;
  onCombatEnd?: () => void;
  phase2?: boolean;
}

type BattlePhase = 'player_turn' | 'enemy_turn' | 'battle_text' | 'victory';

interface BattleMessage {
  text: string;
  type: 'action' | 'damage' | 'heal' | 'critical' | 'ineffective' | 'victory';
}

export function PokemonStyleCombat({
  enemyName,
  enemyImage,
  playerFlare,
  playerClarity,
  enemyHealth,
  onActionSelect,
  onCombatEnd,
  phase2
}: PokemonStyleCombatProps) {
  const [battlePhase, setBattlePhase] = useState<BattlePhase>('player_turn');
  const [battleMessage, setBattleMessage] = useState<BattleMessage | null>(null);
  const [enemyShake, setEnemyShake] = useState(false);
  const [playerShake, setPlayerShake] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [hasShownTutorial, setHasShownTutorial] = useState(false);
  const [hasTriggeredMidBattle, setHasTriggeredMidBattle] = useState(false);

  useEffect(() => {
    console.log('🎮 Combat Check:', { 
      phase2, 
      enemyHealth, 
      hasTriggeredMidBattle, 
      battlePhase 
    });

    // PHASE 1: Trigger mid-battle transition at 50% HP
    if (!phase2 && enemyHealth <= 50 && enemyHealth > 0 && !hasTriggeredMidBattle) {
      console.log('⚡ TRIGGERING MID-BATTLE TRANSITION!');
      setHasTriggeredMidBattle(true);
      setBattlePhase('victory');
      setBattleMessage({ text: 'The Ache flickers... something is changing...', type: 'critical' });
      setTimeout(() => {
        console.log('🎬 Calling onCombatEnd (Phase 1 → Mid-Battle)');
        onCombatEnd?.();
      }, 2500);
      return;
    }

    // PHASE 2 or PHASE 1 complete victory: Enemy defeated
    if (enemyHealth <= 0 && battlePhase !== 'victory') {
      console.log('🏆 VICTORY! Enemy HP = 0');
      setBattlePhase('victory');
      setBattleMessage({ text: `${enemyName} has been understood...`, type: 'victory' });
      setTimeout(() => {
        console.log('🎬 Calling onCombatEnd (Victory)');
        onCombatEnd?.();
      }, 2500);
    }
  }, [enemyHealth, battlePhase, enemyName, onCombatEnd, phase2, hasTriggeredMidBattle]);

  // Show tutorial on first combat load
  useEffect(() => {
    if (!hasShownTutorial && battlePhase === 'player_turn') {
      setShowTutorial(true);
      setHasShownTutorial(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowTutorial(false);
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, [hasShownTutorial, battlePhase]);

  const handlePlayerAction = (actionId: string) => {
    if (battlePhase !== 'player_turn') return;

    setShowTutorial(false);
    
    let message: BattleMessage;
    
    switch (actionId) {
      case 'observe':
        message = { 
          text: 'You watch the pattern carefully. Clarity rises!', 
          type: 'heal' 
        };
        break;
      case 'soothe':
        message = { 
          text: 'You breathe deeply. The pain softens...', 
          type: 'critical' 
        };
        break;
      case 'probe':
        setEnemyShake(true);
        setTimeout(() => setEnemyShake(false), 300);
        message = { 
          text: 'You ask: Where do you live in me? It\'s super effective!', 
          type: 'damage' 
        };
        break;
      case 'resist':
        message = { 
          text: 'You push through the pain. But at what cost?', 
          type: 'action' 
        };
        break;
      default:
        message = { text: 'You hesitate...', type: 'action' };
    }

    setBattleMessage(message);
    setBattlePhase('battle_text');
    
    // Apply action effects FIRST
    onActionSelect(actionId);
    
    // After 2s, check if enemy is still alive, then enemy turn
    setTimeout(() => {
      // Check if combat is still ongoing (not victory)
      if (enemyHealth > 30) { // Only do enemy turn if enemy has health left
        enemyTurn();
      } else if (enemyHealth > 0) {
        // Close to death, return to player turn
        setBattlePhase('player_turn');
        setBattleMessage(null);
      }
    }, 2000);
  };

  const enemyTurn = () => {
    setBattlePhase('enemy_turn');
    
    const attacks = [
      { text: 'The Ache pulses through you!', damage: 'high' },
      { text: 'The shadow grips tighter...', damage: 'medium' },
      { text: 'It mirrors your own pain back at you!', damage: 'high' },
      { text: 'The Ache whispers doubts...', damage: 'low' },
    ];
    
    const attack = attacks[Math.floor(Math.random() * attacks.length)];
    
    setPlayerShake(true);
    setTimeout(() => setPlayerShake(false), 300);
    
    setBattleMessage({ 
      text: attack.text, 
      type: attack.damage === 'high' ? 'critical' : 'damage' 
    });
    
    // Return to player turn after 2s
    setTimeout(() => {
      setBattlePhase('player_turn');
      setBattleMessage(null);
    }, 2000);
  };

  const getActionIcon = (actionId: string) => {
    switch (actionId) {
      case 'observe': return Search;
      case 'soothe': return Heart;
      case 'probe': return Sparkles;
      case 'resist': return Shield;
      default: return Shield;
    }
  };

  const actions = [
    { id: 'observe', label: 'Observe', desc: 'Study the pattern (+Clarity)', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-cyan-500/40' },
    { id: 'soothe', label: 'Soothe', desc: 'Breathe and calm (-Flare)', color: 'from-green-500/20 to-emerald-500/20', border: 'border-emerald-500/40' },
    { id: 'probe', label: 'Probe', desc: 'Ask deep questions (Damage)', color: 'from-purple-500/20 to-pink-500/20', border: 'border-pink-500/40' },
    { id: 'resist', label: 'Resist', desc: 'Push through (-Flare, -Clarity)', color: 'from-red-500/20 to-orange-500/20', border: 'border-orange-500/40' },
  ];

  return (
    <div className="min-h-screen bg-[#1a1625] flex flex-col relative overflow-hidden">
      {/* Combat background */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src={COMBAT_BG}
          alt="Battle arena"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1625]/70 via-[#1a1625]/50 to-[#1a1625]/80" />
      </div>

      <BackgroundParticles />

      {/* Tutorial overlay */}
      <AnimatePresence>
        {showTutorial && battlePhase === 'player_turn' && (
          <motion.div
            className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 max-w-sm"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <div className="backdrop-blur-xl bg-gradient-to-br from-[#f4a261]/30 to-[#c9a0dc]/20 border-2 border-[#f4a261]/50 rounded-xl p-4 shadow-2xl">
              <div className="text-center mb-3">
                <div className="text-2xl mb-2">⚔️</div>
                <h3 className="text-sm text-white mb-1">Turn-Based Combat</h3>
              </div>
              <div className="space-y-2 text-xs text-white/90 font-serif">
                <p>• Choose your action each turn</p>
                <p>• <span className="text-pink-300">Probe</span> deals damage to enemy</p>
                <p>• Enemy attacks back after your turn</p>
                <p>• Reduce enemy HP to 0 to win!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Enemy section */}
        <div className="flex-1 flex flex-col items-center justify-center pt-8">
          {/* Enemy health bar */}
          <motion.div 
            className="w-64 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-xs text-white/70 mb-1 flex justify-between items-center font-serif">
              <span>{enemyName}</span>
              <span className="text-[#e63946]">{Math.max(0, enemyHealth)}%</span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-[#e63946] to-[#f4a261]"
                initial={{ width: '100%' }}
                animate={{ width: `${Math.max(0, enemyHealth)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {phase2 && (
              <div className="text-xs text-[#e63946] text-center mt-1 italic">
                ⚠️ Awakened State ⚠️
              </div>
            )}
          </motion.div>

          {/* Enemy sprite */}
          <motion.div
            className="relative mb-6"
            animate={enemyShake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 blur-2xl opacity-40 -z-10"
              style={{
                background: phase2 
                  ? 'radial-gradient(circle, #e63946 0%, transparent 70%)'
                  : 'radial-gradient(circle, #c9a0dc 0%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            />

            <div className="w-40 h-40 rounded-lg overflow-hidden border-2 border-[#c9a0dc]/30 relative">
              <ImageWithFallback
                src={enemyImage}
                alt={enemyName}
                className="w-full h-full object-cover object-center"
              />
              
              {phase2 && (
                <motion.div
                  className="absolute inset-0 bg-[#e63946]/20"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* Battle message box */}
        <AnimatePresence>
          {battleMessage && (
            <motion.div
              className="mx-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className={`backdrop-blur-xl rounded-xl p-4 border-2 ${
                battleMessage.type === 'critical' ? 'bg-[#e63946]/20 border-[#e63946]/40' :
                battleMessage.type === 'heal' ? 'bg-[#06d6a0]/20 border-[#06d6a0]/40' :
                battleMessage.type === 'damage' ? 'bg-[#c9a0dc]/20 border-[#c9a0dc]/40' :
                battleMessage.type === 'victory' ? 'bg-[#f4a261]/20 border-[#f4a261]/40' :
                'bg-white/10 border-white/20'
              }`}>
                <p className="text-sm text-white/95 font-serif text-center">
                  {battleMessage.text}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player status */}
        <motion.div
          className="mx-4 mb-3"
          animate={playerShake ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <div className="backdrop-blur-sm bg-black/40 rounded-xl p-3 border border-white/10">
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Flare meter */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-white/70">🔥 Flare</span>
                  <span className="text-[#e63946]">{playerFlare}%</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#e63946] to-[#ff6b6b]"
                    animate={{ width: `${playerFlare}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Clarity meter */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-white/70">💫 Clarity</span>
                  <span className="text-[#06d6a0]">{playerClarity}%</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#06d6a0] to-[#06ffa5]"
                    animate={{ width: `${playerClarity}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action menu */}
        {battlePhase === 'player_turn' && (
          <motion.div
            className="mx-4 mb-6 grid grid-cols-2 gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {actions.map((action, index) => {
              const Icon = getActionIcon(action.id);
              return (
                <motion.button
                  key={action.id}
                  onClick={() => handlePlayerAction(action.id)}
                  className={`backdrop-blur-sm bg-gradient-to-br ${action.color} border ${action.border} rounded-xl p-3 text-left hover:scale-105 active:scale-95 transition-transform`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-white" />
                    <span className="text-sm text-white">{action.label}</span>
                  </div>
                  <div className="text-xs text-white/60 font-serif">
                    {action.desc}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Enemy turn indicator */}
        {battlePhase === 'enemy_turn' && (
          <motion.div
            className="mx-4 mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-sm text-[#e63946] font-serif italic">
              Enemy's turn...
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
