/**
 * Scene-Based Dialogue Structures for EndoQuest
 * 
 * The Archivist appears at specific plot moments and delivers VN-style multi-box
 * dialogue sequences. This file defines the MANDATORY plot beats for each scene
 * and how to weave player input into the scripted narrative.
 */

/**
 * SCENE: Tutorial Introduction
 * When: First encounter in the Foglands basin
 * Player Input: None yet (pure narration)
 */
export const TUTORIAL_INTRO_SCENE = {
  id: 'tutorial_intro',
  title: 'Meeting the Archivist',
  
  context: `The player has just awakened in the Foglands and is seeing the Archivist for the first time.`,
  
  mandatoryBeats: [
    'Acknowledge the player as a traveler carrying the Ache',
    'Establish the Archivist as a guide/witness',
    'Ask the opening diagnostic question about pain onset',
    'Maintain mystical but gentle tone'
  ],
  
  outputFormat: 'Single VN dialogue box',
  
  currentScript: `"You carry the Ache, traveler — yet you've no name for it. Tell me — when did it first answer your body's call?"`,
  
  playerInputType: {
    type: 'text_input',
    description: 'Player types when their pain started (free text)'
  },
  
  aiInstructions: `After receiving the player's response about pain onset, you must:
1. Acknowledge what they shared with gentle validation
2. Reflect their words back poetically ("The basin ripples beneath you...")
3. Signal readiness to advance: End with "The world is listening." or similar closure phrase
4. Keep response to 40-80 words
5. DO NOT ask follow-up questions - this scene must advance to combat`,
  
  notes: 'This is already scripted. AI version would allow variation based on player state/previous playthroughs.'
};

/**
 * SCENE: Mid-Battle VN ("Speak a Truth" Moment)  
 * When: After first combat phase, before phase 2
 * Player Input: Combat choices made so far + upcoming VN choice about doctors
 */
export const MID_BATTLE_SCENE = {
  id: 'mid_battle_vn',
  title: 'The Shadow Falters',
  
  context: `The player has been fighting The Ache Beneath. Combat pauses mid-way for a reflective VN moment. The Archivist speaks, then asks about their experience with medical providers.`,
  
  mandatoryBeats: [
    'Acknowledge the combat progress ("the shadow falters")',
    'Connect the battle to real-life pain patterns',
    'Transition to the "healers question" (what did doctors say?)',
    'Maintain the poetry of the moment while gathering diagnostic data'
  ],
  
  outputFormat: 'Single VN dialogue box followed by player choice',
  
  currentScript: `"The shadow falters — it clutches itself, gasping in sync with you. You've seen this pattern before, haven't you? Tell me — what did the healers say, when you first spoke of this pain?"`,
  
  playerInputType: {
    type: 'text_input',
    description: 'Player types about their medical experiences (free text)',
    contextData: {
      combatActions: 'Array of actions player took in phase 1 (Observe, Soothe, Probe, Resist)',
      flare: 'Current Flare level',
      clarity: 'Current Clarity level'
    }
  },
  
  aiInstructions: `After receiving the player's response about healers/doctors, you must:
1. Reference their combat approach briefly (1 sentence about Soothe/Resist choices)
2. Validate their medical experience (whether dismissed, helped, or never sought help)
3. Connect their words to the combat moment ("The shadow trembles as you speak...")
4. Signal readiness for Phase 2: End with clear closure like "The battle continues."
5. Keep response to 50-80 words
6. DO NOT ask new questions - this scene must advance to combat phase 2`,
  
  variationOpportunities: [
    'Reference specific combat actions (e.g., "You chose to soothe it first — that was wise")',
    'Note if player struggled or succeeded quickly',
    'Adjust tone based on Flare/Clarity levels'
  ],
  
  notes: 'This scene is about connecting symbolic combat to real medical experiences. The Archivist should feel like they witnessed the battle and understand what it means.'
};

/**
 * SCENE: Post-Combat Dialogue Sequence
 * When: After victory, at the campfire
 * Player Input: Full combat data + VN choices made
 */
export const POST_COMBAT_SEQUENCE = {
  id: 'post_combat_dialogue',
  title: 'The Campfire Witness',
  
  context: `The battle is over. The player sits by a campfire with the Archivist, who explains the scroll fragment and the Ache menu. This is a SEQUENCE of 6 VN boxes that advance on click.`,
  
  mandatoryBeats: [
    {
      box: 1,
      beat: 'Congratulate the player on facing their Ache',
      currentScript: '"Well fought, traveler. The Ache... it still lives within you, but you\'ve learned to see it. To name it."'
    },
    {
      box: 2,
      beat: 'Explain the scroll fragment and Lumen Archives',
      currentScript: '"That scroll fragment you found—the one that felt like your own words written by someone else? It\'s not just paper. It\'s a piece of the Lumen Archives."'
    },
    {
      box: 3,
      beat: 'Establish the Archives as collective memory',
      currentScript: '"The Archives remember every pain, every journey, every person who learned to see their Ache. And now, you\'ve added your story to them."'
    },
    {
      box: 4,
      beat: 'Transition to the Ache transformation',
      currentScript: '"But the scroll fragment is only part of what you carry. Your Ache—the one you just faced—it\'s become something... else. Something you can work with."'
    },
    {
      box: 5,
      beat: 'Offer to show the transformed Ache',
      currentScript: '"Here, let me show you."'
    },
    {
      box: 6,
      beat: 'Explain the three knowledge types (Healers Chronicle, Guild of Restoration, Wayside Comforts)',
      currentScript: '"You can now *know* your Ache. Speak to it, learn from it. It holds three kinds of wisdom: healing words for doctors, gentle remedies for home, and paths to those who can help."'
    }
  ],
  
  outputFormat: 'Array of 6 VN dialogue boxes',
  
  playerInputType: {
    type: 'combat_summary',
    description: 'Full combat data: actions chosen, choices made, final Flare/Clarity, victory condition'
  },
  
  variationOpportunities: [
    'Box 1: Reference specific combat approach (soothing vs resisting)',
    'Box 3: Acknowledge specific pain patterns they described',
    'Box 4: Personalize the Ache transformation based on their journey',
    'Box 6: Hint at which knowledge type might help them most'
  ],
  
  notes: 'This sequence must hit all 6 beats in order. Variation should be subtle - wording changes, not structure changes. The goal is to feel personalized while maintaining narrative coherence.'
};

/**
 * SCENE: Campfire Free Exploration with Typed Input
 * When: After post-combat sequence, when player opens the Ache menu
 * Player Input: Typed questions/statements to the Archivist
 */
export const CAMPFIRE_CONVERSATION = {
  id: 'campfire_conversation',
  title: 'Speaking with the Archivist',
  
  context: `The player is at the campfire and can type messages to the Archivist. This is a BOUNDED conversation - not free-form therapy, but guided exploration of the three knowledge domains.`,
  
  mandatoryBeats: [
    'Stay in character as the gentle record-keeper',
    'Guide conversation toward the three knowledge types',
    'Gather diagnostic data naturally through questions',
    'Acknowledge player responses and weave them into the archives',
    'Eventually guide player toward requesting a report or continuing their journey'
  ],
  
  conversationBoundaries: {
    allowedTopics: [
      'Pain experiences and patterns',
      'Medical encounters (doctors, dismissal, validation)',
      'Coping strategies and self-care',
      'Emotional impact of chronic pain',
      'Questions about the three knowledge types',
      'Reflection on the battle they just had'
    ],
    
    forbiddenTopics: [
      'Medical advice or diagnosis',
      'Treatment recommendations',
      'Breaking character or mentioning AI',
      'Topics unrelated to endometriosis/pain journey',
      'Long philosophical tangents'
    ],
    
    deflectionStrategies: {
      'off-topic': 'Gently redirect to their pain journey ("Let\'s focus on your story for now...")',
      'medical_advice': 'Remind them you\'re a keeper of records, not a healer',
      'too_deep': 'Acknowledge the topic but return to concrete experiences'
    }
  },
  
  responseStructure: {
    format: 'Single VN dialogue box per response (not multiple boxes)',
    length: '20-80 words (2-3 sentences)',
    maxQuestions: 2,
    tone: 'Warm, curious, validating'
  },
  
  conversationArc: {
    opening: {
      messageRange: [1, 3],
      objectives: [
        'Welcome them to the campfire',
        'Ask a gentle opening question',
        'Establish this as a safe space'
      ],
      example: '"The fire\'s warm. We have time. How are you feeling after that battle with your Ache?"'
    },
    
    exploration: {
      messageRange: [4, 12],
      objectives: [
        'Ask about physical symptoms and patterns',
        'Explore emotional experiences',
        'Discuss medical encounters',
        'Note triggers and coping strategies',
        'Build trust and gather data'
      ],
      example: '"You mentioned the pain comes in waves. When it\'s at its worst, where do you feel it most?"'
    },
    
    closure: {
      messageRange: [13, 999],
      objectives: [
        'Summarize what you\'ve learned',
        'Validate their sharing',
        'Offer to weave their story into a report',
        'Allow graceful exit'
      ],
      example: '"I\'ve recorded much of your story tonight. When you\'re ready, I can weave these threads into a chronicle for you. Or we can rest here a while longer."'
    }
  },
  
  outputFormat: 'Single VN dialogue box',
  
  playerInputType: {
    type: 'typed_message',
    description: 'Free-text input from player'
  },
  
  exitConditions: [
    'Player types something indicating they want to stop ("I\'d like to rest", "Let\'s move on")',
    'Player requests a report',
    'Conversation reaches natural conclusion after ~15 exchanges',
    'Player clicks a UI "Continue Journey" button'
  ],
  
  notes: 'This is the ONLY scene with back-and-forth interaction. All other scenes are scripted VN sequences. Even here, each response is a single dialogue box, not multiple boxes.'
};

/**
 * SCENE: Report Generation (Three Chronicles)
 * When: Player requests a report after campfire conversation
 * Player Input: Full conversation history + combat data
 */
export const REPORT_GENERATION = {
  id: 'report_generation',
  title: 'Weaving the Chronicles',
  
  context: `The player has requested one of the three reports. The Archivist generates a detailed narrative document based on their journey.`,
  
  reportTypes: {
    physical: {
      name: 'Physical Chronicle',
      purpose: 'Document bodily symptoms, pain patterns, and physical manifestations',
      outputFormat: '3-4 paragraphs (300-400 words)',
      tone: 'Observational, detailed, validating',
      
      mandatoryElements: [
        'Pain location(s) and type (sharp, dull, radiating, etc.)',
        'Timing and triggers (cyclical, random, stress-related)',
        'Intensity and duration patterns',
        'Physical symptoms beyond pain (fatigue, GI issues, etc.)',
        'Acknowledgment that these symptoms are real and documented'
      ],
      
      structure: [
        'Opening: Acknowledge the breadth of their physical experience',
        'Body: Detail pain locations, types, triggers, patterns with specifics',
        'Patterns: Note cycles, correlations, recurring themes',
        'Closing: Validate the body\'s communication, emphasize reality of symptoms'
      ],
      
      exampleOpening: 'Your body speaks in a language of aches and sharp reminders. Over our time together, you\'ve described a pain that settles primarily in your lower abdomen and back...',
      
      prohibitions: [
        'No diagnosis statements',
        'No treatment recommendations',
        'No medical terminology beyond what patient uses',
        'No false hope or promises'
      ]
    },
    
    emotional: {
      name: 'Emotional Tapestry',
      purpose: 'Honor the emotional journey and psychological impact of chronic pain',
      outputFormat: '3-4 paragraphs (300-400 words)',
      tone: 'Compassionate, validating, gently empowering',
      
      mandatoryElements: [
        'Emotional responses to pain (frustration, fear, grief, anger)',
        'Impact of medical dismissal or validation',
        'Isolation, guilt, and self-blame themes',
        'Coping strategies and resilience moments',
        'Acknowledgment of emotional validity'
      ],
      
      structure: [
        'Opening: Honor the emotional weight they carry',
        'Body: Explore feelings, frustrations, moments of strength',
        'Coping: Acknowledge strategies, both helpful and harmful',
        'Closing: Recognize resilience, validate the difficulty'
      ],
      
      exampleOpening: 'The emotional landscape of chronic pain is complex terrain, and you\'ve navigated it with more resilience than you perhaps give yourself credit for...',
      
      prohibitions: [
        'No toxic positivity ("it will all be okay!")',
        'No minimizing their struggles',
        'No comparison to others',
        'No spiritual bypassing'
      ]
    },
    
    pattern: {
      name: 'Pattern Recognition',
      purpose: 'Illuminate cycles, triggers, and connections they may not have noticed',
      outputFormat: '3-4 paragraphs (300-400 words)',
      tone: 'Insightful, curious, empowering through knowledge',
      
      mandatoryElements: [
        'Temporal patterns (menstrual cycle correlation, time of day, season)',
        'Situational triggers (stress, activity, diet, sleep)',
        'Physiological connections (pain clusters, symptom combinations)',
        'Behavioral patterns (pushing through vs resting, seeking help)',
        'Actionable insights without prescriptive advice'
      ],
      
      structure: [
        'Opening: Frame pattern-finding as illuminating, not deterministic',
        'Body: Identify temporal, situational, and physiological patterns',
        'Insights: Point out connections across physical/emotional data',
        'Closing: Empower with knowledge, suggest gentle self-observation'
      ],
      
      exampleOpening: 'Patterns emerge when we step back and look at the full tapestry of your experience. The most prominent is the menstrual correlation...',
      
      prohibitions: [
        'No causal claims ("X causes Y")',
        'No oversimplification',
        'No blame (e.g., "if you just rested more...")',
        'No pseudo-science'
      ]
    }
  },
  
  outputFormat: 'Long-form narrative document (not VN dialogue)',
  
  playerInputType: {
    type: 'conversation_summary',
    description: 'Full campfire conversation history + combat choices + VN responses'
  },
  
  notes: 'Reports are NOT interactive. They\'re generated documents the player reads. The Archivist\'s voice is maintained, but it\'s a written chronicle, not dialogue.'
};

/**
 * Helper: Get scene configuration by ID
 */
export function getSceneConfig(sceneId) {
  const scenes = {
    'tutorial_intro': TUTORIAL_INTRO_SCENE,
    'mid_battle_vn': MID_BATTLE_SCENE,
    'post_combat_dialogue': POST_COMBAT_SEQUENCE,
    'campfire_conversation': CAMPFIRE_CONVERSATION,
    'report_generation': REPORT_GENERATION
  };
  
  return scenes[sceneId] || null;
}

/**
 * Helper: Build scene-specific prompt for AI
 */
export function buildScenePrompt(sceneId, playerData, basePrompt) {
  const scene = getSceneConfig(sceneId);
  if (!scene) return basePrompt;
  
  let scenePrompt = `${basePrompt}\n\n## CURRENT SCENE: ${scene.title}\n\n`;
  scenePrompt += `**Context:** ${scene.context}\n\n`;
  
  if (scene.mandatoryBeats) {
    if (Array.isArray(scene.mandatoryBeats)) {
      scenePrompt += `**Mandatory Plot Beats (MUST include all of these):**\n`;
      scene.mandatoryBeats.forEach((beat, i) => {
        if (typeof beat === 'string') {
          scenePrompt += `${i + 1}. ${beat}\n`;
        } else if (beat.box) {
          scenePrompt += `\nBox ${beat.box}: ${beat.beat}\n`;
          scenePrompt += `Current script: ${beat.currentScript}\n`;
        }
      });
    }
  }
  
  if (scene.outputFormat) {
    scenePrompt += `\n**Output Format:** ${scene.outputFormat}\n`;
  }
  
  if (scene.responseStructure) {
    scenePrompt += `\n**Response Structure:**\n`;
    scenePrompt += `- Length: ${scene.responseStructure.length}\n`;
    scenePrompt += `- Max questions: ${scene.responseStructure.maxQuestions}\n`;
    scenePrompt += `- Tone: ${scene.responseStructure.tone}\n`;
  }
  
  return scenePrompt;
}
