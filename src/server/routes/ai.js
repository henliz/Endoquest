import express from 'express';
import OpenAI from 'openai';
import { SYSTEM_PROMPT_BASE } from '../prompts/archivist-personality.js';
import { buildScenePrompt, getSceneConfig, REPORT_GENERATION } from '../prompts/scene-structures.js';

import { fetchSnippets, fetchResources } from '../snowflake/client.js';
import { inferTopicFromHistory } from '../snowflake/topics.js';

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// In-memory storage for campfire conversations
const campfireConversations = new Map();

// Track conversation message count
const conversationMetadata = new Map();

// GET /api/ai/ping - Health check endpoint
router.get('/ping', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Quick OpenAI connectivity check
router.get('/test-openai', async (req, res) => {
  try {
    const r = await openai.models.list();
    // Return a tiny payload so it’s fast & obvious
    res.json({
      ok: true,
      count: r.data?.length ?? 0,
      sample: r.data?.slice(0, 5).map(m => m.id) ?? []
    });
  } catch (e) {
    console.error('test-openai error:', e);
    res.status(500).json({
      ok: false,
      status: e?.status,
      error: e?.message || String(e)
    });
  }
});

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
  const t0 = Date.now();
  let debugOn = req.query.debug === '1' || req.headers['x-debug'] === '1';

  try {
    const {
      reportType = 'Initial Diagnostic Summary',
      conversationHistory = [],
      combatData = {},
      region = 'Ontario',
      audience = 'physician' // 'physician' | 'home'
    } = req.body;

    // 1) Pull Snowflake context (non-fatal)
    let evidence = [], localResources = [];
    const tSnow0 = Date.now();
    try {
      [evidence, localResources] = await Promise.all([
        fetchSnippets('endometriosis', 3),
        fetchResources(region, 3),
      ]);
    } catch (e) {
      console.warn('Snowflake fetch failed:', e);
    }
    const tSnow = Date.now() - tSnow0;

    // 2) Compose prompt (save for debug)
    const isPhysician = audience === 'physician';

    let reportPrompt = `You are the Archivist, generating a ${isPhysician ? '"clinician-facing" formal report' : '"patient-facing" gentle summary'} for a player who just completed the EndoQuest VN/RPG scene.
    Audience: ${isPhysician ? 'Physician/clinician' : 'Patient/home support'}
    Region: ${region}

    Return ONLY a JSON object matching this schema:

    {
      "title": string,
      "patient_summary": string,
      "findings": string[],
      "red_flags": string[],
      "likely_considerations": string[],
      "suggested_next_steps": string[],
      "self_management_tips": string[],
      "resources": [{ "name": string, "url": string|null, "phone": string|null, "tags": string|null }]
    }

    Style & Constraints:
    ${isPhysician ? `- Professional, concise, and clinically useful; write as a brief to a GP/OBGYN.
    - No definitive diagnosis; frame as "considerations".
    - Prefer neutral medical language (e.g., "reports", "denies", "pattern suggests").
    - Organize "findings" to read like problem list bullets.
    - "Red_flags": escalation/safety items (urgent care criteria).` : `- Supportive, plain language, gentle tone.
    - No diagnosis; frame as "may be related" and "could try".
    - Prioritize actionable self-care and pacing ideas in "self_management_tips".
    - "Red_flags": phrase as "seek urgent care if..." in clear language.
    - Avoid jargon; if unavoidable, add a short parenthetical explanation.`}

    - Use Canadian/Ontario framing if region is Ontario.
    `;

    if (evidence?.length) {
      reportPrompt += `\nTrusted Knowledge:\n`;
      for (const e of evidence) {
        reportPrompt += `- ${e.SUBTOPIC}: ${e.TEXT} (source: ${e.SOURCE})\n`;
      }
    }
    if (localResources?.length) {
      reportPrompt += `\nSupport Nearby (${region}):\n`;
      for (const r of localResources) {
        reportPrompt += `- ${r.NAME}${r.PHONE ? ` (${r.PHONE})` : ''} — ${r.URL} [${r.TAGS}]\n`;
      }
    }

    const convoSlice = conversationHistory.slice(-8);
    if (convoSlice.length) {
      reportPrompt += `\nConversation Highlights:\n`;
      for (const msg of convoSlice) {
        reportPrompt += `- ${msg.role}: ${msg.content}\n`;
      }
    }

    if (combatData && (combatData.turnCount !== undefined || combatData.combatActions)) {
      reportPrompt += `\nGameplay Signals:\n`;
      if (combatData.turnCount !== undefined) reportPrompt += `- Combat turns: ${combatData.turnCount}\n`;
      if (combatData.combatActions?.length) reportPrompt += `- Actions: ${combatData.combatActions.join(', ')}\n`;
    }

    // Titles that match the audience (the UI still reads 'title')
    if (isPhysician) {
      reportPrompt += `\nSet "title" to "Initial Diagnostic Summary".\n`;
    } else {
      reportPrompt += `\nSet "title" to "Wayside Comforts — Home Support Summary".\n`;
    }


    reportPrompt += `\nReturn only the JSON object.`;


    // 3) OpenAI call with timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: reportPrompt },
          { role: 'user', content: 'Generate the JSON report now.' }
        ],
        temperature: 0.4,
        max_tokens: 900
      },
      { signal: controller.signal }
    );
    clearTimeout(timer);

    const raw = completion.choices?.[0]?.message?.content ?? '{}';
    const usage = completion.usage || null;
    const model = completion.model || 'unknown';

    // 4) Parse (be forgiving)
    let reportJson;
    try {
      reportJson = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}$/);
      reportJson = m ? JSON.parse(m[0]) : {
        title: isPhysician ? 'Initial Diagnostic Summary' : 'Wayside Comforts — Home Support Summary',
        patient_summary: raw
      };
    }

    // 5) Normalize resources to include Snowflake ones if model omitted
    if (!Array.isArray(reportJson.resources)) reportJson.resources = [];
    for (const r of localResources) {
      reportJson.resources.push({
        name: r.NAME,
        url: r.URL || null,
        phone: r.PHONE || null,
        tags: r.TAGS || null
      });
    }

    // 5b) Normalize + DEDUPE resources (by name|url|phone, case-insensitive)
    const norm = (s) => (typeof s === 'string' ? s.trim() : s || null);
    const toKey = (r) =>
      `${(r.name || '').toLowerCase().trim()}|${(r.url || '').toLowerCase().trim()}|${(r.phone || '').trim()}`;

    if (!Array.isArray(reportJson.resources)) reportJson.resources = [];
    reportJson.resources = reportJson.resources
      .filter(Boolean)
      .map(r => ({
        name: norm(r.name),
        url: norm(r.url),
        phone: norm(r.phone),
        tags: norm(r.tags)
      }))
      .filter(r => r.name); // require a name

    {
      const seen = new Set();
      reportJson.resources = reportJson.resources.filter(r => {
        const k = toKey(r);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    }

    // 5c) De-dupe string arrays too (case-insensitive)
    const dedupeStrings = (arr) => {
      if (!Array.isArray(arr)) return [];
      const seen = new Set();
      const out = [];
      for (const s of arr) {
        const t = String(s || '').trim();
        const k = t.toLowerCase();
        if (!t || seen.has(k)) continue;
        seen.add(k);
        out.push(t);
      }
      return out;
    };

    reportJson.findings               = dedupeStrings(reportJson.findings).slice(0, 5);
    reportJson.red_flags              = dedupeStrings(reportJson.red_flags).slice(0, 3);
    reportJson.likely_considerations  = dedupeStrings(reportJson.likely_considerations).slice(0, 4);
    reportJson.suggested_next_steps   = dedupeStrings(reportJson.suggested_next_steps).slice(0, 5);
    reportJson.self_management_tips   = dedupeStrings(reportJson.self_management_tips).slice(0, 5);

    const cap = (arr, n=5) => Array.isArray(arr) ? arr.slice(0,n) : [];
    reportJson.findings = cap(reportJson.findings);
    reportJson.red_flags = cap(reportJson.red_flags, 3);
    reportJson.likely_considerations = cap(reportJson.likely_considerations, 4);
    reportJson.suggested_next_steps = cap(reportJson.suggested_next_steps);
    reportJson.self_management_tips = cap(reportJson.self_management_tips);

    const totalMs = Date.now() - t0;

    // Always log a brief server-side line
    console.log(`[generate-report] ok type=${reportType} evid=${evidence?.length||0} res=${localResources?.length||0} convo=${convoSlice.length} turns=${combatData?.turnCount ?? '-'} ms=${totalMs} (snowflake ${tSnow}ms)`);

    // Build response
    const payload = {
      ok: true,
      reportType,
      region,
      report: reportJson,
      snowflakeOk: !!(evidence?.length || localResources?.length),
      generatedAt: new Date().toISOString(),
    };

    if (debugOn) {
      payload.debug = {
        model,
        usage,
        timings: { totalMs, tSnowflakeMs: tSnow },
        prompt: reportPrompt,
        audience,
        used: {
          conversationHistory: convoSlice,
          combatData,
          evidenceCount: evidence?.length || 0,
          resourcesCount: localResources?.length || 0,
          // include samples so you can eyeball
          evidenceSample: (evidence || []).slice(0, 2),
          resourcesSample: (localResources || []).slice(0, 2),
        },
        rawModelText: raw
      };
    }

    return res.json(payload);

  } catch (err) {
    const isAbort = err?.name === 'AbortError';
    console.error('Generate Report Error:', err);
    return res.status(isAbort ? 504 : 500).json({
      ok: false,
      error: err?.message || String(err),
      fallback: "I couldn't complete the report just now. Please try again."
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

// GET /api/ai/test-snowflake - quick connectivity check
router.get('/test-snowflake', async (req, res) => {
  try {
    const evidence  = await fetchSnippets('endometriosis', 3);
    const resources = await fetchResources('Ontario', 3);
    res.json({ ok: true, evidence, resources });
  } catch (e) {
    console.error('test-snowflake error:', e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;
