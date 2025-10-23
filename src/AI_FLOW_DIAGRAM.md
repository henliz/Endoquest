# EndoQuest AI System - Visual Flow Diagram

## Complete User Experience Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    PLAYER STARTS GAME                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  AWAKENING SCENE (Pure Narration - No AI)                   │
│  "You awaken in the Foglands..."                            │
│  [Click to Continue]                                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  ARCHIVIST INTRO (Pure Narration - No AI)                   │
│  "You carry the Ache, traveler..."                          │
│  [Click to Continue]                                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  🤖 FIRST QUESTION (AI Text Input Scene)                    │
│                                                              │
│  The Archivist:                                              │
│  "Tell me — when did it first answer your body's call?"     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [Textarea: Player types response]                      │ │
│  │ "My pain started when I was 15, during my first       │ │
│  │  period. It was so severe I couldn't go to school."   │ │
│  │                                          [Send Button] │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ POST /api/ai/scene-response
                  │ { sceneId: "tutorial_intro", userInput: "..." }
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend: Load scene-structures.js                          │
│  - Mandatory beat: Acknowledge + Reflect + Basin metaphor   │
│  - AI instructions: 40-80 words, no questions, closure      │
│  - Character voice: Gentle, poetic, validating              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ OpenAI generates response
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  🤖 AI RESPONSE (VNScene with generated text)               │
│                                                              │
│  The Archivist:                                              │
│  "Fifteen — so young to carry such weight. The basin        │
│   ripples beneath you, reflecting your words back in waves  │
│   of deep violet. You've named the beginning. The world is  │
│   listening."                                                │
│                                                              │
│  [Click to Continue]                                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Store in state.aiResponses:
                  │ { sceneId: 'tutorial_intro', 
                  │   userInput: "My pain started...",
                  │   aiResponse: "Fifteen — so young..." }
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  TRANSITION TO COMBAT (Pure Narration - No AI)              │
│  "A shadow rises from the reflection..."                    │
│  [Click to Continue]                                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  COMBAT PHASE 1 (No AI - Pure Gameplay)                     │
│                                                              │
│  Player chooses actions:                                     │
│  - Soothe → Observe → Soothe                                │
│                                                              │
│  Enemy health: 100 → 75 → 50 → 25                           │
│  Flare: 70 → 65 → 68 → 60                                   │
│  Clarity: 50 → 55 → 60 → 65                                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ When enemy health ≤ 25
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  🤖 MID-BATTLE VN (AI Text Input Scene)                     │
│                                                              │
│  The Archivist:                                              │
│  "The shadow falters — it clutches itself, gasping in sync  │
│   with you. You've seen this pattern before, haven't you?   │
│   Tell me — what did the healers say, when you first spoke  │
│   of this pain?"                                             │
│                                                              │
│  ┌───────────────────────────────────���────────────────────┐ │
│  │ [Textarea: Player types response]                      │ │
│  │ "The doctors told me it was normal period pain and    │ │
│  │  that I was just being dramatic. They said to take    │ │
│  │  ibuprofen and deal with it."                         │ │
│  │                                          [Send Button] │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ POST /api/ai/scene-response
                  │ { sceneId: "mid_battle_vn", 
                  │   userInput: "...",
                  │   playerData: { 
                  │     combatActions: ["Soothe", "Observe", "Soothe"],
                  │     flare: 60, clarity: 65 
                  │   }}
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  🤖 AI RESPONSE (VNScene with context-aware text)           │
│                                                              │
│  The Archivist:                                              │
│  "I see you chose gentleness in battle — soothing the       │
│   shadow rather than fighting it head-on. And yet in life,  │
│   your healers offered no such gentleness. 'Dramatic,'      │
│   they said. The shadow trembles now, not from your blows,  │
│   but from being witnessed. The battle continues."          │
│                                                              │
│  [Click to Continue]                                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Store in state.aiResponses
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  COMBAT PHASE 2 (No AI - Pure Gameplay)                     │
│                                                              │
│  Continue until enemy health = 0                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  VICTORY SCENES (Pure Narration - No AI)                    │
│  Power reveal, Archivist acknowledgment                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  SCROLL OBTAINED (Pure Narration - No AI)                   │
│  "Doctor Scroll Fragment" card animation                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  🤖 POST-COMBAT SEQUENCE (AI-Generated 6-Box VN)           │
│                                                              │
│  [Box 1] "Well fought, traveler. The Ache still lives      │
│           within you, but you've learned to see it."        │
│  [Click]                                                     │
│                                                              │
│  [Box 2] "That scroll fragment you found — it's a piece    │
│           of the Lumen Archives."                           │
│  [Click]                                                     │
│                                                              │
│  [Box 3] "The Archives remember every pain, every journey."│
│  [Click]                                                     │
│                                                              │
│  [Box 4] "Your Ache — it's become something you can work   │
│           with."                                            │
│  [Click]                                                     │
│                                                              │
│  [Box 5] "Here, let me show you."                          │
│  [Click]                                                     │
│                                                              │
│  [Box 6] "You can now *know* your Ache. It holds three     │
│           kinds of wisdom..."                               │
│  [Click]                                                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  🤖 CAMPFIRE SCENE (Extended AI Conversation)               │
│                                                              │
│  [Campfire background with Archivist sprite]                │
│  [Your Ache menu icon visible]                              │
│                                                              │
│  Player clicks Ache menu → Opens dialogue                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  🤖 CAMPFIRE DIALOGUE (Back-and-forth chat)                 │
│                                                              │
│  The Archivist:                                              │
│  "The fire's warm. We have time. How are you feeling after  │
│   that battle with your Ache?"                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [Textarea] "I'm exhausted but also relieved. It felt  │ │
│  │ good to finally name what I've been feeling."         │ │
│  │                                          [Send Button] │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  The Archivist:                                              │
│  "Exhaustion and relief — they often walk together. What    │
│   did it feel like to name it?"                             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [Textarea] "Like I was finally allowed to say it was  │ │
│  │ real. Like someone was actually listening."           │ │
│  │                                          [Send Button] │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Continues for 10-15 more exchanges...]                    │
│                                                              │
│  The Archivist (after ~15 messages):                        │
│  "I've recorded much of your story tonight. When you're     │
│   ready, I can weave these threads into a chronicle for you.│
│   Or we can rest here a while longer."                      │
│                                                              │
│  [Request Physical Chronicle]                               │
│  [Request Emotional Tapestry]                               │
│  [Request Pattern Recognition]                              │
│  [Continue Journey]                                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Player requests Physical Chronicle
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  🤖 REPORT GENERATION                                       │
│                                                              │
│  POST /api/ai/generate-report                               │
│  {                                                           │
│    reportType: "physical",                                  │
│    conversationHistory: [                                   │
│      { role: "user", content: "My pain started at 15..." },│
│      { role: "assistant", content: "Fifteen — so young..." }│
│      // ... all campfire messages                           │
│    ],                                                        │
│    combatData: {                                            │
│      actionsChosen: ["Soothe", "Observe", "Soothe", ...],  │
│      finalStats: { flare: 40, clarity: 75 }                │
│    }                                                         │
│  }                                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ AI generates 300-400 word report
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  📜 PHYSICAL CHRONICLE (Readable Document)                  │
│                                                              │
│  Your body speaks in a language of aches and sharp          │
│  reminders. Over our time together, you've described a pain │
│  that began at fifteen — during your first menstruation,    │
│  severe enough to keep you from school. This was no gentle  │
│  beginning, but an announcement: something in your body was │
│  refusing to be ignored.                                    │
│                                                              │
│  The pain you carry settles primarily in your lower abdomen │
│  and radiates to your back — two places that hold so much.  │
│  You've described it as sharp during your cycle, but also   │
│  present in quieter ways between. It's not constant, but    │
│  it's never fully gone.                                     │
│                                                              │
│  [... continues for 2 more paragraphs ...]                  │
│                                                              │
│  [Download PDF] [Share with Doctor] [Back to Campfire]     │
└─────────────────────────────────────────────────────────────┘
```

## Key AI Integration Points

### 1️⃣ Tutorial Intro Scene
- **Input:** Free text about pain onset
- **AI Task:** Acknowledge + Basin metaphor + Transition
- **Advances to:** Combat

### 2️⃣ Mid-Battle VN Scene
- **Input:** Free text about medical experiences
- **Context:** Combat actions, Flare, Clarity
- **AI Task:** Reference combat approach + Validate + Return to battle
- **Advances to:** Combat Phase 2

### 3️⃣ Campfire Conversation
- **Input:** 15-20 back-and-forth messages
- **AI Task:** Gather diagnostic data through natural conversation
- **Ends with:** Offer to generate reports

### 4️⃣ Report Generation
- **Input:** Full conversation history + combat data
- **AI Task:** Generate 300-400 word chronicle using patient's specific words
- **Output:** Downloadable/shareable document

## Plot Beat Guarantees

```
User Input: "I don't know, maybe when I was 20?"

❌ BAD AI Response (no beat):
"That's interesting. Can you tell me more about when you were 20?"
[Doesn't advance, asks questions, stays in scene]

✅ GOOD AI Response (hits beat):
"Twenty — later than some, earlier than you deserved to name it. 
The basin ripples with your uncertainty, but patterns are forming. 
The world is listening."
[Acknowledges input, uses metaphor, signals transition]
```

## Data Journey

```
Player types → Stored in state → Passed to next scene → 
Informs AI response → Added to conversation history → 
Used in report generation → Appears in final chronicle
```

Every word the player types becomes part of their personalized medical narrative.

---

**This is a guided conversation that FEELS free while maintaining perfect narrative structure.**
