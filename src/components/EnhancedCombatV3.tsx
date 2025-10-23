import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BackgroundParticles } from './BackgroundParticles';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Shield, Heart, Search, Sparkles, AlertTriangle, Zap, Brain, Wind, Flame } from 'lucide-react';

const COMBAT_BG = 'https://64.media.tumblr.com/ed870d2f0519b3088903d112822634dd/b38864c912b46d59-70/s2048x3072/8295c8c91ec218372abc8431372161bed0b23dad.jpg';

interface EnhancedCombatV3Props {
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

type BattlePhase = 
  | 'player_turn' 
  | 'probe_dialogue'          // Probe button clicked
  | 'enemy_response_dialogue' // After specific enemy attacks
  | 'enemy_telegraph' 
  | 'enemy_attack' 
  | 'fireball_attack'         // Fireball Barrage enemy attack
  | 'attack_result' 
  | 'mini_decision' 
  | 'tutorial' 
  | 'flare_crisis'            // Flare 100% - choose minigame
  | 'breathing_minigame'
  | 'pain_mapping'
  | 'flare_storm'
  | 'clarity_crisis'          // Clarity 0% - choose minigame
  | 'memory_fragment'
  | 'reassembly_puzzle'
  | 'affirmation_sequence'
  | 'victory';

type EnemyMove = 'phantom_throb' | 'gaslighting_whisper' | 'flare_spike' | 'numbing_fog' | 'shared_suffering' | 'fireball_barrage';
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
  dialogueSource: 'probe' | 'enemy' | null;
  isPlayerTurn: boolean; // TRUE = player's turn, FALSE = enemy's turn
  waitingForEnemyTurn: boolean; // Player action complete, waiting to transition to enemy
}

// Fireball for Flare Storm
interface Fireball {
  id: number;
  x: number;
  y: number;
  speed: number;
}

export function EnhancedCombatV3({
  enemyName,
  enemyImage,
  playerFlare,
  playerClarity,
  enemyHealth,
  onActionSelect,
  onCombatEnd,
  onMiniChoice,
  phase2 = false
}: EnhancedCombatV3Props) {
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
    isPlayerTurn: true, // Start with player turn
    waitingForEnemyTurn: false,
  });
  
  // Phase 2 Boss Mechanics - Track Flare Storm milestones
  const [flareStormMilestones, setFlareStormMilestones] = useState({
    at75: false,
    at50: false,
    at25: false,
  });
  
  // Debug logging for milestones
  useEffect(() => {
    console.log('🎯 Flare Storm Milestones:', flareStormMilestones, 'Current HP:', enemyHealth, 'Phase2:', phase2);
  }, [flareStormMilestones, enemyHealth, phase2]);

  // Breathing minigame state
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale' | 'hold'>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [circleScale, setCircleScale] = useState(0.5);
  const [breathingSuccess, setBreathingSuccess] = useState(0);
  const [breathingMisses, setBreathingMisses] = useState(0);
  const [breathingText, setBreathingText] = useState('Inhale...');

  // Pain mapping state
  const [painRegions, setPainRegions] = useState<string[]>([]);

  // Fireball attack state (both enemy attack and crisis minigame)
  const [fireballs, setFireballs] = useState<Fireball[]>([]);
  const [fireballsClicked, setFireballsClicked] = useState(0);
  const [fireballsMissed, setFireballsMissed] = useState(0);
  const [fireballAttackDamage, setFireballAttackDamage] = useState(0);

  // Memory fragment state
  const [memoryChoices, setMemoryChoices] = useState<{text: string, isTrue: boolean, selected: boolean}[]>([]);

  // Reassembly state
  const [puzzlePieces, setPuzzlePieces] = useState<{id: number, placed: boolean}[]>([]);

  // Affirmation state
  const [affirmations, setAffirmations] = useState<{text: string, isTrue: boolean}[]>([]);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [affirmationScore, setAffirmationScore] = useState(0);

  // Victory check
  useEffect(() => {
    if (!phase2 && enemyHealth <= 50 && enemyHealth > 0 && battlePhase !== 'victory') {
      console.log('⚡ PHASE 1 COMPLETE');
      setBattlePhase('victory');
      setBattleMessage({ text: 'The Ache flickers... something is changing...', type: 'critical' });
      setTimeout(() => onCombatEnd?.(), 2500);
      return;
    }

    if (enemyHealth <= 0 && battlePhase !== 'victory') {
      console.log('🏆 VICTORY - Combat complete');
      setBattlePhase('victory');
      setBattleMessage({ text: 'The Ache feels... known.', type: 'victory' });
      setTimeout(() => onCombatEnd?.(), 2500);
    }
  }, [enemyHealth, battlePhase, phase2, onCombatEnd]);

  // Flare crisis check
  useEffect(() => {
    if (playerFlare >= 100 && battlePhase !== 'flare_crisis' && battlePhase !== 'breathing_minigame' && battlePhase !== 'pain_mapping' && battlePhase !== 'flare_storm' && battlePhase !== 'victory') {
      console.log('🔥 FLARE CRISIS');
      
      // Choose minigame based on phase and state
      if (phase2 && Math.random() > 0.5) {
        // Phase 2: Flare Storm
        initFlareStorm();
      } else if (Math.random() > 0.5) {
        // Pain Mapping
        initPainMapping();
      } else {
        // Breathing
        initBreathing();
      }
    }
  }, [playerFlare, battlePhase, phase2]);

  // Clarity crisis check
  useEffect(() => {
    if (playerClarity <= 0 && battlePhase !== 'clarity_crisis' && battlePhase !== 'memory_fragment' && battlePhase !== 'reassembly_puzzle' && battlePhase !== 'affirmation_sequence' && battlePhase !== 'victory') {
      console.log('🧠 CLARITY CRISIS');
      
      // Choose minigame randomly
      const choice = Math.random();
      if (choice < 0.33) {
        initMemoryFragment();
      } else if (choice < 0.66) {
        initReassembly();
      } else {
        initAffirmation();
      }
    }
  }, [playerClarity, battlePhase]);

  // Phase 2 Boss Mechanics - Force Flare Storm at HP milestones
  // This triggers INSTEAD of a normal enemy turn when HP crosses thresholds
  useEffect(() => {
    console.log('🔍 Flare Storm check - phase2:', phase2, 'enemyHealth:', enemyHealth, 'battlePhase:', battlePhase, 
                'waitingForEnemyTurn:', combatState.waitingForEnemyTurn, 'isPlayerTurn:', combatState.isPlayerTurn,
                'milestones:', flareStormMilestones);
    
    if (!phase2) {
      console.log('→ Not phase 2, skipping');
      return;
    }
    if (battlePhase === 'victory' || battlePhase === 'flare_storm') {
      console.log('→ Already in victory/flare_storm, skipping');
      return;
    }
    
    // Only check when waiting for enemy turn (right after player action)
    if (!combatState.waitingForEnemyTurn) {
      console.log('→ Not waiting for enemy turn, skipping');
      return;
    }
    
    // enemyHealth is the CURRENT health
    // When player deals damage, we check if we crossed a milestone
    
    // 75 HP threshold - First Flare Storm
    if (enemyHealth <= 75 && enemyHealth > 50 && !flareStormMilestones.at75) {
      console.log('🔥🔥🔥 BOSS PHASE: 75 HP - FLARE STORM TRIGGERED!', enemyHealth);
      setFlareStormMilestones(prev => ({ ...prev, at75: true }));
      setBattleMessage({ text: '⚠️ The Ache\'s form IGNITES! A storm of flames approaches!', type: 'warning' });
      setTimeout(() => {
        initFlareStorm();
      }, 2000);
      return;
    }
    
    // 50 HP threshold - Second Flare Storm
    if (enemyHealth <= 50 && enemyHealth > 25 && !flareStormMilestones.at50 && flareStormMilestones.at75) {
      console.log('🔥🔥🔥 BOSS PHASE: 50 HP - FLARE STORM TRIGGERED!', enemyHealth);
      setFlareStormMilestones(prev => ({ ...prev, at50: true }));
      setBattleMessage({ text: '⚠️ The Ache doubles in intensity! Another storm rises!', type: 'warning' });
      setTimeout(() => {
        initFlareStorm();
      }, 2000);
      return;
    }
    
    // 25 HP threshold - Final Flare Storm
    if (enemyHealth <= 25 && enemyHealth > 0 && !flareStormMilestones.at25 && flareStormMilestones.at50) {
      console.log('🔥🔥🔥 BOSS PHASE: 25 HP - FINAL FLARE STORM TRIGGERED!', enemyHealth);
      setFlareStormMilestones(prev => ({ ...prev, at25: true }));
      setBattleMessage({ text: '⚠️ The Ache unleashes everything! The final storm!', type: 'critical' });
      setTimeout(() => {
        initFlareStorm();
      }, 2000);
      return;
    }
  }, [enemyHealth, phase2, battlePhase, flareStormMilestones, combatState.waitingForEnemyTurn]);

  // Initialize minigames
  const initBreathing = () => {
    setBattlePhase('breathing_minigame');
    setBreathCount(0);
    setBreathingSuccess(0);
    setBreathingMisses(0);
    setCircleScale(0.5);
    setBreathingPhase('inhale');
    setBreathingText('Inhale...');
  };

  const initPainMapping = () => {
    setBattlePhase('pain_mapping');
    setPainRegions([]);
  };

  const initFlareStorm = () => {
    // Reset everything FIRST to prevent stale state issues
    setFireballs([]);
    setFireballsClicked(0);
    setFireballsMissed(0);
    
    // Small delay to ensure state is cleared before starting new storm
    setTimeout(() => {
      setBattlePhase('flare_storm');
      // Spawn fireballs for MINIGAME (more fireballs)
      const newFireballs: Fireball[] = [];
      for (let i = 0; i < 10; i++) {
        newFireballs.push({
          id: i,
          x: 10 + Math.random() * 80, // Keep within screen bounds
          y: -10 - (i * 10),
          speed: 0.8 + Math.random() * 0.7 // Slower
        });
      }
      setFireballs(newFireballs);
    }, 50);
  };

  const initFireballAttack = () => {
    setFireballsClicked(0);
    setFireballsMissed(0);
    setFireballAttackDamage(0);
    // Spawn fireballs for ENEMY ATTACK (fewer, slower)
    const newFireballs: Fireball[] = [];
    for (let i = 0; i < 6; i++) {
      newFireballs.push({
        id: i,
        x: 15 + Math.random() * 70,
        y: -10 - (i * 15),
        speed: 0.6 + Math.random() * 0.5 // Even slower
      });
    }
    setFireballs(newFireballs);
  };

  const initMemoryFragment = () => {
    setBattlePhase('memory_fragment');
    const memories = [
      { text: "The doctor said it was just stress", isTrue: true, selected: false },
      { text: "You're making this up for attention", isTrue: false, selected: false },
      { text: "The pain started when you were 15", isTrue: true, selected: false },
      { text: "Everyone has pain like this", isTrue: false, selected: false },
    ];
    setMemoryChoices(memories);
  };

  const initReassembly = () => {
    setBattlePhase('reassembly_puzzle');
    setPuzzlePieces([
      { id: 1, placed: false },
      { id: 2, placed: false },
      { id: 3, placed: false },
      { id: 4, placed: false },
    ]);
  };

  const initAffirmation = () => {
    setBattlePhase('affirmation_sequence');
    setAffirmationIndex(0);
    setAffirmationScore(0);
    const affirmList = [
      { text: "My pain is real", isTrue: true },
      { text: "I deserve care", isTrue: true },
      { text: "You're imagining this", isTrue: false },
      { text: "I know my body", isTrue: true },
      { text: "Everyone feels this way", isTrue: false },
      { text: "I can trust myself", isTrue: true },
      { text: "It's all in your head", isTrue: false },
      { text: "I am worthy of help", isTrue: true },
    ];
    setAffirmations(affirmList);
  };

  // Breathing animation
  useEffect(() => {
    if (battlePhase === 'breathing_minigame') {
      let phase: 'inhale' | 'hold' | 'exhale' | 'pause' = 'inhale';
      let elapsed = 0;
      
      const interval = setInterval(() => {
        elapsed += 100;
        
        if (phase === 'inhale') {
          setCircleScale(prev => Math.min(1, prev + 0.033)); // 3 seconds to full
          setBreathingText('Breathe in...');
          setBreathingPhase('inhale');
          if (elapsed >= 3000) {
            phase = 'hold';
            elapsed = 0;
          }
        } else if (phase === 'hold') {
          setBreathingText('Hold...');
          if (elapsed >= 1000) {
            phase = 'exhale';
            elapsed = 0;
          }
        } else if (phase === 'exhale') {
          setCircleScale(prev => Math.max(0.5, prev - 0.033)); // 3 seconds to small
          setBreathingText('Breathe out...');
          setBreathingPhase('exhale');
          if (elapsed >= 3000) {
            phase = 'pause';
            elapsed = 0;
          }
        } else if (phase === 'pause') {
          setBreathingText('Rest...');
          if (elapsed >= 1000) {
            phase = 'inhale';
            elapsed = 0;
          }
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [battlePhase]);

  // Fireball animation (both attack and minigame)
  useEffect(() => {
    if (battlePhase === 'flare_storm' || battlePhase === 'fireball_attack') {
      const interval = setInterval(() => {
        setFireballs(prev => {
          if (prev.length === 0) return prev;
          
          const updated = prev.map(fb => ({ 
            ...fb, 
            y: fb.y + fb.speed,
            // Clamp x position to prevent off-screen issues
            x: Math.max(5, Math.min(95, fb.x))
          }));
          
          // Remove fireballs that went off screen (bottom) and count as missed
          const onScreen = updated.filter(fb => fb.y < 100);
          const offScreen = updated.filter(fb => fb.y >= 100);
          
          if (offScreen.length > 0) {
            // Batch update missed count
            setFireballsMissed(m => m + offScreen.length);
            if (battlePhase === 'fireball_attack') {
              // Each missed fireball = damage
              setFireballAttackDamage(d => d + (offScreen.length * 5));
            }
          }
          
          return onScreen;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [battlePhase]);

  // Check flare storm/fireball attack completion
  useEffect(() => {
    if (battlePhase === 'flare_storm') {
      const totalProcessed = fireballsClicked + fireballsMissed;
      // IMPORTANT: Don't check completion until fireballs have actually spawned!
      // This prevents stale state from the previous storm from triggering completion
      if (fireballs.length === 0 && totalProcessed === 0) {
        // Storm hasn't started yet, wait for fireballs to spawn
        return;
      }
      
      // ONLY complete when ALL 10 fireballs have been processed (tapped or left screen)
      // Do NOT exit early even if no fireballs are visible - wait for full count
      if (totalProcessed >= 10) {
        // Minigame over - use a small timeout to ensure state is settled
        const timeout = setTimeout(() => {
          const successRate = fireballsClicked / Math.max(totalProcessed, 1);
          if (successRate >= 0.6) {
            // Success
            onActionSelect(`FLARE_STORM_SUCCESS:${-40}:0`);
            setBattleMessage({ text: "You weathered the storm! Resilient buff gained.", type: 'heal' });
          } else {
            // Failure
            onActionSelect(`FLARE_STORM_FAIL:${-20}:0`);
            setBattleMessage({ text: "The flames overwhelmed you...", type: 'warning' });
          }
          setTimeout(() => {
            // Flare Storm counts as the enemy's turn! Return to player turn
            setCombatState(prev => ({ ...prev, isPlayerTurn: true, waitingForEnemyTurn: false }));
            setBattlePhase('player_turn');
            setBattleMessage(null);
          }, 2000);
        }, 100);
        return () => clearTimeout(timeout);
      }
    } else if (battlePhase === 'fireball_attack') {
      const totalProcessed = fireballsClicked + fireballsMissed;
      // Same guard for fireball attack
      if (fireballs.length === 0 && totalProcessed === 0) {
        return;
      }
      
      // ONLY complete when ALL 6 fireballs have been processed
      if (totalProcessed >= 6) {
        // Attack over
        const timeout = setTimeout(() => {
          const totalDamage = fireballAttackDamage;
          onActionSelect(`ENEMY_fireball_barrage:${totalDamage}:0`);
          setBattleMessage({ 
            text: `The Ache unleashed fireballs! You took ${totalDamage} damage!`, 
            type: fireballsClicked >= 4 ? 'action' : 'critical' 
          });
          // Enemy attack complete, mark for player turn transition
          setCombatState(prev => ({ ...prev, isPlayerTurn: false }));
          setBattlePhase('attack_result');
        }, 100);
        return () => clearTimeout(timeout);
      }
    }
  }, [fireballs.length, fireballsClicked, fireballsMissed, battlePhase, fireballAttackDamage]);

  // Tutorial
  const advanceTutorial = () => {
    if (combatState.tutorialStep === 4) {
      setCombatState(prev => ({ ...prev, tutorialStep: 0, hasSeenTutorial: true, isPlayerTurn: true }));
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
      // Fireball Barrage - special Phase 2 attack
      if (combatState.turnCount > 2 && Math.random() > 0.6) moves.push('fireball_barrage');
      return moves[Math.floor(Math.random() * moves.length)];
    } else {
      const moves: EnemyMove[] = ['phantom_throb', 'gaslighting_whisper'];
      if (playerClarity > 70) moves.push('flare_spike');
      if (combatState.turnCount > 3 && Math.random() > 0.7) moves.push('numbing_fog');
      return moves[Math.floor(Math.random() * moves.length)];
    }
  };

  // Get telegraph
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
      case 'fireball_barrage': return "🔥 The Ache's form IGNITES! Flames gather...";
    }
  };

  // Get probe dialogue choices
  const getProbeDialogue = (): DialogueChoice[] => {
    return [
      { text: "Why do you hurt me?", action: 'probe', emotion: '💭' },
      { text: "Can we coexist?", action: 'soothe', emotion: '🌊' },
      { text: "What are you trying to tell me?", action: 'observe', emotion: '👁️' },
      { text: "I don't have time for this.", action: 'resist', emotion: '💪' },
    ];
  };

  // Get enemy response dialogue
  const getEnemyResponseDialogue = (): DialogueChoice[] => {
    const lastMove = combatState.lastEnemyMove;

    if (lastMove === 'gaslighting_whisper') {
      return [
        { text: "No. I KNOW this is real.", action: 'probe', emotion: '😤' },
        { text: "Maybe you're right... maybe I imagined it.", action: 'observe', emotion: '😔' },
        { text: "I don't need to prove anything to you.", action: 'soothe', emotion: '🌊' },
        { text: "Whatever. Moving on.", action: 'resist', emotion: '💪' },
      ];
    } else if (lastMove === 'flare_spike') {
      return [
        { text: "Why are you doing this to me?!", action: 'probe', emotion: '😤' },
        { text: "I need to breathe through this pain.", action: 'soothe', emotion: '🌊' },
        { text: "Let me watch how this affects me.", action: 'observe', emotion: '👁️' },
        { text: "I can take it. I'm stronger.", action: 'resist', emotion: '💪' },
      ];
    } else {
      return getProbeDialogue();
    }
  };

  // Handle action button click
  const handleActionButtonClick = (actionId: ActionType) => {
    if (actionId === 'probe') {
      // Show probe dialogue
      setCombatState(prev => ({ ...prev, dialogueSource: 'probe' }));
      setBattlePhase('probe_dialogue');
    } else {
      // Execute directly
      handlePlayerAction(actionId);
    }
  };

  // Handle dialogue choice
  const handleDialogueChoice = (choice: DialogueChoice) => {
    console.log('💬 handleDialogueChoice - source:', combatState.dialogueSource, 'choice:', choice.action);
    
    // If this is a response to enemy attack, don't count as player's turn
    // Just transition back to player turn menu
    if (combatState.dialogueSource === 'enemy') {
      console.log('→ Enemy dialogue response - showing player turn menu');
      // Apply small effects from the emotional response
      let clarityChange = 0;
      let flareChange = 0;
      
      // Different responses have different effects
      if (choice.emotion === '😤') {
        clarityChange = 5; // Standing firm increases clarity
      } else if (choice.emotion === '😔') {
        clarityChange = -5; // Doubting yourself decreases clarity
      } else if (choice.emotion === '🌊') {
        flareChange = -3; // Soothing reduces flare
      } else if (choice.emotion === '💪') {
        clarityChange = 3; // Resisting maintains clarity
      }
      
      onActionSelect(`DIALOGUE_RESPONSE:${flareChange}:${clarityChange}`);
      
      // Just go back to player turn - they haven't taken their action yet
      setCombatState(prev => ({ ...prev, isPlayerTurn: true, waitingForEnemyTurn: false, dialogueSource: undefined }));
      setBattlePhase('player_turn');
    } else {
      // This is a probe dialogue - this IS their action
      console.log('→ Probe dialogue - this IS the player action');
      setCombatState(prev => ({ ...prev, pendingAction: choice.action }));
      handlePlayerAction(choice.action, choice.text);
    }
  };

  // Execute enemy attack
  const executeEnemyAttack = (move: EnemyMove) => {
    if (move === 'fireball_barrage') {
      // Special interactive attack
      setBattleMessage({ text: "The Ache used Fireball Barrage!", type: 'critical' });
      setEnemyShake(true);
      setTimeout(() => setEnemyShake(false), 500);
      
      // Initialize fireball attack
      initFireballAttack();
      setBattlePhase('fireball_attack');
      setCombatState(prev => ({ ...prev, lastEnemyMove: move }));
      return;
    }

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
      setCombatState(prev => ({ ...prev, isNumbed: true, lastEnemyMove: move, isPlayerTurn: false }));
    } else {
      setCombatState(prev => ({ ...prev, lastEnemyMove: move, isPlayerTurn: false }));
    }

    setBattlePhase('attack_result');
  };

  // Continue from attack result
  const continueFromAttackResult = () => {
    console.log('📍 continueFromAttackResult - isPlayerTurn:', combatState.isPlayerTurn, 'waitingForEnemyTurn:', combatState.waitingForEnemyTurn);
    setBattleMessage(null);
    
    // If it was enemy's turn that just finished, go back to player
    if (!combatState.isPlayerTurn) {
      console.log('→ Enemy turn just finished, returning to player');
      const triggersDialogue = combatState.lastEnemyMove === 'gaslighting_whisper' || combatState.lastEnemyMove === 'flare_spike';
      
      if (triggersDialogue && Math.random() > 0.3) {
        // Show enemy response dialogue, then player turn
        setCombatState(prev => ({ ...prev, dialogueSource: 'enemy' }));
        setBattlePhase('enemy_response_dialogue');
      } else {
        // Go to player turn
        setCombatState(prev => ({ ...prev, isPlayerTurn: true, waitingForEnemyTurn: false }));
        setBattlePhase('player_turn');
      }
    }
    // If it was player's turn, transition to enemy turn
    else if (combatState.waitingForEnemyTurn) {
      console.log('→ Player turn just finished, starting enemy turn');
      setCombatState(prev => ({ ...prev, isPlayerTurn: false, waitingForEnemyTurn: false }));
      startEnemyTurn();
    } else {
      // RECOVERY MECHANISM: If we're in an unexpected state, safely recover to player turn
      console.log('⚠️ Unexpected state - recovering to player turn');
      setCombatState(prev => ({ ...prev, isPlayerTurn: true, waitingForEnemyTurn: false }));
      setBattlePhase('player_turn');
    }
  };

  // Handle player action
  const handlePlayerAction = (actionId: ActionType, dialogueText?: string) => {
    if (actionId === 'observe' && combatState.isNumbed) {
      setBattleMessage({ 
        text: "You try to focus, but the Numbing Fog blocks your thoughts...", 
        type: 'ineffective' 
      });
      setCombatState(prev => ({ ...prev, isNumbed: false, waitingForEnemyTurn: true }));
      setBattlePhase('attack_result');
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
        const observeText = dialogueText || 'You watch the pattern carefully.';
        if (combatState.nextEnemyMove === 'gaslighting_whisper') {
          message = { text: `${observeText} Ready for the whispers!`, type: 'super_effective' };
          clarityChange = 30;
          effectiveness = 'super_effective';
        } else {
          message = { text: observeText, type: 'heal' };
          clarityChange = 20;
        }
        break;

      case 'soothe':
        const sootheText = dialogueText || 'You breathe deeply. The pain softens...';
        const newSootheUsedTurn = combatState.turnCount;
        let sootheEffectiveness = -30;
        if (sootheCooldown === 1) sootheEffectiveness = -20;
        else if (sootheCooldown === 2) sootheEffectiveness = -25;
        if (phase2) sootheEffectiveness += 8;

        if (combatState.nextEnemyMove === 'flare_spike') {
          message = { text: `${sootheText} Bracing yourself!`, type: 'super_effective' };
          sootheEffectiveness -= 12;
          clarityChange = 10;
          effectiveness = 'super_effective';
        } else {
          message = { text: sootheText, type: 'heal' };
          clarityChange = 5;
        }

        flareChange = sootheEffectiveness;
        setCombatState(prev => ({ ...prev, sootheUsedTurn: newSootheUsedTurn }));
        break;

      case 'probe':
        const probeText = dialogueText || 'You ask: Where do you live in me?';
        
        if (playerClarity > 70) {
          message = { text: `${probeText} DEEP PROBE!`, type: 'super_effective' };
          damage = 50;
          clarityChange = 20;
          flareChange = 3;
          effectiveness = 'super_effective';
        } else if (playerClarity < 30) {
          message = { text: `${probeText} Flailing in the dark!`, type: 'not_effective' };
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
        const resistText = dialogueText || 'You push through the pain.';
        if (combatState.nextEnemyMove === 'phantom_throb') {
          message = { text: `${resistText} Steeling yourself!`, type: 'super_effective' };
          damage = 18;
          flareChange = -22;
          clarityChange = -5;
          effectiveness = 'super_effective';
        } else if (combatState.nextEnemyMove === 'gaslighting_whisper') {
          message = { text: `${resistText} The doubt worsens...`, type: 'not_effective' };
          damage = 12;
          flareChange = -12;
          clarityChange = -18;
          effectiveness = 'not_effective';
        } else {
          message = { text: resistText, type: 'action' };
          damage = 12;
          flareChange = -18;
          clarityChange = -10;
        }

        setEnemyShake(true);
        setTimeout(() => setEnemyShake(false), 300);
        break;
    }

    setBattleMessage(message);
    
    // Mark that player action is complete and we'll need to go to enemy turn
    setCombatState(prev => ({ ...prev, waitingForEnemyTurn: true }));
    setBattlePhase('attack_result');

    onActionSelect(`${actionId}:${damage}:${flareChange}:${clarityChange}`);
    console.log('💥 Action complete - new enemyHealth will be:', enemyHealth - damage);

    console.log(`💥 ${actionId}: ${damage} dmg, ${flareChange} Flare, ${clarityChange} Clarity, ${effectiveness}`);

    // Show effectiveness, then ALWAYS wait for player to continue to enemy turn
    setTimeout(() => {
      if (effectiveness === 'super_effective') {
        setBattleMessage({ text: "It's super effective!", type: 'super_effective' });
      } else if (effectiveness === 'not_effective') {
        setBattleMessage({ text: "It's not very effective...", type: 'not_effective' });
      }

      // For Probe, show mini-decision before enemy turn
      setTimeout(() => {
        if (actionId === 'probe') {
          setBattlePhase('mini_decision');
        }
        // For all other actions, player clicks through attack_result to go to enemy turn
        // This is handled by continueFromAttackResult
      }, 1500);
    }, 1500);

    const newTurnCount = combatState.turnCount + 1;
    setCombatState(prev => ({ ...prev, turnCount: newTurnCount }));
  };

  // Start enemy turn
  const startEnemyTurn = () => {
    if (enemyHealth <= 0) return;
    
    // In Phase 2, check if we should force a Flare Storm instead - DIRECT TRIGGER
    if (phase2) {
      // Check 75 HP threshold
      if (enemyHealth <= 75 && enemyHealth > 50 && !flareStormMilestones.at75) {
        console.log('🔥🔥🔥 FORCING FLARE STORM AT 75 HP!', enemyHealth);
        setFlareStormMilestones(prev => ({ ...prev, at75: true }));
        setBattleMessage({ text: '⚠️ The Ache\'s form IGNITES! A storm of flames approaches!', type: 'warning' });
        setTimeout(() => {
          initFlareStorm();
        }, 2000);
        return;
      }
      
      // Check 50 HP threshold
      if (enemyHealth <= 50 && enemyHealth > 25 && !flareStormMilestones.at50 && flareStormMilestones.at75) {
        console.log('🔥🔥🔥 FORCING FLARE STORM AT 50 HP!', enemyHealth);
        setFlareStormMilestones(prev => ({ ...prev, at50: true }));
        setBattleMessage({ text: '⚠️ The Ache doubles in intensity! Another storm rises!', type: 'warning' });
        setTimeout(() => {
          initFlareStorm();
        }, 2000);
        return;
      }
      
      // Check 25 HP threshold
      if (enemyHealth <= 25 && enemyHealth > 0 && !flareStormMilestones.at25 && flareStormMilestones.at50) {
        console.log('🔥🔥🔥 FORCING FLARE STORM AT 25 HP!', enemyHealth);
        setFlareStormMilestones(prev => ({ ...prev, at25: true }));
        setBattleMessage({ text: '⚠️ The Ache unleashes everything! The final storm!', type: 'critical' });
        setTimeout(() => {
          initFlareStorm();
        }, 2000);
        return;
      }
    }

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

    // After mini-decision, go to enemy turn
    setCombatState(prev => ({ ...prev, isPlayerTurn: false, waitingForEnemyTurn: false }));
    startEnemyTurn();
  };

  // Breathing minigame click
  const handleBreathClick = () => {
    const isCorrectTiming = 
      (breathingPhase === 'inhale' && circleScale > 0.9) ||
      (breathingPhase === 'exhale' && circleScale < 0.6);

    if (isCorrectTiming) {
      setBreathingSuccess(prev => prev + 1);
      setBreathCount(prev => prev + 1);
      
      if (breathCount + 1 >= 3) {
        // Success!
        onActionSelect(`BREATHING_SUCCESS:${-30}:0`);
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
        onActionSelect(`BREATHING_FAIL:${-15}:0`);
        setBattleMessage({ text: "Your breathing is ragged, but you're still standing.", type: 'action' });
        setTimeout(() => {
          setBattlePhase('player_turn');
          setBattleMessage(null);
        }, 2000);
      }
    }
  };

  // Pain mapping
  const handlePainRegionClick = (region: string) => {
    if (!painRegions.includes(region)) {
      const newRegions = [...painRegions, region];
      setPainRegions(newRegions);
      
      if (newRegions.length >= 3) {
        // Complete
        onActionSelect(`PAIN_MAPPING:${-25}:0:${newRegions.join(',')}`);
        setBattleMessage({ text: "Naming the pain makes it smaller. Not gone, but knowable.", type: 'heal' });
        setTimeout(() => {
          setBattlePhase('player_turn');
          setBattleMessage(null);
        }, 2000);
      }
    }
  };

  // Fireball click
  const handleFireballClick = (id: number, event: React.MouseEvent | React.TouchEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    // Safety check - only process clicks during active minigame phases
    if (battlePhase !== 'flare_storm' && battlePhase !== 'fireball_attack') {
      console.log('⚠️ Ignoring click - not in active minigame phase');
      return;
    }
    
    // Use callback form to ensure we only increment if we actually removed a fireball
    setFireballs(prev => {
      const exists = prev.some(fb => fb.id === id);
      if (exists) {
        setFireballsClicked(c => c + 1);
        return prev.filter(fb => fb.id !== id);
      }
      return prev;
    });
  };

  // Memory fragment
  const handleMemoryClick = (index: number) => {
    const updated = [...memoryChoices];
    updated[index].selected = !updated[index].selected;
    setMemoryChoices(updated);
  };

  const submitMemoryChoices = () => {
    const correct = memoryChoices.filter(m => m.isTrue === m.selected).length;
    const successRate = correct / memoryChoices.length;
    
    if (successRate >= 0.5) {
      onActionSelect(`MEMORY_SUCCESS:0:${30}`);
      setBattleMessage({ text: "The fog clears. You remember who you are.", type: 'heal' });
    } else {
      onActionSelect(`MEMORY_FAIL:0:${15}`);
      setBattleMessage({ text: "The confusion lingers, but you're still here.", type: 'warning' });
    }
    
    setTimeout(() => {
      setBattlePhase('player_turn');
      setBattleMessage(null);
    }, 2000);
  };

  // Reassembly
  const handlePieceClick = (id: number) => {
    const updated = [...puzzlePieces];
    const piece = updated.find(p => p.id === id);
    if (piece && !piece.placed) {
      piece.placed = true;
      setPuzzlePieces(updated);
      
      if (updated.every(p => p.placed)) {
        // Success
        onActionSelect(`REASSEMBLY_SUCCESS:0:${35}`);
        setBattleMessage({ text: "You are whole. You are real.", type: 'heal' });
        setTimeout(() => {
          setBattlePhase('player_turn');
          setBattleMessage(null);
        }, 2000);
      }
    }
  };

  // Affirmation
  const handleAffirmationClick = (isYes: boolean) => {
    const current = affirmations[affirmationIndex];
    const correct = (isYes && current.isTrue) || (!isYes && !current.isTrue);
    
    if (correct) {
      setAffirmationScore(prev => prev + 1);
    }
    
    if (affirmationIndex + 1 >= affirmations.length) {
      // Complete
      const successRate = affirmationScore / affirmations.length;
      if (successRate >= 0.6) {
        onActionSelect(`AFFIRMATION_SUCCESS:0:${40}`);
        setBattleMessage({ text: "You know who you are. The fog can't take that.", type: 'heal' });
      } else {
        onActionSelect(`AFFIRMATION_FAIL:0:${25}`);
        setBattleMessage({ text: "The doubts linger, but so do you.", type: 'warning' });
      }
      
      setTimeout(() => {
        setBattlePhase('player_turn');
        setBattleMessage(null);
      }, 2000);
    } else {
      setAffirmationIndex(prev => prev + 1);
    }
  };

  // Render tutorial
  const renderTutorial = () => {
    const steps = [
      {
        title: "Welcome to Combat",
        text: "The Ache manifests before you. You must understand it to overcome it. Every choice is an emotional stance.",
        icon: <Sparkles className="w-8 h-8" />
      },
      {
        title: "Emotional Choices",
        text: "After attacks, you'll choose how to respond. Probe lets you choose from all actions. There's no single 'right' answer.",
        icon: <Brain className="w-8 h-8" />
      },
      {
        title: "The Enemy Telegraphs",
        text: "Watch the warning at the top of the screen. The Ache shows what it's about to do. Choose your response wisely.",
        icon: <AlertTriangle className="w-8 h-8" />
      },
      {
        title: "Crisis Management",
        text: "If Flare reaches 100% or Clarity hits 0%, you'll face a minigame. Stay calm and you'll recover!",
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

      {/* Tutorial */}
      <AnimatePresence>
        {battlePhase === 'tutorial' && renderTutorial()}
      </AnimatePresence>

      {/* BREATHING MINIGAME */}
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
                className="w-64 h-64 mx-auto mb-8 flex items-center justify-center cursor-pointer relative"
                onClick={handleBreathClick}
              >
                <motion.div 
                  className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/30 to-amber-500/30 border-4 border-purple-400/50 flex items-center justify-center"
                  animate={{ scale: circleScale }}
                  transition={{ duration: 0.1 }}
                >
                  <p className="text-white text-lg font-serif">{breathingText}</p>
                </motion.div>
                
                {/* Ripple effect */}
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-purple-300/30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
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
                Click when the circle feels right
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAIN MAPPING */}
      <AnimatePresence>
        {battlePhase === 'pain_mapping' && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center max-w-md px-4">
              <p className="text-white text-xl mb-8 font-serif">
                Where does it hurt most? Point to the pain.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { id: 'lower_abdomen', label: 'Lower Abdomen', emoji: '🔴' },
                  { id: 'lower_back', label: 'Lower Back', emoji: '🟠' },
                  { id: 'legs', label: 'Legs', emoji: '🟡' },
                  { id: 'bowels', label: 'Bowels/Bladder', emoji: '🟢' },
                  { id: 'chest', label: 'Chest', emoji: '🔵' },
                  { id: 'everywhere', label: 'Everywhere', emoji: '🧠' },
                ].map(region => (
                  <button
                    key={region.id}
                    onClick={() => handlePainRegionClick(region.id)}
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${
                      painRegions.includes(region.id)
                        ? 'bg-purple-500/50 border-purple-300 scale-95'
                        : 'bg-white/10 border-white/30 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-1">{region.emoji}</div>
                    <div className="text-white text-sm">{region.label}</div>
                  </button>
                ))}
              </div>

              <p className="text-white/60 text-sm">
                Select {3 - painRegions.length} more region{3 - painRegions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIREBALL ATTACK (Enemy Attack in Phase 2) */}
      <AnimatePresence>
        {battlePhase === 'fireball_attack' && (
          <motion.div
            className="absolute inset-0 z-50 bg-gradient-to-b from-red-900/40 via-orange-900/30 to-black/60 backdrop-blur-sm overflow-hidden pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute top-8 left-0 right-0 text-center pointer-events-none">
              <p className="text-white text-xl font-serif mb-2">
                🔥 FIREBALL BARRAGE! 🔥
              </p>
              <p className="text-white/70 text-sm">
                Click the flames to protect yourself!
              </p>
              <div className="mt-2 text-white text-sm">
                Deflected: {fireballsClicked} | Hit: {fireballsMissed}
              </div>
            </div>

            {/* Fireballs - only render if they exist */}
            {fireballs.length > 0 && fireballs.map(fb => (
              <div
                key={fb.id}
                className="absolute pointer-events-auto cursor-pointer touch-none"
                style={{ 
                  left: `${fb.x}%`, 
                  top: `${fb.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 100
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFireballClick(fb.id, e);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFireballClick(fb.id, e);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFireballClick(fb.id, e);
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.8 }}
                  className="w-16 h-16 relative select-none"
                >
                  <ImageWithFallback
                    src="https://i.pinimg.com/originals/1b/34/df/1b34dfc0a9bf5563e0f960a24b6862db.gif"
                    alt="Fireball"
                    className="w-full h-full object-contain drop-shadow-[0_0_16px_rgba(255,100,0,0.9)] pointer-events-none"
                  />
                </motion.div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLARE STORM (Minigame) */}
      <AnimatePresence>
        {battlePhase === 'flare_storm' && (
          <motion.div
            className="absolute inset-0 z-50 bg-gradient-to-b from-red-900/40 via-orange-900/30 to-black/60 backdrop-blur-sm overflow-hidden pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute top-8 left-0 right-0 text-center pointer-events-none">
              <p className="text-white text-xl font-serif mb-4">
                Brace yourself! The Ache unleashes a FLARE STORM!
              </p>
              <p className="text-white/70 text-sm">
                Click the flames before they hit you!
              </p>
              <div className="mt-4 text-white">
                Clicked: {fireballsClicked} | Missed: {fireballsMissed}
              </div>
            </div>

            {/* Fireballs - only render if they exist */}
            {fireballs.length > 0 && fireballs.map(fb => (
              <div
                key={fb.id}
                className="absolute pointer-events-auto cursor-pointer touch-none"
                style={{ 
                  left: `${fb.x}%`, 
                  top: `${fb.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 100
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFireballClick(fb.id, e);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFireballClick(fb.id, e);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFireballClick(fb.id, e);
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.8 }}
                  className="w-16 h-16 relative select-none"
                >
                  <ImageWithFallback
                    src="https://i.pinimg.com/originals/1b/34/df/1b34dfc0a9bf5563e0f960a24b6862db.gif"
                    alt="Fireball"
                    className="w-full h-full object-contain drop-shadow-[0_0_16px_rgba(255,100,0,0.9)] pointer-events-none"
                  />
                </motion.div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MEMORY FRAGMENT */}
      <AnimatePresence>
        {battlePhase === 'memory_fragment' && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center max-w-md px-4">
              <p className="text-white text-xl mb-8 font-serif">
                You're losing yourself in the fog... what was real?
              </p>

              <p className="text-white/80 text-sm mb-4">Which of these are true?</p>

              <div className="space-y-3 mb-6">
                {memoryChoices.map((memory, i) => (
                  <button
                    key={i}
                    onClick={() => handleMemoryClick(i)}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      memory.selected
                        ? 'bg-blue-500/50 border-blue-300'
                        : 'bg-white/10 border-white/30 hover:bg-white/20'
                    }`}
                  >
                    <span className="text-white text-sm font-serif">"{memory.text}"</span>
                  </button>
                ))}
              </div>

              <button
                onClick={submitMemoryChoices}
                className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
              >
                Remember
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REASSEMBLY PUZZLE */}
      <AnimatePresence>
        {battlePhase === 'reassembly_puzzle' && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <p className="text-white text-xl mb-8 font-serif">
                Pull yourself together. Literally.
              </p>

              <p className="text-white/80 text-sm mb-6">Click the pieces in order</p>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                {puzzlePieces.map(piece => (
                  <button
                    key={piece.id}
                    onClick={() => handlePieceClick(piece.id)}
                    className={`h-32 rounded-xl border-2 transition-all ${
                      piece.placed
                        ? 'bg-green-500/50 border-green-300'
                        : 'bg-purple-500/20 border-purple-300 hover:bg-purple-500/40'
                    }`}
                  >
                    <span className="text-white text-4xl">{piece.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AFFIRMATION SEQUENCE */}
      <AnimatePresence>
        {battlePhase === 'affirmation_sequence' && affirmationIndex < affirmations.length && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center max-w-md px-4">
              <p className="text-white text-xl mb-8 font-serif">
                You're losing sight of yourself. What do you know to be true?
              </p>

              <motion.div
                key={affirmationIndex}
                className="mb-8 p-6 bg-white/10 rounded-xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <p className="text-white text-lg font-serif">
                  "{affirmations[affirmationIndex].text}"
                </p>
              </motion.div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleAffirmationClick(true)}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                >
                  TRUE
                </button>
                <button
                  onClick={() => handleAffirmationClick(false)}
                  className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                >
                  FALSE
                </button>
              </div>

              <p className="text-white/60 text-sm mt-4">
                {affirmationIndex + 1} / {affirmations.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enemy HP bar */}
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

          {/* Telegraph */}
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

      {/* Enemy display */}
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

      {/* Battle message */}
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

      {/* Action buttons */}
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

      {/* Probe dialogue */}
      <AnimatePresence>
        {battlePhase === 'probe_dialogue' && (
          <motion.div
            className="relative z-20 px-4 mb-6 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <p className="text-white text-sm text-center mb-4 font-serif italic">
              You want to ask a hard question...
            </p>
            
            <p className="text-white text-sm text-center mb-2">
              What will you ask The Ache?
            </p>

            {getProbeDialogue().map((choice, i) => (
              <motion.button
                key={i}
                onClick={() => handleDialogueChoice(choice)}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/30 hover:border-purple-400/60 rounded-xl text-left transition-all"
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

      {/* Enemy response dialogue */}
      <AnimatePresence>
        {battlePhase === 'enemy_response_dialogue' && (
          <motion.div
            className="relative z-20 px-4 mb-6 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <p className="text-white/80 text-sm text-center mb-4 font-serif italic">
              The Ache stares at you, waiting...
            </p>
            
            <p className="text-white text-sm text-center mb-2">
              How do you respond?
            </p>

            {getEnemyResponseDialogue().map((choice, i) => (
              <motion.button
                key={i}
                onClick={() => handleDialogueChoice(choice)}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/30 hover:border-purple-400/60 rounded-xl text-left transition-all"
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

      {/* Mini-decision (after Probe action) */}
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
