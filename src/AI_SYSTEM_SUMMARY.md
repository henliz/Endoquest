# EndoQuest AI System - Complete Summary

## What You Now Have

A **plot-constrained AI dialogue system** that lets players type their own responses while ensuring the story still progresses through mandatory narrative beats.

## Key Components

### 1. Frontend Components
- **`TextInputVNScene.tsx`** - VN-style dialogue box with textarea input
- **`AITextInputScene.tsx`** - Wrapper that handles AI API calls and response flow
- **`VNScene.tsx`** - Standard VN dialogue (for AI responses)

### 2. Backend System
- **`scene-structures.js`** - Defines mandatory plot beats for each scene
- **`archivist-personality.js`** - Defines the Archivist's character voice
- **`ai.js` routes** - API endpoints for scene responses and reports

### 3. Flow Architecture

```
Player types response
         ↓
AITextInputScene calls /api/ai/scene-response
         ↓
Backend loads scene config (mandatory beats + AI instructions)
         ↓
OpenAI generates response that:
  - Incorporates player's words
  - Hits mandatory plot beat
  - Stays 40-80 words
  - Signals readiness to advance
         ↓
Response displayed in VNScene
         ↓
Player clicks continue
         ↓
Game advances to next phase
```

## The Magic: Plot Beats

Each scene has **mandatory beats** the AI MUST hit:

### Example: Tutorial Intro Scene
**Player types:** "My pain started at 14 during my first period."

**AI must:**
1. ✅ Acknowledge their pain onset story
2. ✅ Reflect their words poetically
3. ✅ Use basin/reflection metaphor
4. ✅ Signal transition ("The world is listening")
5. ✅ NOT ask follow-up questions

**AI generates:** 
> "Fourteen — so young to carry such weight. The basin ripples beneath you, reflecting your words back in waves of deep violet. You've named the beginning. The world is listening."

**Result:** Personalized + On-rails = Perfect

## Scenes That Use Text Input

### 1. Tutorial Intro (`tutorial_intro`)
- **When:** First encounter with Archivist
- **Question:** "When did your pain begin?"
- **Beat:** Acknowledge → Reflect → Transition to combat
- **Length:** 40-80 words

### 2. Mid-Battle VN (`mid_battle_vn`)
- **When:** Halfway through combat
- **Question:** "What did the healers say?"
- **Beat:** Reference combat → Validate medical experience → Return to battle
- **Length:** 50-80 words
- **Context:** Receives combat actions, Flare, Clarity

### 3. Campfire Conversation (`campfire_conversation`)
- **When:** Post-combat at campfire
- **Type:** Extended back-and-forth (15-20 messages)
- **Beat:** Opening → Exploration → Closure
- **Length:** 20-80 words per response
- **Special:** ONLY scene with true chat interaction

### 4. Post-Combat Sequence (`post_combat_dialogue`)
- **When:** After victory, explaining scroll/Ache menu
- **Type:** 6-box VN sequence (AI-generated)
- **Beat:** Congratulate → Explain scroll → Archives → Ache transformation → Show menu → Explain knowledge types
- **Length:** 50-100 words per box

## How to Integrate

### Quick Replace Pattern

**OLD (Click-based):**
```tsx
<VNChoiceScene
  text="When did the pain begin?"
  choices={[...]}
  onChoiceSelect={handleChoice}
/>
```

**NEW (AI Text Input):**
```tsx
<AITextInputScene
  promptText="When did the pain begin?"
  placeholder="Describe when your pain started..."
  sceneId="tutorial_intro"
  onAdvance={(userInput, aiResponse) => {
    // Store the response
    setState(prev => ({
      ...prev,
      aiResponses: [...prev.aiResponses, { sceneId, userInput, aiResponse }]
    }));
    // Advance to next phase
    advancePhase('next_phase');
  }}
/>
```

## Scene IDs Reference

| Scene ID | Purpose | Input Type | Advances To |
|----------|---------|------------|-------------|
| `tutorial_intro` | Pain onset question | Text input | `transition_to_combat` |
| `mid_battle_vn` | Healers/doctors question | Text input | `combat_phase_2` |
| `campfire_conversation` | Extended dialogue | Back-and-forth chat | User-initiated exit |
| `post_combat_dialogue` | Victory sequence | Pre-generated | Campfire scene |

## API Endpoints Quick Reference

### Scene Response (Most Common)
```javascript
POST http://localhost:3001/api/ai/scene-response

Body:
{
  sceneId: "tutorial_intro",
  userInput: "My pain started...",
  playerData: { flare: 45, clarity: 72 }
}

Response:
{
  response: "The basin ripples...",
  shouldAdvance: true,
  wordCount: 54
}
```

### Campfire Chat (Extended Conversation)
```javascript
POST http://localhost:3001/api/ai/campfire-chat

Body:
{
  playerId: "player-123",
  message: "The pain is mostly in my abdomen",
  conversationHistory: [...]
}

Response:
{
  response: "Lower abdomen — where so much is held...",
  conversationHistory: [...],
  metadata: {
    messageCount: 5,
    arcStage: "exploration",
    shouldPromptClosure: false
  }
}
```

### Generate Report (End of Journey)
```javascript
POST http://localhost:3001/api/ai/generate-report

Body:
{
  playerId: "player-123",
  reportType: "physical", // or "emotional" or "pattern"
  conversationHistory: [...],
  combatData: {...}
}

Response:
{
  reportType: "physical",
  reportName: "Physical Chronicle",
  report: "Your body speaks in a language of aches...",
  wordCount: 387
}
```

## Data Flow for Reports

```
Player types throughout game
         ↓
aiResponses stored in state
         ↓
[
  { sceneId: 'tutorial_intro', userInput: '...', aiResponse: '...' },
  { sceneId: 'mid_battle_vn', userInput: '...', aiResponse: '...' },
  { sceneId: 'campfire_1', userInput: '...', aiResponse: '...' },
  // ... 15-20 campfire messages
]
         ↓
Player requests Physical Chronicle
         ↓
Convert to conversation history format
         ↓
conversationHistory: [
  { role: 'user', content: 'My pain started at 15...' },
  { role: 'assistant', content: 'The basin ripples...' },
  { role: 'user', content: 'Doctors dismissed me...' },
  { role: 'assistant', content: 'The shadow trembles...' },
  // ... rest of conversation
]
         ↓
Send to /api/ai/generate-report
         ↓
AI generates 300-400 word Physical Chronicle
using specific details from player's story
         ↓
Display as readable document
```

## Configuration Files

### `/server/prompts/scene-structures.js`
Defines WHEN and HOW AI responds:
- Scene IDs and titles
- Mandatory plot beats
- AI instructions
- Output format requirements
- Player input types

### `/server/prompts/archivist-personality.js`
Defines WHO the AI is:
- Core identity and values
- Speech patterns
- Response length rules
- Hard boundaries
- Example dialogues

## Testing Checklist

### ✅ Scene Response Test
- [ ] Player can type freely in textarea
- [ ] Submit button disabled when empty
- [ ] Loading spinner shows while waiting
- [ ] AI response incorporates player's words
- [ ] Response hits mandatory plot beat
- [ ] Response length is 40-80 words
- [ ] Clicking continue advances to next phase
- [ ] userInput and aiResponse stored in state

### ✅ Campfire Chat Test
- [ ] Opening messages (1-3) welcome player
- [ ] Exploration messages (4-12) ask diagnostic questions
- [ ] Closure messages (13+) summarize and offer exit
- [ ] Each response is 20-80 words
- [ ] Max 2 questions per response
- [ ] Stays on topic (pain journey)
- [ ] Conversation ends gracefully

### ✅ Report Generation Test
- [ ] Reports include specific player quotes
- [ ] Reports are 300-400 words (3-4 paragraphs)
- [ ] Reports follow required structure
- [ ] Reports maintain Archivist's voice
- [ ] Reports contain NO medical advice

## Cost & Performance

### OpenAI API Costs (gpt-4o-mini)
- Scene response: ~$0.0001 per response
- Campfire message: ~$0.0001 per message
- Report generation: ~$0.001 per report
- **Full playthrough: ~$0.01**

### Response Times
- Scene response: 1-2 seconds
- Campfire message: 1-2 seconds
- Report generation: 2-4 seconds

### Token Usage
- Scene response: ~150 tokens
- Campfire message: ~150 tokens
- Report generation: ~700 tokens

## Environment Setup

### Required .env Variables
```
OPENAI_API_KEY=sk-proj-...
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Backend Commands
```bash
cd server
npm install
npm run dev  # Runs on port 3001
```

### Frontend Integration
```tsx
// In components, use:
const API_URL = 'http://localhost:3001';

// Or create a config file:
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001'
};
```

## Fallback Strategy

If AI fails, use fallback responses:

```tsx
catch (error) {
  console.error('AI error:', error);
  
  // Use scene-appropriate fallback
  const fallbacks = {
    'tutorial_intro': 'The basin ripples with your words. The world is listening.',
    'mid_battle_vn': 'The shadow trembles as you speak. The battle continues.',
    'campfire_conversation': 'I hear you, traveler. Tell me more.'
  };
  
  setAiResponse(fallbacks[sceneId] || 'The archives seem distant...');
  setPhase('response');
}
```

## Benefits

✅ **Patient-specific data** - Actual words, not multiple choice
✅ **Personalized narrative** - Story adapts to their input
✅ **Plot guaranteed** - Mandatory beats ensure flow
✅ **Richer reports** - AI has real patient language
✅ **Replay value** - Slightly different each time
✅ **Emotional engagement** - Typing > clicking

## Limitations

⚠️ **Requires backend** - Can't run offline (yet)
⚠️ **API cost** - ~$0.01 per playthrough
⚠️ **Response delay** - 1-3 seconds per response
⚠️ **Moderation risk** - AI might generate unexpected content (rare)
⚠️ **No caching** - Each response is regenerated (future feature)

## Next Steps

1. **Implement in TutorialEncounter** - See `/TUTORIAL_AI_UPGRADE.md`
2. **Test with real users** - Gather feedback on typing vs clicking
3. **Add response caching** - Store common responses to reduce API calls
4. **Add offline mode** - Fallback to click-based choices when backend unavailable
5. **Add conversation persistence** - Save to database for cross-session memory
6. **Add emotional analysis** - Detect distress and adjust Archivist's tone

## Documentation Files

- **`/ARCHIVIST_AI_SYSTEM.md`** - Full architecture guide
- **`/TUTORIAL_AI_UPGRADE.md`** - Step-by-step integration guide
- **`/INTEGRATION_EXAMPLE.md`** - Code examples and patterns
- **`/server/API_REFERENCE.md`** - Complete API documentation
- **`/BACKEND_SETUP.md`** - Backend setup instructions

## Support

If something isn't working:
1. Check backend is running (`npm run dev` in `/server`)
2. Verify OpenAI API key in `.env`
3. Check browser console for errors
4. Check backend console for request logs
5. Test API endpoints directly with curl/Postman
6. Review scene-structures.js for scene configuration

---

**You now have a hybrid system: the narrative flow of a visual novel with the personalization of AI conversation, constrained by mandatory plot beats to ensure story coherence. Perfect for diagnostic data collection that feels natural and engaging.**
