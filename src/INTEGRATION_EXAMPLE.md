# AI Text Input Integration Example

## Overview

This guide shows how to replace VNChoiceScene with AITextInputScene to enable typing while maintaining plot progression.

## Component Flow

### Old: Click-based VN Choice
```tsx
<VNChoiceScene
  characterName="The Archivist"
  text="When did it first answer your body's call?"
  choices={[
    { id: 'early_onset', text: "When I first bled — it was never mild.", emotion: 'Honest' },
    { id: 'progressive', text: "It crept in later — a curse that grew with the years.", emotion: 'Reflective' }
  ]}
  onChoiceSelect={handleChoice}
/>
```

### New: Text Input with AI Response
```tsx
<AITextInputScene
  backgroundImage={VN_BACKGROUND}
  characterImages={ARCHIVIST_PORTRAITS}
  characterName="The Archivist"
  promptText="Tell me — when did it first answer your body's call?"
  placeholder="Type your response..."
  sceneId="tutorial_intro"
  onAdvance={() => advancePhase('transition_to_combat')}
/>
```

## Integration into TutorialEncounter.tsx

### Before (Click-based):
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

### After (Text Input with AI):
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
      onAdvance={() => advancePhase('transition_to_combat')}
    />
  );

// basin_response phase is now handled by AITextInputScene internally
// The AI generates a response like:
// "The basin ripples beneath you. You spoke of pain that began in your teens, 
//  relentless and unheard. The patterns shift — steady pulses that match your 
//  heartbeat. The world is listening."
```

## Mid-Battle Example

### Before (Click-based):
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

### After (Text Input with AI):
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
        combatActions: state.playerChoices.filter(c => ['Soothe', 'Observe', 'Probe', 'Resist'].includes(c)),
        flare: state.flare,
        clarity: state.clarity,
        turnCount: state.combatTurns
      }}
      onAdvance={() => advancePhase('combat_phase_2')}
    />
  );

// healers_question phase is eliminated - AI response includes acknowledgment
// and advances directly to combat_phase_2
```

## State Management

### Storing AI Responses for Reports

Add an `aiResponses` array to state:

```tsx
interface TutorialState {
  phase: Phase;
  flare: number;
  clarity: number;
  turnCount: number;
  playerChoices: string[];
  aiResponses: Array<{ sceneId: string; userInput: string; aiResponse: string }>;
  combatTurns: number;
  enemyHealth: number;
}
```

### Modify AITextInputScene to track responses:

```tsx
<AITextInputScene
  // ... other props
  onAdvance={(userInput, aiResponse) => {
    // Store the conversation
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
```

## Backend Data Flow

```
┌─────────────────┐
│  Player types   │
│ "My pain began  │
│  at age 14..."  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ POST /api/ai/scene-response │
│ {                           │
│   sceneId: "tutorial_intro",│
│   userInput: "My pain...",  │
│   playerData: {}            │
│ }                           │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ AI checks scene-structures.js│
│ - Loads mandatory beats      │
│ - Loads AI instructions      │
│ - Incorporates user input    │
│ - Generates constrained resp │
└────────┬─────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Response:                   │
│ {                           │
│   response: "The basin      │
│     ripples beneath you...  │
│     The world is listening",│
│   shouldAdvance: true,      │
│   wordCount: 54             │
│ }                           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│ Display in      │
│ VNScene, then   │
│ advance to next │
│ phase on click  │
└─────────────────┘
```

## Scene Configuration

Each scene in `scene-structures.js` defines:

```javascript
export const TUTORIAL_INTRO_SCENE = {
  id: 'tutorial_intro',
  title: 'Meeting the Archivist',
  
  mandatoryBeats: [
    'Acknowledge the player's pain onset story',
    'Reflect their words poetically',
    'Signal transition to combat',
    'Use "The world is listening" or similar closure'
  ],
  
  aiInstructions: `
    1. Validate what they shared (no judgment)
    2. Weave their specific words into the basin/reflection metaphor
    3. Keep to 40-80 words
    4. DO NOT ask follow-up questions
    5. End with clear closure phrase
  `,
  
  outputFormat: 'Single VN dialogue box',
  
  playerInputType: {
    type: 'text_input',
    description: 'Free text about pain onset'
  }
};
```

## Testing Checklist

- [ ] Text input appears with Archivist's question
- [ ] Player can type freely (max 500 chars)
- [ ] Submit button disabled when empty
- [ ] Loading spinner shows while waiting for AI
- [ ] AI response appears in VNScene
- [ ] Response incorporates player's input
- [ ] Response hits mandatory plot beat
- [ ] Response length is appropriate (40-80 words)
- [ ] Clicking "Continue" advances to next phase
- [ ] User input and AI response are stored in state
- [ ] No console errors
- [ ] Fallback response works if API fails

## Troubleshooting

### AI response is too long
- Adjust `max_tokens` in `/server/routes/ai.js`
- Add stricter length instruction in `scene-structures.js`

### AI isn't hitting plot beats
- Make mandatory beats more explicit
- Add examples to `aiInstructions`
- Increase temperature for more creative responses (but < 0.9)

### API timeout or failure
- Check backend is running (`npm run server`)
- Verify OpenAI API key in `.env`
- Check console for CORS errors
- Ensure fallback response is displayed

### Player input not being stored
- Verify `onAdvance` callback receives both userInput and aiResponse
- Check state updates in console
- Ensure aiResponses array is initialized in state

## Complete Example: Updated TutorialEncounter

See `/components/TutorialEncounterWithAI.tsx` (to be created) for a full implementation example.

## Benefits

✅ **Natural language diagnostic data** - Patients describe symptoms in their own words
✅ **Personalized responses** - AI weaves player input into narrative
✅ **Plot progression guaranteed** - Mandatory beats ensure story flow
✅ **Replayability** - Slightly different responses each time
✅ **Richer reports** - AI has actual patient language to work with
✅ **Emotional engagement** - Typing feels more personal than clicking

## Limitations

⚠️ **Requires backend** - Must have Express server + OpenAI API running
⚠️ **API cost** - ~$0.01 per playthrough (gpt-4o-mini)
⚠️ **Response time** - 1-3 second delay per response
⚠️ **Moderation needed** - AI might generate unexpected responses (rare)
⚠️ **No offline mode** - Fallback to click-based choices if API unavailable
