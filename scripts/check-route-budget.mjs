import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const budgets = [
  { route: "/app", manifest: ".next/server/app/app/page_client-reference-manifest.js", maximumKb: 120 },
  { route: "/admin", manifest: ".next/server/app/admin/page_client-reference-manifest.js", maximumKb: 160 },
  { route: "/visor", manifest: ".next/server/app/app/material/[id]/visor/page_client-reference-manifest.js", maximumKb: 160 }
];

let failed = false;
for (const budget of budgets) {
  const manifest = await readFile(resolve(budget.manifest), "utf8");
  const chunks = [...new Set([...manifest.matchAll(/\/_next\/(static\/chunks\/[^\"]+\.js)/g)].map(match => match[1]))];
  const bytes = (await Promise.all(chunks.map(chunk => stat(resolve(".next", chunk))))).reduce((sum, file) => sum + file.size, 0);
  const kilobytes = bytes / 1024;
  console.log(`${budget.route}: ${kilobytes.toFixed(1)} KB / ${budget.maximumKb} KB`);
  if (kilobytes > budget.maximumKb) failed = true;
}

if (failed) {
  console.error("Una ruta superó el presupuesto de JavaScript inicial.");
  process.exitCode = 1;
}
