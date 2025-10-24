import { OpenAI } from "openai";
import "dotenv/config";
import type { BookletSection } from "./booklet";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface RulesetNode {
  name: string;
  parent?: string | null;
  sections: Pick<BookletSection, "heading" | "breadcrumb_heading" | "body" | "classification" | "page">[];
  children: RulesetNode[];
}

export async function buildRulesetTree(sections: BookletSection[]): Promise<RulesetNode> {
  const root: RulesetNode = { name: "General Provisions", parent: null, sections: [], children: [] };

  const byClass = new Map<string, BookletSection[]>();
  for (const s of sections) {
    const key = s.classification ?? "General Provisions";
    if (!byClass.has(key)) byClass.set(key, []);
    byClass.get(key)!.push(s);
  }

  for (const [cls, list] of byClass.entries()) {
    if (cls === "General Provisions") {
      root.sections.push(...list.map(s => ({
        heading: s.heading,
        breadcrumb_heading: s.breadcrumb_heading ?? null,
        body: s.body,
        classification: s.classification,
        page: s.page
      })));
      continue;
    }

    const proposal = await proposeBenefitStructure(cls, list.map(s => s.heading));
    const benefitNode: RulesetNode = {
      name: proposal.name ?? cls,
      parent: root.name,
      sections: [],
      children: []
    };

    for (const s of list) {
      benefitNode.sections.push({
        heading: s.heading,
        breadcrumb_heading: s.breadcrumb_heading ?? null,
        body: s.body,
        classification: s.classification,
        page: s.page
      });
    }

    root.children.push(benefitNode);
  }

  return root;
}

async function proposeBenefitStructure(classification: string, headings: string[]) {
  if (!process.env.OPENAI_API_KEY) return { name: classification };
  const sys = `You are helping organize a benefits booklet. Given a coarse classification and a list of section headings, propose a single benefit name (string).`;
  const user = JSON.stringify({ classification, headings: headings.slice(0, 100) });
  const out = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0.2,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user }
    ]
  });
  try { return JSON.parse(out.choices[0].message.content || "{}"); }
  catch { return { name: classification }; }
}

export function searchProvisions(root: RulesetNode, keywords: string[], caseSensitive = false) {
  const rx = keywords.map(k => new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), caseSensitive ? "g" : "gi"));
  const results: { node: string; page: number; heading: string; snippet: string }[] = [];

  const visit = (n: RulesetNode) => {
    for (const s of n.sections) {
      const hay = `${s.heading}\n${s.body}`;
      if (rx.some(r => r.test(hay))) {
        const snippet = hay.slice(0, 200).replace(/\s+/g, " ");
        results.push({ node: n.name, page: s.page, heading: s.heading, snippet });
      }
    }
    for (const c of n.children) visit(c);
  };

  visit(root);
  return results;
}

export function searchBenefits(root: RulesetNode, keywords: string[], caseSensitive = false) {
  const rx = keywords.map(k => new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), caseSensitive ? "g" : "gi"));
  const results: { name: string; match: string }[] = [];

  const visit = (n: RulesetNode) => {
    if (rx.some(r => r.test(n.name))) results.push({ name: n.name, match: n.name });
    for (const c of n.children) visit(c);
  };

  visit(root);
  return results;
}
