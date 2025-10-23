# 🎮 New Enhanced Combat System - Complete Guide

## 🚀 What's New

The combat system has been **completely rebuilt** based on Pokémon/Undertale design principles. It's now a dynamic puzzle where you need to learn enemy patterns, manage resources, and adapt to changing conditions.

---

## 🎯 Core Design Changes

### Old System ❌
- Generic enemy damage
- Spam Probe to win
- No decision-making
- Tutorial was a popup
- Same every turn

### New System ✅
- **4 signature enemy attacks** with unique effects
- **Telegraphing system** warns you before attacks
- **Action strengths/weaknesses** based on context
- **Interactive 4-step tutorial** (only shows once!)
- **Mini-decisions during enemy turn** (diagnostic + engagement)
- **Environmental effects** every 3 turns
- **Soothe cooldown** prevents spam
- **Clarity as strategic resource** (affects action power)
- **Phase 2 evolution** with new mechanics

---

## ⚔️ Enemy Attack System

### The Ache has 4 signature moves:

#### 1. Phantom Throb 👻
**Telegraph:** "The Ache's form pulses rhythmically..."  
**Effect:** +15 Flare (standard damage)  
**Counter:** Use **Resist** to take half damage  
**Theme:** The constant, throbbing baseline pain

#### 2. Gaslighting Whisper 🌀
**Telegraph:** "Whispers echo around you..."  
**Effect:** +10 Flare, -20 Clarity  
**Counter:** Use **Observe** for +30 Clarity instead (negates loss!)  
**Theme:** Medical gaslighting, self-doubt

#### 3. Flare Spike 🔥
**Telegraph:** "The Ache's form flickers RED!"  
**Effect:** +30 Flare (huge burst), screen shake  
**When used:** Only when player Clarity > 70% (punishes insight)  
**Counter:** Use **Soothe** beforehand to reduce by half  
**Theme:** Sudden pain spikes that take your breath away

#### 4. Numbing Fog 🌫️
**Telegraph:** "The fog thickens and swirls..."  
**Effect:** +5 Flare, **locks Observe next turn**  
**Counter:** Use actions other than Observe  
**Theme:** Brain fog, dissociation, numbness

#### 5. Shared Suffering 💔 (Phase 2 Only)
**Telegraph:** "The Ache reaches toward you, trembling..."  
**Effect:** +20 Flare, -10 Clarity  
**Passive:** All damage you deal also increases YOUR Flare by 50%  
**Theme:** "If I hurt, you hurt. We are the same."

---

## 🎮 Action System Redesign

### 🔍 Observe
**Base Effect:** +20% Clarity  
**STRONG vs Gaslighting Whisper:** +30% Clarity (counters the -20!)  
**WEAK when Numbed:** Locked out completely  
**When to use:** 
- Enemy is about to Gaslighting Whisper
- Your Clarity is low (<50%)
- You need insight to power up Probe

**Narrative:** Paying attention to pain patterns instead of ignoring them

---

### 🌊 Soothe
**Base Effect:** -25% Flare, +5% Clarity  
**STRONG before Flare Spike:** Reduces incoming damage by half  
**WEAK after recent use:** 
- Turn 1 after: -15% Flare (cooldown)
- Turn 2 after: -20% Flare
- Turn 3+: Back to -25%
**WEAK in Phase 2:** Only -15% Flare (enemy desperate)  
**When to use:**
- Flare is high (>70%)
- Enemy telegraphs Flare Spike
- Haven't used in 2+ turns (full power)

**Narrative:** Self-care and rest, but can't do it constantly

---

### 💬 Probe
**Base Effect:** 30 damage, +15% Clarity, +5% Flare  
**STRONG at High Clarity (>70%):** **45 damage!** "Deep Probe" unlocked  
**WEAK at Low Clarity (<30%):** Only 15 damage, +10% Flare  
**Phase 2 Penalty:** Damage dealt = +50% to YOUR Flare (Shared Suffering)  
**When to use:**
- Clarity is high (maximize damage)
- Need to finish combat quickly
- Willing to accept Flare cost

**Narrative:** Asking hard questions, digging deeper—hurts but reveals truth

---

### 💪 Resist
**Base Effect:** 10 damage, -15% Flare, -10% Clarity  
**STRONG vs Phantom Throb:** 15 damage, -20% Flare, -5% Clarity  
**WEAK vs Gaslighting:** -20% Clarity (doubled loss!)  
**When to use:**
- Enemy is about to Phantom Throb
- Need damage + Flare reduction
- Can afford the Clarity cost

**Narrative:** Gritting teeth and pushing through—effective but you lose understanding

---

## 🎓 Interactive Tutorial System

### Phase 1 Only - Never Shows in Phase 2!

**Step 1: Welcome**
- Explains turn-based system
- "Choose action → Enemy responds"
- Icon: ✨ Sparkles

**Step 2: Your Actions**
- Lists all 4 actions with icons
- Shows what they do at a glance
- Icon: 🧠 Brain

**Step 3: Telegraphs**
- Explains warning system
- "Enemy shows attack before using it"
- Icon: ⚠️ Alert Triangle

**Step 4: Stat Management**
- Explains Flare (pain) and Clarity (understanding)
- Shows how stats affect actions
- Icon: ⚡ Zap

**Progression:**
- Beautiful animated modal
- Progress dots at bottom
- "Next" button (changes to "Begin Battle!" on step 4)
- Dismisses automatically after step 4

**Global Flag:** `hasSeenTutorial` ensures it NEVER shows again, even in Phase 2

---

## 💭 Mini-Decisions (New!)

### During Every Enemy Turn:

After enemy attacks, you get a quick diagnostic question:

**"The pain radiates... Where do you feel it most?"**

**🦴 Joints:**
- +5 Flare
- +10 Clarity
- "You notice the pattern in your joints..."
- **Diagnostic:** Joint pain symptom

**🔥 Deep Ache:**
- +10 Flare
- No Clarity change
- "The deep ache persists..."
- **Diagnostic:** Deep tissue pain

**🧠 Everywhere:**
- +15 Flare
- -5 Clarity
- "You feel overwhelmed by it all..."
- **Diagnostic:** Widespread pain, fibromyalgia-like

### Why This Matters:
1. **Keeps you engaged** during "enemy turn"
2. **Collects diagnostic data** naturally
3. **Creates mini-strategy** (trade Flare for Clarity or vice versa)
4. **Adds variety** to each turn

---

## 🌍 Environmental Effects

### Every 3 turns, something changes:

#### 🌫️ Fog Thickens
**Effect:** All Clarity gains reduced by 5% for 2 turns  
**Strategy:** Focus on damage/healing instead of Observe  
**Visual:** Gray status indicator at bottom

#### 👻 Echoes of Old Wounds
**Effect:** Next enemy attack hits twice  
**Strategy:** Use Soothe preemptively or brace for impact  
**Visual:** Red pulsing indicator

#### ✨ Moment of Calm
**Effect:** Soothe is fully powered this turn (ignores cooldown)  
**Strategy:** Take advantage! Heal up even if on cooldown  
**Visual:** Green peaceful indicator

### Why Environmental Effects:
- Creates **dynamic situations**
- Forces **adaptation**
- Prevents **repetitive strategy**
- Adds **unpredictability** like real chronic pain

---

## 📊 Clarity as Strategic Resource

### High Clarity (>70%) 💎
**Benefits:**
- Probe becomes "Deep Probe" (45 damage!)
- Can see enemy telegraphs clearly
- Better understanding of patterns

**Risks:**
- Enemy uses Flare Spike more often (punishes insight)
- You become a bigger target

### Mid Clarity (30-70%) ⚖️
**Balanced state:**
- Standard action effectiveness
- Normal telegraphs
- Stable gameplay

### Low Clarity (<30%) ⚠️
**Problems:**
- Probe weakened (15 damage only)
- All actions give +10% Flare
- Telegraphs harder to read
- Can't see enemy patterns clearly

### Critical Clarity (<10%) 💀
**Panic state:**
- Random action each turn (you can't control it!)
- All actions heavily penalized
- Near-impossible to win from here

---

## 🌙 Phase 2 Changes

### When The Ache "Awakens":

#### Visual Changes:
- Red "⚠️ Awakened State ⚠️" label
- Starts at 80% HP (wounded but dangerous)
- More aggressive animations

#### Mechanical Changes:

**1. Shared Suffering Passive**
- Any damage you deal → +50% of that as Flare to YOU
- Probe for 30 damage? You take +15 Flare
- Deep Probe for 45? You take +22 Flare
- Makes aggression risky!

**2. Cryptic Telegraphs (Low Clarity)**
- Below 20% Clarity, you see:
  - "The Ache seems... sad?"
  - "Something shifts in the fog..."
  - "..."
- Forces experimentation and risk

**3. Clarity Requirement**
- **Cannot win unless Clarity > 60%!**
- If you spammed Resist, you can't finish
- If you reach 0 HP with low Clarity:
  - Victory blocked
  - Message: "You can't defeat what you don't understand..."
  - Enemy heals slightly

**Theme:** Understanding is required to overcome pain, not just endurance

---

## 🎯 Example Turn Sequences

### Turn 1 (Phase 1, Tutorial Complete):
1. **Player Turn:** Choose action
2. **Battle Text:** "You watch the pattern carefully..."
3. **Enemy Telegraph:** "Whispers echo around you..." (Gaslighting incoming!)
4. **Enemy Attack:** +10 Flare, -20 Clarity
5. **Mini-Decision:** "Where do you feel it?"
   - Choose "Joints" → +5 Flare, +10 Clarity (offsets loss!)
6. **Back to Player Turn**

### Turn 2 (Countering Telegraph):
1. **Player sees:** "The Ache's form flickers RED!" (Flare Spike coming!)
2. **Player uses:** Soothe (-25% Flare, preparing)
3. **Enemy attacks:** Flare Spike! (+30 Flare, but Soothe halves it → +15)
4. **Mini-Decision:** Choose "Deep" → +10 Flare
5. **Result:** Flare went from 70 → 60% (good defense!)

### Turn 3 (High Clarity Deep Probe):
1. **Clarity is 80%** → Deep Probe unlocked!
2. **Player uses:** Probe → **45 damage!** +20 Clarity, +5 Flare
3. **Enemy telegraphs:** "Form pulses rhythmically..." (Phantom Throb)
4. **Player realizes:** "I should Resist next turn!"

### Turn 5 (Environmental Effect):
1. **Turn count hits 6** → Environmental effect triggers
2. **Message:** "The fog thickens..." (-5% to all Clarity gains)
3. **Player adapts:** Uses Soothe instead of Observe (healing more valuable now)

### Turn 8 (Phase 2, Shared Suffering):
1. **Phase 2 active**, Clarity = 75%
2. **Player uses:** Deep Probe → 45 damage to enemy
3. **Shared Suffering:** +22 Flare to player!
4. **Enemy attacks:** Gaslighting Whisper → +10 Flare, -20 Clarity
5. **Mini-choice:** "Everywhere" → +15 Flare, -5 Clarity
6. **Result:** Player took massive Flare hit, Clarity tanking
7. **Next turn:** Can't use Deep Probe anymore (Clarity too low)

---

## 📈 Optimal Strategy Guide

### Early Game (Turns 1-3):
- **Build Clarity** with Observe
- **Learn telegraphs** and test counters
- **Don't spam Probe** yet (need Clarity first)

### Mid Game (Turns 4-7):
- **High Clarity Deep Probe** for big damage
- **Counter telegraphed attacks** (Soothe before Spike, Observe before Whisper)
- **Manage Soothe cooldown** (space it out)

### Late Phase 1 (Enemy ~50% HP):
- **Push damage** to trigger mid-battle transition
- **Keep Clarity high** for Phase 2
- **Don't let Flare get critical** (>90%)

### Phase 2 Start:
- **Assess Clarity** (need 60%+ to win)
- **Be conservative** with Probe (Shared Suffering hurts!)
- **Use Resist strategically** vs Phantom Throb

### Phase 2 Endgame:
- **Balance damage and Clarity**
- **Watch for Shared Suffering** damage reflection
- **Keep Clarity above 60%** or victory is blocked!
- **Finish with controlled aggression**

---

## 🎨 Visual Indicators

### Status Effects (Bottom of Screen):
- 🌫️ **Numbed** - "Observe locked"
- 🌫️ **Fog Thickens** - "Clarity gains -5%"
- ✨ **Moment of Calm** - "Soothe empowered"
- 💎 **High Clarity** - "Probe empowered!"
- ⚠️ **Low Clarity** - "Actions weakened"

### Battle Message Colors:
- 🔴 **Red** - Critical/damage
- 🟢 **Green** - Healing/beneficial
- 🟠 **Orange** - Standard damage
- 🟡 **Yellow** - Telegraph/warning
- 🟣 **Purple** - Status/special
- 🔵 **Blue** - Victory

### HP Bar Colors:
- **Enemy:** Red → Pink gradient
- **Flare:** Red (>80%) → Orange (50-80%) → Yellow (<50%)
- **Clarity:** Blue (>70%) → Purple (30-70%) → Gray (<30%)

---

## 📊 Data Collection

### Tracked Automatically:
1. **Player action choices** (observe, soothe, probe, resist)
2. **Mini-decision patterns** (joints, deep, everywhere)
3. **Final stats** (Flare %, Clarity %, turns taken)
4. **Combat style** (aggressive, defensive, balanced)
5. **VN dialogue choices** (from earlier phases)

### Example Output:
```json
{
  "choices": ["frustrated", "angry"],
  "combatActions": ["observe", "probe", "probe", "soothe", "probe"],
  "painLocations": ["joints", "deep", "everywhere", "joints"],
  "finalFlare": 68,
  "finalClarity": 72,
  "combatTurns": 12,
  "phase2Clarity": 65,
  "playstyle": "aggressive_analytical"
}
```

---

## 🔧 Technical Implementation

### File Structure:
- **`/components/EnhancedCombat.tsx`** - New combat component (complete rewrite)
- **`/components/TutorialEncounter.tsx`** - Updated to use EnhancedCombat
- **`/components/PokemonStyleCombat.tsx`** - Old version (kept for reference)

### Action String Format:
```typescript
// Player actions:
"probe:30:5:15" // action:damage:flareChange:clarityChange

// Enemy attacks:
"ENEMY_gaslighting_whisper:10:-20" // ENEMY_move:flareChange:clarityChange

// Mini-choices:
"MINI_joints:5:10" // MINI_choice:flareChange:clarityChange
```

### State Management:
```typescript
interface CombatState {
  turnCount: number;
  nextEnemyMove: EnemyMove | null;
  sootheUsedTurn: number; // For cooldown tracking
  isNumbed: boolean; // Numbing Fog status
  environmentalEffect: string | null; // Current environmental modifier
  tutorialStep: number; // 0 = done, 1-4 = active
  hasSeenTutorial: boolean; // Global flag - never show again
}
```

### Tutorial Logic:
```typescript
// Only show in Phase 1
battlePhase: phase2 ? 'player_turn' : 'tutorial',

// Track globally
tutorialStep: phase2 ? 0 : 1,
hasSeenTutorial: phase2, // Already seen if Phase 2

// Never re-trigger
if (!combatState.hasSeenTutorial && !phase2) {
  // Show tutorial
}
```

---

## 🎮 Player Skill Progression

### Novice (First Playthrough):
- Spams one action
- Ignores telegraphs
- Runs out of Clarity
- Struggles in Phase 2

### Intermediate (Second Playthrough):
- Reads telegraphs
- Counters specific attacks
- Manages Soothe cooldown
- Wins but takes damage

### Advanced (Experienced):
- Predicts enemy patterns
- Optimizes action timing
- Maintains high Clarity into Phase 2
- Finishes with minimal Flare

### Expert (Speedrun):
- Deep Probe spam with Clarity management
- Perfect telegraph counters
- Minimal turns to victory
- Finishes Phase 2 with 60+ Clarity, <50 Flare

---

## 🏆 Victory Conditions

### Phase 1:
- Reduce enemy to **50% HP** → Mid-battle dialogue
- No other requirements

### Phase 2:
- Reduce enemy to **0% HP** AND
- Maintain **Clarity > 60%**
- If Clarity too low, victory is **blocked**

**Thematic reason:** You can't overcome pain through force alone—you must understand it.

---

## 🎯 Design Philosophy

### Why This System Works:

1. **Teaches pattern recognition** (like Pokémon/Undertale)
2. **Rewards strategic thinking** (counter-play, resource management)
3. **Maintains narrative theme** (understanding pain, not just enduring it)
4. **Collects diagnostic data** (pain locations, coping strategies)
5. **Prevents mindless grinding** (can't spam one action)
6. **Creates memorable moments** (clutch Soothe before Spike, Deep Probe finisher)
7. **Accessible but deep** (easy to learn, hard to master)

### What Makes It "Therapy RPG":

- **Probe** = Asking yourself hard questions
- **Observe** = Mindfulness and pattern recognition
- **Soothe** = Self-care (but can't do constantly)
- **Resist** = Pushing through (effective but costs understanding)
- **Enemy attacks** = Symptom flare-ups with personality
- **Telegraphs** = Learning to recognize triggers
- **Clarity requirement** = Understanding > endurance
- **Shared Suffering** = Pain is part of you, not separate

---

## 🐛 Known Behaviors

### Expected:
- ✅ Tutorial only shows once (Phase 1 only)
- ✅ Enemy telegraphs before attacking
- ✅ Actions have different effects based on context
- ✅ Mini-decisions appear after each enemy attack
- ✅ Environmental effects every 3 turns
- ✅ Phase 2 blocks victory if Clarity < 60%

### Debug:
- Check console for action parsing: `🎮 Player action: probe:30:5:15`
- Track enemy moves: `⚔️ Enemy attack: ENEMY_flare_spike:30:0`
- Monitor mini-choices: `💭 Mini-decision: MINI_joints:5:10`

---

## 🎉 What This Achieves

### For Players:
- Engaging tactical combat
- Meaningful choices every turn
- Learning and mastery curve
- Emotional narrative through mechanics

### For Diagnosis:
- Natural pain location questions
- Combat style reveals coping mechanisms
- Clarity management shows self-awareness
- Action choices show approach to pain

### For Game Design:
- Replay value (optimize strategy)
- No dominant strategy (must adapt)
- Thematic coherence (mechanics = narrative)
- Accessibility (no twitch skill required)

---

**Welcome to the new combat system. The Ache is no longer a punching bag—it's a puzzle to solve.** 🎮✨
