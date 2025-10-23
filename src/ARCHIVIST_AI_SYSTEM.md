# Archivist AI System Architecture

## Overview

The Archivist AI system is designed for **scene-based VN storytelling with plot constraints**, NOT free-form chatbot conversation. The AI generates dialogue that feels personalized while always hitting mandatory story beats.

## Core Principles

### 1. VN-Style Multi-Box Dialogue
The Archivist speaks in **sequences of dialogue boxes** that advance on click, like a visual novel:

```
[Click] "Well fought, traveler."
[Click] "The Ache... it still lives within you, but you've learned to see it."
[Click] "To name it."
```

**NOT** back-and-forth chat:
```
❌ User: "How are you?"
❌ Archivist: "I'm well, how are you?"
❌ User: "I'm okay I guess"
```

### 2. Plot-Constrained Scenes
Every Archivist appearance has **mandatory beats** that MUST occur regardless of player input:

**Example:** Post-Combat Sequence
- Beat 1: Congratulate on victory ✅ REQUIRED
- Beat 2: Explain scroll fragment ✅ REQUIRED
- Beat 3: Introduce Lumen Archives ✅ REQUIRED
- Beat 4-6: ... ✅ REQUIRED

Player choices can **flavor** how these beats are delivered, but can't skip or reorder them.

### 3. Bounded Interaction
Only ONE scene has true back-and-forth interaction: **Campfire Conversation**.

Even then, it's bounded:
- 15-20 message maximum
- Guided toward three knowledge domains
- Single dialogue box per response (not multi-box sequences)
- Must eventually close conversation gracefully

## Scene Types

### Scene Type A: Pure Narration (No AI)
**Examples:** Awakening, Transition to Combat

These are fully scripted and don't need AI. They're hardcoded in the React components.

### Scene Type B: AI-Enhanced VN Sequences
**Examples:** Mid-Battle VN, Post-Combat Dialogue

The AI generates multiple dialogue boxes that incorporate player data while hitting all plot beats.

**API Endpoint:** `POST /api/ai/generate-vn-sequence`

**Input:**
```json
{
  "sceneId": "mid_battle_vn",
  "playerData": {
    "combatActions": ["Soothe", "Observe", "Resist"],
    "flare": 45,
    "clarity": 72
  }
}
```

**Output:**
```json
{
  "dialogue": "The shadow falters — it clutches itself, gasping in sync with you. I see you chose to soothe it first. That was wise. Tell me — what did the healers say, when you first spoke of this pain?",
  "outputFormat": "Single VN dialogue box followed by player choice"
}
```

**How it works:**
1. AI receives the mandatory plot beats for the scene
2. AI receives player combat choices/stats
3. AI weaves player data into the scripted moment
4. Output maintains narrative flow while feeling personalized

### Scene Type C: Interactive Campfire Conversation
**Example:** Post-combat campfire exploration

The ONLY scene with true back-and-forth interaction.

**API Endpoint:** `POST /api/ai/campfire-chat`

**Input:**
```json
{
  "playerId": "player-123",
  "message": "The pain started when I was 15...",
  "conversationHistory": [...]
}
```

**Output:**
```json
{
  "response": "Fifteen is so young to begin carrying such weight. Where did the pain first make itself known?",
  "metadata": {
    "messageCount": 4,
    "arcStage": "exploration",
    "shouldPromptClosure": false
  }
}
```

**Conversation Arc:**
1. **Opening (messages 1-3):** Welcome, establish safety, gentle opening question
2. **Exploration (messages 4-12):** Gather physical/emotional/pattern data
3. **Closure (messages 13+):** Summarize, validate, offer report, allow exit

**Boundaries:**
- Response length: 20-80 words (2-3 sentences)
- Max 2 questions per response
- Stay focused on pain journey (not general therapy)
- Guide toward three knowledge types
- Graceful exit around message 15-20

### Scene Type D: Report Generation
**Examples:** Physical Chronicle, Emotional Tapestry, Pattern Recognition

Long-form narrative documents (300-400 words) generated from conversation + combat data.

**API Endpoint:** `POST /api/ai/generate-report`

**Output Format:**
- 3-4 flowing paragraphs
- Archivist's voice
- Specific details from player's story
- Validating and insightful tone
- NO medical advice/diagnosis

## File Structure

```
/server/
├── prompts/
│   ├── archivist-personality.js   # Character voice, speech patterns, boundaries
│   └── scene-structures.js        # Scene definitions with mandatory beats
└── routes/
    ├── ai.js                       # API endpoints
    └── playerData.js               # Data storage
```

### `archivist-personality.js`
Defines WHO the Archivist is:
- Core identity and values
- Speech patterns (vocabulary, tone, sentence structure)
- Response length guidelines (20-80 words)
- Hard boundaries (never give medical advice, never break character)
- Good/bad dialogue examples

### `scene-structures.js`
Defines WHEN and HOW the Archivist appears:
- Scene configurations with mandatory plot beats
- Output format requirements (single box vs multi-box sequence)
- Player input types and how to incorporate them
- Conversation arc definitions (for campfire scene)
- Report templates with required elements

## Example: Mid-Battle VN Scene

**Context:** Player has fought The Ache Beneath for ~3 turns. Combat pauses. VN scene plays.

**Current Scripted Version:**
```
"The shadow falters — it clutches itself, gasping in sync with you. 
You've seen this pattern before, haven't you? 
Tell me — what did the healers say, when you first spoke of this pain?"
```

**AI-Enhanced Version:**

*Player used Soothe → Observe → Soothe*
```
"The shadow eases under your touch — see how it responds when you meet it with gentleness? 
You've seen this pattern before, haven't you? 
Tell me — what did the healers say, when you first spoke of this pain?"
```

*Player used Resist → Resist → Probe*
```
"You fought hard against it, and it fought back harder. The shadow trembles now, but so do you. 
You've seen this pattern before, haven't you? 
Tell me — what did the healers say, when you first spoke of this pain?"
```

**Notice:**
- The core beat ("ask about healers") ALWAYS happens
- The narrative flavor adjusts based on combat approach
- Still one dialogue box, still advances to the same VN choice scene
- Feels personalized without breaking story flow

## Example: Campfire Conversation

**Turn 1 (Opening):**
```
User: "I'm exhausted from that battle."

Archivist: "The fire's warm. We have time. How are you feeling, 
beyond the exhaustion?"
```

**Turn 5 (Exploration):**
```
User: "The pain is mostly in my lower abdomen and back."

Archivist: "Lower abdomen and back — two places that carry so much. 
Does it stay there, or does it travel?"
```

**Turn 15 (Closure):**
```
User: "I think I've shared everything I can tonight."

Archivist: "You've given the archives much to hold. When you're ready, 
I can weave these threads into a chronicle for you. Or we can simply rest."
```

**Notice:**
- Each response is SHORT (2-3 sentences)
- Questions are gentle and open-ended
- Conversation naturally guides toward closure
- Player retains agency to end conversation

## Integration Guidelines

### For Frontend Developers:

1. **Scripted VN Scenes (tutorial intro, most dialogue):**
   - Use hardcoded dialogue unless you specifically want variation
   - Call `/generate-vn-sequence` only if you want AI to incorporate player choices

2. **Campfire Conversation:**
   - Call `/campfire-chat` for each user message
   - Display response in a single VN dialogue box
   - Show typing indicator while waiting
   - After ~15 messages, show a "Continue Journey" button option

3. **Reports:**
   - Call `/generate-report` when player requests Physical Chronicle, Emotional Tapestry, or Pattern Recognition
   - Display as a readable document (not VN dialogue)
   - Allow scrolling for longer content

### For Prompt Engineers:

1. **Always test against the mandatory beats:**
   - Does the AI hit ALL required plot points?
   - Does it stay within the scene's purpose?
   - Does it maintain the Archivist's voice?

2. **Length is critical:**
   - VN responses: 1-3 sentences max
   - Campfire chat: 20-80 words (2-3 sentences)
   - Reports: 300-400 words (3-4 paragraphs)

3. **Boundaries are non-negotiable:**
   - Never medical advice
   - Never break character
   - Never go off-topic
   - Never make promises about healing

## Testing Checklist

### Scene Generation Test:
- [ ] AI hits all mandatory beats in correct order
- [ ] Output format matches requirement (single box vs array)
- [ ] Player data is incorporated naturally
- [ ] Tone matches Archivist personality
- [ ] Length is appropriate for scene type

### Campfire Conversation Test:
- [ ] Opening (1-3): Warm welcome, establishes safety
- [ ] Exploration (4-12): Asks diagnostic questions naturally
- [ ] Closure (13+): Summarizes, offers report, allows exit
- [ ] Each response is 20-80 words
- [ ] Max 2 questions per response
- [ ] Stays on topic (pain journey)

### Report Generation Test:
- [ ] 300-400 words (3-4 paragraphs)
- [ ] Includes all mandatory elements for report type
- [ ] Uses specific details from player's story
- [ ] Follows required structure
- [ ] Maintains Archivist's voice
- [ ] NO medical advice/diagnosis

## Fallback Handling

If OpenAI API fails, each endpoint returns a fallback response:

```json
{
  "error": "Failed to generate response",
  "fallback": "The threads of memory seem tangled... give me a moment to gather my thoughts."
}
```

Frontend should:
1. Display the fallback dialogue
2. Allow player to retry
3. Log the error for debugging
4. Optionally fall back to hardcoded script

## Future Enhancements

1. **Dynamic Plot Variation:**
   - Multiple story paths based on accumulated choices
   - Different Archivist dialogue for repeat players
   - Branching narratives with AI-generated bridges

2. **Emotional State Tracking:**
   - Adjust Archivist's tone based on player's emotional state
   - More validation if player seems distressed
   - More exploratory if player seems engaged

3. **Memory Across Sessions:**
   - Database storage for conversations
   - Archivist remembers previous encounters
   - "Last time you mentioned..." callbacks

4. **Multi-Language Support:**
   - Generate dialogue in player's language
   - Maintain personality across translations
   - Cultural adaptation of metaphors
