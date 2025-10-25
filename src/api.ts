export type Msg = { role: 'user' | 'assistant'; content: string };
export type CombatData = { turnCount?: number; combatActions?: string[] };

export interface ReportJSON {
  title: string;
  patient_summary: string;
  findings: string[];
  red_flags: string[];
  likely_considerations: string[];
  suggested_next_steps: string[];
  self_management_tips: string[];
  resources: { name: string; url?: string|null; phone?: string|null; tags?: string|null }[];
}

export interface GenerateReportResponse {
  ok: boolean;
  reportType: string;
  region: string;
  report: ReportJSON;
  snowflakeOk: boolean;
  generatedAt: string;
  debug?: {
    model: string;
    usage: any;
    timings: { totalMs: number; tSnowflakeMs: number };
    prompt: string;
    used: {
      conversationHistory: Msg[];
      combatData: CombatData;
      evidenceCount: number;
      resourcesCount: number;
      evidenceSample: any[];
      resourcesSample: any[];
    };
    rawModelText: string;
  };
}

// If set (e.g. in prod), requests go to that origin. In dev leave it empty so Vite proxy handles /api/*
const API_BASE = import.meta.env.VITE_API_BASE ?? ''; // '' => same-origin, proxied by Vite
const DEBUG_QUERY = import.meta.env.DEV ? '?debug=1' : '';

function apiUrl(path: string) {
  // Always require a leading slash, so '/api/...' hits the proxy
  if (!path.startsWith('/')) throw new Error(`apiUrl path must start with '/': ${path}`);
  return `${API_BASE}${path}`;
}

async function postJSON<TReq, TResp>(path: string, body: TReq): Promise<TResp> {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // credentials can be omitted unless you're actually using cookies
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${path} ${res.status} ${text}`);
  }
  return res.json() as Promise<TResp>;
}

/** ---------- Endpoints ---------- */

export async function generateReport(
  {
    reportType,
    region,
    conversationHistory,
    combatData,
    audience = 'physician', // 'physician' | 'home'
  }: {
    reportType: string;
    region?: string;
    conversationHistory?: Msg[];
    combatData?: CombatData;
    audience?: 'physician' | 'home';
  },
  debug = false
) {
  const res = await fetch(`/api/ai/generate-report?debug=${debug ? '1' : '0'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reportType,
      region,
      conversationHistory,
      combatData,
      audience, // <<< new
    }),
  });
  return await res.json();
}

// --- AI text input scene: single-box reply ---
export async function sceneResponse(args: {
  sceneId: string;
  userInput: string;
  playerData?: Record<string, any>;
}) {
  return postJSON<typeof args, any>('/api/ai/scene-response', args);
}

// --- VN sequence: multi-box generator (e.g., post-combat 6 boxes) ---
export async function generateVNSequence(args: {
  sceneId: string;
  playerData?: Record<string, any>;
}) {
  return postJSON<typeof args, any>('/api/ai/generate-vn-sequence', args);
}


export async function campfireChat(opts: {
  playerId?: string;
  message: string;
  conversationHistory?: Msg[];
}) {
  return postJSON<typeof opts, {
    response: string;
    conversationHistory: Msg[];
    metadata: { messageCount: number; arcStage: string; wordCount: number; shouldPromptClosure: boolean };
  }>('/api/ai/campfire-chat', opts);
}