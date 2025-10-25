// src/server/routes/ai.js
import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

/* =========================
   OpenAI client
   ========================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

/* =========================
   In-memory conversation state
   (kept here so this file is self-contained)
   ========================= */

/** @typedef {{ role: 'user' | 'assistant' | 'system', content: string }} Msg */

/** @type {Map<string, Msg[]>} */
const campfireConversations = new Map();
/** @type {Map<string, { messageCount: number, startedAt?: string }>} */
const conversationMetadata = new Map();

/* =========================
   Minimal fallbacks for project utilities
   (Replace these with your real imports when ready)
   ========================= */

// TODO: replace with actual base prompt string from your project
const SYSTEM_PROMPT_BASE = `You are the Archivist in a VN/RPG about endometriosis. Keep responses concise and emotionally safe.`;

// TODO: replace with your real scene config loader
function getSceneConfig(sceneId) {
  // Minimal default shape so the routes don't explode
  return {
    responseStructure: { length: 'short', maxQuestions: 1 },
    conversationArc: {
      opening: { objectives: ['Greet', 'Invite sharing', 'Set safety'] },
      exploration: { objectives: ['Reflect', 'Validate', 'Probe gently'] },
      closure: { objectives: ['Summarize', 'Reassure', 'Offer next step'] }
    },
    outputFormat: 'json',
    aiInstructions: 'Hit the mandatory plot beat for this scene.'
  };
}

// TODO: replace with your real prompt builder
function buildScenePrompt(sceneId, playerData, base) {
  const pd = playerData ? `\n\n[PlayerData]: ${JSON.stringify(playerData).slice(0, 500)}` : '';
  return `${base}\n\n[Scene]: ${sceneId}${pd}`;
}

// Snowflake data fetchers (safe fallbacks)
async function fetchSnippets(_topic, _n) {
  return []; // plug your real Snowflake query here
}
async function fetchResources(_region, _n) {
  return []; // plug your real Snowflake query here
}

/* =========================
   Benefits Tooling fallbacks
   (Your project likely has real versions; these keep this file working)
   ========================= */

/** @returns {Promise<Record<string, unknown>>} */
async function initBenefitsTools() {
  return {};
}

/** @type {any[]} */
const BENEFITS_TOOLS = [];

// When the model asks to call a tool, you’d dispatch here.
// This fallback just echoes back that the tool ran.
async function executeToolCall(toolCall, _tools) {
  return {
    role: 'tool',
    tool_call_id: toolCall.id,
    content: JSON.stringify({ ok: true, function: toolCall.function?.name ?? 'unknown', result: [] })
  };
}

/* =========================
   Guild/Benefits system prompt
   ========================= */
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
1. **Start with structure**: Use \`get_benefit_structure\`
2. **Search by keywords**: Use \`search_keywords\`
3. **Get details**: Use \`get_benefit_details\`
4. **Check general provisions**: Use \`get_general_provisions\`

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
- 🔵 Physical therapy/rehab
- 🟢 Mental health
- 🟡 Nutrition
- 🟠 Complementary
- 🟣 Specialist/diagnostic
- ⚪ Workplace support/navigation

## Writing Guidelines
- "Why": start with their symptom/challenge; tie to service; likely benefit
- "Action": immediate step, referral requirement, contact method
- "Coverage": EXACT plan language; percentages + max + period; combos

## Critical Rules
- ✅ Use tools; ✅ exact benefit names; ✅ specific coverage; ✅ 3–5 recs; ✅ Return ONLY valid JSON
- ❌ Don’t invent coverage; ❌ don’t recommend services not in plan; ❌ no cures; ❌ no provider names
`;

/* ============================================================================
   ROUTES
   ============================================================================ */

/**
 * POST /api/ai/campfire-chat
 * Free-form conversation (bounded) with Archivist.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.post('/campfire-chat', async (req, res) => {
  try {
    const { playerId, message, conversationHistory } = /** @type {{playerId?: string, message?: string, conversationHistory?: Msg[]}} */ (req.body || {});

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // conversation metadata
    if (playerId && !conversationMetadata.has(playerId)) {
      conversationMetadata.set(playerId, { messageCount: 0, startedAt: new Date().toISOString() });
    }
    const meta = playerId ? (conversationMetadata.get(playerId) ?? { messageCount: 0 }) : { messageCount: 0 };
    meta.messageCount += 1;
    if (playerId) conversationMetadata.set(playerId, meta);

    const sceneConfig = getSceneConfig('campfire_conversation');

    let arcStage = /** @type {'opening'|'exploration'|'closure'} */ ('exploration');
    if (meta.messageCount <= 3) arcStage = 'opening';
    else if (meta.messageCount >= 13) arcStage = 'closure';

    const currentArc = sceneConfig.conversationArc[arcStage];

    // Build prompt
    let scenePrompt = buildScenePrompt('campfire_conversation', {}, SYSTEM_PROMPT_BASE);
    scenePrompt += `\n**Current Arc Stage:** ${arcStage.toUpperCase()} (message ${meta.messageCount})\n`;
    scenePrompt += `**Objectives:**\n${currentArc.objectives.map((o) => `- ${o}`).join('\n')}\n\n`;
    scenePrompt += `**Remember:**\n- Respond with a SINGLE VN dialogue box\n- Keep it ${sceneConfig.responseStructure.length}\n- Max ${sceneConfig.responseStructure.maxQuestions} question(s)\n- Guide toward the three knowledge types\n`;

    /** @type {Msg[]} */
    const messages = [
      { role: 'system', content: scenePrompt },
      ...(Array.isArray(conversationHistory) ? conversationHistory : []),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 150,
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    });

    const archivistResponse = completion.choices?.[0]?.message?.content ?? '';
    const wordCount = archivistResponse.split(/\s+/).filter(Boolean).length;

    // persist convo
    if (playerId) {
      const hist = campfireConversations.get(playerId) ?? [];
      hist.push({ role: 'user', content: message }, { role: 'assistant', content: archivistResponse });
      campfireConversations.set(playerId, hist);
    }

    return res.json({
      response: archivistResponse,
      conversationHistory: [
        ...(Array.isArray(conversationHistory) ? conversationHistory : []),
        { role: 'user', content: message },
        { role: 'assistant', content: archivistResponse }
      ],
      metadata: {
        messageCount: meta.messageCount,
        arcStage,
        wordCount,
        shouldPromptClosure: meta.messageCount >= 15
      }
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    if (error?.status === 401) {
      return res.status(500).json({
        error: 'API key invalid or missing',
        fallback: "I'm having trouble connecting to my archives at the moment. Perhaps we could try again in a moment?"
      });
    }
    return res.status(500).json({
      error: 'Failed to generate response',
      fallback: "The threads of memory seem tangled... give me a moment to gather my thoughts."
    });
  }
});

/**
 * POST /api/ai/scene-response
 * Scene-constrained response that must hit a plot beat.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.post('/scene-response', async (req, res) => {
  try {
    const { sceneId, userInput, playerData } = /** @type {{sceneId?: string, userInput?: string, playerData?: any}} */ (req.body || {});

    if (!sceneId) return res.status(400).json({ error: 'sceneId is required' });
    if (!userInput || !userInput.trim()) return res.status(400).json({ error: 'userInput is required' });

    const sceneConfig = getSceneConfig(sceneId);
    if (!sceneConfig) return res.status(400).json({ error: `Unknown scene: ${sceneId}` });

    let scenePrompt = buildScenePrompt(sceneId, playerData, SYSTEM_PROMPT_BASE);

    if (sceneConfig.aiInstructions) {
      scenePrompt += `\n\n**AI INSTRUCTIONS FOR THIS SCENE:**\n${sceneConfig.aiInstructions}\n`;
    }

    if (playerData) {
      scenePrompt += `\n\n**Player Context:**\n`;
      if (Array.isArray(playerData.combatActions)) {
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

    /** @type {Msg[]} */
    const messages = [
      { role: 'system', content: scenePrompt },
      { role: 'user', content: userInput }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 150
    });

    const responseText = completion.choices?.[0]?.message?.content ?? '';
    const wordCount = responseText.split(/\s+/).filter(Boolean).length;

    return res.json({
      sceneId,
      response: responseText,
      shouldAdvance: true,
      wordCount,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Scene Response Error:', error);
    if (error?.status === 401) {
      return res.status(500).json({
        error: 'API key invalid or missing',
        fallback: "I'm having trouble connecting to my archives at the moment. Perhaps we could try again in a moment?"
      });
    }
    return res.status(500).json({
      error: 'Failed to generate response',
      fallback: "The threads of memory seem tangled... give me a moment to gather my thoughts."
    });
  }
});

/**
 * POST /api/ai/generate-vn-sequence
 * Generates a 6-box VN dialogue sequence.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.post('/generate-vn-sequence', async (req, res) => {
  try {
    const { sceneId, playerData } = /** @type {{sceneId?: string, playerData?: any}} */ (req.body || {});
    if (!sceneId) return res.status(400).json({ error: 'sceneId is required' });

    const sceneConfig = getSceneConfig(sceneId);
    if (!sceneConfig) return res.status(400).json({ error: `Unknown scene: ${sceneId}` });

    let scenePrompt = buildScenePrompt(sceneId, playerData, SYSTEM_PROMPT_BASE);

    if (playerData) {
      scenePrompt += `\n\n**Player Journey Summary:**\n`;
      if (Array.isArray(playerData.combatActions)) scenePrompt += `Combat approach: ${playerData.combatActions.join(', ')}\n`;
      if (playerData.vnResponses) scenePrompt += `Key responses: ${JSON.stringify(playerData.vnResponses)}\n`;
      if (playerData.flare !== undefined) scenePrompt += `Final state - Flare: ${playerData.flare}, Clarity: ${playerData.clarity}\n`;
    }

    scenePrompt += `\n\nGenerate the dialogue sequence for this scene. Return the 6 dialogue boxes as a JSON array of strings.`;

    /** @type {Msg[]} */
    const messages = [
      { role: 'system', content: scenePrompt },
      { role: 'user', content: 'Generate the VN dialogue sequence for this scene as a JSON array.' }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 600
    });

    const dialogue = completion.choices?.[0]?.message?.content ?? '[]';

    return res.json({
      sceneId,
      dialogue,
      outputFormat: sceneConfig.outputFormat,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('VN Sequence Generation Error:', error);
    return res.status(500).json({
      error: 'Failed to generate VN sequence',
      fallback: "The words seem distant... let me try again."
    });
  }
});

/**
 * POST /api/ai/generate-report
 * Produces a clinician- or patient-facing JSON report.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.post('/generate-report', async (req, res) => {
  const t0 = Date.now();
  const debugOn = req.query.debug === '1' || req.headers['x-debug'] === '1';

  try {
    const {
      reportType = 'Initial Diagnostic Summary',
      conversationHistory = [],
      combatData = {},
      region = 'Ontario',
      audience = 'physician'
    } = /** @type {any} */ (req.body || {});

    let evidence = [];
    let localResources = [];
    const tSnow0 = Date.now();
    try {
      [evidence, localResources] = await Promise.all([
        fetchSnippets('endometriosis', 3),
        fetchResources(region, 3)
      ]);
    } catch (e) {
      console.warn('Snowflake fetch failed:', e);
    }
    const tSnow = Date.now() - tSnow0;

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
${isPhysician ? `- Professional, concise, clinically useful.
- No definitive diagnosis; frame as "considerations".
- Neutral medical language; problem-list style findings.
- Red_flags = escalation/safety items.` : `- Supportive, plain language.
- No diagnosis; use "may be related".
- Actionable pacing/self-care.
- Red_flags = "seek urgent care if..."`}

- Use Canadian/Ontario framing if region is Ontario.
`;

    if (evidence?.length) {
      reportPrompt += `\nTrusted Knowledge:\n`;
      for (const ev of evidence) {
        reportPrompt += `- ${ev.SUBTOPIC}: ${ev.TEXT} (source: ${ev.SOURCE})\n`;
      }
    }
    if (localResources?.length) {
      reportPrompt += `\nSupport Nearby (${region}):\n`;
      for (const r of localResources) {
        reportPrompt += `- ${r.NAME}${r.PHONE ? ` (${r.PHONE})` : ''} — ${r.URL} [${r.TAGS}]\n`;
      }
    }

    /** @type {Msg[]} */
    const convoSlice = Array.isArray(conversationHistory) ? conversationHistory.slice(-8) : [];
    if (convoSlice.length) {
      reportPrompt += `\nConversation Highlights:\n`;
      for (const msg of convoSlice) {
        reportPrompt += `- ${msg.role}: ${msg.content}\n`;
      }
    }

    if (combatData && (combatData.turnCount !== undefined || combatData.combatActions)) {
      reportPrompt += `\nGameplay Signals:\n`;
      if (combatData.turnCount !== undefined) reportPrompt += `- Combat turns: ${combatData.turnCount}\n`;
      if (Array.isArray(combatData.combatActions) && combatData.combatActions.length) {
        reportPrompt += `- Actions: ${combatData.combatActions.join(', ')}\n`;
      }
    }

    if (isPhysician) reportPrompt += `\nSet "title" to "Initial Diagnostic Summary".\n`;
    else reportPrompt += `\nSet "title" to "Wayside Comforts — Home Support Summary".\n`;

    reportPrompt += `\nReturn only the JSON object.`;

    // Timeout wrapper
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
      // Some OpenAI SDKs accept { signal } in options; safe to leave in JS:
      { signal: controller.signal }
    );
    clearTimeout(timer);

    const raw = completion.choices?.[0]?.message?.content ?? '{}';
    const usage = completion.usage || null;
    const model = completion.model || 'unknown';

    // Parse forgivingly
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

    // Ensure resources; append Snowflake resources
    if (!Array.isArray(reportJson.resources)) reportJson.resources = [];
    for (const r of localResources) {
      reportJson.resources.push({
        name: r.NAME, url: r.URL || null, phone: r.PHONE || null, tags: r.TAGS || null
      });
    }

    // Dedup resources (name|url|phone)
    const norm = (s) => (typeof s === 'string' ? s.trim() : s || null);
    const toKey = (r) =>
      `${(r.name || '').toLowerCase().trim()}|${(r.url || '').toLowerCase().trim()}|${(r.phone || '').trim()}`;

    reportJson.resources = (reportJson.resources || [])
      .filter(Boolean)
      .map((r) => ({ name: norm(r.name), url: norm(r.url), phone: norm(r.phone), tags: norm(r.tags) }))
      .filter((r) => r.name);

    {
      const seen = new Set();
      reportJson.resources = reportJson.resources.filter((r) => {
        const k = toKey(r);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    }

    // Dedup string arrays, cap lengths
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
    const cap = (arr, n = 5) => Array.isArray(arr) ? arr.slice(0, n) : [];

    reportJson.findings              = cap(dedupeStrings(reportJson.findings), 5);
    reportJson.red_flags             = cap(dedupeStrings(reportJson.red_flags), 3);
    reportJson.likely_considerations = cap(dedupeStrings(reportJson.likely_considerations), 4);
    reportJson.suggested_next_steps  = cap(dedupeStrings(reportJson.suggested_next_steps), 5);
    reportJson.self_management_tips  = cap(dedupeStrings(reportJson.self_management_tips), 5);

    const totalMs = Date.now() - t0;
    console.log(`[generate-report] ok type=${reportType} evid=${evidence?.length||0} res=${localResources?.length||0} convo=${(Array.isArray(conversationHistory) ? conversationHistory.slice(-8) : []).length} turns=${combatData?.turnCount ?? '-'} ms=${totalMs} (snowflake ${tSnow}ms)`);

    const payload = {
      ok: true,
      reportType,
      region,
      report: reportJson,
      snowflakeOk: !!(evidence?.length || localResources?.length),
      generatedAt: new Date().toISOString()
    };

    if (debugOn) {
      payload.debug = {
        model,
        usage,
        timings: { totalMs, tSnowflakeMs: tSnow },
        prompt: reportPrompt,
        audience,
        used: {
          conversationHistory: Array.isArray(conversationHistory) ? conversationHistory.slice(-8) : [],
          combatData,
          evidenceCount: evidence?.length || 0,
          resourcesCount: localResources?.length || 0,
          evidenceSample: (evidence || []).slice(0, 2),
          resourcesSample: (localResources || []).slice(0, 2)
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

/**
 * GET /api/ai/campfire-conversation/:playerId
 * Returns stored conversation for a player.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.get('/campfire-conversation/:playerId', (req, res) => {
  const { playerId } = /** @type {{playerId: string}} */ (req.params);
  const history = campfireConversations.get(playerId) || [];
  const metadata = conversationMetadata.get(playerId) || { messageCount: 0 };
  return res.json({ conversationHistory: history, messageCount: metadata.messageCount });
});

/**
 * DELETE /api/ai/campfire-conversation/:playerId
 * Clears stored conversation for a player.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.delete('/campfire-conversation/:playerId', (req, res) => {
  const { playerId } = /** @type {{playerId: string}} */ (req.params);
  campfireConversations.delete(playerId);
  conversationMetadata.delete(playerId);
  return res.json({ message: 'Campfire conversation cleared' });
});

/**
 * GET /api/ai/test-snowflake
 */
router.get('/test-snowflake', async (_req, res) => {
  try {
    const evidence = await fetchSnippets('endometriosis', 3);
    const resources = await fetchResources('Ontario', 3);
    res.json({ ok: true, evidence, resources });
  } catch (e) {
    console.error('test-snowflake error:', e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

/**
 * POST /api/ai/benefits/guide
 * Generates Guild of Restoration benefits JSON by analyzing conversation.
 * Keeps tool-call loop but gracefully falls back if parsing fails.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.post('/benefits/guide', async (req, res) => {
  try {
    /** @type {{ playerId?: string }} */
    const { playerId } = req.body || {};
    /** @type {Msg[]} */
    const conversationHistory = playerId ? (campfireConversations.get(playerId) || []) : [];

    // Empty conversation → friendly fallback
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
        contact: { insurer: "Sun Life", portal: "mysunlife.ca", phone: "1-800-361-6212" }
      });
    }

    const tools = await initBenefitsTools();

    const transcript = conversationHistory
      .map(m => `${m.role === 'user' ? 'Player' : 'Archivist'}: ${m.content}`)
      .join('\n\n');

    const userPrompt = `**Conversation Analysis Request**
Analyze the following EndoQuest campfire conversation and generate 3-5 prioritized healthcare benefit recommendations.

**Conversation History:**
${transcript}

**Instructions:**
1) Identify key symptoms, pain patterns, and emotional themes
2) Use the benefits plan tools to search for and retrieve relevant coverage information
3) Map symptoms to appropriate healthcare services
4) Prioritize by urgency and impact potential
5) Generate JSON object with "benefits" array following the exact format specified

Return ONLY the JSON object, no additional text.`;

    /** @type {Msg[]} */
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

      const choice = completion.choices?.[0];
      const msg = choice?.message;

      // Push assistant/tool messages into the running transcript
      if (msg) messages.push(/** @type {Msg} */(msg));

      // If the model is done or didn't request any tools, try to parse
      if (choice?.finish_reason === 'stop' || !msg?.tool_calls) {
        try {
          const content = msg?.content || '{}';
          const parsed = JSON.parse(content);
          const benefits = Array.isArray(parsed?.benefits) ? parsed.benefits : [];
          if (benefits.length >= 3) {
            return res.json({
              title: "Guild of Restoration",
              subtitle: "Benefits matched to your needs",
              intro: "Based on your conversation, here are personalized benefit recommendations.",
              benefits,
              contact: { insurer: "Sun Life", portal: "mysunlife.ca", phone: "1-800-361-6212" },
              generatedAt: new Date().toISOString()
            });
          }
        } catch (e) {
          console.error('Failed to parse AI response:', e);
        }

        // Parsing failed → minimal fallback
        return res.json({ title: "Guild of Restoration", benefits: [] });
      }

      // Execute tool calls if any
      if (Array.isArray(msg.tool_calls) && msg.tool_calls.length) {
        for (const tc of msg.tool_calls) {
          const toolResult = await executeToolCall(tc, tools);
          messages.push(/** @type {any} */(toolResult));
        }
      }
    }

    // Safety net if the loop never successfully returned
    return res.json({ title: "Guild of Restoration", benefits: [] });
  } catch (error) {
    console.error('Guild generation error:', error);
    return res.status(500).json({ error: 'Failed to generate guide', benefits: [] });
  }
});

export default router;
