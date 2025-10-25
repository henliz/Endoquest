import path from "node:path";
import fs from "fs-extra";
import { buildRulesetTree, searchProvisions, searchBenefits } from "./ruleset.ts";
import type { BookletSection } from "./booklet.ts";

const cachePath = path.resolve("src/server/benefits/booklet_cache.json");
const outPath = path.resolve("src/server/benefits/ruleset.json");

(async () => {
  const cache = await fs.readJSON(cachePath) as { hierarchical: boolean; provisions: BookletSection[] };
  const root = await buildRulesetTree(cache.provisions);

  await fs.writeJSON(outPath, root, { spaces: 2 });
  console.log("✅ Wrote", outPath);

  // Optional quick search: pass terms after `--`
  const sep = process.argv.indexOf("--");
  if (sep !== -1) {
    const terms = process.argv.slice(sep + 1);
    if (terms.length) {
      console.log("🔎 Provisions:", searchProvisions(root, terms).slice(0, 5));
      console.log("🔎 Benefits:", searchBenefits(root, terms).slice(0, 5));
    }
  }
})();
