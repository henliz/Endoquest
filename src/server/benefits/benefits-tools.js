// Minimal stub so the server can start without the real benefits engine.

export class BenefitsPlanTools {
  constructor(rulesetPath, bookletPath) {
    this.rulesetPath = rulesetPath;
    this.bookletPath = bookletPath;
    this.ready = false;
  }
  async initialize() {
    // In the real version you’d load JSON here.
    this.ready = true;
    return true;
  }
}

// Empty tool schema for OpenAI tool-calls; fill in later if you need that feature.
export const BENEFITS_TOOLS = [];

/**
 * Execute an OpenAI tool call. The real version would inspect
 * toolCall.function.name and arguments, then return function-call
 * results back into the chat. Here we just return a neutral no-op.
 */
export async function executeToolCall(toolCall /*, tools */) {
  return {
    role: 'tool',
    tool_call_id: toolCall.id || 'noop',
    name: toolCall.function?.name || 'noop',
    content: JSON.stringify({ ok: true, result: null })
  };
}
