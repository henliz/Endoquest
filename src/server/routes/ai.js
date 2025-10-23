import express from 'express';
import OpenAI from 'openai';
import { SYSTEM_PROMPT_BASE } from '../prompts/archivist-personality.js';
import { buildScenePrompt, getSceneConfig, REPORT_GENERATION } from '../prompts/scene-structures.js';

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// In-memory storage for campfire conversations
const campfireConversations = new Map();

// Track conversation message count
const conversationMetadata = new Map();

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

export default router;
