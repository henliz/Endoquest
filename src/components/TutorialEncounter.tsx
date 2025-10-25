import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VNScene } from './VNScene';
import { VNChoiceScene } from './VNChoiceScene';
import { AITextInputScene } from './AITextInputScene';
import { EnhancedCombatV3 } from './EnhancedCombatV3';
import { PostCombatScene } from './PostCombatScene';
import { HowlerAudioManager } from './HowlerAudioManager';
import { MusicToggle } from './MusicToggle';
import { generateReport, type Msg, type CombatData, type ReportJSON } from '../api';
import { downloadReportAsPDF } from '../utils/pdf';

type Phase = 
  | 'awakening'
  | 'archivist_intro'
  | 'first_question'
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

function renderList(title: string, items?: string[]) {
  if (!items || !items.length) return null;
  return (
    <section className="mb-4">
      <h2 className="font-semibold mb-1">{title}</h2>
      <ul className="list-disc pl-6 space-y-1">
        {items.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    </section>
  );
}

// Archivist VN portraits - rotate between these during dialogue
const ARCHIVIST_PORTRAITS = [
  'https://64.media.tumblr.com/6ac9c73c28d6ce9ab4e74e7202871951/3f2885bda6ac220c-1d/s1280x1920/5400143058374ff9dad6debaf0434fbc7dc4caaf.png',
  'https://aniyuki.com/wp-content/uploads/2022/06/aniyuki-xiao-png-16.png',
  'https://www.pngall.com/wp-content/uploads/15/Xiao-PNG-Images.png'
];
const VN_BACKGROUND = 'https://64.media.tumblr.com/4cef6a87f522f8f2ca9e9aafd84fbaca/b38864c912b46d59-00/s1280x1920/e0a2f6bb50cb530ee6235c1fc75f8d86477c4120.jpg';
const ENEMY_IMAGE = 'https://64.media.tumblr.com/tumblr_mcchojgkjR1rreqgwo1_500.gif';

// 🎵 AUDIO SYSTEM
// Music files should be placed in /public/audio/
// See /AUDIO_SETUP.md for instructions

interface TutorialEncounterProps {
  onComplete: (data: { choices: string[], finalState: TutorialState }) => void;
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
    enemyHealth: 1,
  });

  const [musicEnabled, setMusicEnabled] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);



  const advancePhase = (nextPhase: Phase) => {
    setState(prev => ({ ...prev, phase: nextPhase }));
  };

  const handleChoice = (choiceId: string) => {
    setState(prev => ({
      ...prev,
      playerChoices: [...prev.playerChoices, choiceId],
    }));
    
    // Route based on current phase
    if (state.phase === 'first_question') {
      advancePhase('transition_to_combat');
    }
  };

  const handleMiniChoice = (choice: string) => {
    // Track diagnostic data from mini-choices
    setState(prev => ({
      ...prev,
      playerChoices: [...prev.playerChoices, `pain_location_${choice}`],
    }));
  };

  const handleBattleAction = (actionString: string) => {
    // Format: "action:damage:flareChange:clarityChange" or special minigame results
    const parts = actionString.split(':');
    const action = parts[0];
    
    let newFlare = state.flare;
    let newClarity = state.clarity;
    let newEnemyHealth = state.enemyHealth;

    if (action.startsWith('ENEMY_')) {
      // Enemy attack
      const flareIncrease = parseInt(parts[1]) || 0;
      const clarityChange = parseInt(parts[2]) || 0;
      
      newFlare = Math.min(100, Math.max(0, state.flare + flareIncrease));
      newClarity = Math.min(100, Math.max(0, state.clarity + clarityChange));
      
      console.log('⚔️ Enemy attack:', action, `+${flareIncrease} Flare, ${clarityChange} Clarity`);
    } else if (action.startsWith('MINI_')) {
      // Mini-decision
      const flareIncrease = parseInt(parts[1]) || 0;
      const clarityChange = parseInt(parts[2]) || 0;
      
      newFlare = Math.min(100, Math.max(0, state.flare + flareIncrease));
      newClarity = Math.min(100, Math.max(0, state.clarity + clarityChange));
      
      console.log('💭 Mini-decision:', action, `+${flareIncrease} Flare, ${clarityChange} Clarity`);
    } else if (action.startsWith('BREATHING_')) {
      // Breathing minigame result
      const flareChange = parseInt(parts[1]) || 0;
      const clarityChange = parseInt(parts[2]) || 0;
      
      newFlare = Math.min(100, Math.max(0, state.flare + flareChange));
      newClarity = Math.min(100, Math.max(0, state.clarity + clarityChange));
      
      console.log('🌬️ Breathing minigame:', action, `${flareChange} Flare, ${clarityChange} Clarity`);
    } else if (action.startsWith('PAIN_MAPPING')) {
      // Pain mapping minigame
      const flareChange = parseInt(parts[1]) || 0;
      const clarityChange = parseInt(parts[2]) || 0;
      const regions = parts[3] || '';
      
      newFlare = Math.min(100, Math.max(0, state.flare + flareChange));
      newClarity = Math.min(100, Math.max(0, state.clarity + clarityChange));
      
      console.log('🗺️ Pain mapping:', regions, `${flareChange} Flare, ${clarityChange} Clarity`);
    } else if (action.startsWith('FLARE_STORM')) {
      // Flare storm minigame
      const flareChange = parseInt(parts[1]) || 0;
      const clarityChange = parseInt(parts[2]) || 0;
      
      newFlare = Math.min(100, Math.max(0, state.flare + flareChange));
      newClarity = Math.min(100, Math.max(0, state.clarity + clarityChange));
      
      console.log('🔥 Flare storm:', action, `${flareChange} Flare, ${clarityChange} Clarity`);
    } else if (action.startsWith('MEMORY_')) {
      // Memory fragment minigame
      const flareChange = parseInt(parts[1]) || 0;
      const clarityChange = parseInt(parts[2]) || 0;
      
      newFlare = Math.min(100, Math.max(0, state.flare + flareChange));
      newClarity = Math.min(100, Math.max(0, state.clarity + clarityChange));
      
      console.log('🧠 Memory fragment:', action, `${flareChange} Flare, ${clarityChange} Clarity`);
    } else if (action.startsWith('REASSEMBLY_')) {
      // Reassembly puzzle
      const flareChange = parseInt(parts[1]) || 0;
      const clarityChange = parseInt(parts[2]) || 0;
      
      newFlare = Math.min(100, Math.max(0, state.flare + flareChange));
      newClarity = Math.min(100, Math.max(0, state.clarity + clarityChange));
      
      console.log('🧩 Reassembly:', action, `${flareChange} Flare, ${clarityChange} Clarity`);
    } else if (action.startsWith('AFFIRMATION_')) {
      // Affirmation sequence
      const flareChange = parseInt(parts[1]) || 0;
      const clarityChange = parseInt(parts[2]) || 0;
      
      newFlare = Math.min(100, Math.max(0, state.flare + flareChange));
      newClarity = Math.min(100, Math.max(0, state.clarity + clarityChange));
      
      console.log('✨ Affirmation:', action, `${flareChange} Flare, ${clarityChange} Clarity`);
    } else {
      // Player action
      const damage = parseInt(parts[1]) || 0;
      const flareChange = parseInt(parts[2]) || 0;
      const clarityChange = parseInt(parts[3]) || 0;
      
      newEnemyHealth = Math.max(0, state.enemyHealth - damage);
      newFlare = Math.min(100, Math.max(0, state.flare + flareChange));
      newClarity = Math.min(100, Math.max(0, state.clarity + clarityChange));
      
      console.log('🎮 Player action:', action, `${damage} dmg, ${flareChange} Flare, ${clarityChange} Clarity`);
      
      // Track player choice
      setState(prev => ({
        ...prev,
        playerChoices: [...prev.playerChoices, action],
      }));
    }

    const newCombatTurns = state.combatTurns + 1;

    setState(prev => ({
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

  const [reportText, setReportText] = useState<string | null>(null);
  const [reportKind, setReportKind] = useState<'physical' | 'emotional' | 'pattern' | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportPhysician, setReportPhysician] = useState<ReportJSON | null>(null);
  const [reportHome, setReportHome] = useState<ReportJSON | null>(null);



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
              setState(prev => ({
                ...prev,
                aiResponses: [
                  ...prev.aiResponses,
                  { sceneId: 'tutorial_intro', userInput, aiResponse }
                ]
              }));
              advancePhase('transition_to_combat');
            }}
          />
        );

      case 'transition_to_combat':
        return (
          <VNScene
            backgroundImage={VN_BACKGROUND}
            characterName="Narration"
            text="A shadow rises from the reflection. It moves as you move, clutching at its abdomen with mirrored pain. You realize the world is reacting to you. The Ache Beneath stands before you. The fight begins."
            onContinue={() => {
              setState(prev => ({ ...prev, combatTurns: 0 }));
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
              combatActions: state.playerChoices.filter(c => 
                ['Soothe', 'Observe', 'Probe', 'Resist'].includes(c)
              ),
              flare: state.flare,
              clarity: state.clarity,
              turnCount: state.combatTurns
            }}
            onAdvance={(userInput, aiResponse) => {
              setState(prev => ({
                ...prev,
                aiResponses: [
                  ...prev.aiResponses,
                  { sceneId: 'mid_battle_vn', userInput, aiResponse }
                ],
                combatTurns: 0,
                enemyHealth: 1
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
            <div className="relative min-h-screen">
              {/* The end card */}
              <PostCombatScene
                onContinue={() => advancePhase('game_end')}
                reportPhysician={reportPhysician}
                reportHome={reportHome}
                requestReport={handleGenerateReport}
                reportLoading={reportLoading}
                reportError={reportError}
              />



              {/* Your controls overlay ON TOP of the card
              <div className="absolute inset-0 z-[999] pointer-events-none flex items-end justify-center p-6">
                <div className="pointer-events-auto flex flex-wrap gap-3
                                rounded-xl border border-white/15 bg-black/50 backdrop-blur px-4 py-3">
                  <button
                    disabled={reportLoading}
                    onClick={() => handleGenerateReport('physical')}
                    className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white"
                  >
                    {reportLoading && reportKind === 'physical' ? 'Generating…' : 'Generate Physical'}
                  </button>
                  <button
                    disabled={reportLoading}
                    onClick={() => handleGenerateReport('emotional')}
                    className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white"
                  >
                    {reportLoading && reportKind === 'emotional' ? 'Generating…' : 'Generate Emotional'}
                  </button>
                  <button
                    disabled={reportLoading}
                    onClick={() => handleGenerateReport('pattern')}
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white"
                  >
                    {reportLoading && reportKind === 'pattern' ? 'Generating…' : 'Generate Pattern'}
                  </button>
                </div>
              </div> */}

              {/* Optional: show the generated report as a centered top modal
              {reportText && (
                <div className="absolute inset-0 z-[1000] flex items-center justify-center p-6">
                  <div className="max-w-lg w-full rounded-2xl border border-white/15
                                  bg-[#1b1425]/90 backdrop-blur p-6 text-white shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold">
                        {reportKind === 'physical'  && 'Doctor Scroll Fragment — Physical Chronicle'}
                        {reportKind === 'emotional' && 'Doctor Scroll Fragment — Emotional Chronicle'}
                        {reportKind === 'pattern'   && 'Doctor Scroll Fragment — Pattern Chronicle'}
                      </h3>
                      <div className="text-white/60 text-sm">DIAGNOSTIC FRAGMENT</div>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-white/90">{reportText}</p>
                    <div className="mt-4 flex gap-2">
                      <button className="px-3 py-2 rounded bg-white/10 hover:bg-white/20"
                              onClick={() => setReportText(null)}>
                        Generate different
                      </button>
                      <button className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500"
                              onClick={() => advancePhase('game_end')}>
                        Continue Journey
                      </button>
                    </div>
                  </div>
                </div>
              )} */}
            </div>
          );

      case 'game_end':
        return (
          <motion.div
            className="min-h-screen bg-gradient-to-b from-[#1a1625] to-[#0f0a1a] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center px-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-white text-4xl mb-6">To Be Continued...</h1>
                <p className="text-white/70 text-lg mb-8 font-serif max-w-md mx-auto">
                  The path to the Lumen Archives awaits. But that is a journey for another day.
                </p>
                <button
                  onClick={() => onComplete({
                    choices: state.playerChoices,
                    finalState: state
                  })}
                  className="px-8 py-3 bg-[#c9a0dc] hover:bg-[#b88fcc] text-white rounded-xl transition-colors"
                >
                  Return to Start
                </button>
              </motion.div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const getPhaseNumber = (): number => {
    const phaseMap: Record<Phase, number> = {
      awakening: 0,
      archivist_intro: 1,
      first_question: 2,
      basin_response: 3,
      transition_to_combat: 4,
      combat_phase_1: 5,
      mid_battle_vn: 6,
      healers_question: 7,
      combat_phase_2: 8,
      victory_vn: 9,
      power_reveal: 10,
      post_combat: 11,
      game_end: 12,
      archivist_final: 11,
      post_combat: 12,
      game_end: 13,
    };
    return phaseMap[state.phase] || 0;
  };

  const isCombatPhase = state.phase === 'combat_phase_1' || state.phase === 'combat_phase_2';
  
  // Determine which music track to play
  const currentTrack = isCombatPhase ? 'combat' : 'vn';

  function buildConversationHistory(aiResponses: {
    sceneId: string; userInput: string; aiResponse: string;
  }[]) {
    return aiResponses.flatMap(r => ([
      { role: 'user' as const,      content: r.userInput },
      { role: 'assistant' as const, content: r.aiResponse },
    ]));
  }

  async function handleGenerateReport(audience: 'physician' | 'home' = 'physician') {
    console.log('🧪 Generating report for audience:', audience);
    setReportLoading(true);
    setReportError(null);
    setReportKind(null); // optional: you can keep/remove this now

    try {
      // Pick a title that matches the audience (the backend also sets title, this just aligns UI)
      const reportType = audience === 'home'
        ? 'Wayside Comforts — Home Support Summary'
        : 'Initial Diagnostic Summary';


      const history: Msg[] = buildConversationHistory(state.aiResponses);

      const combat: CombatData = {
        turnCount: state.combatTurns,
        combatActions: state.playerChoices,
      };

      const resp = await generateReport(
        {
          reportType,
          region: 'Ontario',
          conversationHistory: history,
          combatData: combat,
          audience, // << important
        },
        true // debug
      );

      if (resp.debug) {
        console.groupCollapsed('🧪 Report Debug');
        console.log('Model:', resp.debug.model);
        console.log('Usage:', resp.debug.usage);
        console.log('Timings:', resp.debug.timings);
        console.log('Used conversation history:', resp.debug.used.conversationHistory);
        console.log('Used combat data:', resp.debug.used.combatData);
        console.log('Snowflake evidence count:', resp.debug.used.evidenceCount, resp.debug.used.evidenceSample);
        console.log('Local resources count:', resp.debug.used.resourcesCount, resp.debug.used.resourcesSample);
        console.log('Final prompt:', resp.debug.prompt);
        console.log('Raw model text:', resp.debug.rawModelText);
        console.groupEnd();
      }

      if (audience === 'physician') {
        setReportPhysician(resp.report);
      } else {
        setReportHome(resp.report);
      }
      setReportText(null);
    } catch (e: any) {
      console.error(e);
      setReportError(e?.message ?? 'Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  }


  // async function requestReport(audience: 'physician' | 'home' = 'physician') {
  //   console.log('🧪 Generating report for audience:', audience);
  //   setReportLoading(true);
  //   setReportError(null);
  //   try {
  //     const history: Msg[] = buildConversationHistory(state.aiResponses);

  //     const combat: CombatData = {
  //       turnCount: state.combatTurns,
  //       combatActions: state.playerChoices,
  //     };

  //     const reportType =
  //       audience === 'physician' ? 'Initial Diagnostic Summary' : 'Home Self-Care Summary';

  //     const resp = await generateReport(
  //       {
  //         reportType,
  //         region: 'Ontario',
  //         conversationHistory: history,
  //         combatData: combat,
  //         audience, // <<< important
  //       },
  //       true
  //     );

  //     if (resp.debug) {
  //       console.groupCollapsed('🧪 Report Debug');
  //       console.log('Model:', resp.debug.model);
  //       console.log('Usage:', resp.debug.usage);
  //       console.log('Timings:', resp.debug.timings);
  //       console.log('Used conversation history:', resp.debug.used.conversationHistory);
  //       console.log('Used combat data:', resp.debug.used.combatData);
  //       console.log('Evidence sample:', resp.debug.used.evidenceSample);
  //       console.log('Resources sample:', resp.debug.used.resourcesSample);
  //       console.log('Final prompt:', resp.debug.prompt);
  //       console.groupEnd();
  //     }

  //     setReportJson(resp.report);
  //     setReportText(null);
  //   } catch (e: any) {
  //     console.error(e);
  //     setReportError(e?.message ?? 'Failed to generate report');
  //   } finally {
  //     setReportLoading(false);
  //   }
  // }



  return (
    <div>
      {/* Howler.js Audio Manager - auto-detects user interaction */}
      <HowlerAudioManager 
        track={currentTrack}
        volume={0.4}
        enabled={musicEnabled}
      />
      
      {/* Music toggle */}
      <MusicToggle onToggle={setMusicEnabled} />

      {/* Phase content */}
      {renderPhase()}

      {/* status toasts */}
      {/* {reportLoading && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000]
                        rounded bg-black/70 text-white px-4 py-2">
          Generating your report…
        </div>
      )}
      {reportError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000]
                        rounded bg-red-600 text-white px-4 py-2">
          {reportError}
        </div>
      )} */}

      {/* structured report overlay */}
      {/* {reportJson && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6">
          <div id="report-root" className="max-w-3xl w-full rounded-2xl border border-white/15
                          bg-white text-black shadow-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">{reportJson.title}</h3>
              <button
                className="text-sm text-gray-600 hover:text-gray-900"
                onClick={() => setReportJson(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                className="px-3 py-2 rounded bg-black text-white"
                onClick={() => downloadReportAsPDF(reportJson)}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )} */}

    </div>
  );
}
