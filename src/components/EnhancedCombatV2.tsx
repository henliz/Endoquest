import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BackgroundParticles } from './BackgroundParticles';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Shield, Heart, Search, Sparkles, AlertTriangle, Zap, Brain, Wind } from 'lucide-react';

const COMBAT_BG = 'https://64.media.tumblr.com/ed870d2f0519b3088903d112822634dd/b38864c912b46d59-70/s2048x3072/8295c8c91ec218372abc8431372161bed0b23dad.jpg';

interface EnhancedCombatV2Props {
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

type BattlePhase = 'player_turn' | 'dialogue_choice' | 'enemy_telegraph' | 'enemy_attack' | 'attack_result' | 'mini_decision' | 'tutorial' | 'breathing_minigame' | 'victory';

type EnemyMove = 'phantom_throb' | 'gaslighting_whisper' | 'flare_spike' | 'numbing_fog' | 'shared_suffering';

type ActionType = 'observe' | 'soothe' | 'probe' | 'resist';

interface BattleMessage {
  text: string;
  type: 'action' | 'damage' | 'heal' | 'critical' | 'ineffective' | 'victory' | 'telegraph' | 'warning' | 'super_effective' | 'not_effective';
}

interface DialogueChoice {
  text: string;
  action: ActionType;
  emotion: string;
}

interface CombatState {
  turnCount: number;
  nextEnemyMove: EnemyMove | null;
  sootheUsedTurn: number;
  isNumbed: boolean;
  environmentalEffect: string | null;
  tutorialStep: number;
  hasSeenTutorial: boolean;
  lastEnemyMove: EnemyMove | null;
  pendingAction: ActionType | null;
}

export function EnhancedCombatV2({
  enemyName,
  enemyImage,
  playerFlare,
  playerClarity,
  enemyHealth,
  onActionSelect,
  onCombatEnd,
  onMiniChoice,
  phase2 = false
}: EnhancedCombatV2Props) {
  const [battlePhase, setBattlePhase] = useState<BattlePhase>(phase2 ? 'player_turn' : 'tutorial');
  const [battleMessage, setBattleMessage] = useState<BattleMessage | null>(null);
  const [enemyShake, setEnemyShake] = useState(false);
  const [playerShake, setPlayerShake] = useState(false);
  
  const [combatState, setCombatState] = useState<CombatState>({
    turnCount: 0,
    nextEnemyMove: null,
    sootheUsedTurn: -10,
    isNumbed: false,
    environmentalEffect: null,
    tutorialStep: phase2 ? 0 : 1,
    hasSeenTutorial: phase2,
    lastEnemyMove: null,
    pendingAction: null,
  });

  // Breathing minigame state
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [circleScale, setCircleScale] = useState(0.5);
  const [breathingSuccess, setBreathingSuccess] = useState(0);
  const [breathingMisses, setBreathingMisses] = useState(0);

  // Check for victory conditions
  useEffect(() => {
    if (!phase2 && enemyHealth <= 50 && enemyHealth > 0 && battlePhase !== 'victory') {
      console.log('⚡ PHASE 1 COMPLETE - Triggering mid-battle');
      setBattlePhase('victory');
      setBattleMessage({ text: 'The Ache flickers... something is changing...', type: 'critical' });
      setTimeout(() => onCombatEnd?.(), 2500);
      return;
    }

    if (phase2 && enemyHealth <= 0 && battlePhase !== 'victory') {
      console.log('🏆 VICTORY - Phase 2 complete');
      setBattlePhase('victory');
      setBattleMessage({ text: `${enemyName} has been understood...`, type: 'victory' });
      setTimeout(() => onCombatEnd?.(), 2500);
    }

    if (!phase2 && enemyHealth <= 0 && battlePhase !== 'victory') {
      setBattlePhase('victory');
      setBattleMessage({ text: 'The Ache wavers...', type: 'victory' });
      setTimeout(() => onCombatEnd?.(), 2500);
    }
  }, [enemyHealth, battlePhase, playerClarity, phase2, onCombatEnd, enemyName]);

  // Check for Flare crisis
  useEffect(() => {
    if (playerFlare >= 100 && battlePhase !== 'breathing_minigame' && battlePhase !== 'victory') {
      console.log('🔥 FLARE CRISIS - Starting breathing minigame');
      setBattlePhase('breathing_minigame');
      setBreathCount(0);
      setBreathingSuccess(0);
      setBreathingMisses(0);
      setCircleScale(0.5);
      setBreathingPhase('inhale');
    }
  }, [playerFlare, battlePhase]);

  // Breathing animation
  useEffect(() => {
    if (battlePhase === 'breathing_minigame') {
      const interval = setInterval(() => {
        setBreathingPhase(prev => {
          if (prev === 'inhale') {
            setCircleScale(1);
            return 'exhale';
          } else {
            setCircleScale(0.5);
            return 'inhale';
          }
        });
      }, 3000); // 3 seconds per breath cycle

      return () => clearInterval(interval);
    }
  }, [battlePhase]);

  // Tutorial progression
  const advanceTutorial = () => {
    if (combatState.tutorialStep === 4) {
      setCombatState(prev => ({ ...prev, tutorialStep: 0, hasSeenTutorial: true }));
      setBattlePhase('player_turn');
    } else {
      setCombatState(prev => ({ ...prev, tutorialStep: prev.tutorialStep + 1 }));
    }
  };

  // Enemy move selection
  const selectEnemyMove = (): EnemyMove => {
    if (phase2) {
      const moves: EnemyMove[] = ['phantom_throb', 'gaslighting_whisper', 'shared_suffering'];
      if (playerClarity > 70) moves.push('flare_spike');
      return moves[Math.floor(Math.random() * moves.length)];
    } else {
      const moves: EnemyMove[] = ['phantom_throb', 'gaslighting_whisper'];
      if (playerClarity > 70) moves.push('flare_spike');
      if (combatState.turnCount > 3 && Math.random() > 0.7) moves.push('numbing_fog');
      return moves[Math.floor(Math.random() * moves.length)];
    }
  };

  // Get telegraph message
  const getTelegraph = (move: EnemyMove): string => {
    if (phase2 && playerClarity < 20) {
      const cryptic = ["The Ache seems... sad?", "Something shifts in the fog...", "You feel... something?", "..."];
      return cryptic[Math.floor(Math.random() * cryptic.length)];
    }

    switch (move) {
      case 'phantom_throb': return "The Ache's form pulses rhythmically...";
      case 'gaslighting_whisper': return "Whispers echo around you...";
      case 'flare_spike': return "The Ache's form flickers RED!";
      case 'numbing_fog': return "The fog thickens and swirls...";
      case 'shared_suffering': return "The Ache reaches toward you, trembling...";
    }
  };

  // Get dialogue choices for PROBE action
  const getDialogueChoices = (): DialogueChoice[] => {
    // These are all ways to ask "Where do you live in me?" with different emotional tones
    return [
      { text: "Tell me where you hide in my body.", action: 'probe', emotion: '💭' },
      { text: "Show me your patterns. I'm listening.", action: 'probe', emotion: '👁️' },
      { text: "Where do you live? I need to know.", action: 'probe', emotion: '🔍' },
      { text: "Reveal yourself to me.", action: 'probe', emotion: '✨' },
    ];
  };

  // Execute enemy attack
  const executeEnemyAttack = (move: EnemyMove) => {
    let message: BattleMessage;
    let flareIncrease = 0;
    let clarityChange = 0;
    let applyNumb = false;

    switch (move) {
      case 'phantom_throb':
        message = { text: "The Ache used Phantom Throb!", type: 'damage' };
        flareIncrease = 8;
        break;
      case 'gaslighting_whisper':
        message = { text: "The Ache used Gaslighting Whisper!", type: 'critical' };
        flareIncrease = 6;
        clarityChange = -15;
        break;
      case 'flare_spike':
        message = { text: "The Ache used Flare Spike!", type: 'critical' };
        flareIncrease = 18;
        setEnemyShake(true);
        setTimeout(() => setEnemyShake(false), 500);
        break;
      case 'numbing_fog':
        message = { text: "The Ache used Numbing Fog!", type: 'warning' };
        flareIncrease = 3;
        applyNumb = true;
        break;
      case 'shared_suffering':
        message = { text: "The Ache used Shared Suffering!", type: 'critical' };
        flareIncrease = 12;
        clarityChange = -8;
        break;
    }

    setBattleMessage(message);
    setPlayerShake(true);
    setTimeout(() => setPlayerShake(false), 300);

    onActionSelect(`ENEMY_${move}:${flareIncrease}:${clarityChange}`);

    if (applyNumb) {
      setCombatState(prev => ({ ...prev, isNumbed: true, lastEnemyMove: move }));
    } else {
      setCombatState(prev => ({ ...prev, lastEnemyMove: move }));
    }

    setBattlePhase('attack_result');
  };

  // Handle continuing from attack result
  const continueFromAttackResult = () => {
    setBattlePhase('player_turn');
    setBattleMessage(null);
  };

  // Handle action button click
  const handleActionButtonClick = (actionId: ActionType) => {
    if (actionId === 'probe') {
      // Probe shows dialogue first
      setBattlePhase('dialogue_choice');
    } else {
      // Other actions execute directly
      handlePlayerAction(actionId);
    }
  };

  // Handle dialogue choice selection (Probe only)
  const handleDialogueChoice = (choice: DialogueChoice) => {
    setCombatState(prev => ({ ...prev, pendingAction: 'probe' }));
    handlePlayerAction('probe', choice.text);
  };

  // Handle player action
  const handlePlayerAction = (actionId: ActionType, dialogueText?: string) => {
    if (actionId === 'observe' && combatState.isNumbed) {
      setBattleMessage({ 
        text: "You try to focus, but the Numbing Fog blocks your thoughts...", 
        type: 'ineffective' 
      });
      setBattlePhase('attack_result');
      setTimeout(() => {
        setCombatState(prev => ({ ...prev, isNumbed: false }));
        startEnemyTurn();
      }, 2000);
      return;
    }

    let message: BattleMessage;
    let damage = 0;
    let flareChange = 0;
    let clarityChange = 0;
    let effectiveness: 'super_effective' | 'not_effective' | 'normal' = 'normal';

    const sootheCooldown = combatState.turnCount - combatState.sootheUsedTurn;
    
    switch (actionId) {
      case 'observe':
        if (combatState.nextEnemyMove === 'gaslighting_whisper') {
          message = { text: "You observe carefully, ready for the whispers!", type: 'super_effective' };
          clarityChange = 30;
          effectiveness = 'super_effective';
        } else {
          message = { text: 'You watch the pattern carefully.', type: 'heal' };
          clarityChange = 20;
        }
        break;

      case 'soothe':
        const newSootheUsedTurn = combatState.turnCount;
        let sootheEffectiveness = -30;
        if (sootheCooldown === 1) sootheEffectiveness = -20;
        else if (sootheCooldown === 2) sootheEffectiveness = -25;
        if (phase2) sootheEffectiveness += 8;

        if (combatState.nextEnemyMove === 'flare_spike') {
          message = { text: "You breathe deeply, bracing yourself!", type: 'super_effective' };
          sootheEffectiveness -= 12;
          clarityChange = 10;
          effectiveness = 'super_effective';
        } else {
          message = { text: 'You breathe deeply. The pain softens...', type: 'heal' };
          clarityChange = 5;
        }

        flareChange = sootheEffectiveness;
        setCombatState(prev => ({ ...prev, sootheUsedTurn: newSootheUsedTurn }));
        break;

      case 'probe':
        // Use dialogue text if provided
        const probeText = dialogueText || 'You ask: Where do you live in me?';
        
        if (playerClarity > 70) {
          message = { text: `${probeText} DEEP PROBE!`, type: 'super_effective' };
          damage = 50;
          clarityChange = 20;
          flareChange = 3;
          effectiveness = 'super_effective';
        } else if (playerClarity < 30) {
          message = { text: `${probeText} You're flailing in the dark!`, type: 'not_effective' };
          damage = 20;
          clarityChange = 10;
          flareChange = 8;
          effectiveness = 'not_effective';
        } else {
          message = { text: probeText, type: 'damage' };
          damage = 35;
          clarityChange = 15;
          flareChange = 3;
        }

        if (phase2 && damage > 0) {
          const reflectedDamage = Math.floor(damage * 0.3);
          flareChange += reflectedDamage;
        }

        setEnemyShake(true);
        setTimeout(() => setEnemyShake(false), 300);
        break;

      case 'resist':
        if (combatState.nextEnemyMove === 'phantom_throb') {
          message = { text: "You steel yourself against the pain!", type: 'super_effective' };
          damage = 18;
          flareChange = -22;
          clarityChange = -5;
          effectiveness = 'super_effective';
        } else if (combatState.nextEnemyMove === 'gaslighting_whisper') {
          message = { text: "Resisting only makes the doubt worse...", type: 'not_effective' };
          damage = 12;
          flareChange = -12;
          clarityChange = -18;
          effectiveness = 'not_effective';
        } else {
          message = { text: 'You push through the pain.', type: 'action' };
          damage = 12;
          flareChange = -18;
          clarityChange = -10;
        }

        setEnemyShake(true);
        setTimeout(() => setEnemyShake(false), 300);
        break;
    }

    setBattleMessage(message);
    setBattlePhase('attack_result');

    onActionSelect(`${actionId}:${damage}:${flareChange}:${clarityChange}`);

    console.log(`💥 ${actionId}: ${damage} dmg, ${flareChange} Flare, ${clarityChange} Clarity, ${effectiveness}`);

    // Show effectiveness message, then mini-decision for Probe
    setTimeout(() => {
      if (effectiveness === 'super_effective') {
        setBattleMessage({ text: "It's super effective!", type: 'super_effective' });
      } else if (effectiveness === 'not_effective') {
        setBattleMessage({ text: "It's not very effective...", type: 'not_effective' });
      }

      setTimeout(() => {
        if (actionId === 'probe') {
          setBattlePhase('mini_decision');
        } else {
          startEnemyTurn();
        }
      }, 1500);
    }, 1500);

    const newTurnCount = combatState.turnCount + 1;
    setCombatState(prev => ({ ...prev, turnCount: newTurnCount }));
  };

  // Start enemy turn
  const startEnemyTurn = () => {
    if (enemyHealth <= 0) return;

    const move = selectEnemyMove();
    const telegraph = getTelegraph(move);

    setCombatState(prev => ({ ...prev, nextEnemyMove: move }));
    setBattlePhase('enemy_telegraph');
    setBattleMessage({ text: telegraph, type: 'telegraph' });

    setTimeout(() => {
      setBattlePhase('enemy_attack');
      executeEnemyAttack(move);
    }, 2000);
  };

  // Handle mini-choice
  const handleMiniChoice = (choice: string) => {
    onMiniChoice?.(choice);
    
    let flareIncrease = 0;
    let clarityIncrease = 0;

    switch (choice) {
      case 'joints':
        flareIncrease = 5;
        clarityIncrease = 10;
        break;
      case 'deep':
        flareIncrease = 10;
        clarityIncrease = 0;
        break;
      case 'everywhere':
        flareIncrease = 15;
        clarityIncrease = -5;
        break;
    }

    onActionSelect(`MINI_${choice}:${flareIncrease}:${clarityIncrease}`);

    startEnemyTurn();
  };

  // Handle breathing minigame click
  const handleBreathClick = () => {
    const isCorrectTiming = 
      (breathingPhase === 'inhale' && circleScale > 0.9) ||
      (breathingPhase === 'exhale' && circleScale < 0.6);

    if (isCorrectTiming) {
      setBreathingSuccess(prev => prev + 1);
      setBreathCount(prev => prev + 1);
      
      if (breathCount + 1 >= 3) {
        // Success!
        onActionSelect(`BREATHING_SUCCESS:${-30}:0`); // Reduce Flare by 30
        setBattleMessage({ text: "You've steadied yourself. The pain is still there, but manageable.", type: 'heal' });
        setTimeout(() => {
          setBattlePhase('player_turn');
          setBattleMessage(null);
        }, 2000);
      }
    } else {
      setBreathingMisses(prev => prev + 1);
      
      if (breathingMisses + 1 >= 3) {
        // Failure
        onActionSelect(`BREATHING_FAIL:${-15}:0`); // Reduce Flare by 15
        setBattleMessage({ text: "Your breathing is ragged, but you're still standing.", type: 'action' });
        setTimeout(() => {
          setBattlePhase('player_turn');
          setBattleMessage(null);
        }, 2000);
      }
    }
  };

  // Render tutorial (same as before)
  const renderTutorial = () => {
    const steps = [
      {
        title: "Welcome to Combat",
        text: "The Ache manifests before you. You must understand it to overcome it. But first, you'll need to respond to its attacks emotionally.",
        icon: <Sparkles className="w-8 h-8" />
      },
      {
        title: "Emotional Choices",
        text: "After each attack, you'll choose how to respond. Your emotional stance determines your action. There's no single 'right' answer.",
        icon: <Brain className="w-8 h-8" />
      },
      {
        title: "The Enemy Telegraphs",
        text: "Watch the warning at the top of the screen. The Ache shows what it's about to do. Choose your response wisely.",
        icon: <AlertTriangle className="w-8 h-8" />
      },
      {
        title: "Manage Your Stats",
        text: "Flare is pain. Clarity is understanding. If Flare reaches 100%, you'll need to breathe. Keep them balanced!",
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
            <div className="text-[#c9a0dc]">{step.icon}</div>
            <h2 className="text-white text-xl">{step.title}</h2>
            <p className="text-white/80 text-sm whitespace-pre-line leading-relaxed font-serif">{step.text}</p>
            <div className="flex items-center gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === combatState.tutorialStep - 1 ? 'w-8 bg-[#c9a0dc]' : 'w-2 bg-white/30'
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
        id: 'observe' as ActionType, 
        label: 'Observe', 
        icon: Search, 
        color: 'from-blue-500/20 to-blue-600/20 border-blue-400/50',
        locked: combatState.isNumbed
      },
      { 
        id: 'soothe' as ActionType, 
        label: 'Soothe', 
        icon: Heart, 
        color: 'from-green-500/20 to-green-600/20 border-green-400/50',
        locked: false
      },
      { 
        id: 'probe' as ActionType, 
        label: 'Probe', 
        icon: Sparkles, 
        color: 'from-pink-500/20 to-pink-600/20 border-pink-400/50',
        locked: false
      },
      { 
        id: 'resist' as ActionType, 
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
              onClick={() => !isLocked && handleActionButtonClick(action.id)}
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

      {/* Breathing Minigame */}
      <AnimatePresence>
        {battlePhase === 'breathing_minigame' && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <motion.p
                className="text-white text-xl mb-8 font-serif"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                The pain is overwhelming. You need to breathe.
              </motion.p>

              <motion.div
                className="w-64 h-64 mx-auto mb-8 flex items-center justify-center cursor-pointer"
                onClick={handleBreathClick}
                animate={{ scale: circleScale }}
                transition={{ duration: 3, ease: 'easeInOut' }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/30 to-amber-500/30 border-4 border-purple-400/50 flex items-center justify-center">
                  <p className="text-white/70 text-sm">
                    {breathingPhase === 'inhale' ? 'Click at peak' : 'Click at bottom'}
                  </p>
                </div>
              </motion.div>

              <div className="flex justify-center gap-2 mb-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < breathingSuccess ? 'bg-green-500' : 
                      i < breathingSuccess + breathingMisses ? 'bg-red-500' :
                      'bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <p className="text-white/60 text-sm">
                {breathingPhase === 'inhale' ? 'Inhale...' : 'Exhale...'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enemy HP bar at top */}
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
          
          {phase2 && (
            <motion.div
              className="mt-2 text-center px-4 py-1 bg-red-500/90 text-white text-xs rounded-full inline-block"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚠️ Awakened State ⚠️
            </motion.div>
          )}

          {/* Telegraph indicator during player turn */}
          {battlePhase === 'player_turn' && combatState.nextEnemyMove && (
            <motion.div
              className="mt-3 text-center px-4 py-2 bg-yellow-500/20 border border-yellow-400/50 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-yellow-200 text-xs">
                ⚠️ {getTelegraph(combatState.nextEnemyMove)}
              </p>
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

      {/* Battle message box with tap to continue */}
      <AnimatePresence>
        {battleMessage && battlePhase === 'attack_result' && (
          <motion.div
            className="relative z-20 mx-4 mb-4 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={continueFromAttackResult}
          >
            <div className={`backdrop-blur-xl rounded-xl p-4 border-2 ${
              battleMessage.type === 'critical' ? 'bg-red-500/20 border-red-400/50' :
              battleMessage.type === 'heal' ? 'bg-green-500/20 border-green-400/50' :
              battleMessage.type === 'damage' ? 'bg-orange-500/20 border-orange-400/50' :
              battleMessage.type === 'super_effective' ? 'bg-green-500/30 border-green-400/60' :
              battleMessage.type === 'not_effective' ? 'bg-gray-500/30 border-gray-400/60' :
              battleMessage.type === 'telegraph' ? 'bg-yellow-500/20 border-yellow-400/50' :
              battleMessage.type === 'warning' ? 'bg-purple-500/20 border-purple-400/50' :
              battleMessage.type === 'victory' ? 'bg-blue-500/20 border-blue-400/50' :
              'bg-white/10 border-white/20'
            }`}>
              <p className="text-white text-sm font-serif text-center mb-2">
                {battleMessage.text}
              </p>
              <p className="text-white/50 text-xs text-center animate-pulse">
                Tap to continue ›
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons during player turn */}
      <AnimatePresence>
        {battlePhase === 'player_turn' && (
          <motion.div
            className="relative z-20 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {renderActions()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogue choices (PROBE ONLY) */}
      <AnimatePresence>
        {battlePhase === 'dialogue_choice' && (
          <motion.div
            className="relative z-20 px-4 mb-6 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <p className="text-white text-sm text-center mb-4 font-serif">
              "Where do you live in me?"
            </p>
            
            <p className="text-white/80 text-xs text-center mb-2">
              How do you ask?
            </p>

            {getDialogueChoices().map((choice, i) => (
              <motion.button
                key={i}
                onClick={() => handleDialogueChoice(choice)}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/30 hover:border-purple-400/60 rounded-xl text-left transition-all hover:scale-102"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <span className="text-lg mr-2">{choice.emotion}</span>
                <span className="text-white text-sm font-serif">"{choice.text}"</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini-decision */}
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
