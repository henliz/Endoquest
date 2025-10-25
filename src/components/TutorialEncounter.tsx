// src/components/TutorialEncounter.tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { VNScene } from './VNScene';
import { AITextInputScene } from './AITextInputScene';
import { EnhancedCombatV3 } from './EnhancedCombatV3';
import { PostCombatScene } from './PostCombatScene';
import { WebAudioManager } from '@/audio/WebAudioManager';
import { MusicToggle } from './MusicToggle';

type Phase =
  | 'awakening'
  | 'archivist_intro'
  | 'first_question'
  | 'basin_response'
  | 'transition_to_combat'
  | 'combat_phase_1'
  | 'mid_battle_vn'
  | 'combat_phase_2'
  | 'victory_vn'
  | 'power_reveal'
  | 'archivist_final'
  | 'post_combat'
  | 'game_end';

interface TutorialState {
  phase: Phase;
  flare: number;
  clarity: number;
  turnCount: number;
  playerChoices: string[];
  aiResponses: Array<{
    sceneId: string;
    userInput: string;
    aiResponse: string;
  }>;
  combatTurns: number;
  enemyHealth: number;
}

// Archivist VN portraits - rotate between these during dialogue
const ARCHIVIST_PORTRAITS = [
  '/assets/Archivist_Sprite1.png',
];
const VN_BACKGROUND =
  'https://64.media.tumblr.com/4cef6a87f522f8f2ca9e9aafd84fbaca/b38864c912b46d59-00/s1280x1920/e0a2f6bb50cb530ee6235c1fc75f8d86477c4120.jpg';
const ENEMY_IMAGE =
  'https://64.media.tumblr.com/tumblr_mcchojgkjR1rreqgwo1_500.gif';

interface TutorialEncounterProps {
  onComplete: (data: { choices: string[]; finalState: TutorialState }) => void;
}

export function TutorialEncounter({ onComplete }: TutorialEncounterProps) {
  const [state, setState] = useState<TutorialState>({
    phase: 'awakening',
    flare: 70,
    clarity: 50,
    turnCount: 0,
    playerChoices: [],
    aiResponses: [],
    combatTurns: 0,
    enemyHealth: 100,
  });

  const [musicEnabled, setMusicEnabled] = useState(true);

  const advancePhase = (next: Phase) => {
    setState((prev) => ({ ...prev, phase: next }));
  };

  const handleChoice = (choiceId: string) => {
    setState((prev) => ({
      ...prev,
      playerChoices: [...prev.playerChoices, choiceId],
    }));

    // Route based on current phase
    if (state.phase === 'first_question') {
      advancePhase('basin_response');
    }
  };

  const handleMiniChoice = (choice: string) => {
    setState((prev) => ({
      ...prev,
      playerChoices: [...prev.playerChoices, `pain_location_${choice}`],
    }));
  };

  const handleBattleAction = (actionString: string) => {
    const parts = actionString.split(':');
    const action = parts[0];

    let newFlare = state.flare;
    let newClarity = state.clarity;
    let newEnemyHealth = state.enemyHealth;

    const clamp = (x: number) => Math.min(100, Math.max(0, x));

    if (action.startsWith('ENEMY_')) {
      const flareIncrease = parseInt(parts[1]) || 0;
      const clarityChange = parseInt(parts[2]) || 0;
      newFlare = clamp(state.flare + flareIncrease);
      newClarity = clamp(state.clarity + clarityChange);
      console.log('⚔️ Enemy attack:', action, `+${flareIncrease} Flare, ${clarityChange} Clarity`);
    } else if (action.startsWith('MINI_')) {
      const flareChange = parseInt(parts[1]) || 0;
      const clarityChange = parseInt(parts[2]) || 0;
      newFlare = clamp(state.flare + flareChange);
      newClarity = clamp(state.clarity + clarityChange);
      console.log('💭 Mini-decision:', action, `${flareChange} Flare, ${clarityChange} Clarity`);
    } else if (action.startsWith('BREATHING_')) {
      const flareChange = parseInt(parts[1]) || 0;
      const clarityChange = parseInt(parts[2]) || 0;
      newFlare = clamp(state.flare + flareChange);
      newClarity = clamp(state.clarity + clarityChange);
      console.log('🌬️ Breathing minigame:', action, `${flareChange} Flare, ${clarityChange} Clarity`);
    } else if (action.startsWith('PAIN_MAPPING')) {
      const flareChange = parseInt(parts[1]) || 0;
      const clarityChange = parseInt(parts[2]) || 0;
      const regions = parts[3] || '';
      newFlare = clamp(state.flare + flareChange);
      newClarity = clamp(state.clarity + clarityChange);
      console.log('🗺️ Pain mapping:', regions, `${flareChange} Flare, ${clarityChange} Clarity`);
    } else if (action.startsWith('FLARE_STORM')) {
      const flareChange = parseInt(parts[1]) || 0;
      const clarityChange = parseInt(parts[2]) || 0;
      newFlare = clamp(state.flare + flareChange);
      newClarity = clamp(state.clarity + clarityChange);
      console.log('🔥 Flare storm:', action, `${flareChange} Flare, ${clarityChange} Clarity`);
    } else if (action.startsWith('MEMORY_')) {
      const flareChange = parseInt(parts[1]) || 0;
      const clarityChange = parseInt(parts[2]) || 0;
      newFlare = clamp(state.flare + flareChange);
      newClarity = clamp(state.clarity + clarityChange);
      console.log('🧠 Memory fragment:', action, `${flareChange} Flare, ${clarityChange} Clarity`);
    } else if (action.startsWith('REASSEMBLY_')) {
      const flareChange = parseInt(parts[1]) || 0;
      const clarityChange = parseInt(parts[2]) || 0;
      newFlare = clamp(state.flare + flareChange);
      newClarity = clamp(state.clarity + clarityChange);
      console.log('🧩 Reassembly:', action, `${flareChange} Flare, ${clarityChange} Clarity`);
    } else if (action.startsWith('AFFIRMATION_')) {
      const flareChange = parseInt(parts[1]) || 0;
      const clarityChange = parseInt(parts[2]) || 0;
      newFlare = clamp(state.flare + flareChange);
      newClarity = clamp(state.clarity + clarityChange);
      console.log('✨ Affirmation:', action, `${flareChange} Flare, ${clarityChange} Clarity`);
    } else {
      // Player action with damage
      const damage = parseInt(parts[1]) || 0;
      const flareChange = parseInt(parts[2]) || 0;
      const clarityChange = parseInt(parts[3]) || 0;

      newEnemyHealth = Math.max(0, state.enemyHealth - damage);
      newFlare = clamp(state.flare + flareChange);
      newClarity = clamp(state.clarity + clarityChange);

      console.log('🎮 Player action:', action, `${damage} dmg, ${flareChange} Flare, ${clarityChange} Clarity`);

      setState((prev) => ({
        ...prev,
        playerChoices: [...prev.playerChoices, action],
      }));
    }

    const newCombatTurns = state.combatTurns + 1;

    setState((prev) => ({
      ...prev,
      flare: newFlare,
      clarity: newClarity,
      enemyHealth: newEnemyHealth,
      combatTurns: newCombatTurns,
    }));
  };

  const handleCombatEnd = () => {
    console.log('🎬 handleCombatEnd called! Current phase:', state.phase);
    if (state.phase === 'combat_phase_1') {
      console.log('→ Advancing to mid_battle_vn');
      setTimeout(() => advancePhase('mid_battle_vn'), 500);
    } else if (state.phase === 'combat_phase_2') {
      console.log('→ Advancing to victory_vn');
      setTimeout(() => advancePhase('victory_vn'), 500);
    }
  };

  const renderPhase = () => {
    switch (state.phase) {
      case 'awakening':
        return (
          <VNScene
            backgroundImage={VN_BACKGROUND}
            characterName="Narration"
            text="You awaken in the Foglands. Before the mist twists into regions like The Binding Grove or The Flooded Hollow, there's a shallow basin — silent, pulsing with a heartbeat not your own. Here, something stirs below the surface."
            onContinue={() => advancePhase('archivist_intro')}
          />
        );

      case 'archivist_intro':
        return (
          <VNScene
            backgroundImage={VN_BACKGROUND}
            characterImages={ARCHIVIST_PORTRAITS}
            characterName="The Archivist"
            text="You carry the Ache, traveler — yet you've no name for it. Tell me — when did it first answer your body's call?"
            onContinue={() => advancePhase('first_question')}
          />
        );

      case 'first_question':
        return (
          <AITextInputScene
            backgroundImage={VN_BACKGROUND}
            characterImages={ARCHIVIST_PORTRAITS}
            characterName="The Archivist"
            promptText="Tell me — when did it first answer your body's call?"
            placeholder="Describe when your pain began..."
            sceneId="tutorial_intro"
            onAdvance={(userInput, aiResponse) => {
              setState((prev) => ({
                ...prev,
                aiResponses: [
                  ...prev.aiResponses,
                  { sceneId: 'tutorial_intro', userInput, aiResponse },
                ],
              }));
              advancePhase('basin_response');
            }}
          />
        );

      case 'basin_response':
        return (
          <VNScene
            backgroundImage={VN_BACKGROUND}
            characterImages={ARCHIVIST_PORTRAITS}
            characterName="The Archivist"
            text="You put words to what had no name. The basin ripples in recognition."
            onContinue={() => advancePhase('transition_to_combat')}
          />
        );

      case 'transition_to_combat':
        return (
          <VNScene
            backgroundImage={VN_BACKGROUND}
            characterName="Narration"
            text="A shadow rises from the reflection. It moves as you move, clutching at its abdomen with mirrored pain. You realize the world is reacting to you. The Ache Beneath stands before you. The fight begins."
            onContinue={() => {
              setState((prev) => ({ ...prev, combatTurns: 0 }));
              advancePhase('combat_phase_1');
            }}
          />
        );

      case 'combat_phase_1':
        console.log('📍 Rendering COMBAT PHASE 1, enemyHealth:', state.enemyHealth);
        return (
          <EnhancedCombatV3
            enemyName="The Ache Beneath"
            enemyImage={ENEMY_IMAGE}
            playerFlare={state.flare}
            playerClarity={state.clarity}
            enemyHealth={state.enemyHealth}
            onActionSelect={handleBattleAction}
            onMiniChoice={handleMiniChoice}
            onCombatEnd={handleCombatEnd}
            phase2={false}
          />
        );

      case 'mid_battle_vn':
        return (
          <AITextInputScene
            backgroundImage={VN_BACKGROUND}
            characterImages={ARCHIVIST_PORTRAITS}
            characterName="The Archivist"
            promptText="The shadow falters — it clutches itself, gasping in sync with you. You've seen this pattern before, haven't you? Tell me — what did the healers say, when you first spoke of this pain?"
            placeholder="Describe your experience with doctors..."
            sceneId="mid_battle_vn"
            playerData={{
              combatActions: state.playerChoices.filter((c) =>
                ['Soothe', 'Observe', 'Probe', 'Resist'].includes(c)
              ),
              flare: state.flare,
              clarity: state.clarity,
              turnCount: state.combatTurns,
            }}
            onAdvance={(userInput, aiResponse) => {
              setState((prev) => ({
                ...prev,
                aiResponses: [
                  ...prev.aiResponses,
                  { sceneId: 'mid_battle_vn', userInput, aiResponse },
                ],
                combatTurns: 0,
                enemyHealth: 80,
              }));
              advancePhase('combat_phase_2');
            }}
          />
        );

      case 'combat_phase_2':
        console.log('📍 Rendering COMBAT PHASE 2, enemyHealth:', state.enemyHealth);
        return (
          <EnhancedCombatV3
            enemyName="The Ache Beneath"
            enemyImage={ENEMY_IMAGE}
            playerFlare={state.flare}
            playerClarity={state.clarity}
            enemyHealth={state.enemyHealth}
            onActionSelect={handleBattleAction}
            onMiniChoice={handleMiniChoice}
            onCombatEnd={handleCombatEnd}
            phase2={true}
          />
        );

      case 'victory_vn':
        return (
          <VNScene
            backgroundImage={VN_BACKGROUND}
            characterName="Narration"
            text="The basin calms. The shadow kneels before you — and then it merges with you, flowing into your veins like liquid light. The pain does not vanish; it becomes something you can see, something you can name."
            onContinue={() => advancePhase('power_reveal')}
          />
        );

      case 'power_reveal':
        return (
          <VNScene
            backgroundImage={VN_BACKGROUND}
            characterImages={ARCHIVIST_PORTRAITS}
            characterName="The Archivist"
            text="You have named the Ache. It was never weakness — it was the map. Now it listens when you do. You've unlocked Empathic Resonance: the ability to sense disturbances in the Fog."
            onContinue={() => advancePhase('archivist_final')}
          />
        );

      case 'archivist_final':
        return (
          <VNScene
            backgroundImage={VN_BACKGROUND}
            characterImages={ARCHIVIST_PORTRAITS}
            characterName="The Archivist"
            text="This was only the first ache, traveler. Beyond this basin lie others — vines that bind, floods that drain, and nerves that burn. But now you have a name for your pain, and that is power."
            onContinue={() => advancePhase('post_combat')}
          />
        );

      case 'post_combat':
       return (
         <PostCombatScene
           onContinue={() =>
             onComplete({ choices: state.playerChoices, finalState: state })
           }
         />
       );

      case 'game_end':
        return (
          <motion.div
            className="min-h-screen bg-gradient-to-b from-[#1a1625] to-[#0f0a1a] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center px-4">
              <h1 className="text-white text-4xl mb-6">To Be Continued...</h1>
              <p className="text-white/70 text-lg mb-8 font-serif max-w-md mx-auto">
                The path to the Lumen Archives awaits. But that is a journey for another day.
              </p>
              <button
                onClick={() =>
                  onComplete({ choices: state.playerChoices, finalState: state })
                }
                className="px-8 py-3 bg-[#c9a0dc] hover:bg-[#b88fcc] text-white rounded-xl transition-colors"
              >
                Return to Start
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Phase index for any progress UI
  const getPhaseNumber = (): number => {
    const phaseMap: Record<Phase, number> = {
      awakening: 0,
      archivist_intro: 1,
      first_question: 2,
      basin_response: 3,
      transition_to_combat: 4,
      combat_phase_1: 5,
      mid_battle_vn: 6,
      combat_phase_2: 7,
      victory_vn: 8,
      power_reveal: 9,
      archivist_final: 10,
      post_combat: 11,
      game_end: 12,
    };
    return phaseMap[state.phase] ?? 0;
  };

  // ---- MUSIC SELECTION ----
  // Ache theme during the reconciliation/interlude moments
  const achePhases: Set<Phase> = new Set([]);
  const isAcheMoment = achePhases.has(state.phase);

  // Combat music only for these
  const combatPhases: Set<Phase> = new Set(['transition_to_combat', 'combat_phase_1', 'combat_phase_2', 'mid_battle_vn']);
  const isCombatLike = combatPhases.has(state.phase);

  const currentTrack = isAcheMoment ? 'ache' : isCombatLike ? 'combat' : 'vn';

  return (
    <div>
      {/* One music manager for the whole tutorial screen */}
      <WebAudioManager track={currentTrack} volume={0.4} enabled={musicEnabled} />

      {/* Music toggle */}
      <MusicToggle onToggle={setMusicEnabled} />

      {/* Phase content */}
      {renderPhase()}
    </div>
  );
}
