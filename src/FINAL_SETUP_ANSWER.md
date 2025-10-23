# YES! Just Plug in the API Key (+ 2 more tiny steps)

## What I Just Did

✅ Updated `TutorialEncounter.tsx` to use `AITextInputScene`
✅ Replaced 2 click-based scenes with text input scenes
✅ Added `aiResponses` array to state to store player's typed responses
✅ Removed obsolete phases (`basin_response`, `healers_question`)

## What You Need To Do

### 1. Install Dependencies (one-time, 30 seconds)
```bash
cd server
npm install
```

This installs: express, cors, dotenv, openai, nodemon

### 2. Add Your API Key (one-time, 30 seconds)

Create `/server/.env`:
```
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Get your API key: https://platform.openai.com/api-keys

### 3. Start Backend (every time you develop)
```bash
cd server
npm run dev
```

Should see:
```
🚀 EndoQuest backend running on http://localhost:3001
```

### 4. Run Your Game (like normal)
```bash
npm run dev
```

## What Changed in the Game

### Before (Click-based):
```
Archivist: "When did your pain begin?"
[Click: "When I first bled"]
→ Pre-written response
→ Advance to combat
```

### After (AI Text Input):
```
Archivist: "When did your pain begin?"
[Type: "My pain started at 15 during my first period"]
[Submit]
→ AI generates personalized response incorporating your words
→ Advance to combat
```

## Two Scenes Now Use AI:

1. **Tutorial Intro** - "When did your pain begin?"
2. **Mid-Battle VN** - "What did the healers say?"

Both store the player's typed responses in `state.aiResponses[]` for later use in report generation.

## File Changes Made

**Modified:**
- ✏️ `/components/TutorialEncounter.tsx` (added AI integration)

**Already Created (no changes needed):**
- ✅ `/components/AITextInputScene.tsx`
- ✅ `/components/TextInputVNScene.tsx`
- ✅ `/server/index.js`
- ✅ `/server/routes/ai.js`
- ✅ `/server/prompts/scene-structures.js`
- ✅ `/server/prompts/archivist-personality.js`
- ✅ `/server/package.json`

**Need to Create (by you):**
- 📝 `/server/.env` (with your API key)

## Cost

- **gpt-4o-mini** pricing: $0.150 per 1M input tokens, $0.600 per 1M output tokens
- **Per response:** ~150 tokens = ~$0.0001
- **Per playthrough:** ~$0.01
- **1000 players:** ~$10

## Testing It Works

1. Start backend: `cd server && npm run dev`
2. Visit: http://localhost:3001/health
3. Should see: `{"status":"ok","message":"EndoQuest backend is running"}`
4. Start game: `npm run dev`
5. Play until Archivist scene
6. Type your response
7. Watch AI generate personalized dialogue!

## Verify AI Responses Are Stored

Open browser console during gameplay:
```javascript
// After typing a response, check it was saved:
console.log(state.aiResponses);

// Should see:
[
  {
    sceneId: 'tutorial_intro',
    userInput: 'My pain started at 15...',
    aiResponse: 'Fifteen — so young to carry such weight...'
  }
]
```

## Fallback If Backend Fails

If the backend is down or API key is invalid, the AI component will show a fallback response:
```
"The basin ripples with your words. The world is listening."
```

The game still advances normally.

## So Yes, Just 3 Steps:

1. ✅ `cd server && npm install`
2. ✅ Create `/server/.env` with API key
3. ✅ `npm run dev` in `/server` directory

**That's literally it. Everything else is done.** 🎉

---

See `/START_HERE.md` for a simpler version of these instructions.
See `/QUICK_START_AI.md` for more detailed setup.
See `/AI_SYSTEM_SUMMARY.md` for the full architecture overview.
