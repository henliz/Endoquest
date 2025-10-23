import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BackgroundParticles } from './BackgroundParticles';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Shield, Heart, Search, Sparkles, AlertTriangle, Zap, Brain, Wind } from 'lucide-react';

const COMBAT_BG = 'https://64.media.tumblr.com/ed870d2f0519b3088903d112822634dd/b38864c912b46d59-70/s2048x3072/8295c8c91ec218372abc8431372161bed0b23dad.jpg';

interface EnhancedCombatProps {
  enemyName: string;
  enemyImage: string;
  playerFlare: number;
  playerClarity: number;
  enemyHealth: number;
  onActionSelect: (actionId: string) => void;
  onCombatEnd?: () => void;
  onMiniChoice?: (choice: string) => void;
  phase2?: boolean;
}

type BattlePhase = 'player_turn' | 'enemy_telegraph' | 'enemy_attack' | 'mini_decision' | 'battle_text' | 'tutorial' | 'victory';

type EnemyMove = 'phantom_throb' | 'gaslighting_whisper' | 'flare_spike' | 'numbing_fog' | 'shared_suffering';

interface BattleMessage {
  text: string;
  type: 'action' | 'damage' | 'heal' | 'critical' | 'ineffective' | 'victory' | 'telegraph' | 'warning';
}

interface CombatState {
  turnCount: number;
  nextEnemyMove: EnemyMove | null;
  sootheUsedTurn: number; // Track when Soothe was last used
  isNumbed: boolean; // Numbing Fog status
  environmentalEffect: string | null;
  tutorialStep: number; // 0 = done, 1-4 = active tutorial
  hasSeenTutorial: boolean; // Global flag - never show again
}

export function EnhancedCombat({
  enemyName,
  enemyImage,
  playerFlare,
  playerClarity,
  enemyHealth,
  onActionSelect,
  onCombatEnd,
  onMiniChoice,
  phase2 = false
}: EnhancedCombatProps) {
  const [battlePhase, setBattlePhase] = useState<BattlePhase>(phase2 ? 'player_turn' : 'tutorial');
  const [battleMessage, setBattleMessage] = useState<BattleMessage | null>(null);
  const [enemyShake, setEnemyShake] = useState(false);
  const [playerShake, setPlayerShake] = useState(false);
  
  const [combatState, setCombatState] = useState<CombatState>({
    turnCount: 0,
    nextEnemyMove: null,
    sootheUsedTurn: -10, // Long ago
    isNumbed: false,
    environmentalEffect: null,
    tutorialStep: phase2 ? 0 : 1, // Start tutorial in phase 1 only
    hasSeenTutorial: phase2 // If phase 2, we've already seen it
  });

  // Check for victory conditions
  useEffect(() => {
    // Phase 1: Trigger mid-battle at 50% HP
    if (!phase2 && enemyHealth <= 50 && enemyHealth > 0 && battlePhase !== 'victory') {
      console.log('⚡ PHASE 1 COMPLETE - Triggering mid-battle');
      setBattlePhase('victory');
      setBattleMessage({ text: 'The Ache flickers... something is changing...', type: 'critical' });
      setTimeout(() => onCombatEnd?.(), 2500);
      return;
    }

    // Phase 2: Victory at 0 HP (removed Clarity requirement for now - too hard)
    if (phase2 && enemyHealth <= 0 && battlePhase !== 'victory') {
      console.log('🏆 VICTORY - Phase 2 complete');
      setBattlePhase('victory');
      setBattleMessage({ text: `${enemyName} has been understood...`, type: 'victory' });
      setTimeout(() => onCombatEnd?.(), 2500);
    }

    // Normal Phase 1 victory (if somehow reached 0 HP)
    if (!phase2 && enemyHealth <= 0 && battlePhase !== 'victory') {
      setBattlePhase('victory');
      setBattleMessage({ text: 'The Ache wavers...', type: 'victory' });
      setTimeout(() => onCombatEnd?.(), 2500);
    }
  }, [enemyHealth, battlePhase, playerClarity, phase2, onCombatEnd, enemyName]);

  // Tutorial progression
  const advanceTutorial = () => {
    if (combatState.tutorialStep === 4) {
      // Tutorial complete
      setCombatState(prev => ({ ...prev, tutorialStep: 0, hasSeenTutorial: true }));
      setBattlePhase('player_turn');
    } else {
      setCombatState(prev => ({ ...prev, tutorialStep: prev.tutorialStep + 1 }));
    }
  };

  // Enemy move selection
  const selectEnemyMove = (): EnemyMove => {
    if (phase2) {
      // Phase 2: Can use Shared Suffering
      const moves: EnemyMove[] = ['phantom_throb', 'gaslighting_whisper', 'shared_suffering'];
      
      if (playerClarity > 70) {
        moves.push('flare_spike'); // Punish high clarity
      }
      
      return moves[Math.floor(Math.random() * moves.length)];
    } else {
      // Phase 1: Standard moves
      const moves: EnemyMove[] = ['phantom_throb', 'gaslighting_whisper'];
      
      if (playerClarity > 70) {
        moves.push('flare_spike');
      }
      
      if (combatState.turnCount > 3 && Math.random() > 0.7) {
        moves.push('numbing_fog');
      }
      
      return moves[Math.floor(Math.random() * moves.length)];
    }
  };

  // Get telegraph message for enemy move
  const getTelegraph = (move: EnemyMove): string => {
    if (phase2 && playerClarity < 20) {
      // Cryptic telegraphs at low clarity
      const cryptic = [
        "The Ache seems... sad?",
        "Something shifts in the fog...",
        "You feel... something?",
        "..."
      ];
      return cryptic[Math.floor(Math.random() * cryptic.length)];
    }

    switch (move) {
      case 'phantom_throb':
        return "The Ache's form pulses rhythmically...";
      case 'gaslighting_whisper':
        return "Whispers echo around you...";
      case 'flare_spike':
        return "The Ache's form flickers RED!";
      case 'numbing_fog':
        return "The fog thickens and swirls...";
      case 'shared_suffering':
        return "The Ache reaches toward you, trembling...";
    }
  };

  // Execute enemy attack
  const executeEnemyAttack = (move: EnemyMove) => {
    let message: BattleMessage;
    let flareIncrease = 0;
    let clarityChange = 0;
    let applyNumb = false;

    switch (move) {
      case 'phantom_throb':
        message = { text: "A wave of deep, aching pain radiates through you...", type: 'damage' };
        flareIncrease = 8; // Reduced from 15
        break;
      
      case 'gaslighting_whisper':
        message = { text: "\"Did you imagine it? Was it ever real?\"", type: 'critical' };
        flareIncrease = 6; // Reduced from 10
        clarityChange = -15; // Reduced from -20
        break;
      
      case 'flare_spike':
        message = { text: "The pain surges suddenly, taking your breath away!", type: 'critical' };
        flareIncrease = 18; // Reduced from 30
        setEnemyShake(true);
        setTimeout(() => setEnemyShake(false), 500);
        break;
      
      case 'numbing_fog':
        message = { text: "Everything feels distant... muffled... wrong.", type: 'warning' };
        flareIncrease = 3; // Reduced from 5
        applyNumb = true;
        break;
      
      case 'shared_suffering':
        message = { text: "\"If I hurt, you hurt. We are the same.\"", type: 'critical' };
        flareIncrease = 12; // Reduced from 20
        clarityChange = -8; // Reduced from -10
        break;
    }

    setBattleMessage(message);
    setPlayerShake(true);
    setTimeout(() => setPlayerShake(false), 300);

    // Apply effects through callback
    onActionSelect(`ENEMY_${move}:${flareIncrease}:${clarityChange}`);

    if (applyNumb) {
      setCombatState(prev => ({ ...prev, isNumbed: true }));
    }

    // After enemy attack, return to player turn
    setTimeout(() => {
      setBattlePhase('player_turn');
      setBattleMessage(null);
    }, 2000);
  };

  // Handle player action
  const handlePlayerAction = (actionId: string) => {
    if (battlePhase !== 'player_turn') return;

    // Check if Observe is locked by Numbing Fog
    if (actionId === 'observe' && combatState.isNumbed) {
      setBattleMessage({ 
        text: "You try to focus, but the Numbing Fog blocks your thoughts...", 
        type: 'ineffective' 
      });
      setBattlePhase('battle_text');
      setTimeout(() => {
        setCombatState(prev => ({ ...prev, isNumbed: false })); // Clear numb
        startEnemyTurn();
      }, 2000);
      return;
    }

    // Calculate action effectiveness
    let message: BattleMessage;
    let damage = 0;
    let flareChange = 0;
    let clarityChange = 0;

    const sootheCooldown = combatState.turnCount - combatState.sootheUsedTurn;
    
    switch (actionId) {
      case 'observe':
        // Strong vs Gaslighting Whisper (counters Clarity loss)
        if (combatState.nextEnemyMove === 'gaslighting_whisper') {
          message = { text: "You observe carefully, ready for the whispers. Your mind stays clear!", type: 'critical' };
          clarityChange = 30;
        } else {
          message = { text: 'You watch the pattern carefully. Clarity rises!', type: 'heal' };
          clarityChange = 20;
        }
        break;

      case 'soothe':
        // Track usage for cooldown
        const newSootheUsedTurn = combatState.turnCount;
        
        // Effectiveness based on cooldown and phase
        let sootheEffectiveness = -30; // Increased from -25
        if (sootheCooldown === 1) sootheEffectiveness = -20; // Increased from -15
        else if (sootheCooldown === 2) sootheEffectiveness = -25; // Increased from -20
        if (phase2) sootheEffectiveness += 8; // Reduced penalty from 10

        // Strong before Flare Spike
        if (combatState.nextEnemyMove === 'flare_spike') {
          message = { text: "You breathe deeply, bracing yourself for the surge...", type: 'critical' };
          sootheEffectiveness -= 12; // Increased from -10
          clarityChange = 10;
        } else {
          message = { text: 'You breathe deeply. The pain softens...', type: 'heal' };
          clarityChange = 5;
        }

        flareChange = sootheEffectiveness;
        setCombatState(prev => ({ ...prev, sootheUsedTurn: newSootheUsedTurn }));
        break;

      case 'probe':
        // Effectiveness based on Clarity
        if (playerClarity > 70) {
          message = { text: "You see its weak points! DEEP PROBE!", type: 'critical' };
          damage = 50; // Increased from 45
          clarityChange = 20;
          flareChange = 3; // Reduced from 5
        } else if (playerClarity < 30) {
          message = { text: "You're flailing in the dark! Probe is ineffective!", type: 'ineffective' };
          damage = 20; // Increased from 15
          clarityChange = 10;
          flareChange = 8; // Reduced from 10
        } else {
          message = { text: 'You ask: Where do you live in me? It\'s effective!', type: 'damage' };
          damage = 35; // Increased from 30
          clarityChange = 15;
          flareChange = 3; // Reduced from 5
        }

        // Phase 2: Shared Suffering hurts you too (but less now)
        if (phase2 && damage > 0) {
          const reflectedDamage = Math.floor(damage * 0.3); // Reduced from 0.5
          flareChange += reflectedDamage;
          message.text += ` (Shared pain: +${reflectedDamage} Flare!)`;
        }

        setEnemyShake(true);
        setTimeout(() => setEnemyShake(false), 300);
        break;

      case 'resist':
        // Strong vs Phantom Throb (reduces incoming)
        if (combatState.nextEnemyMove === 'phantom_throb') {
          message = { text: "You steel yourself against the throbbing pain!", type: 'critical' };
          damage = 18; // Increased from 15
          flareChange = -22; // Increased from -20
          clarityChange = -5;
        } 
        // Weak vs Gaslighting (doubles clarity loss)
        else if (combatState.nextEnemyMove === 'gaslighting_whisper') {
          message = { text: "Resisting only makes the doubt worse...", type: 'ineffective' };
          damage = 12; // Increased from 10
          flareChange = -12; // Increased from -10
          clarityChange = -18; // Reduced from -20
        } else {
          message = { text: 'You push through the pain. But at what cost?', type: 'action' };
          damage = 12; // Increased from 10
          flareChange = -18; // Increased from -15
          clarityChange = -10;
        }

        setEnemyShake(true);
        setTimeout(() => setEnemyShake(false), 300);
        break;
    }

    setBattleMessage(message);
    setBattlePhase('battle_text');

    // Send action to parent with effects
    onActionSelect(`${actionId}:${damage}:${flareChange}:${clarityChange}`);

    console.log(`💥 Action result: ${damage} dmg to enemy, ${flareChange} Flare, ${clarityChange} Clarity`);

    // Show mini-decision during Probe action
    if (actionId === 'probe') {
      setTimeout(() => {
        setBattlePhase('mini_decision');
      }, 2000);
    } else {
      // For other actions, go straight to enemy turn
      setTimeout(() => {
        startEnemyTurn();
      }, 2000);
    }

    // Environmental effects every 3 turns
    const newTurnCount = combatState.turnCount + 1;
    let environmentalEffect = null;
    
    if (newTurnCount % 3 === 0) {
      const effects = [
        "fog_thickens",
        "echoes",
        "calm"
      ];
      environmentalEffect = effects[Math.floor(Math.random() * effects.length)];
    }

    setCombatState(prev => ({ 
      ...prev, 
      turnCount: newTurnCount,
      environmentalEffect 
    }));
  };

  // Start enemy turn with telegraph
  const startEnemyTurn = () => {
    if (enemyHealth <= 0) return; // Don't attack if dead

    const move = selectEnemyMove();
    const telegraph = getTelegraph(move);

    setCombatState(prev => ({ ...prev, nextEnemyMove: move }));
    setBattlePhase('enemy_telegraph');
    setBattleMessage({ text: telegraph, type: 'telegraph' });

    // After telegraph, execute attack
    setTimeout(() => {
      setBattlePhase('enemy_attack');
      executeEnemyAttack(move);
    }, 1500);
  };

  // Handle mini-decision (diagnostic + engagement) - happens during Probe
  const handleMiniChoice = (choice: string) => {
    onMiniChoice?.(choice);
    
    let flareIncrease = 0;
    let clarityIncrease = 0;
    let followUpMessage = "";

    switch (choice) {
      case 'joints':
        flareIncrease = 5;
        clarityIncrease = 10;
        followUpMessage = "You notice the pattern in your joints...";
        break;
      case 'deep':
        flareIncrease = 10;
        clarityIncrease = 0;
        followUpMessage = "The deep ache persists...";
        break;
      case 'everywhere':
        flareIncrease = 15;
        clarityIncrease = -5;
        followUpMessage = "You feel overwhelmed by it all...";
        break;
    }

    // Apply mini-choice effects
    onActionSelect(`MINI_${choice}:${flareIncrease}:${clarityIncrease}`);

    setBattleMessage({ text: followUpMessage, type: 'action' });

    // After mini-choice, continue to enemy turn
    setTimeout(() => {
      startEnemyTurn();
    }, 1500);
  };

  // Render tutorial
  const renderTutorial = () => {
    const steps = [
      {
        title: "Welcome to Combat",
        text: "The Ache manifests before you. You must understand it to overcome it. Each turn, you'll choose an action, then The Ache will respond.",
        icon: <Sparkles className="w-8 h-8" />
      },
      {
        title: "Your Actions",
        text: "🔍 Observe: Study the pattern (+Clarity)\n🌊 Soothe: Breathe and calm (-Flare)\n💬 Probe: Ask hard questions (Damage)\n💪 Resist: Push through (Damage + -Flare)",
        icon: <Brain className="w-8 h-8" />
      },
      {
        title: "The Enemy Telegraphs",
        text: "Before attacking, The Ache will show a warning. Read it carefully! Different actions counter different attacks.",
        icon: <AlertTriangle className="w-8 h-8" />
      },
      {
        title: "Manage Your Stats",
        text: "Flare is pain. Clarity is understanding. High Clarity makes Probe stronger. Low Clarity makes you panic. Keep them balanced!",
        icon: <Zap className="w-8 h-8" />
      }
    ];

    const step = steps[combatState.tutorialStep - 1];

    return (
      <motion.div
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="max-w-md mx-4 bg-gradient-to-br from-[#2a1f3d]/95 to-[#1a1625]/95 border-2 border-[#c9a0dc]/50 rounded-2xl p-8 shadow-2xl"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="text-[#c9a0dc]">
              {step.icon}
            </div>
            
            <h2 className="text-white text-xl">{step.title}</h2>
            
            <p className="text-white/80 text-sm whitespace-pre-line leading-relaxed font-serif">
              {step.text}
            </p>

            <div className="flex items-center gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === combatState.tutorialStep - 1 
                      ? 'w-8 bg-[#c9a0dc]' 
                      : 'w-2 bg-white/30'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={advanceTutorial}
              className="px-8 py-3 bg-[#c9a0dc] hover:bg-[#b88fcc] text-white rounded-xl transition-colors"
            >
              {combatState.tutorialStep === 4 ? "Begin Battle!" : "Next"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Render action buttons
  const renderActions = () => {
    const actions = [
      { 
        id: 'observe', 
        label: 'Observe', 
        icon: Search, 
        color: 'from-blue-500/20 to-blue-600/20 border-blue-400/50',
        locked: combatState.isNumbed
      },
      { 
        id: 'soothe', 
        label: 'Soothe', 
        icon: Heart, 
        color: 'from-green-500/20 to-green-600/20 border-green-400/50',
        locked: false
      },
      { 
        id: 'probe', 
        label: 'Probe', 
        icon: Sparkles, 
        color: 'from-pink-500/20 to-pink-600/20 border-pink-400/50',
        locked: false
      },
      { 
        id: 'resist', 
        label: 'Resist', 
        icon: Shield, 
        color: 'from-orange-500/20 to-orange-600/20 border-orange-400/50',
        locked: false
      },
    ];

    return (
      <div className="grid grid-cols-2 gap-3 px-4">
        {actions.map(action => {
          const Icon = action.icon;
          const isLocked = action.locked;
          
          return (
            <motion.button
              key={action.id}
              onClick={() => !isLocked && handlePlayerAction(action.id)}
              disabled={isLocked}
              className={`relative px-6 py-4 rounded-xl border-2 bg-gradient-to-br ${action.color} 
                backdrop-blur-sm transition-all
                ${isLocked 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'hover:scale-105 active:scale-95 hover:shadow-lg'
                }`}
              whileHover={!isLocked ? { y: -2 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon className="w-6 h-6 text-white" />
                <span className="text-white text-sm">{action.label}</span>
              </div>
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wind className="w-8 h-8 text-purple-400 animate-pulse" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    );
  };

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
        {battlePhase === 'tutorial' && renderTutorial()}
      </AnimatePresence>

      {/* Enemy HP bar at top - with more spacing */}
      <div className="relative z-10 pt-16 px-4 pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-xs text-white/70 mb-1">
            <span>{enemyName}</span>
            <span>{Math.max(0, enemyHealth)}%</span>
          </div>
          <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/20">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-pink-500"
              initial={{ width: '100%' }}
              animate={{ width: `${Math.max(0, enemyHealth)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Phase 2 indicator */}
          {phase2 && (
            <motion.div
              className="mt-2 text-center px-4 py-1 bg-red-500/90 text-white text-xs rounded-full inline-block"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚠️ Awakened State ⚠️
            </motion.div>
          )}
        </div>
      </div>

      {/* Enemy display - centered, pushed down slightly */}
      <div className="relative z-10 flex-1 flex items-center justify-center pb-8">
        <motion.div
          className={`relative ${enemyShake ? 'animate-shake' : ''}`}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ marginTop: '2rem' }}
        >
          <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-[#c9a0dc]/30 shadow-2xl">
            <ImageWithFallback
              src={enemyImage}
              alt={enemyName}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </div>

      {/* Player stats */}
      <div className={`relative z-10 px-4 mb-4 ${playerShake ? 'animate-shake' : ''}`}>
        <div className="grid grid-cols-2 gap-3">
          {/* Flare */}
          <div>
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Flare
              </span>
              <span>{Math.min(100, Math.max(0, playerFlare))}%</span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/20">
              <motion.div
                className={`h-full ${
                  playerFlare > 80 ? 'bg-red-500' : 
                  playerFlare > 50 ? 'bg-orange-500' : 
                  'bg-yellow-500'
                }`}
                animate={{ width: `${Math.min(100, Math.max(0, playerFlare))}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Clarity */}
          <div>
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                Clarity
              </span>
              <span>{Math.min(100, Math.max(0, playerClarity))}%</span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/20">
              <motion.div
                className={`h-full ${
                  playerClarity > 70 ? 'bg-blue-500' : 
                  playerClarity > 30 ? 'bg-purple-500' : 
                  'bg-gray-500'
                }`}
                animate={{ width: `${Math.min(100, Math.max(0, playerClarity))}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Battle message box */}
      <AnimatePresence>
        {battleMessage && (
          <motion.div
            className="relative z-20 mx-4 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className={`backdrop-blur-xl rounded-xl p-4 border-2 ${
              battleMessage.type === 'critical' ? 'bg-red-500/20 border-red-400/50' :
              battleMessage.type === 'heal' ? 'bg-green-500/20 border-green-400/50' :
              battleMessage.type === 'damage' ? 'bg-orange-500/20 border-orange-400/50' :
              battleMessage.type === 'telegraph' ? 'bg-yellow-500/20 border-yellow-400/50' :
              battleMessage.type === 'warning' ? 'bg-purple-500/20 border-purple-400/50' :
              battleMessage.type === 'victory' ? 'bg-blue-500/20 border-blue-400/50' :
              'bg-white/10 border-white/20'
            }`}>
              <p className="text-white text-sm font-serif text-center">
                {battleMessage.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini-decision (during enemy turn) */}
      <AnimatePresence>
        {battlePhase === 'mini_decision' && (
          <motion.div
            className="relative z-20 mx-4 mb-4 space-y-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="backdrop-blur-xl bg-purple-500/20 border-2 border-purple-400/50 rounded-xl p-4">
              <p className="text-white text-sm font-serif text-center mb-3">
                Where do you feel it most?
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleMiniChoice('joints')}
                  className="px-3 py-3 bg-blue-500/30 hover:bg-blue-500/50 border border-blue-400/50 rounded-lg text-white text-xs transition-colors"
                >
                  🦴 Joints
                </button>
                <button
                  onClick={() => handleMiniChoice('deep')}
                  className="px-3 py-3 bg-orange-500/30 hover:bg-orange-500/50 border border-orange-400/50 rounded-lg text-white text-xs transition-colors"
                >
                  🔥 Deep
                </button>
                <button
                  onClick={() => handleMiniChoice('everywhere')}
                  className="px-3 py-3 bg-red-500/30 hover:bg-red-500/50 border border-red-400/50 rounded-lg text-white text-xs transition-colors"
                >
                  🧠 Everywhere
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action menu */}
      <AnimatePresence>
        {battlePhase === 'player_turn' && (
          <motion.div
            className="relative z-20 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {renderActions()}

            {/* Status indicators */}
            <div className="mt-3 px-4 flex flex-wrap gap-2 justify-center">
              {combatState.isNumbed && (
                <div className="px-3 py-1 bg-purple-500/30 border border-purple-400/50 rounded-full text-xs text-white">
                  🌫️ Numbed (Observe locked)
                </div>
              )}
              {combatState.environmentalEffect === 'fog_thickens' && (
                <div className="px-3 py-1 bg-gray-500/30 border border-gray-400/50 rounded-full text-xs text-white">
                  🌫️ Fog thickens (-5% Clarity gains)
                </div>
              )}
              {combatState.environmentalEffect === 'calm' && (
                <div className="px-3 py-1 bg-green-500/30 border border-green-400/50 rounded-full text-xs text-white">
                  ✨ Moment of calm (Soothe empowered)
                </div>
              )}
              {playerClarity > 70 && (
                <div className="px-3 py-1 bg-blue-500/30 border border-blue-400/50 rounded-full text-xs text-white">
                  💎 High Clarity (Probe empowered!)
                </div>
              )}
              {playerClarity < 30 && (
                <div className="px-3 py-1 bg-red-500/30 border border-red-400/50 rounded-full text-xs text-white">
                  ⚠️ Low Clarity (Actions weakened)
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
