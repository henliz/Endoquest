# Tutorial Encounter AI Upgrade Guide

## Quick Start: 3 Steps to Add AI Text Input

### Step 1: Update State Interface

Add `aiResponses` to track player's typed responses:

```tsx
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
```

Initialize it:
```tsx
const [state, setState] = useState<TutorialState>({
  phase: 'awakening',
  flare: 70,
  clarity: 50,
  turnCount: 0,
  playerChoices: [],
  aiResponses: [], // ← Add this
  combatTurns: 0,
  enemyHealth: 100,
});
```

### Step 2: Import AITextInputScene

```tsx
import { AITextInputScene } from './AITextInputScene';
```

### Step 3: Replace VNChoiceScene with AITextInputScene

#### Example 1: Tutorial Intro (Pain Onset Question)

**OLD:**
```tsx
case 'first_question':
  return (
    <VNChoiceScene
      backgroundImage={VN_BACKGROUND}
      characterImages={ARCHIVIST_PORTRAITS}
      characterName="The Archivist"
      text="When did it first answer your body's call?"
      choices={[
        { id: 'early_onset', text: "When I first bled — it was never mild.", emotion: 'Honest' },
        { id: 'progressive', text: "It crept in later — a curse that grew with the years.", emotion: 'Reflective' },
        { id: 'cyclical', text: "It only visits me when the moon calls, then leaves.", emotion: 'Observant' },
        { id: 'chronic', text: "I can't even tell anymore — it's constant.", emotion: 'Weary' },
      ]}
      onChoiceSelect={handleChoice}
    />
  );

case 'basin_response':
  return (
    <VNScene
      backgroundImage={VN_BACKGROUND}
      characterImages={ARCHIVIST_PORTRAITS}
      characterName="The Archivist"
      text="The basin ripples beneath you, reflecting your words back in waves of deep violet and crimson. The patterns shift — steady pulses that match your heartbeat. The world is listening."
      onContinue={() => advancePhase('transition_to_combat')}
    />
  );
```

**NEW:**
```tsx
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
        // Store the conversation
        setState(prev => ({
          ...prev,
          aiResponses: [
            ...prev.aiResponses,
            { sceneId: 'tutorial_intro', userInput, aiResponse }
          ]
        }));
        // Skip basin_response - AI already generated it
        advancePhase('transition_to_combat');
      }}
    />
  );

// DELETE case 'basin_response' - no longer needed!
```

#### Example 2: Mid-Battle VN (Healers Question)

**OLD:**
```tsx
case 'mid_battle_vn':
  return (
    <VNScene
      backgroundImage={VN_BACKGROUND}
      characterImages={ARCHIVIST_PORTRAITS}
      characterName="The Archivist"
      text="The shadow falters — it clutches itself, gasping in sync with you. You've seen this pattern before, haven't you? Tell me — what did the healers say, when you first spoke of this pain?"
      onContinue={() => advancePhase('healers_question')}
    />
  );

case 'healers_question':
  return (
    <VNChoiceScene
      backgroundImage={VN_BACKGROUND}
      characterImages={ARCHIVIST_PORTRAITS}
      characterName="The Archivist"
      text="What did the healers say?"
      choices={[
        { id: 'dismissed', text: "They told me it was normal. That I was overreacting.", emotion: 'Bitter' },
        { id: 'validated', text: "They listened. They tried to help.", emotion: 'Grateful' },
        { id: 'never_asked', text: "I never told them. I thought I could handle it alone.", emotion: 'Ashamed' }
      ]}
      onChoiceSelect={(choiceId) => {
        setState(prev => ({ ...prev, playerChoices: [...prev.playerChoices, `healers_${choiceId}`] }));
        advancePhase('combat_phase_2');
      }}
    />
  );
```

**NEW:**
```tsx
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
          ]
        }));
        advancePhase('combat_phase_2');
      }}
    />
  );

// DELETE case 'healers_question' - no longer needed!
```

### Step 4: Update Phase Types

Remove the phases you deleted:

**OLD:**
```tsx
type Phase = 
  | 'awakening'
  | 'archivist_intro'
  | 'first_question'
  | 'basin_response'        // ← Remove
  | 'transition_to_combat'
  | 'combat_phase_1'
  | 'mid_battle_vn'
  | 'healers_question'      // ← Remove
  | 'combat_phase_2'
  | 'victory_vn'
  | 'power_reveal'
  | 'archivist_final'
  | 'post_combat'
  | 'game_end';
```

**NEW:**
```tsx
type Phase = 
  | 'awakening'
  | 'archivist_intro'
  | 'first_question'        // Now uses AI
  | 'transition_to_combat'
  | 'combat_phase_1'
  | 'mid_battle_vn'         // Now uses AI
  | 'combat_phase_2'
  | 'victory_vn'
  | 'power_reveal'
  | 'archivist_final'
  | 'post_combat'
  | 'game_end';
```

### Step 5: Pass AI Responses to Reports

When generating reports, pass the typed responses:

```tsx
const handleGenerateReport = async (reportType: 'physical' | 'emotional' | 'pattern') => {
  const response = await fetch('http://localhost:3001/api/ai/generate-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerId: 'player-123',
      reportType,
      conversationHistory: state.aiResponses.map(r => [
        { role: 'user', content: r.userInput },
        { role: 'assistant', content: r.aiResponse }
      ]).flat(),
      combatData: {
        actionsChosen: state.playerChoices,
        finalStats: { flare: state.flare, clarity: state.clarity }
      }
    })
  });
  
  const data = await response.json();
  // Display data.report
};
```

## Complete Modified renderPhase() Function

```tsx
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
          text="You carry the Ache, traveler — yet you've no name for it."
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
              ]
            }));
            advancePhase('combat_phase_2');
          }}
        />
      );

    case 'combat_phase_2':
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

    // ... rest of phases
  }
};
```

## Testing the Changes

1. **Start the backend:**
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Verify OpenAI API key in `/server/.env`:**
   ```
   OPENAI_API_KEY=sk-...
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

3. **Run the frontend:**
   ```bash
   npm run dev
   ```

4. **Test flow:**
   - Start game
   - Reach "first_question" scene
   - Type: "My pain started when I was 15, during my first period. It was so bad I couldn't go to school."
   - Click submit
   - Verify AI response appears
   - Verify response incorporates your words
   - Click continue
   - Verify it advances to transition_to_combat

5. **Check state in DevTools:**
   ```tsx
   console.log('AI Responses:', state.aiResponses);
   // Should show:
   // [{ sceneId: 'tutorial_intro', userInput: '...', aiResponse: '...' }]
   ```

## Fallback for No Backend

Add offline mode that falls back to VNChoiceScene:

```tsx
const USE_AI = true; // Set to false to use click-based choices

case 'first_question':
  if (USE_AI) {
    return <AITextInputScene {...aiProps} />;
  } else {
    return <VNChoiceScene {...clickProps} />;
  }
```

## Benefits Summary

✅ **Natural language** - Patients describe in own words
✅ **Personalized** - AI weaves their input into story
✅ **Plot guaranteed** - Mandatory beats ensure flow
✅ **Rich reports** - Better data for chronicles
✅ **Replayable** - Slightly different each time
✅ **Emotionally engaging** - Typing > clicking

## Performance Notes

- AI response time: 1-3 seconds
- Cost per response: ~$0.0001 (gpt-4o-mini)
- Full playthrough: ~$0.01
- Falls back gracefully if API fails
- Responses are cached per scene (future feature)
