# 🚀 Start AI System - 3 Steps

## ✅ What's Already Done

All code is written and ready! I just updated `TutorialEncounter.tsx` with the AI components.

---

## 🔧 3 Steps to Activate

### Step 1: Install Server (30 seconds)
```bash
cd server
npm install
```

### Step 2: Add API Key (30 seconds)
Create file: `/server/.env`

```
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Get your API key: https://platform.openai.com/api-keys

### Step 3: Start Backend (10 seconds)
```bash
npm run dev
```

Should see: `🚀 EndoQuest backend running on http://localhost:3001`

---

## ✨ That's It!

Now run your game:
```bash
# In root directory
npm run dev
```

**The tutorial now uses AI text input!**

Players can type their own responses at:
- First question: "When did your pain begin?"
- Mid-battle: "What did the healers say?"

---

## 🧪 Test It

1. Start game
2. Reach the Archivist scene
3. Type: "My pain started when I was 15"
4. Watch the AI respond with personalized dialogue
5. Continue playing!

---

## 📊 Check State in Console

Open browser console and type:
```javascript
// See all AI responses stored
console.log(window.__TUTORIAL_STATE__?.aiResponses);
```

---

## 💰 Cost: ~$0.01 per playthrough

Using `gpt-4o-mini` (very cheap model)

---

## ⚠️ Troubleshooting

### Backend won't start?
```bash
cd server
npm install
npm run dev
```

### "Invalid API key"?
- Check `.env` file is in `/server/` directory
- Check key starts with `sk-proj-`
- Restart backend after adding key

### Frontend can't reach backend?
- Check backend is running: http://localhost:3001/health
- Should see: `{"status":"ok"}`

### AI response is weird?
- This is normal during testing
- Adjust prompts in `/server/prompts/scene-structures.js`

---

## 📚 More Info

- **Quick Start Guide:** `/QUICK_START_AI.md`
- **Complete Overview:** `/AI_SYSTEM_SUMMARY.md`
- **Integration Guide:** `/TUTORIAL_AI_UPGRADE.md`
- **API Docs:** `/server/API_REFERENCE.md`

---

## 🎮 Want to Disable AI Temporarily?

In `/components/TutorialEncounter.tsx`, add at the top:

```tsx
const USE_AI = false; // Set to true to enable AI
```

Then wrap AI scenes:
```tsx
case 'first_question':
  if (USE_AI) {
    return <AITextInputScene {...} />;
  } else {
    return <VNChoiceScene {...} />; // Original click-based version
  }
```

(But you'd need to restore the old VNChoiceScene code from git history)

---

**You're ready! Just `cd server && npm install && npm run dev` and add your API key. That's literally it! 🎉**
