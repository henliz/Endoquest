/* eslint-disable no-console */
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import dotenv from "dotenv";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import {
  BenefitsPlanTools,
  executeToolCall,
  BENEFITS_TOOLS,
  type ToolCall,
} from "./benefits-tools";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ────────────────────────────────────────────────────────────────────────────────
// Env / OpenAI
// ────────────────────────────────────────────────────────────────────────────────
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

async function llm(opts: {
  system: string;
  user: string;
  temperature?: number;
  model?: string;
}): Promise<string> {
  const { system, user, temperature = 0.3, model = "gpt-4o-mini" } = opts;
  if (!openai) {
    const preview = user.replace(/\s+/g, " ").slice(0, 300);
    return `(offline) ${preview}${user.length > 300 ? "..." : ""}`;
  }
  const out = await openai.chat.completions.create({
    model,
    temperature,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return out.choices[0]?.message?.content ?? "";
}

// ────────────────────────────────────────────────────────────────────────────────
// Guild of Restoration System Prompt
// ────────────────────────────────────────────────────────────────────────────────
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

Consider:
- Severity and impact of symptoms
- Accessibility (no referral needed vs. requires specialist)
- Coverage amount and likelihood of approval
- Evidence base for the condition
- Time to benefit (quick relief vs. long-term)

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
- Be specific about what to look for (e.g., "providers experienced in chronic pain")

### The "Coverage" Field
- Use the EXACT coverage language from the benefits plan
- Include both percentage and maximum if applicable (e.g., "80% up to $1,000/year")
- Specify time period (per year, per visit, lifetime maximum)
- Note if it's combined with other benefits

## Critical Rules

### Always Do:
- ✅ Use tools to verify every coverage detail
- ✅ Use exact benefit names from the plan
- ✅ Provide specific, accurate coverage amounts
- ✅ Link recommendations directly to their expressed symptoms/experiences
- ✅ Return valid JSON in the exact format specified
- ✅ Prioritize by impact and accessibility
- ✅ Give 3-5 recommendations (3 minimum, 5 maximum)

### Never Do:
- ❌ Make up or guess coverage amounts
- ❌ Recommend services not in the benefits plan
- ❌ Promise cures or guaranteed outcomes
- ❌ Suggest avoiding medical care or replacing specialist treatment
- ❌ Blame the patient for their condition
- ❌ Imply symptoms are psychosomatic or "all in their head"
- ❌ Name specific doctors or clinics
- ❌ Recommend unproven or experimental treatments
- ❌ Include explanations or text outside the JSON structure

## Output Format

Return ONLY a valid JSON object with a "benefits" array. No additional text before or after:

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

// ────────────────────────────────────────────────────────────────────────────────
// Simple session-scoped memory (single device/session)
// ────────────────────────────────────────────────────────────────────────────────
type Msg = { role: "user" | "assistant" | "tool"; content: string; tool_calls?: any };

const memory: {
  conversation: Msg[];
  guide: any | null;
  isUpdating: boolean;
} = {
  conversation: [],
  guide: null,
  isUpdating: false,
};

function arcStage(userTurnCount: number): "opening" | "exploration" | "closure" {
  if (userTurnCount <= 3) return "opening";
  if (userTurnCount >= 13) return "closure";
  return "exploration";
}

// ────────────────────────────────────────────────────────────────────────────────
// Benefits Plan Tools Instance
// ────────────────────────────────────────────────────────────────────────────────
const BENEFITS_DIR = __dirname;
const RULESET_PATH = path.join(BENEFITS_DIR, "ruleset_cache.json");
const BOOKLET_PATH = path.join(BENEFITS_DIR, "booklet_cache.json");

let benefitsTools: BenefitsPlanTools | null = null;

async function initializeBenefitsTools(): Promise<BenefitsPlanTools> {
  if (!benefitsTools) {
    benefitsTools = new BenefitsPlanTools(RULESET_PATH, BOOKLET_PATH);
    await benefitsTools.initialize();
    console.log("✓ Benefits plan tools initialized");
  }
  return benefitsTools;
}

// ────────────────────────────────────────────────────────────────────────────────
// NEW: Build guide using AI with benefits plan tools
// ────────────────────────────────────────────────────────────────────────────────
async function buildGuideFromHistory() {
  if (memory.isUpdating) return;
  memory.isUpdating = true;

  try {
    // Initialize tools
    const tools = await initializeBenefitsTools();

    // Format conversation for analysis
    const transcript = memory.conversation
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => `${m.role === "user" ? "Player" : "Archivist"}: ${m.content}`)
      .join("\n\n");

    const userPrompt = `**Conversation Analysis Request**

Analyze the following EndoQuest campfire conversation and generate 3-5 prioritized healthcare benefit recommendations.

**Conversation History:**
${transcript || "No conversation data available yet. Provide general recommendations for someone beginning their endometriosis journey."}

**Instructions:**
1. Identify key symptoms, pain patterns, and emotional themes
2. Use the benefits plan tools to search for and retrieve relevant coverage information
3. Map symptoms to appropriate healthcare services
4. Prioritize by urgency and impact potential
5. Generate JSON object with "benefits" array following the exact format specified in your instructions

Return ONLY the JSON object, no additional text.`;

    if (!openai) {
      memory.guide = createFallbackGuide();
      return;
    }

    // Multi-turn conversation with tool calling
    const messages: any[] = [
      { role: "system", content: GUILD_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ];

    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    while (attempts < MAX_ATTEMPTS) {
      attempts++;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages,
        tools: BENEFITS_TOOLS,
        tool_choice: "auto",
      });

      const choice = completion.choices[0];
      const message = choice.message;

      // Add assistant's message to conversation
      messages.push(message);

      // Check if we're done
      if (choice.finish_reason === "stop" || !message.tool_calls) {
        // Parse final response
        try {
          const content = message.content || "{}";
          const parsed = JSON.parse(content);
          const benefits = parsed.benefits || [];

          if (Array.isArray(benefits) && benefits.length >= 3) {
            memory.guide = {
              title: "Guild of Restoration",
              subtitle: "Benefits matched to your needs",
              intro:
                "Based on your conversation, here are personalized benefit recommendations.",
              benefits,
              contact: {
                insurer: "Sun Life",
                portal: "mysunlife.ca",
                phone: "1-800-361-6212",
              },
              generatedAt: new Date().toISOString(),
            };
            console.log(`✓ Guide generated with ${benefits.length} recommendations`);
            return;
          }
        } catch (e) {
          console.error("Failed to parse AI response:", e);
        }

        // If we get here, parsing failed - use fallback
        memory.guide = createFallbackGuide();
        return;
      }

      // Execute tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log(
          `→ Executing ${message.tool_calls.length} tool call(s) (attempt ${attempts}/${MAX_ATTEMPTS})`
        );

        for (const toolCall of message.tool_calls) {
          const toolResult = await executeToolCall(toolCall as ToolCall, tools);
          messages.push(toolResult);

          // Log tool usage
          const funcName = toolCall.function.name;
          console.log(`  ✓ ${funcName}`);
        }
      }
    }

    // Max attempts reached
    console.warn("⚠ Max tool call attempts reached, using fallback");
    memory.guide = createFallbackGuide();
  } catch (e) {
    console.error("buildGuideFromHistory error", e);
    memory.guide = createFallbackGuide();
  } finally {
    memory.isUpdating = false;
  }
}

function createFallbackGuide() {
  return {
    title: "Guild of Restoration",
    subtitle: "Benefits matched to your needs",
    intro:
      "These are general recommendations. Continue the conversation for more personalized suggestions.",
    benefits: [
      {
        priority: 1,
        title: "Pelvic Floor Physiotherapy",
        icon: "🔵",
        coverage: "$500–$1,000/year",
        why: "Pelvic, lower back, or radiating pain often involves pelvic floor dysfunction.",
        action: "Book an initial assessment (usually no referral required).",
      },
      {
        priority: 2,
        title: "Mental Health Counseling",
        icon: "🟢",
        coverage: "$1,000–$5,000/year",
        why: "Chronic pain and medical trauma benefit from psychological support and advocacy skills.",
        action:
          "Search for chronic pain–informed therapists; ask about direct billing.",
      },
      {
        priority: 3,
        title: "Registered Dietitian",
        icon: "🟡",
        coverage: "Plan-dependent",
        why: "Targeted nutrition can help manage inflammation and energy.",
        action: "Look for women's health RDs; ask for a 15-min discovery call.",
      },
    ],
    contact: {
      insurer: "Sun Life",
      portal: "mysunlife.ca",
      phone: "1-800-361-6212",
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// Express app (standalone server)
// ────────────────────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

/** POST /api/ai/scene-response */
app.post("/api/ai/scene-response", async (req, res) => {
  try {
    const { sceneId, userInput, playerData, conversationHistory } = req.body ?? {};
    const history = (conversationHistory as Msg[]) ?? memory.conversation;

    const system =
      "You are The Archivist: calm, validating, clear. " +
      "Reply in 1–3 concise sentences; be specific and supportive; no markdown.";
    const user = `sceneId=${sceneId}\nplayerData=${JSON.stringify(playerData)}\nuserInput=${userInput}`;

    const reply = await llm({ system, user });

    const updated = history.concat(
      { role: "user", content: String(userInput ?? "") },
      { role: "assistant", content: reply }
    );
    memory.conversation = updated;

    setImmediate(buildGuideFromHistory);

    res.json({ response: reply, conversationHistory: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "scene-response failed" });
  }
});

/** POST /api/ai/campfire-chat */
app.post("/api/ai/campfire-chat", async (req, res) => {
  try {
    const { message, conversationHistory } = req.body ?? {};
    const existing = (conversationHistory as Msg[]) ?? memory.conversation;

    const userTurns = existing.filter((m) => m.role === "user").length + 1;
    const stage = arcStage(userTurns);
    const system =
      "You are The Archivist, a reflective facilitator. " +
      "Keep responses under ~120 words, grounded and practical. " +
      `Arc stage: ${stage}.`;

    const reply = await llm({ system, user: String(message ?? "") });

    const updated = existing.concat(
      { role: "user", content: String(message ?? "") },
      { role: "assistant", content: reply }
    );
    memory.conversation = updated;

    setImmediate(buildGuideFromHistory);

    res.json({ conversationHistory: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "campfire-chat failed" });
  }
});

/** POST /api/benefits/guide */
app.post("/api/benefits/guide", async (_req, res) => {
  try {
    if (!memory.guide) await buildGuideFromHistory();
    res.json(memory.guide);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "guide failed" });
  }
});

/** GET /api/benefits/guide.pdf */
app.get("/api/benefits/guide.pdf", async (_req, res) => {
  try {
    if (!memory.guide) await buildGuideFromHistory();

    const g = memory.guide || {};
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=benefits-guide.pdf"
    );

    const doc = new PDFDocument({ size: "LETTER", margin: 48 });
    doc.pipe(res);

    doc.fontSize(18).text(g.title || "Guild of Restoration", { underline: true });
    doc
      .moveDown(0.3)
      .fontSize(12)
      .fillColor("#555")
      .text(g.subtitle || "");
    doc.moveDown().fillColor("#000").fontSize(12).text(g.intro || "");

    doc.moveDown();
    (g.benefits || []).forEach((b: any, i: number) => {
      doc
        .fontSize(14)
        .fillColor("#4B0082")
        .text(`PRIORITY ${b.priority}: ${b.title}`);
      doc.moveDown(0.1).fontSize(11).fillColor("#000").text(`Coverage: ${b.coverage}`);
      doc.moveDown(0.1).text(`Why: ${b.why}`);
      doc.moveDown(0.1).text(`Next step: ${b.action}`);
      if (i < g.benefits.length - 1) doc.moveDown();
    });

    doc
      .moveDown()
      .fontSize(10)
      .fillColor("#555")
      .text(
        `Contact: ${g?.contact?.insurer ?? ""} • ${g?.contact?.portal ?? ""} • ${g?.contact?.phone ?? ""}`
      );
    doc.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "pdf failed" });
  }
});

// ────────────────────────────────────────────────────────────────────────────────
// Boot
// ────────────────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT || 3001);

// Initialize tools on startup
initializeBenefitsTools()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`✓ Benefits agent listening on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Failed to initialize benefits tools:", err);
    console.log("Starting server without tools (fallback mode)");
    app.listen(PORT, () =>
      console.log(`⚠ Benefits agent listening on http://localhost:${PORT} (fallback mode)`)
    );
  });