// src/server/benefits/run-booklet-python.ts
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "fs-extra";

const pdf = "src/server/benefits/Sample Booklet1.pdf";
const out = "src/server/benefits";

async function runPython(pdfPath: string, outDir: string, summarize = true) {
  await fs.ensureDir(outDir);

  // Use your venv’s python if available, else fallback to "python3"
  const python = process.platform === "win32"
    ? path.resolve(".venv", "Scripts", "python.exe")
    : path.resolve(".venv", "bin", "python");

  const cmd = fs.existsSync(python) ? python : "python3";

  const args = [
    "src/server/benefits/booklet.py", // path to your original Python file
    "--pdf", pdfPath,
    "--out", outDir,
    ...(summarize ? ["--summarize"] : [])
  ];

  console.log("→ Running:", cmd, args.join(" "));
  return new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Python exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

(async () => {
  await runPython(pdf, out, true);
  console.log("✅ Wrote", path.join(out, "booklet_cache.json"));
})();
