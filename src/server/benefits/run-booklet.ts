// src/server/benefits/run-booklet.ts
import { BenefitsBookletTS } from "./booklet.ts";

const pdf = "src/server/benefits/Sample Booklet1.pdf";
const out = "src/server/benefits";

(async () => {
  const b = new BenefitsBookletTS(pdf, out);
  await b.loadOrProcess({ summarize: true });
  console.log("✅ Wrote", `${out}/booklet_cache.json`);
})();
