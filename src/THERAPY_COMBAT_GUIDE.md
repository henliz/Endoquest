# 🧠 Therapy Combat System - Complete Guide

## 🌟 What Makes This Special

**You're not just building a game. You're building a THERAPEUTIC EXPERIENCE.**

Every combat turn is now a **micro-therapy session** where players:
- Face difficult emotional questions
- Learn to recognize their responses to medical trauma
- Practice real coping mechanisms (breathing exercises)
- Build self-advocacy language

This is **CBT mechanics wrapped in Pokémon combat**.

---

## 🎮 New Features Overview

### 1. **Dialogue-Before-Action System** ✨
**Instead of clicking "Probe"**, you get:

> *The Ache used Gaslighting Whisper!*  
> *"Maybe it IS all in your head..."*  
> 
> **The Ache stares at you, waiting...**  
> **How do you respond?**
> 
> 😤 **"No. I KNOW this is real."** → PROBE  
> 👁️ **"What are you trying to tell me?"** → OBSERVE  
> 🌊 **"I don't need to prove anything to you."** → SOOTHE  
> 💪 **"Whatever. Moving on."** → RESIST

**Every action is reframed as an emotional question/stance toward pain.**

---

### 2. **Telegraph Visibility** 🔮
**During YOUR turn**, you see what the enemy is preparing:

> ⚠️ *Whispers echo around you...*

This appears at the top of the screen **while you're choosing your response**, allowing you to:
- Counter specific attacks strategically
- Make informed emotional choices
- Feel like you're learning the enemy's patterns

---

### 3. **Pokémon-Style Attack Messages** 💥
**After every attack**, you get:

> **The Ache used Flare Spike!**  
> *(damage happens)*  
> **It's super effective!**  
> 
> *Tap to continue ›*

**Benefits:**
- Clear feedback on what happened
- Shows effectiveness (super effective / not very effective)
- Gives player time to process
- Feels like classic Pokémon battles

---

### 4. **Breathing Minigame (Flare Crisis)** 🌬️
**When Flare hits 100%**, instead of instant fail:

**Screen:**
- Everything goes dark/blurred
- Text: *"The pain is overwhelming. You need to breathe."*
- **Pulsing circle** appears (expands/contracts like breathing)

**Mechanic:**
- Click when circle is **at its largest** (end of inhale)
- Click when circle is **at its smallest** (end of exhale)
- Do this **3 times successfully**

**Success** (3 good breaths):
- Flare drops to **70%**
- Message: *"You've steadied yourself. The pain is still there, but manageable."*
- Combat continues

**Failure** (3 missed clicks):
- Flare drops to **85%** (some relief)
- Message: *"Your breathing is ragged, but you're still standing."*
- Combat continues

**Why This Works:**
- Teaches **real coping mechanism** (box breathing)
- Visceral (you FEEL the panic)
- Forgiving (failure isn't game over)
- **Empowering** (you control the outcome)

---

## 📊 Dialogue Choice System

### How Choices Map to Actions

Each dialogue choice reveals your **emotional stance** toward pain:

| Emotion | Example Text | Action | Thematic Meaning |
|---------|--------------|--------|------------------|
| 😤 **Confrontational** | "No. I KNOW this is real." | PROBE | Challenging gaslighting directly |
| 👁️ **Curious** | "What are you trying to tell me?" | OBSERVE | Seeking understanding |
| 🌊 **Boundary-Setting** | "I don't need to prove anything." | SOOTHE | Self-compassion, setting limits |
| 💪 **Avoidant** | "Whatever. Moving on." | RESIST | Pushing through, avoiding engagement |

### Dialogue Variations by Enemy Attack

**After Gaslighting Whisper:**
- 😤 "No. I KNOW this is real." → PROBE (confronts gaslighting)
- 👁️ "What are you trying to tell me?" → OBSERVE (seeks truth)
- 🌊 "I don't need to prove anything to you." → SOOTHE (sets boundary)
- 💪 "Whatever. Moving on." → RESIST (avoids)

**After Flare Spike:**
- 💭 "Why do you hurt me like this?" → PROBE (demands answers)
- 👁️ "Let me understand you..." → OBSERVE (seeks meaning)
- 🌊 "I need to breathe through this." → SOOTHE (self-care)
- 💪 "I can take it." → RESIST (endures)

**After Phantom Throb:**
- 💭 "Where do you come from?" → PROBE (investigates source)
- 👁️ "I'm watching your pattern." → OBSERVE (analyzes)
- 🌊 "Let's ease this together." → SOOTHE (collaboration)
- 💪 "I'll push through you." → RESIST (powers through)

**Default (Generic):**
- 💭 "Where do you live in me?" → PROBE
- 👁️ "I want to understand you." → OBSERVE
- 🌊 "Can we coexist?" → SOOTHE
- 💪 "I don't have time for this." → RESIST

---

## 🎯 Turn Flow (New System)

### Old Flow:
1. Enemy attacks
2. Choose action (button)
3. Repeat

### New Flow:
1. **Enemy telegraphs** next move *(visible at top)*
2. **Enemy attacks** → "The Ache used X!"
3. **Attack result message** → "It's super effective!" / damage shown
4. **Tap to continue** ›
5. **Dialogue choices appear** → "How do you respond?"
6. **Choose emotional response** → Maps to action
7. **Action executes** → See effectiveness
8. **Probe only:** Mini-decision ("Where do you feel it?")
9. **Repeat**

### Flare Crisis Flow:
1. Flare hits **100%**
2. **Breathing minigame triggers**
3. **Pulsing circle** appears
4. **Click at peak/trough** (3x)
5. **Success/Fail** → Flare reduced
6. **Return to combat**

---

## 💡 Diagnostic Value

### What This System Tracks

**Player Emotional Responses:**
```json
{
  "gaslighting_response": "confrontational",  // Chose "I KNOW this is real"
  "flare_spike_response": "self_care",        // Chose "breathe through this"
  "phantom_response": "investigative",        // Chose "Where do you come from?"
  "avg_stance": "boundary_setting",           // Most common: Soothe choices
  "breathing_success_rate": 0.67,             // 2/3 breathing attempts successful
  "pain_locations": ["joints", "deep", "joints"]
}
```

**Clinical Insights:**
- **Confrontational responses** → Patient advocates for self, pushes back on gaslighting
- **Avoidant responses** → Patient may internalize doubt, resist engagement
- **Boundary-setting responses** → Healthy self-compassion
- **Investigative responses** → Seeks understanding, wants to learn about condition
- **Breathing success** → Ability to self-regulate under stress

---

## 🎨 UI/UX Details

### Dialogue Choice Appearance

**Animation:**
- Choices **fade in one at a time** (0.1s delay between each)
- Hover effect: Choice **glows** and **slides right 4px**
- After selection: Other choices **fade out**
- Selected choice **pulses** briefly

**Visual Design:**
```
┌─────────────────────────────────────────┐
│ The Ache stares at you, waiting...     │
│                                         │
│ How do you respond?                     │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 😤 "No. I KNOW this is real."       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 👁️ "What are you trying to tell me?" │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ... (2 more choices)                    │
└─────────────────────────────────────────┘
```

### Telegraph Indicator

**During Player Turn:**
```
┌──────────────────────────────────────┐
│ The Ache Beneath          HP: 73%   │
│ ████████████████░░░░░░░░░░░░░░░░░░  │
│                                      │
│ ⚠️ Whispers echo around you...      │  ← TELEGRAPH
└──────────────────────────────────────┘
```

**Colors:**
- Yellow background (`bg-yellow-500/20`)
- Yellow border (`border-yellow-400/50`)
- Warning icon (⚠️)

### Attack Result Messages

**Color Coding:**
- **Super Effective:** Green (`bg-green-500/30`)
- **Not Very Effective:** Gray (`bg-gray-500/30`)
- **Critical Hit:** Red (`bg-red-500/20`)
- **Normal:** Orange (`bg-orange-500/20`)

**Tap to Continue:**
- White/50% opacity
- Animated pulse
- "Tap to continue ›" text

### Breathing Minigame

**Visual:**
```
        The pain is overwhelming.
           You need to breathe.

            ┌─────────┐
            │         │
            │    ○    │  ← Circle pulses
            │         │     (0.5x → 1.0x scale)
            └─────────┘

         Click at peak/bottom

          ● ○ ○  ← Progress dots
                    (green = success,
                     red = miss,
                     gray = pending)

              Inhale...
```

**Animation:**
- Circle **expands** over 1.5 seconds (inhale)
- Circle **contracts** over 1.5 seconds (exhale)
- Total cycle: **3 seconds**
- Gradient: Purple → Amber
- Border: Purple glow

---

## 🔧 Technical Implementation

### File Structure

**New File:**
- `/components/EnhancedCombatV2.tsx` - Complete rewrite with all features

**Updated Files:**
- `/components/TutorialEncounter.tsx` - Uses EnhancedCombatV2, handles breathing effects

### State Management

```typescript
interface CombatState {
  turnCount: number;
  nextEnemyMove: EnemyMove | null;           // What enemy will do
  sootheUsedTurn: number;
  isNumbed: boolean;
  environmentalEffect: string | null;
  tutorialStep: number;
  hasSeenTutorial: boolean;
  lastEnemyMove: EnemyMove | null;           // NEW: What enemy just did
  pendingAction: ActionType | null;          // NEW: What action was chosen
}

// Breathing minigame state
breathingPhase: 'inhale' | 'exhale'
breathCount: number                          // How many breaths completed
circleScale: number                          // 0.5 (exhale) to 1.0 (inhale)
breathingSuccess: number                     // Successful clicks
breathingMisses: number                      // Failed clicks
```

### Battle Phases

```typescript
type BattlePhase = 
  | 'player_turn'           // Unused (skipped)
  | 'dialogue_choice'       // NEW: Show emotional responses
  | 'enemy_telegraph'       // Show warning
  | 'enemy_attack'          // Enemy attacks
  | 'attack_result'         // NEW: Show result with tap-to-continue
  | 'mini_decision'         // Pain location question (Probe only)
  | 'tutorial'              // 4-step tutorial
  | 'breathing_minigame'    // NEW: Flare crisis
  | 'victory'               // Combat end
```

### Dialogue Choice Type

```typescript
interface DialogueChoice {
  text: string;          // "No. I KNOW this is real."
  action: ActionType;    // 'probe' | 'observe' | 'soothe' | 'resist'
  emotion: string;       // '😤' emoji
}
```

### Action String Format

**Player actions:**
```
"probe:35:-3:15"  // action:damage:flareChange:clarityChange
```

**Enemy attacks:**
```
"ENEMY_gaslighting_whisper:6:-15"  // ENEMY_move:flareChange:clarityChange
```

**Mini-decisions:**
```
"MINI_joints:5:10"  // MINI_choice:flareChange:clarityChange
```

**Breathing results:**
```
"BREATHING_SUCCESS:-30:0"  // Success: -30 Flare
"BREATHING_FAIL:-15:0"     // Fail: -15 Flare
```

---

## 🎓 Tutorial Updates

### Step 2 Updated:

**Old:**
> "Your Actions: Observe, Soothe, Probe, Resist"

**New:**
> "Emotional Choices: After each attack, you'll choose how to respond. Your emotional stance determines your action. There's no single 'right' answer."

### Step 3 Updated:

**Old:**
> "The Enemy Telegraphs: Before attacking, The Ache will show a warning."

**New:**
> "The Enemy Telegraphs: Watch the warning at the top of the screen. The Ache shows what it's about to do. Choose your response wisely."

### Step 4 Updated:

**Old:**
> "Manage Your Stats: Flare is pain. Clarity is understanding."

**New:**
> "Manage Your Stats: Flare is pain. Clarity is understanding. If Flare reaches 100%, you'll need to breathe. Keep them balanced!"

---

## 📈 Expected Player Experience

### First Playthrough (Novice)

**Turn 1:**
- Enemy attacks
- Player reads: "The Ache used Gaslighting Whisper!"
- Sees: "It was super effective!"
- Taps to continue
- Reads dialogue choices
- Picks: 💪 "Whatever. Moving on." (avoidant)
- Result: Resist action, loses Clarity

**Turn 3:**
- Flare hits 100%
- Breathing minigame triggers
- Player: "Oh shit, what do I do?!"
- Tries clicking randomly
- Misses 2/3 times
- Flare reduced to 85%
- Realizes: "I need to time my clicks better"

**Turn 5:**
- Sees telegraph: ⚠️ Whispers echo...
- Remembers: "That's Gaslighting Whisper!"
- Picks: 😤 "No. I KNOW this is real." (confrontational)
- Result: Probe counters it, super effective!
- Player: "OH I GET IT NOW"

**Aha Moment:**
- "The dialogue isn't just flavor text—it's teaching me how to respond to medical gaslighting!"

### Experienced Playthrough

**Player Strategy:**
- Reads telegraphs during dialogue choice
- Picks counters strategically
- Uses breathing minigame for intentional breaks
- Balanced emotional responses (not just spam Probe)
- Finishes with high Clarity, low Flare
- Understands: "This is therapy disguised as combat"

---

## 🏆 Design Wins

### What This Achieves

1. **Emotional Engagement**
   - Every turn = meaningful choice
   - Players reflect on their own responses to medical trauma
   - Builds empathy for patient experience

2. **Educational Value**
   - Teaches breathing techniques (real coping skill)
   - Models self-advocacy language
   - Shows healthy vs unhealthy responses to gaslighting

3. **Diagnostic Data**
   - Tracks emotional response patterns
   - Measures ability to self-regulate
   - Identifies coping style

4. **Narrative Depth**
   - Combat IS the therapy session
   - Every action has emotional weight
   - Boss battle = confronting internalized medical trauma

5. **Replayability**
   - Players want to see all dialogue options
   - Try different emotional approaches
   - Master breathing minigame

---

## 🚀 Demo/Pitch Integration

### 30-Second Demo Flow

**Show:**
1. Enemy attacks: *"The Ache used Gaslighting Whisper!"*
2. Result: *"It's super effective!"* (Flare spikes)
3. Dialogue choice: *"How do you respond?"*
4. Player picks: 😤 *"No. I KNOW this is real."*
5. Probe counters: *"It's super effective!"*
6. Flare hits 100%
7. Breathing minigame: *"You need to breathe."*
8. Success: Flare drops to 70%

**Narration:**
> "Watch what happens when Sarah's pain becomes overwhelming. The game doesn't punish her—it teaches her to breathe. This is a real coping mechanism patients use. We're building health literacy through gameplay. Every combat turn is a micro-therapy session where players learn to recognize and respond to medical gaslighting."

### Pitch Framing

**Opening:**
> "What if a boss battle was also a therapy session?"

**Hook:**
> "In EndoQuest, combat isn't about reflexes—it's about emotional intelligence. Players don't just click 'Attack.' They choose how to respond: Do I confront the gaslighting? Do I seek understanding? Do I set a boundary?"

**Closer:**
> "We're not just collecting diagnostic data. We're teaching patients to advocate for themselves. Re-Mission did this for cancer adherence. SPARX did this for depression. EndoQuest is doing it for diagnostic empowerment."

---

## 🔮 Future Expansions

### Roadmap Features (Don't Build Yet)

**Clarity Crisis Minigame:**
- Triggers at 0% Clarity
- Memory fragment puzzle: Distinguish real memories from gaslighting
- *"Which of these are true?"*
- Success: Clarity rises to 40%

**Dynamic Enemy Responses:**
- The Ache comments on your choices
- Different dialogue based on your pattern
- *"You keep pushing me away. Why won't you listen?"*

**Combo System:**
- Observe → Probe = Critical hit
- Soothe → Soothe = "Centered" buff
- Resist → Resist = "Desperate" debuff

**Environmental Effects Enhanced:**
- Dialogue changes based on environment
- Fog = cryptic choices
- Calm = extra Soothe option

---

## ✅ Testing Checklist

### Dialogue System
- [ ] Dialogue appears after every enemy attack
- [ ] 4 choices always shown
- [ ] Choices map to correct actions
- [ ] Choices update based on last enemy move
- [ ] Animation staggers (0.1s delay)
- [ ] Hover effect works
- [ ] Selected choice triggers action

### Telegraph Display
- [ ] Shows during dialogue choice phase
- [ ] Correct message for enemy move
- [ ] Yellow warning box at top
- [ ] Visible but not intrusive

### Attack Messages
- [ ] "The Ache used X!" appears
- [ ] Effectiveness shown (super/not)
- [ ] "Tap to continue" visible
- [ ] Clicking advances to dialogue
- [ ] All messages have correct colors

### Breathing Minigame
- [ ] Triggers at Flare >= 100%
- [ ] Circle animates (3s cycle)
- [ ] Click detection works
- [ ] Success after 3 good clicks
- [ ] Failure after 3 misses
- [ ] Flare reduces correctly (-30 success, -15 fail)
- [ ] Returns to combat after

### Integration
- [ ] Turn flow smooth (no stuck states)
- [ ] Stats update correctly
- [ ] Mini-decision still works (Probe only)
- [ ] Tutorial updated
- [ ] Phase 2 uses same system

---

## 💬 Expected Player Feedback

### Positive
- "Holy shit, this is actually teaching me how to respond to gaslighting"
- "The breathing thing helped me calm down IRL"
- "I want to see all the dialogue options"
- "This feels like a real boss fight but also therapy?"

### Questions
- "What's the 'best' choice?" → **There isn't one!** Context-dependent
- "Can I fail the breathing?" → **No, just get less benefit**
- "Why can't I just click Probe?" → **Because healing isn't about brute force**

### Concerns to Address
- "Too much reading?" → **Tap-to-continue prevents overwhelm**
- "Dialogue slows combat?" → **That's the point—reflection is valuable**

---

## 🌙 Final Thoughts

You're building something **genuinely innovative**.

**This isn't:**
- A health game with gamification tacked on
- A quiz disguised as combat
- Edutainment with shallow mechanics

**This is:**
- **Exposure therapy** (facing difficult questions)
- **Somatic regulation** (breathing minigame)
- **Cognitive reframing** (dialogue choices model self-advocacy)
- **Empowerment through gameplay**

Every design decision serves **dual purpose**:
1. **Engaging gameplay** (Pokemon-style boss fight)
2. **Therapeutic value** (CBT mechanics, health literacy)

This is what games-for-health should be.

**Now go make judges CRY with how good this feels.** 🌙🔥
