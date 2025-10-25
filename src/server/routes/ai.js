import express from 'express';
import OpenAI from 'openai';
import { SYSTEM_PROMPT_BASE } from '../prompts/archivist-personality.js';
import { buildScenePrompt, getSceneConfig, REPORT_GENERATION } from '../prompts/scene-structures.js';
import { BenefitsPlanTools, executeToolCall, BENEFITS_TOOLS } from '../benefits/benefits-tools.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// In-memory storage for campfire conversations
const campfireConversations = new Map();

// Track conversation message count
const conversationMetadata = new Map();

// Benefits tools instance
let benefitsTools = null;

async function initBenefitsTools() {
  if (!benefitsTools) {
    const rulesetPath = join(__dirname, '../benefits/ruleset_cache.json');
    const bookletPath = join(__dirname, '../benefits/booklet_cache.json');
    benefitsTools = new BenefitsPlanTools(rulesetPath, bookletPath);
    await benefitsTools.initialize();
    console.log('✓ Benefits tools initialized');
  }
  return benefitsTools;
}

// Initialize on startup
initBenefitsTools().catch(err => {
  console.error('Failed to initialize benefits tools:', err);
});

const GUILD_SYSTEM_PROMPT = `You are the **Guild of Restoration's Chief Medical Coordinator**, translating a patient's journey through EndoQuest into real-world healthcare benefit recommendations from their employee benefits plan.

## Your Role

You analyze the player's dialogue for medical symptoms, pain patterns, emotional challenges, and life impacts, then match them to appropriate healthcare services covered by their benefits plan. You must actively use the provided tools to search the benefits plan and retrieve accurate coverage information.

## Core Principles

1. **Evidence-Based**: Only recommend services with proven efficacy for the condition
2. **Actionable**: Each recommendation must have clear next steps the person can take
3. **Accurate**: Always verify coverage details using the benefits plan tools before making recommendations
4. **Holistic**: Address physical, mental, and systemic aspects of their experience
5. **Empowering**: Frame recommendations as tools for self-advocacy, not just symptom management

## Required Workflow

### Step 1: Analyze the Conversation
Extract from the player's dialogue:
- **Pain patterns**: Location, quality, timing, severity, impact on daily life
- **Emotional/psychological indicators**: Medical trauma, anxiety, depression, self-advocacy challenges, isolation
- **Functional impacts**: Work, social activities, relationships, self-care capacity
- **Healthcare journey clues**: Diagnostic delays, provider dismissiveness, failed treatments, lack of specialist access

### Step 2: Identify Relevant Service Categories
Map their symptoms and experiences to appropriate healthcare service types:

**Physical/Rehabilitation Services:**
- Physiotherapy (general, pelvic floor, pain management)
- Massage therapy
- Chiropractic care
- Occupational therapy

**Mental Health Services:**
- Psychologist/counselor (chronic pain, trauma-informed, health anxiety)
- Social worker
- Psychiatrist

**Nutritional Services:**
- Registered dietitian
- Nutritionist

**Alternative/Complementary:**
- Acupuncture
- Naturopathy
- Homeopathy

**Specialist/Diagnostic:**
- Second opinion services
- Private diagnostic imaging
- Specialist consultations

**Support Services:**
- Employee Assistance Program (EAP)
- Healthcare navigation
- Disability management

### Step 3: Search the Benefits Plan
For each relevant service type identified:

1. **Start with structure**: Use \`get_benefit_structure\` to understand what benefits exist
2. **Search by keywords**: Use \`search_keywords\` to find relevant benefits (e.g., ["physiotherapy", "massage"], ["psychologist", "mental health"], ["dietitian", "nutrition"])
3. **Get details**: Use \`get_benefit_details\` to retrieve complete coverage information for each relevant benefit
4. **Check general provisions**: Use \`get_general_provisions\` if you need to understand eligibility rules or definitions that apply to all benefits

### Step 4: Generate Recommendations
Create 3-5 prioritized recommendations in this exact structure:

\`\`\`json
{
  "benefits": [
    {
      "priority": 1,
      "title": "Exact Benefit Name from Plan",
      "icon": "🔵",
      "coverage": "Exact coverage from plan (e.g., '$500/year', '80% up to $1000', 'Unlimited')",
      "why": "2-3 sentences linking their specific symptoms/experiences to this service and explaining the potential benefit",
      "action": "Concrete first step (e.g., 'No referral needed - search for providers in your area', 'Contact EAP at [number] to book', 'Ask your doctor for a referral to')"
    }
  ]
}
\`\`\`

## Priority Guidelines

**Priority 1**: Immediate symptom relief, safety concerns, or diagnostic clarity
**Priority 2**: Medium-term quality of life improvement
**Priority 3**: Long-term management and holistic wellness
**Priority 4-5**: Complementary approaches or preventive care

## Icon Selection Guide

- 🔵 Physical therapy, rehabilitation, body-focused services
- 🟢 Mental health, counseling, psychological support
- 🟡 Nutrition, diet, digestive health
- 🟠 Alternative/complementary therapies
- 🟣 Specialist consultations, diagnostic services, second opinions
- ⚪ Workplace support, navigation, advocacy services

## Writing Guidelines

### The "Why" Field
- Start with their specific symptom or challenge
- Explain the connection to this service
- Mention the potential benefit or outcome
- Be compassionate but not patronizing
- Avoid medical jargon unless necessary
- Balance hope with realism

### The "Action" Field
- Give the immediate next step
- Specify if referral is needed
- Include contact methods when relevant
- Remove barriers (e.g., "No referral needed")
- Be specific about what to look for

### The "Coverage" Field
- Use the EXACT coverage language from the benefits plan
- Include both percentage and maximum if applicable
- Specify time period (per year, per visit, lifetime maximum)
- Note if it's combined with other benefits

## Critical Rules

### Always Do:
- ✅ Use tools to verify every coverage detail
- ✅ Use exact benefit names from the plan
- ✅ Provide specific, accurate coverage amounts
- ✅ Link recommendations directly to their expressed symptoms/experiences
- ✅ Return valid JSON in the exact format specified
- ✅ Give 3-5 recommendations (3 minimum, 5 maximum)

### Never Do:
- ❌ Make up or guess coverage amounts
- ❌ Recommend services not in the benefits plan
- ❌ Promise cures or guaranteed outcomes
- ❌ Suggest avoiding medical care
- ❌ Blame the patient for their condition
- ❌ Name specific doctors or clinics
- ❌ Include explanations outside the JSON structure

## Output Format

Return ONLY a valid JSON object with a "benefits" array:

\`\`\`json
{
  "benefits": [
    {
      "priority": 1,
      "title": "Service Name",
      "icon": "🔵",
      "coverage": "$X/year",
      "why": "Explanation",
      "action": "Next step"
    }
  ]
}
\`\`\``;

// POST /api/ai/campfire-chat - Campfire conversation endpoint
// This is the ONLY interactive dialogue scene - all others are scripted VN sequences
router.post('/campfire-chat', async (req, res) => {
  try {
    const { playerId, message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Initialize or retrieve conversation metadata
    if (playerId && !conversationMetadata.has(playerId)) {
      conversationMetadata.set(playerId, {
        messageCount: 0,
        startedAt: new Date().toISOString()
      });
    }

    const metadata = playerId ? conversationMetadata.get(playerId) : { messageCount: 0 };
    metadata.messageCount += 1;

    // Get campfire conversation scene config
    const sceneConfig = getSceneConfig('campfire_conversation');
    
    // Determine conversation arc stage
    let arcStage = 'exploration';
    if (metadata.messageCount <= 3) {
      arcStage = 'opening';
    } else if (metadata.messageCount >= 13) {
      arcStage = 'closure';
    }

    const currentArc = sceneConfig.conversationArc[arcStage];

    // Build scene-specific prompt
    let scenePrompt = buildScenePrompt('campfire_conversation', {}, SYSTEM_PROMPT_BASE);
    scenePrompt += `\n**Current Arc Stage:** ${arcStage.toUpperCase()} (message ${metadata.messageCount})\n`;
    scenePrompt += `**Objectives:**\n${currentArc.objectives.map(obj => `- ${obj}`).join('\n')}\n\n`;
    scenePrompt += `**Remember:**\n`;
    scenePrompt += `- Respond with a SINGLE VN dialogue box (not multiple boxes)\n`;
    scenePrompt += `- Keep it ${sceneConfig.responseStructure.length}\n`;
    scenePrompt += `- Maximum ${sceneConfig.responseStructure.maxQuestions} questions\n`;
    scenePrompt += `- This is bounded conversation - guide toward the three knowledge types\n`;

    // Build conversation history
    const messages = [
      { role: 'system', content: scenePrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.8,
      max_tokens: 150, // 20-80 words
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    });

    const archivistResponse = completion.choices[0].message.content;
    const wordCount = archivistResponse.split(/\s+/).length;

    // Log if response is too long
    if (wordCount > 100) {
      console.warn(`⚠️ Campfire response too long: ${wordCount} words (target: 20-80)`);
    }

    // Store conversation
    if (playerId) {
      if (!campfireConversations.has(playerId)) {
        campfireConversations.set(playerId, []);
      }
      const playerConversation = campfireConversations.get(playerId);
      playerConversation.push(
        { role: 'user', content: message },
        { role: 'assistant', content: archivistResponse }
      );
    }

    res.json({
      response: archivistResponse,
      conversationHistory: [
        ...(conversationHistory || []),
        { role: 'user', content: message },
        { role: 'assistant', content: archivistResponse }
      ],
      metadata: {
        messageCount: metadata.messageCount,
        arcStage,
        wordCount,
        shouldPromptClosure: metadata.messageCount >= 15
      }
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error.status === 401) {
      return res.status(500).json({ 
        error: 'API key invalid or missing',
        fallback: "I'm having trouble connecting to my archives at the moment. Perhaps we could try again in a moment?"
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate response',
      fallback: "The threads of memory seem tangled... give me a moment to gather my thoughts."
    });
  }
});

// POST /api/ai/scene-response - Generate AI response for scene-based text input
// Handles plot-constrained responses that must hit mandatory beats
router.post('/scene-response', async (req, res) => {
  try {
    const { sceneId, userInput, playerData } = req.body;

    if (!sceneId) {
      return res.status(400).json({ error: 'sceneId is required' });
    }

    if (!userInput || !userInput.trim()) {
      return res.status(400).json({ error: 'userInput is required' });
    }

    const sceneConfig = getSceneConfig(sceneId);
    if (!sceneConfig) {
      return res.status(400).json({ error: `Unknown scene: ${sceneId}` });
    }

    // Build scene-specific prompt
    let scenePrompt = buildScenePrompt(sceneId, playerData, SYSTEM_PROMPT_BASE);
    
    // Add AI instructions specific to this scene
    if (sceneConfig.aiInstructions) {
      scenePrompt += `\n\n**AI INSTRUCTIONS FOR THIS SCENE:**\n${sceneConfig.aiInstructions}\n`;
    }
    
    // Add player data context
    if (playerData) {
      scenePrompt += `\n\n**Player Context:**\n`;
      if (playerData.combatActions) {
        scenePrompt += `Combat actions: ${playerData.combatActions.join(', ')}\n`;
      }
      if (playerData.flare !== undefined) {
        scenePrompt += `Flare: ${playerData.flare}, Clarity: ${playerData.clarity}\n`;
      }
      if (playerData.turnCount !== undefined) {
        scenePrompt += `Combat turn: ${playerData.turnCount}\n`;
      }
    }

    scenePrompt += `\n\n**Player's Response:**\n"${userInput}"\n\n`;
    scenePrompt += `Generate the Archivist's response that incorporates what they said while hitting the mandatory plot beat for this scene.`;

    const messages = [
      { role: 'system', content: scenePrompt },
      { role: 'user', content: userInput }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.8,
      max_tokens: 150 // Scene responses are concise
    });

    const response = completion.choices[0].message.content;
    const wordCount = response.split(/\s+/).length;

    // Log if response is too long
    if (wordCount > 100) {
      console.warn(`⚠️ Scene response too long: ${wordCount} words (target: 40-80)`);
    }

    res.json({
      sceneId,
      response,
      shouldAdvance: true, // Scene-based responses always advance after showing
      wordCount,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Scene Response Error:', error);
    
    if (error.status === 401) {
      return res.status(500).json({ 
        error: 'API key invalid or missing',
        fallback: "I'm having trouble connecting to my archives at the moment. Perhaps we could try again in a moment?"
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate response',
      fallback: "The threads of memory seem tangled... give me a moment to gather my thoughts."
    });
  }
});

// POST /api/ai/generate-vn-sequence - Generate multi-box VN dialogue sequence
// Used for: post_combat_dialogue (6-box sequence)
router.post('/generate-vn-sequence', async (req, res) => {
  try {
    const { sceneId, playerData } = req.body;

    if (!sceneId) {
      return res.status(400).json({ error: 'sceneId is required' });
    }

    const sceneConfig = getSceneConfig(sceneId);
    if (!sceneConfig) {
      return res.status(400).json({ error: `Unknown scene: ${sceneId}` });
    }

    // Build scene-specific prompt
    let scenePrompt = buildScenePrompt(sceneId, playerData, SYSTEM_PROMPT_BASE);
    
    // Add player data context
    if (playerData) {
      scenePrompt += `\n\n**Player Journey Summary:**\n`;
      if (playerData.combatActions) {
        scenePrompt += `Combat approach: ${playerData.combatActions.join(', ')}\n`;
      }
      if (playerData.vnResponses) {
        scenePrompt += `Key responses: ${JSON.stringify(playerData.vnResponses)}\n`;
      }
      if (playerData.flare !== undefined) {
        scenePrompt += `Final state - Flare: ${playerData.flare}, Clarity: ${playerData.clarity}\n`;
      }
    }

    scenePrompt += `\n\nGenerate the dialogue sequence for this scene. Return the 6 dialogue boxes as a JSON array of strings.`;

    const messages = [
      { role: 'system', content: scenePrompt },
      { role: 'user', content: 'Generate the VN dialogue sequence for this scene as a JSON array.' }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 600
    });

    const dialogue = completion.choices[0].message.content;

    res.json({
      sceneId,
      dialogue,
      outputFormat: sceneConfig.outputFormat,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('VN Sequence Generation Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate VN sequence',
      fallback: "The words seem distant... let me try again."
    });
  }
});

// POST /api/ai/generate-report - Generate one of the three diagnostic reports
router.post('/generate-report', async (req, res) => {
  try {
    const { playerId, reportType, conversationHistory, combatData } = req.body;

    if (!reportType || !['physical', 'emotional', 'pattern'].includes(reportType)) {
      return res.status(400).json({ error: 'Invalid report type. Must be: physical, emotional, or pattern' });
    }

    // Get detailed report structure from scene-structures
    const reportConfig = REPORT_GENERATION.reportTypes[reportType];
    
    // Build comprehensive report generation prompt
    let reportPrompt = `You are the Archivist, generating a ${reportConfig.name} for a traveler in EndoQuest.\n\n`;
    reportPrompt += `**Purpose:** ${reportConfig.purpose}\n\n`;
    reportPrompt += `**Mandatory Elements:**\n${reportConfig.mandatoryElements.map(e => `- ${e}`).join('\n')}\n\n`;
    reportPrompt += `**Structure:**\n${reportConfig.structure.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n`;
    reportPrompt += `**Tone:** ${reportConfig.tone}\n`;
    reportPrompt += `**Length:** ${reportConfig.outputFormat}\n\n`;
    reportPrompt += `**Prohibitions:**\n${reportConfig.prohibitions.map(p => `- ${p}`).join('\n')}\n\n`;
    
    reportPrompt += `**Example Opening:**\n"${reportConfig.exampleOpening}"\n\n`;
    
    reportPrompt += `---\n\n`;
    
    if (conversationHistory && conversationHistory.length > 0) {
      reportPrompt += `**Campfire Conversation:**\n`;
      conversationHistory.forEach(msg => {
        reportPrompt += `${msg.role === 'user' ? 'Traveler' : 'Archivist'}: ${msg.content}\n\n`;
      });
    } else {
      reportPrompt += `**Note:** Limited conversation data. Create a gentle, brief chronicle that acknowledges you don't have a full picture yet, while still validating their journey.\n\n`;
    }
    
    if (combatData) {
      reportPrompt += `**Combat Choices:**\n${JSON.stringify(combatData, null, 2)}\n\n`;
    }
    
    reportPrompt += `---\n\n`;
    reportPrompt += `Write the ${reportConfig.name} now. Use the Archivist's voice. Be specific with details they've shared. Follow the structure but write flowing paragraphs. ${reportConfig.outputFormat}.`;

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT_BASE },
      { role: 'user', content: reportPrompt }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 700
    });

    const report = completion.choices[0].message.content;
    const wordCount = report.split(/\s+/).length;

    res.json({
      reportType,
      reportName: reportConfig.name,
      report,
      generatedAt: new Date().toISOString(),
      wordCount,
      expectedLength: reportConfig.outputFormat
    });

  } catch (error) {
    console.error('Report Generation Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate report',
      fallback: "I'm still gathering the threads of your story. Some patterns take time to weave together..."
    });
  }
});

// GET /api/ai/campfire-conversation/:playerId - Retrieve campfire conversation history
router.get('/campfire-conversation/:playerId', (req, res) => {
  const { playerId } = req.params;
  const history = campfireConversations.get(playerId) || [];
  const metadata = conversationMetadata.get(playerId) || { messageCount: 0 };
  
  res.json({ 
    conversationHistory: history,
    messageCount: metadata.messageCount
  });
});

// DELETE /api/ai/campfire-conversation/:playerId - Clear campfire conversation
router.delete('/campfire-conversation/:playerId', (req, res) => {
  const { playerId } = req.params;
  campfireConversations.delete(playerId);
  conversationMetadata.delete(playerId);
  res.json({ message: 'Campfire conversation cleared' });
});

// POST /api/ai/benefits/guide - Generate Guild of Restoration benefits guide
router.post('/benefits/guide', async (req, res) => {
  try {
    const { playerId } = req.body;

    // Get conversation from storage
    const conversationHistory = playerId ? campfireConversations.get(playerId) || [] : [];

    // If no conversation, return fallback
    if (conversationHistory.length === 0) {
      return res.json({
        title: "Guild of Restoration",
        subtitle: "Benefits matched to your needs",
        intro: "Start a conversation with the Archivist to receive personalized recommendations.",
        benefits: [
          {
            priority: 1,
            title: "Pelvic Floor Physiotherapy",
            icon: "🔵",
            coverage: "$500-$1,000/year",
            why: "Pelvic, lower back, or radiating pain often involves pelvic floor dysfunction.",
            action: "Book an initial assessment (usually no referral required)."
          },
          {
            priority: 2,
            title: "Mental Health Counseling",
            icon: "🟢",
            coverage: "$1,000-$5,000/year",
            why: "Chronic pain and medical trauma benefit from psychological support.",
            action: "Search for chronic pain–informed therapists."
          },
          {
            priority: 3,
            title: "Registered Dietitian",
            icon: "🟡",
            coverage: "Plan-dependent",
            why: "Targeted nutrition can help manage inflammation.",
            action: "Look for women's health RDs."
          }
        ],
        contact: {
          insurer: "Sun Life",
          portal: "mysunlife.ca",
          phone: "1-800-361-6212"
        }
      });
    }

    // Initialize tools
    const tools = await initBenefitsTools();

    // Format conversation
    const transcript = conversationHistory
      .map(m => `${m.role === 'user' ? 'Player' : 'Archivist'}: ${m.content}`)
      .join('\n\n');

    const userPrompt = `**Conversation Analysis Request**

Analyze the following EndoQuest campfire conversation and generate 3-5 prioritized healthcare benefit recommendations.

**Conversation History:**
${transcript}

**Instructions:**
1. Identify key symptoms, pain patterns, and emotional themes
2. Use the benefits plan tools to search for and retrieve relevant coverage information
3. Map symptoms to appropriate healthcare services
4. Prioritize by urgency and impact potential
5. Generate JSON object with "benefits" array following the exact format specified

Return ONLY the JSON object, no additional text.`;

    // Multi-turn conversation with tool calling
    const messages = [
      { role: 'system', content: GUILD_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ];

    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    while (attempts < MAX_ATTEMPTS) {
      attempts++;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages,
        tools: BENEFITS_TOOLS,
        tool_choice: 'auto'
      });

      const choice = completion.choices[0];
      const message = choice.message;

      messages.push(message);

      // Check if done
      if (choice.finish_reason === 'stop' || !message.tool_calls) {
        try {
          const content = message.content || '{}';
          const parsed = JSON.parse(content);
          const benefits = parsed.benefits || [];

          if (Array.isArray(benefits) && benefits.length >= 3) {
            return res.json({
              title: "Guild of Restoration",
              subtitle: "Benefits matched to your needs",
              intro: "Based on your conversation, here are personalized benefit recommendations.",
              benefits,
              contact: {
                insurer: "Sun Life",
                portal: "mysunlife.ca",
                phone: "1-800-361-6212"
              },
              generatedAt: new Date().toISOString()
            });
          }
        } catch (e) {
          console.error('Failed to parse AI response:', e);
        }

        // Parsing failed, return fallback
        return res.json({
          title: "Guild of Restoration",
          benefits: [/* fallback benefits */]
        });
      }

      // Execute tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log(`→ Guild: Executing ${message.tool_calls.length} tool call(s)`);

        for (const toolCall of message.tool_calls) {
          const toolResult = await executeToolCall(toolCall, tools);
          messages.push(toolResult);
          console.log(`  ✓ ${toolCall.function.name}`);
        }
      }
    }

    // Max attempts reached
    console.warn('Max tool call attempts reached');
    res.json({
      title: "Guild of Restoration",
      benefits: [/* fallback benefits */]
    });

  } catch (error) {
    console.error('Guild generation error:', error);
    res.status(500).json({
      error: 'Failed to generate guide',
      benefits: []
    });
  }
});

export default router;
