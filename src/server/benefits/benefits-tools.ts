// benefits-tools.ts
// TypeScript implementation of benefits plan query tools

import fs from "fs-extra";
import path from "node:path";

// ────────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ────────────────────────────────────────────────────────────────────────────────

interface BookletSection {
  heading: string;
  breadcrumb_heading: string;
  body: string;
  summary?: string;
  classification?: string;
  key_entities?: string[];
  page: number;
  sequence?: number;
}

interface RuleSetNode {
  name: string;
  provisions: BookletSection[];
  benefits: RuleSetNode[];
  parent?: string | null;
}

interface BenefitHierarchy {
  name: string;
  provisions?: Array<{
    heading: string;
    breadcrumb_heading: string;
    page: number;
  }>;
  benefits: BenefitHierarchy[];
}

interface BenefitContent {
  name: string;
  parent: string | null;
  "sub-benefits"?: string[];
  sections: Array<{
    heading: string;
    breadcrumb_heading: string;
    body: string;
    classification: string;
    page: number;
  }>;
}

interface SearchResult {
  heading: string;
  breadcrumb_heading: string;
  body: string;
  page: number;
  ruleset_name: string;
  keywords_found: string[];
}

// ────────────────────────────────────────────────────────────────────────────────
// Benefits Plan Tools Implementation
// ────────────────────────────────────────────────────────────────────────────────

export class BenefitsPlanTools {
  private ruleset: RuleSetNode | null = null;
  private booklet: BookletSection[] = [];

  constructor(private rulesetPath: string, private bookletPath?: string) {}

  async initialize(): Promise<void> {
    // Load ruleset cache
    if (await fs.pathExists(this.rulesetPath)) {
      this.ruleset = await fs.readJSON(this.rulesetPath);
    } else {
      throw new Error(`Ruleset not found at ${this.rulesetPath}`);
    }

    // Load booklet cache if provided
    if (this.bookletPath && (await fs.pathExists(this.bookletPath))) {
      const bookletData = await fs.readJSON(this.bookletPath);
      this.booklet = bookletData.sections || [];
    }
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Tool 1: get_benefit_structure
  // ──────────────────────────────────────────────────────────────────────────────
  getBenefitStructure(
    startingPoint: string = "Plan",
    includeSections: boolean = false
  ): BenefitHierarchy {
    if (!this.ruleset) throw new Error("Ruleset not initialized");

    const targetNode = this.findRuleset(this.ruleset, startingPoint);
    if (!targetNode) {
      throw new Error(`Benefit not found: ${startingPoint}`);
    }

    return this.buildHierarchy(targetNode, includeSections);
  }

  private findRuleset(node: RuleSetNode, name: string): RuleSetNode | null {
    // Handle "Plan" or "General Provisions" as root
    if (
      (name === "Plan" || name === "General Provisions") &&
      !node.parent
    ) {
      return node;
    }

    if (node.name === name) {
      return node;
    }

    for (const benefit of node.benefits) {
      const found = this.findRuleset(benefit, name);
      if (found) return found;
    }

    return null;
  }

  private buildHierarchy(
    node: RuleSetNode,
    includeSections: boolean
  ): BenefitHierarchy {
    const result: BenefitHierarchy = {
      name: node.name,
      benefits: [],
    };

    if (includeSections && node.provisions.length > 0) {
      result.provisions = node.provisions.map((p) => ({
        heading: p.heading,
        breadcrumb_heading: p.breadcrumb_heading,
        page: p.page,
      }));
    }

    result.benefits = node.benefits.map((b) =>
      this.buildHierarchy(b, includeSections)
    );

    return result;
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Tool 2: get_general_provisions
  // ──────────────────────────────────────────────────────────────────────────────
  getGeneralProvisions(): BookletSection[] {
    if (!this.ruleset) throw new Error("Ruleset not initialized");

    // Return provisions from the root node
    return this.ruleset.provisions.map((p) => ({
      heading: p.heading,
      breadcrumb_heading: p.breadcrumb_heading,
      body: p.body,
      classification: p.classification || "",
      page: p.page,
      summary: p.summary,
    }));
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Tool 3: get_benefit_details
  // ──────────────────────────────────────────────────────────────────────────────
  getBenefitDetails(benefitName: string): BenefitContent[] {
    if (!this.ruleset) throw new Error("Ruleset not initialized");

    const targetNode = this.findRuleset(this.ruleset, benefitName);
    if (!targetNode) {
      throw new Error(`Benefit not found: ${benefitName}`);
    }

    return this.getContentWithParents(targetNode);
  }

  private getContentWithParents(node: RuleSetNode): BenefitContent[] {
    const result: BenefitContent[] = [];
    let current: RuleSetNode | null = node;
    let isTarget = true;

    while (current) {
      const content: BenefitContent = {
        name: current.name,
        parent: current.parent || null,
        sections: current.provisions.map((s) => ({
          heading: s.heading,
          breadcrumb_heading: s.breadcrumb_heading,
          body: s.body,
          classification: s.classification || "",
          page: s.page,
        })),
      };

      // Add sub-benefits only for the target node
      if (isTarget) {
        content["sub-benefits"] = current.benefits.map((b) => b.name);
        isTarget = false;
      }

      result.push(content);

      // Move to parent
      if (current.parent) {
        current = this.findRuleset(this.ruleset!, current.parent);
      } else {
        current = null;
      }
    }

    return result;
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Tool 4: get_section_context
  // ──────────────────────────────────────────────────────────────────────────────
  getSectionContext(breadcrumbHeading: string): BookletSection[] {
    if (!this.ruleset) throw new Error("Ruleset not initialized");

    const results: BookletSection[] = [];

    const searchNode = (node: RuleSetNode) => {
      for (const provision of node.provisions) {
        if (provision.breadcrumb_heading === breadcrumbHeading) {
          results.push(provision);
        }
      }

      for (const benefit of node.benefits) {
        searchNode(benefit);
      }
    };

    searchNode(this.ruleset);

    if (results.length === 0) {
      throw new Error(`Section not found: ${breadcrumbHeading}`);
    }

    return results;
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Tool 5: get_mini_booklet
  // ──────────────────────────────────────────────────────────────────────────────
  getMiniBooklet(): Array<{ heading: string; summary: string; page: number }> {
    if (!this.ruleset) throw new Error("Ruleset not initialized");

    const results: Array<{ heading: string; summary: string; page: number }> =
      [];

    const collectSections = (node: RuleSetNode) => {
      for (const provision of node.provisions) {
        results.push({
          heading: provision.breadcrumb_heading,
          summary: provision.summary || provision.body.slice(0, 200) + "...",
          page: provision.page,
        });
      }

      for (const benefit of node.benefits) {
        collectSections(benefit);
      }
    };

    collectSections(this.ruleset);

    return results.sort((a, b) => a.page - b.page);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Tool 6: search_keywords
  // ──────────────────────────────────────────────────────────────────────────────
  searchKeywords(
    keywords: string[],
    caseSensitive: boolean = false
  ): SearchResult[] {
    if (!this.ruleset) throw new Error("Ruleset not initialized");

    const results: SearchResult[] = [];
    const searchTerms = this.processSearchTerms(keywords);

    const searchNode = (node: RuleSetNode) => {
      for (const provision of node.provisions) {
        const foundTerms = this.findMatchingTerms(
          provision.body,
          searchTerms,
          caseSensitive
        );

        if (foundTerms.length > 0) {
          results.push({
            heading: provision.heading,
            breadcrumb_heading: provision.breadcrumb_heading,
            body: provision.body,
            page: provision.page,
            ruleset_name: node.name,
            keywords_found: foundTerms,
          });
        }
      }

      for (const benefit of node.benefits) {
        searchNode(benefit);
      }
    };

    searchNode(this.ruleset);

    // Sort by number of keywords found (descending), then by breadcrumb
    results.sort(
      (a, b) =>
        b.keywords_found.length - a.keywords_found.length ||
        a.breadcrumb_heading.localeCompare(b.breadcrumb_heading)
    );

    return results;
  }

  private processSearchTerms(terms: string[]): string[] {
    return terms.map((term) => {
      // Remove quotes from exact phrases
      if (term.startsWith('"') && term.endsWith('"')) {
        return term.slice(1, -1);
      }
      return term;
    });
  }

  private findMatchingTerms(
    text: string,
    terms: string[],
    caseSensitive: boolean
  ): string[] {
    const searchText = caseSensitive ? text : text.toLowerCase();
    const searchTerms = caseSensitive
      ? terms
      : terms.map((t) => t.toLowerCase());

    return terms.filter((_, i) => searchText.includes(searchTerms[i]));
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// Tool Call Handler
// ────────────────────────────────────────────────────────────────────────────────

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export async function executeToolCall(
  toolCall: ToolCall,
  tools: BenefitsPlanTools
): Promise<{ tool_call_id: string; role: "tool"; content: string }> {
  const { name, arguments: argsString } = toolCall.function;
  const args = JSON.parse(argsString);

  let result: any;

  try {
    switch (name) {
      case "get_benefit_structure":
        result = tools.getBenefitStructure(
          args.starting_point || "Plan",
          args.include_sections ?? false
        );
        break;

      case "get_general_provisions":
        result = tools.getGeneralProvisions();
        break;

      case "get_benefit_details":
        if (!args.benefit_name) {
          throw new Error("benefit_name is required");
        }
        result = tools.getBenefitDetails(args.benefit_name);
        break;

      case "get_section_context":
        if (!args.breadcrumb_heading) {
          throw new Error("breadcrumb_heading is required");
        }
        result = tools.getSectionContext(args.breadcrumb_heading);
        break;

      case "get_mini_booklet":
        result = tools.getMiniBooklet();
        break;

      case "search_keywords":
        if (!args.keywords || !Array.isArray(args.keywords)) {
          throw new Error("keywords array is required");
        }
        result = tools.searchKeywords(
          args.keywords,
          args.case_sensitive ?? false
        );
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      tool_call_id: toolCall.id,
      role: "tool",
      content: JSON.stringify(result, null, 2),
    };
  } catch (error: any) {
    return {
      tool_call_id: toolCall.id,
      role: "tool",
      content: JSON.stringify({
        error: error.message || "Tool execution failed",
      }),
    };
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// Export tool definitions for OpenAI
// ────────────────────────────────────────────────────────────────────────────────

export const BENEFITS_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_benefit_structure",
      description:
        "Returns the hierarchical structure of the benefits plan, showing how benefits and their sub-benefits are organized. Returns structure and optionally includes related sections for each benefit. Always start here to understand what benefits are available.",
      parameters: {
        type: "object",
        properties: {
          starting_point: {
            type: "string",
            description:
              "Where to start in the hierarchy (use 'Plan' for complete structure, or a specific benefit name like 'Basic Life Insurance' to focus on one benefit)",
          },
          include_sections: {
            type: "boolean",
            description:
              "Set to true to see the sections that relate to each benefit, false for benefit structure only",
          },
          justification: {
            type: "string",
            description: "Explain why you need this view of the benefit structure.",
          },
        },
        required: ["starting_point", "justification"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_general_provisions",
      description:
        "Shows the general sections and requirements that apply to all benefits. Returns sections related to definitions, eligibility for benefits, and other requirements that apply to all benefits. Review these to understand the foundational rules that govern all benefits.",
      parameters: {
        type: "object",
        properties: {
          justification: {
            type: "string",
            description: "Explain why you need to review these general requirements.",
          },
        },
        required: ["justification"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_benefit_details",
      description:
        "After identifying a specific benefit, use this to get its complete details including all requirements, conditions, and rules that apply to that benefit. Returns all sections describing what's covered and any special rules for the benefit AND all sections from parent benefits up to the root level.",
      parameters: {
        type: "object",
        properties: {
          benefit_name: {
            type: "string",
            description: "Name of the benefit to retrieve (e.g., 'Basic Life Insurance')",
          },
          justification: {
            type: "string",
            description: "Explain why you need to see this benefit's details.",
          },
        },
        required: ["benefit_name", "justification"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_section_context",
      description:
        "If you need to verify how a specific section fits into the overall benefits booklet structure, use this to get its context and related sections.",
      parameters: {
        type: "object",
        properties: {
          breadcrumb_heading: {
            type: "string",
            description:
              "The full path to the section (e.g., 'Benefits -> Medical -> Prescriptions')",
          },
          justification: {
            type: "string",
            description: "Explain why you need to verify this section's context.",
          },
        },
        required: ["breadcrumb_heading", "justification"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_mini_booklet",
      description:
        "Provides an outline of the complete benefits booklet structure. Returns a list of sections and their summaries from the benefits booklet. Only use this if you can't find what you need through the normal benefit structure.",
      parameters: {
        type: "object",
        properties: {
          justification: {
            type: "string",
            description:
              "Explain why the benefit structure wasn't sufficient for your needs.",
          },
        },
        required: ["justification"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_keywords",
      description:
        "Search for specific keywords or phrases across all benefits and their sections. Returns all sections containing any of the search terms, including which benefit they belong to.",
      parameters: {
        type: "object",
        properties: {
          keywords: {
            type: "array",
            items: {
              type: "string",
            },
            description:
              'List of terms to search for. Use quotes for exact phrases. Example: ["dental", "\\"wisdom tooth\\"", "x-ray"] will find sections containing either "dental" OR the exact phrase "wisdom tooth" OR "x-ray"',
          },
          case_sensitive: {
            type: "boolean",
            description: "Whether to perform case-sensitive search (default false)",
          },
          justification: {
            type: "string",
            description: "Explain why you need to search for these keywords.",
          },
        },
        required: ["keywords", "justification"],
        additionalProperties: false,
      },
    },
  },
];