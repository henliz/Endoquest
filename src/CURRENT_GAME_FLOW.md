# EndoQuest Tutorial Encounter - Complete Flow Report

## 📖 Narrative Structure

### Phase 1: Awakening (VN)
**Scene:** Player wakes in a gothic basin  
**Character:** None (narration)  
**Text:** "You wake to the sound of dripping water..."  
**Mechanics:** Click to continue

---

### Phase 2: Archivist Introduction (VN)
**Scene:** Mysterious robed figure appears  
**Character:** The Archivist (full-screen portrait)  
**Text:** "Ah. Another soul arrives. Tell me — do you remember what brought you to the Fog?"  
**Mechanics:** Click to continue

---

### Phase 3: First Diagnostic Question (VN Choice)
**Scene:** The Archivist questions you  
**Character:** The Archivist  
**Question:** Memory diagnostic - exploring past pain  

**Choices:**
1. 🔥 **Frustrated:** "I remember doctors who didn't listen."
2. 💙 **Resigned:** "I remember trying to explain pain no one believed."
3. 🌙 **Curious:** "I remember thinking... maybe it's all in my head?"

**Impact:** Tracks player's emotional response to medical gaslighting  
**Mechanics:** Single choice → continues narrative

---

### Phase 4: Basin Response (VN)
**Scene:** The Archivist responds to your choice  
**Character:** The Archivist  
**Text:** Acknowledges your pain and introduces the concept of "Ache-Echoes"  
**Mechanics:** Click to continue

---

### Phase 5: Transition to Combat (VN)
**Scene:** First enemy appears  
**Character:** The Archivist (warning)  
**Text:** "The first Ache-Echo stirs. You cannot run from this one. You must face it."  
**Setup:** Introduces combat mechanics contextually  
**Mechanics:** Click to enter combat

---

### Phase 6: Combat Phase 1 ⚔️
**Enemy:** The Ache Beneath  
**Enemy Image:** Dark ethereal shadow  
**Starting Stats:**
- Enemy HP: 100%
- Player Flare: 70%
- Player Clarity: 50%

**Combat Mechanics:**
- **Observe** → +20% Clarity (study the pattern)
- **Soothe** → -25% Flare, +5% Clarity (breathe and calm)
- **Probe** → 30 damage to enemy, +15% Clarity, +5% Flare (ask questions)
- **Resist** → 10 damage to enemy, -15% Flare, -10% Clarity (push through)

**Turn Order:**
1. Player chooses action
2. Battle message displays ("It's super effective!", etc.)
3. Enemy attacks (adds 10-25 Flare damage)
4. Return to player turn

**Win Condition:** Reduce enemy HP to **50%** (NOT 0%)  
**Current Issue:** 🚨 **THIS IS BROKEN** - Should trigger mid-battle at 50% HP but currently waits for 0%

---

### Phase 7: Mid-Battle VN Scene (VN)
**Trigger:** Enemy reaches 50% HP in Phase 1  
**Scene:** The Ache speaks for the first time  
**Character:** The Ache Beneath  
**Text:** "You see me now. The pain you carry—it's more than physical. When the healers failed you, what did that cost?"  
**Narrative Purpose:** Reveals that the "enemy" is actually a part of you seeking understanding  
**Mechanics:** Click to continue

---

### Phase 8: Healer's Question (VN Choice)
**Scene:** The Ache asks about medical trauma  
**Character:** The Ache Beneath  
**Question:** Diagnostic question about healthcare experiences  

**Choices:**
1. 😔 **Honest:** "It made me doubt everything I felt."
2. 😠 **Angry:** "It made me furious. I knew I was right."
3. 🌀 **Detached:** "I stopped trusting anyone. Including myself."

**Impact:** Tracks trauma response patterns  
**Mechanics:** Choice → triggers Phase 2 combat

---

### Phase 9: Combat Phase 2 ⚔️
**Enemy:** The Ache Beneath (Awakened)  
**Visual Change:** Red overlay, "⚠️ Awakened State ⚠️"  
**Starting Stats:**
- Enemy HP: 80% (wounded but dangerous)
- Player Flare: Current value from Phase 1
- Player Clarity: Current value from Phase 1

**Same Actions:** Observe, Soothe, Probe, Resist  
**Difficulty Increase:** Enemy hits harder? (TBD)

**Win Condition:** Reduce enemy HP to 0%  
**Victory Trigger:** Auto-progresses to victory scene

---

### Phase 10: Victory VN (VN)
**Scene:** The Ache merges with you  
**Character:** None (narration)  
**Text:** "The basin calms. The shadow kneels before you — and then it merges with you, flowing into your veins like liquid light. The pain does not vanish; it becomes something you can see, something you can name."  
**Narrative Impact:** Reframes pain as knowledge rather than weakness  
**Mechanics:** Click to continue

---

### Phase 11: Power Reveal (VN)
**Scene:** The Archivist explains your new ability  
**Character:** The Archivist  
**Text:** "You have named the Ache. You've unlocked **Empathic Resonance**: the ability to sense disturbances in the Fog."  
**Game Mechanic Unlock:** New ability for future encounters  
**Mechanics:** Click to continue

---

### Phase 12: Tutorial Complete (VN)
**Scene:** Final guidance from the Archivist  
**Character:** The Archivist  
**Text:** "This was only the first ache, traveler. Beyond this basin lie others — vines that bind, floods that drain, and nerves that burn. But now you have a name for your pain, and that is power."  
**Narrative Setup:** Teases future encounters  
**Mechanics:** Click to end tutorial

---

## 🎮 Combat System Analysis

### Current Issues:
1. **Phase 1 → Phase 2 transition broken**
   - Currently triggers at 0% HP (victory)
   - SHOULD trigger at 50% HP (mid-battle)
   - Player gets confused because there's only one combat phase

2. **Enemy Turn Execution**
   - Sometimes doesn't execute?
   - Timing might be off

3. **Tutorial Display**
   - Shows on first combat entry
   - Explains turn-based mechanics
   - Auto-hides after 6s or first action

### Suggested Combat Improvements:

#### Option A: Keep Two-Phase Combat
- **Phase 1 Goal:** Understand the enemy (reach 50% HP)
- **Mid-Battle:** Dialogue reveals enemy's nature
- **Phase 2 Goal:** Integrate the pain (defeat enemy)
- **Benefit:** Narrative arc, builds tension

#### Option B: Single Combat with Milestones
- **One continuous battle** to 0% HP
- **At 75% HP:** Enemy speaks (brief dialogue overlay)
- **At 50% HP:** Enemy transforms (visual change)
- **At 25% HP:** Final words
- **Benefit:** No jarring transitions, maintains flow

#### Option C: "Understanding" System
- **Reduce HP through Probe actions** (damage)
- **Build "Understanding" meter** through Observe
- **Victory requires BOTH:**
  - Enemy HP to 0%
  - Understanding to 100%
- **Benefit:** Thematic depth, strategic choices matter

---

## 🎨 Visual Flow

### VN Scenes:
- Full-screen character portraits (floating animation)
- Gothic backgrounds (muted, atmospheric)
- Dialogue box at bottom
- Crimson Text font for narration

### Combat Scenes:
- **NEW:** Dark gothic background image
- Enemy portrait in rounded frame
- HP bars with percentages
- Action buttons (color-coded by type)
- Battle messages (Pokemon-style)

### Transitions:
- Smooth crossfades between phases
- Only dialogue text fades (not entire scene)
- Music switches: VN ambient ↔ Combat epic

---

## 🎵 Audio System Status

### Current Implementation:
- **Type:** SoundCloud invisible iframe
- **VN Music:** Curse of Strahd - Introduction
- **Combat Music:** (Same track - needs replacement)
- **Volume:** 40%

### Known Issues:
- ⚠️ **SoundCloud Widget API not loading?**
- ⚠️ **Autoplay blocked by browser?**
- ⚠️ **Script tag in component may not execute**

### Recommended Fix:
Switch to direct MP3 files instead of SoundCloud:
1. Download tracks as MP3
2. Upload to `/public/audio/`
3. Use AudioManager with direct URLs
4. More reliable than iframe embed

---

## 📊 Diagnostic Data Collection

### Tracked Data Points:
1. **First Question Response** (Phase 3)
   - Emotional state: Frustrated / Resigned / Curious
   
2. **Healer's Question Response** (Phase 8)
   - Trauma response: Doubt / Anger / Detachment

3. **Combat Choices** (Both phases)
   - Action preferences: Observe, Soothe, Probe, Resist
   - Play style: Aggressive vs. Defensive vs. Analytical

4. **Final State** (Phase 12)
   - Flare level (pain)
   - Clarity level (understanding)

### Data Output:
```typescript
{
  choices: ['frustrated', 'angry'],
  finalState: {
    flare: 45,
    clarity: 85,
    playerChoices: ['probe', 'observe', 'probe', ...]
  }
}
```

---

## 🎯 Tutorial Goals

### Narrative Goals:
✅ Introduce The Fog and Ache-Echoes  
✅ Establish The Archivist as guide  
✅ Reframe pain as map/power  
✅ Build empathy for player's medical trauma  

### Gameplay Goals:
✅ Teach 4-action combat system  
✅ Demonstrate turn-based mechanics  
⚠️ Show two-phase boss structure (BROKEN)  
✅ Unlock first ability (Empathic Resonance)  

### Diagnostic Goals:
✅ Assess emotional response to gaslighting  
✅ Identify trauma coping mechanisms  
✅ Track pain management strategies (via actions)  
✅ Establish baseline Flare/Clarity levels  

---

## 🐛 Critical Bugs to Fix

1. **Combat Phase Transition (HIGH PRIORITY)**
   - Phase 1 should end at 50% HP, not 0%
   - Need to properly trigger mid_battle_vn

2. **Audio System (MEDIUM PRIORITY)**
   - SoundCloud implementation may be broken
   - Need to debug or switch to MP3 files

3. **Enemy Turn Timing (LOW PRIORITY)**
   - Verify enemy attacks are executing
   - Check timing between turns

---

## 💡 Recommendations for Next Steps

### Combat Redesign Options:

**If you want more engaging combat:**
- Add **status effects** (Burning, Numb, Focused)
- Include **item system** (Herbal Tea, Journal, etc.)
- Add **combo system** (Observe → Probe = Critical Hit)
- Include **risk/reward** (Resist gives power but costs HP)

**If you want more narrative:**
- Add **mid-combat dialogue** at HP thresholds
- Include **enemy reactions** to specific actions
- Add **moral choices** during battle
- Include **multiple endings** based on actions

**If you want more diagnostic depth:**
- Track **action patterns** (aggressive, defensive, etc.)
- Include **timed choices** (stress response)
- Add **resource management** (Spoons/Energy system)
- Include **consequence chains** (actions affect future encounters)

---

## 🎭 Tone & Aesthetic

**Visual:** Undertale meets Spiritfarer meets Celeste  
**Narrative:** Therapy RPG, melancholic-magical  
**Colors:** Muted purples (#c9a0dc), deep blues, warm amber (#f4a261)  
**Typography:** Crimson Text (narration), Inter (UI)  
**Music:** Gothic ambient (VN), Epic battle (Combat)  
**Themes:** Medical trauma, pain as power, naming the unspeakable

---

**Total Tutorial Length:** ~10-15 minutes  
**Total Phases:** 12  
**Combat Encounters:** 2 (supposed to be)  
**Diagnostic Questions:** 2  
**Narrative Beats:** 10
