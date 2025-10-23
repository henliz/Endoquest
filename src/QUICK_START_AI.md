# EndoQuest AI System - Quick Start Guide

## Setup in 5 Minutes

### Step 1: Install Backend Dependencies (1 min)
```bash
cd server
npm install
```

### Step 2: Add OpenAI API Key (1 min)
Create `/server/.env`:
```
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Get your API key: https://platform.openai.com/api-keys

### Step 3: Start Backend (1 min)
```bash
npm run dev
```

You should see: `🚀 EndoQuest backend running on http://localhost:3001`

### Step 4: Test Backend (1 min)
Open browser: http://localhost:3001/health

Should see: `{"status":"ok","message":"EndoQuest backend is running"}`

### Step 5: Add AI Component to Tutorial (1 min)

In `/components/TutorialEncounter.tsx`:

```tsx
// Add import at top
import { AITextInputScene } from './AITextInputScene';

// Update state interface
interface TutorialState {
  phase: Phase;
  flare: number;
  clarity: number;
  turnCount: number;
  playerChoices: string[];
  aiResponses: Array<{        // ← ADD THIS
    sceneId: string;
    userInput: string;
    aiResponse: string;
  }>;
  combatTurns: number;
  enemyHealth: number;
}

// Initialize in useState
const [state, setState] = useState<TutorialState>({
  phase: 'awakening',
  flare: 70,
  clarity: 50,
  turnCount: 0,
  playerChoices: [],
  aiResponses: [],           // ← ADD THIS
  combatTurns: 0,
  enemyHealth: 100,
});

// Replace first_question case
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

// REMOVE case 'basin_response' - no longer needed!
```

### Step 6: Test It! (30 sec)

1. Run frontend: `npm run dev`
2. Start game and reach the Archivist
3. Type: "My pain started when I was 15"
4. Click Send
5. Watch AI respond with personalized dialogue
6. Click Continue
7. Combat begins!

**That's it! You now have AI-powered typing in your game.**

---

## What You Just Built

✅ Players can TYPE their pain story instead of clicking choices
✅ AI generates personalized responses that incorporate their words
✅ Story still progresses through mandatory plot beats
✅ All responses are stored for report generation later

---

## Next Steps

### Add More AI Scenes

**Mid-Battle VN:**
```tsx
case 'mid_battle_vn':
  return (
    <AITextInputScene
      backgroundImage={VN_BACKGROUND}
      characterImages={ARCHIVIST_PORTRAITS}
      characterName="The Archivist"
      promptText="Tell me — what did the healers say, when you first spoke of this pain?"
      placeholder="Describe your experience with doctors..."
      sceneId="mid_battle_vn"
      playerData={{
        combatActions: state.playerChoices,
        flare: state.flare,
        clarity: state.clarity
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
```

### Generate Reports

```tsx
const handleGenerateReport = async (reportType: 'physical' | 'emotional' | 'pattern') => {
  const response = await fetch('http://localhost:3001/api/ai/generate-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerId: 'player-123',
      reportType,
      conversationHistory: state.aiResponses.flatMap(r => [
        { role: 'user', content: r.userInput },
        { role: 'assistant', content: r.aiResponse }
      ]),
      combatData: {
        actionsChosen: state.playerChoices,
        finalStats: { flare: state.flare, clarity: state.clarity }
      }
    })
  });
  
  const data = await response.json();
  console.log('Generated report:', data.report);
  // Display data.report to player
};
```

---

## Troubleshooting

### "Network error" or can't reach backend
- Check backend is running: `cd server && npm run dev`
- Check URL in browser: http://localhost:3001/health
- Check CORS settings in `/server/index.js`

### "Invalid API key"
- Verify `.env` file exists in `/server/` directory
- Check key starts with `sk-proj-`
- Restart backend after adding key

### AI response is weird/doesn't make sense
- Check `/server/prompts/scene-structures.js` for scene config
- Adjust `aiInstructions` to be more specific
- Lower temperature in `/server/routes/ai.js` (0.7 → 0.6)

### Response is too long/short
- Adjust `max_tokens` in `/server/routes/ai.js`
- Update word count requirement in scene-structures.js
- Add length reminder to `aiInstructions`

### Want to test without typing every time
- Add a "Use default response" button in TextInputVNScene
- Or temporarily use VNChoiceScene for testing

---

## Cost Estimate

Using `gpt-4o-mini`:
- Tutorial intro: $0.0001
- Mid-battle VN: $0.0001
- Campfire chat (15 messages): $0.0015
- Physical Chronicle: $0.001
- **Total per playthrough: ~$0.01**

For 1000 players: ~$10

---

## Files You Need

### Frontend
- ✅ `/components/TextInputVNScene.tsx` (created)
- ✅ `/components/AITextInputScene.tsx` (created)
- 🔧 `/components/TutorialEncounter.tsx` (modify)

### Backend
- ✅ `/server/prompts/scene-structures.js` (created)
- ✅ `/server/prompts/archivist-personality.js` (created)
- ✅ `/server/routes/ai.js` (created)
- ✅ `/server/index.js` (already set up)
- 🔧 `/server/.env` (add your API key)

---

## Documentation

- **`/AI_SYSTEM_SUMMARY.md`** - Complete overview
- **`/TUTORIAL_AI_UPGRADE.md`** - Detailed integration guide
- **`/AI_FLOW_DIAGRAM.md`** - Visual flow diagrams
- **`/INTEGRATION_EXAMPLE.md`** - Code examples
- **`/server/API_REFERENCE.md`** - API docs

---

## Support Commands

```bash
# Start backend
cd server && npm run dev

# Test health endpoint
curl http://localhost:3001/health

# Test scene response
curl -X POST http://localhost:3001/api/ai/scene-response \
  -H "Content-Type: application/json" \
  -d '{
    "sceneId": "tutorial_intro",
    "userInput": "My pain started at 15",
    "playerData": {}
  }'

# Check backend logs
# Watch the terminal where you ran `npm run dev`
```

---

**You're ready! Start typing your story into the Foglands. 🌫️✨**
