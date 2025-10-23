# ✅ Correct Combat Flow

## 🎮 How It Actually Works

### Player Turn Flow:

1. **See 4 action buttons:**
   - 🔍 Observe
   - 🌊 Soothe
   - 💬 Probe
   - 💪 Resist

2. **If you click Observe, Soothe, or Resist:**
   - Action executes immediately
   - "It's super effective!" / "Not very effective..." shows
   - Tap to continue
   - Mini-decision (pain location) does NOT appear
   - Goes to enemy turn

3. **If you click Probe:**
   - **Dialogue choices appear:** "Where do you live in me? How do you ask?"
   - 4 emotional ways to ask the question:
     - 💭 "Tell me where you hide in my body."
     - 👁️ "Show me your patterns. I'm listening."
     - 🔍 "Where do you live? I need to know."
     - ✨ "Reveal yourself to me."
   - You pick one
   - Probe executes with that dialogue text
   - "It's super effective!" / "Not very effective..." shows
   - Tap to continue
   - **Mini-decision appears:** "Where do you feel it most?"
     - 🦴 Joints
     - 🔥 Deep
     - 🧠 Everywhere
   - Goes to enemy turn

### Enemy Turn Flow:

1. **Enemy attacks:**
   - "The Ache used Gaslighting Whisper!"
   - Damage happens
   - "It's super effective!" / effect message
   - **Tap to continue ›**

2. **Returns to player turn**
   - See 4 action buttons again
   - Telegraph visible at top: ⚠️ "Whispers echo around you..."

### Flare Crisis Flow:

**When Flare >= 100%:**
1. Breathing minigame triggers
2. Pulsing circle appears
3. Click at peak (inhale) and bottom (exhale)
4. Success (3 good) = -30 Flare
5. Fail (3 miss) = -15 Flare
6. Returns to player turn

---

## 🎯 Key Differences from Before

**WRONG (what I built first):**
- No action buttons
- Every turn showed dialogue choices
- Dialogue choices determined ALL actions

**RIGHT (current version):**
- ✅ 4 action buttons always visible
- ✅ Observe/Soothe/Resist execute directly
- ✅ ONLY Probe shows dialogue choices
- ✅ Probe dialogue adds emotional flavor to the question
- ✅ Mini-decision ("Where do you feel it?") ONLY after Probe

---

## 💡 Why This Works Better

**Probe as special action:**
- It's the only ATTACK action (deals damage)
- Dialogue makes it feel more intimate/therapeutic
- "Where do you live in me?" is answered through mini-decision
- Other actions (Observe/Soothe/Resist) are self-care/defensive

**Maintains action variety:**
- Players can still use all 4 actions freely
- Probe isn't mandatory every turn
- Strategic choice preserved

**Dialogue is bonus depth:**
- Adds flavor to Probe
- Tracks HOW player asks questions (gentle vs demanding)
- Doesn't slow down other actions

---

## 📊 Diagnostic Value

### Action Usage:
```json
{
  "actions": ["observe", "probe", "soothe", "probe", "resist"],
  "probe_dialogues": [
    "Tell me where you hide in my body.",
    "Show me your patterns. I'm listening."
  ],
  "pain_locations": ["joints", "deep"],
  "playstyle": "balanced_investigative"
}
```

**Insights:**
- Probe dialogue choices = emotional approach to questioning
- Action distribution = coping style
- Pain locations = symptom mapping

---

## 🎨 UI States

### State 1: Player Turn
```
┌──────────────────────────────────┐
│ The Ache Beneath      HP: 73%   │
│ ██████████████░░░░░░░░░░░░░░░░░ │
│                                  │
│ ⚠️ Whispers echo around you...  │  ← Telegraph
└──────────────────────────────────┘

     [Enemy image in center]

    Flare: 85%  Clarity: 60%

┌──────────┬──────────┐
│ 🔍       │ 🌊       │
│ Observe  │ Soothe   │  ← Action buttons
└──────────┴──────────┘
┌──────────┬──────────┐
│ 💬       │ 💪       │
│ Probe    │ Resist   │
└──────────┴──────────┘
```

### State 2: Probe Dialogue
```
    "Where do you live in me?"
       How do you ask?

┌────────────────────────────────┐
│ 💭 "Tell me where you hide..." │
└────────────────────────────────┘

┌────────────────────────────────┐
│ 👁️ "Show me your patterns..."  │
└────────────────────────────────┘

... (2 more choices)
```

### State 3: Attack Result
```
┌────────────────────────────────┐
│ You ask: "Tell me where you    │
│ hide in my body."              │
│                                │
│ It's super effective!          │
│                                │
│    Tap to continue ›           │  ← Click to advance
└────────────────────────────────┘
```

### State 4: Mini-Decision (Probe only)
```
┌────────────────────────────────┐
│ Where do you feel it most?     │
│                                │
│  🦴 Joints  🔥 Deep  🧠 Every  │
└────────────────────────────────┘
```

### State 5: Enemy Attack
```
┌────────────────────────────────┐
│ The Ache used Gaslighting      │
│ Whisper!                       │
│                                │
│ It's super effective!          │
│                                │
│    Tap to continue ›           │
└────────────────────────────────┘
```

---

## 🔄 Complete Turn Example

**Turn Start:**
- Player sees: 4 action buttons + telegraph

**Player clicks: Probe**
- Dialogue appears: "Where do you live in me? How do you ask?"
- Player picks: 💭 "Tell me where you hide in my body."
- Message: "You ask: 'Tell me where you hide...' It's super effective!"
- Tap to continue
- Mini-decision: "Where do you feel it most?"
- Player picks: 🦴 Joints
- Enemy turn begins

**Enemy Turn:**
- Telegraph: "Whispers echo around you..."
- Attack: "The Ache used Gaslighting Whisper!"
- Message: "It's super effective!"
- Tap to continue

**Back to Player Turn:**
- See 4 action buttons again
- Telegraph updated (next attack)

---

## ✅ What's Working Now

1. ✅ 4 action buttons visible on player turn
2. ✅ Observe/Soothe/Resist execute directly
3. ✅ Probe shows dialogue first
4. ✅ Dialogue choices are emotional variants of "Where do you live in me?"
5. ✅ Mini-decision only after Probe
6. ✅ Telegraph visible during player turn
7. ✅ Enemy attacks have "Tap to continue"
8. ✅ Breathing minigame at Flare 100%
9. ✅ All effectiveness messages working

---

## 🎯 Testing Checklist

- [ ] Click Observe → executes immediately
- [ ] Click Soothe → executes immediately  
- [ ] Click Resist → executes immediately
- [ ] Click Probe → shows dialogue choices
- [ ] Pick dialogue → Probe executes with that text
- [ ] After Probe → mini-decision appears
- [ ] After other actions → NO mini-decision
- [ ] Enemy attack → shows "Tap to continue"
- [ ] Tap → returns to player turn
- [ ] Flare 100% → breathing minigame
- [ ] Breathing success → returns to combat

---

**This is the correct implementation! 🎉**
