//To run this, use: npx ts-node --esm src/server/benefits/run-booklet.ts
//This converts the booklet into json format

import fs from "fs-extra";
import { readFileSync } from "node:fs";
import path from "path";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { OpenAI } from "openai";
import dotenv from "dotenv";

export type BBox = [number, number, number, number];

export interface Span {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName?: string;
  fontSize?: number;
}

export interface Line {
  spans: Span[];
  bbox: BBox;
}

export interface PageBlock { lines: Line[] }
export interface PageText {
  pageIndex: number;
  width: number;
  height: number;
  blocks: PageBlock[];
}

export interface SectionAttributes {
  size?: number;
  formatting?: string;
  alignment?: "left" | "center" | "right";
  indentation?: number;
}

export interface BookletSection {
  heading: string;
  breadcrumb_heading?: string | null;
  attributes: SectionAttributes;
  body: string;
  sequence: number;
  page: number;
  summary?: string;
  classification?: string;
  key_entities?: string[];
}

export interface BookletCache {
  hierarchical: boolean;
  provisions: BookletSection[];
}

// Load API key from a fixed path: src/server/.env
// (ensures it works regardless of the repo root CWD)
dotenv.config({ path: path.resolve("src/server/.env") });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function approxFontSize(transform: number[]) {
  const a = transform[0];
  const d = transform[3];
  const size = Math.max(Math.abs(a), Math.abs(d));
  return Math.round(size * 100) / 100;
}

function isAllCaps(s: string) { return !!s && s === s.toUpperCase(); }

function isTitleCase(s: string) {
  const small = new Set(["a","an","and","as","at","but","by","for","in","of","on","or","the","to","with"]);
  const words = s.split(/\s+/).filter(Boolean);
  if (!words.length) return false;
  if (!/^[A-Z]/.test(words[0])) return false;
  for (let i = 1; i < words.length; i++) {
    const w = words[i].replace(/[()]/g, "");
    const isSmall = small.has(w.toLowerCase());
    if (!isSmall && !/^[A-Z]/.test(w)) return false;
    if (isSmall && i !== words.length - 1 && /^[A-Z]/.test(w)) return false;
  }
  return true;
}

function cleanText(t: string) {
  return t
    .replaceAll("ﬁ", "fi")
    .replaceAll("ﬂ", "fl")
    .replaceAll("Ɵ", "ti")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

function determineAlignment(x1: number, x2: number, pageWidth: number, indent: number) {
  const margin = 24;
  const pageLeft = 0 + margin;
  const pageRight = pageWidth - margin;
  const diff = Math.abs((pageRight - x2) - (x1 - pageLeft));
  if (x1 < pageLeft + indent) return "left" as const;
  if (diff < margin) return "center" as const;
  if (x2 > pageRight - indent) return "right" as const;
  return "left" as const;
}

async function extractPages(pdfPath: string): Promise<PageText[]> {
  const data = new Uint8Array(readFileSync(pdfPath));
  const loadingTask = (pdfjs as any).getDocument({ data });
  const doc = await loadingTask.promise;
  const results: PageText[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent({ normalizeWhitespace: true });

    const items = textContent.items as any[];
    const spans: Span[] = items.map((it: any) => ({
      text: it.str as string,
      x: it.transform[4],
      y: it.transform[5],
      width: it.width,
      height: it.height,
      fontName: it.fontName,
      fontSize: approxFontSize(it.transform)
    }));

    spans.sort((a, b) => b.y - a.y || a.x - b.x);

    const epsilonY = 2.5;
    const lines: Line[] = [];
    let current: Span[] = [];

    for (const s of spans) {
      if (!current.length || Math.abs(current[0].y - s.y) <= epsilonY) {
        current.push(s);
      } else {
        current.sort((a, b) => a.x - b.x);
        const bbox: BBox = [
          current[0].x,
          current.reduce((m, v) => Math.min(m, v.y - v.height), Infinity),
          current[current.length - 1].x + current[current.length - 1].width,
          current.reduce((m, v) => Math.max(m, v.y), -Infinity)
        ];
        lines.push({ spans: current, bbox });
        current = [s];
      }
    }
    if (current.length) {
      current.sort((a, b) => a.x - b.x);
      const bbox: BBox = [
        current[0].x,
        current.reduce((m, v) => Math.min(m, v.y - v.height), Infinity),
        current[current.length - 1].x + current[current.length - 1].width,
        current.reduce((m, v) => Math.max(m, v.y), -Infinity)
      ];
      lines.push({ spans: current, bbox });
    }

    results.push({
      pageIndex: i - 1,
      width: viewport.width,
      height: viewport.height,
      blocks: [{ lines }]
    });
  }

  return results;
}

function buildSections(pages: PageText[]): BookletSection[] {
  const sections: BookletSection[] = [];
  const styleSizes: number[] = [];

  for (const p of pages) {
    for (const block of p.blocks) {
      for (const line of block.lines) {
        for (const sp of line.spans) styleSizes.push(sp.fontSize ?? 0);
      }
    }
  }
  const sorted = [...styleSizes].sort((a,b)=>a-b);
  const p90 = sorted[Math.floor(0.9 * (sorted.length-1))] ?? 12;

  let current: BookletSection | null = null;
  let seq = 0;

  for (const p of pages) {
    for (const block of p.blocks) {
      for (const line of block.lines) {
        const text = cleanText(line.spans.map(s => s.text).join(" ").trim());
        if (!text) continue;

        const first = line.spans[0];
        const size = Math.round((first.fontSize ?? 0) * 100) / 100;
        const fontName = first.fontName ?? "";
        const boldish = /bold/i.test(fontName);
        const alignment = determineAlignment(line.bbox[0], line.bbox[2], p.width, 8);
        const attrs: SectionAttributes = {
          size,
          formatting: [boldish ? "Bold" : null].filter(Boolean).join(", ") || "",
          alignment,
          indentation: Math.round(line.bbox[0] / 5) * 5
        };

        let header = false;
        if (size >= p90 || boldish) header = true;
        if (/[.]/.test(text)) header = false;
        if (text.length < 3) header = false;
        if ([
          "Summary of Benefits","Table of Contents","Schedule of Benefits","Benefit Schedule","Benefit Summary"
        ].includes(text)) header = true;
        if (isAllCaps(text) || isTitleCase(text)) header = true;

        if (header) {
          if (current) sections.push(current);
          current = {
            heading: text,
            attributes: attrs,
            body: "",
            sequence: ++seq,
            page: p.pageIndex + 1,
            breadcrumb_heading: null
          };
        } else {
          if (!current) {
            current = {
              heading: "Preface",
              attributes: attrs,
              body: text,
              sequence: ++seq,
              page: p.pageIndex + 1,
              breadcrumb_heading: null
            };
          } else {
            current.body += (current.body ? "\n" : "") + text;
          }
        }
      }
    }
  }
  if (current) sections.push(current);

  const sizes = sections.map(s => s.attributes.size ?? 0);
  const uniq = Array.from(new Set(sizes)).sort((a,b)=>b-a);
  const tierFor = new Map(uniq.map((v,i)=>[v,i]));
  const breadcrumb: string[] = [];
  for (const s of sections) {
    const idx = tierFor.get(s.attributes.size ?? 0) ?? 0;
    breadcrumb[idx] = s.heading;
    for (let j = idx+1; j < breadcrumb.length; j++) (breadcrumb as any)[j] = "";
    s.breadcrumb_heading = breadcrumb.filter(Boolean).join(" › ");
  }

  return sections;
}

export class BenefitsBookletTS {
  sections: BookletSection[] = [];
  hierarchical = false;
  resultsDir: string;
  pdfPath: string;

  constructor(pdfPath: string, resultsDir: string) {
    this.pdfPath = pdfPath;
    this.resultsDir = resultsDir;
    fs.ensureDirSync(this.resultsDir);
  }

  private cacheFile() { return path.join(this.resultsDir, "booklet_cache.json"); }

  async loadOrProcess(opts?: { force?: boolean; summarize?: boolean }) {
    const force = !!opts?.force;
    const summarize = !!opts?.summarize;

    console.log(`→ Parsing: ${this.pdfPath} -> ${this.resultsDir}`);

    if (!force && await fs.pathExists(this.cacheFile())) {
      const cached = await fs.readJSON(this.cacheFile()) as BookletCache;
      this.sections = cached.provisions;
      this.hierarchical = cached.hierarchical;
      if (!this.hierarchical) this.reconstructHierarchy();
      return;
    }

    const pages = await extractPages(this.pdfPath);
    console.log(`→ Extracted ${pages.length} page(s)`);
    this.sections = buildSections(pages);
    console.log(`→ Built ${this.sections.length} section(s)`);
    this.reconstructHierarchy();

    if (summarize && process.env.OPENAI_API_KEY) {
      await this.parallelSummaries();
    }

    const cache: BookletCache = { hierarchical: true, provisions: this.sections };
    console.log(`→ Writing: ${this.cacheFile()}`);
    await fs.writeJSON(this.cacheFile(), cache, { spaces: 2 });
  }

  private reconstructHierarchy() {
    this.hierarchical = true;
  }

  private async parallelSummaries() {
    const batch = 4;
    const work = [...this.sections];
    while (work.length) {
      const chunk = work.splice(0, batch);
      await Promise.all(chunk.map(async (s) => {
        try {
          const { heading, summary, classification, key_entities } = await this.summarizeSection(s.heading, s.body);
          s.heading = heading || s.heading;
          s.summary = summary;
          s.classification = classification;
          s.key_entities = key_entities ?? [];
        } catch {}
      }));
    }
  }

  private async summarizeSection(heading: string, body: string) {
    const sys = `You are an expert employee benefits analyst. Return JSON with keys: heading, summary, classification, key_entities (array). Classification must be one of: ["General Provisions","Eligibility","Life Insurance","Accidental Death and Dismemberment","Short-Term Disability","Long-Term Disability","Extended Health Care","Dental","Vision","Travel/Out of Country","Other"]. If you are unsure, use "Other".`;
    const user = `Section Heading: ${heading}\n\nSection Body:\n${body.slice(0, 4000)}`;

    const out = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user }
      ]
    });
    const content = out.choices[0].message.content || "{}";
    return JSON.parse(content);
  }
}
