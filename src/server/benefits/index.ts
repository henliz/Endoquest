import { Command } from "commander";
import path from "path";
import * as fs from "fs-extra";
import chalk from "chalk";
import "dotenv/config";

import { BenefitsBookletTS } from "./booklet";
import { buildRulesetTree, searchBenefits, searchProvisions } from "./ruleset";

const program = new Command();
program
  .name("benefits-booklet-ts")
  .description("Parse a benefits booklet PDF and build a searchable structure")
  .version("0.1.0");

program.command("parse")
  .argument("<pdf>", "path to the booklet PDF")
  .option("-o, --out <dir>", "output directory", "./results")
  .option("--no-summarize", "skip OpenAI summarization/classification")
  .action(async (pdf, opts) => {
    const outDir = path.resolve(opts.out);
    await fs.ensureDir(outDir);

    const booklet = new BenefitsBookletTS(pdf, outDir);
    await booklet.loadOrProcess({ force: true, summarize: !!opts.summarize });

    const provisionsPath = path.join(outDir, "provisions.json");
    await fs.writeJSON(provisionsPath, { hierarchical: true, provisions: booklet.sections }, { spaces: 2 });
    console.log(chalk.green("• Parsed provisions →"), provisionsPath);

    const tree = await buildRulesetTree(booklet.sections);
    const rulesetPath = path.join(outDir, "ruleset.json");
    await fs.writeJSON(rulesetPath, tree, { spaces: 2 });
    console.log(chalk.green("• Built ruleset tree →"), rulesetPath);

    const provHits = searchProvisions(tree, ["dental", "x-ray"], false);
    await fs.writeJSON(path.join(outDir, "sample_provision_search.json"), provHits, { spaces: 2 });
    const benHits = searchBenefits(tree, ["Life", "Disability"]);
    await fs.writeJSON(path.join(outDir, "sample_benefit_search.json"), benHits, { spaces: 2 });
    console.log(chalk.green("• Sample searches written."));
  });

program.parseAsync(process.argv).catch(e => {
  console.error(e);
  process.exit(1);
});

// --- runtime helper (no CLI changes needed) ---
type Section = { heading: string; breadcrumb_heading?: string|null; body: string; classification?: string; page: number };
type RulesetNode = { name: string; parent?: string|null; sections: Section[]; children: RulesetNode[] };

function extractBenefitKeywords(text: string): string[] {
  const t = text.toLowerCase();
  const kws: string[] = [];
  if (/\bdental|tooth|teeth|x-?ray|ortho/i.test(t)) kws.push("Dental","x-ray","orthodontic");
  if (/\bvision|glasses|optometrist|eyes?/i.test(t)) kws.push("Vision","eye exam");
  if (/\bdrug|prescription|pharmacy|rx\b/i.test(t)) kws.push("Extended Health Care","drug");
  if (/\btherapy|physio|massage|chiro|mental|counsel(l)?ing/i.test(t)) kws.push("paramedical","Extended Health Care");
  if (/\btravel|out of country|ooc|abroad/i.test(t)) kws.push("Travel","Out of Country");
  if (/\bdisability|short[- ]term|long[- ]term|std|ltd/i.test(t)) kws.push("Disability","Short-Term","Long-Term");
  if (/\blife insurance|beneficiary|ad&d|accidental death/i.test(t)) kws.push("Life","Accidental Death and Dismemberment");
  return Array.from(new Set(kws));
}

/** Load ruleset.json and search it using keywords inferred from free text. */
export async function queryBenefitsRuntime(text: string, outDir = "results") {
  const rulesetPath = path.join(outDir, "ruleset.json");
  const tree = (await fs.readJSON(rulesetPath)) as RulesetNode;
  const keywords = extractBenefitKeywords(text);
  if (keywords.length === 0) return { keywords, benefits: [], provisions: [] };
  const benefits = searchBenefits(tree, keywords);
  const provisions = searchProvisions(tree, keywords, false);
  return { keywords, benefits, provisions };
}
