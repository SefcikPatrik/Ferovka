// Writes src/data/catalog.json – the only catalogue the site imports (it ends up in the browser's JS bundle).
// Premium analyses (not in src/data/access.json "free") keep only slug, file, name, brand, model, kind and date:
// no summary, ad count, median, model accuracy or history numbers. Totals are pre-aggregated here.
// Runs before every build / dev; src/data/reports.json (written by sync-reports.mjs) stays the source.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const all = read("src/data/reports.json");
const free = new Set(read("src/data/access.json").free);

const models = all.filter((r) => r.kind === "model");
const totals = {
  analyses: models.length,
  ads: models.reduce((s, r) => s + (r.ads ?? 0), 0),
  updated: all.map((r) => r.date).sort().at(-1) ?? "",
};
const reports = all.map((r) =>
  free.has(r.slug)
    ? r
    : { slug: r.slug, file: r.file, name: r.name, brand: r.brand, model: r.model, kind: r.kind, date: r.date, summary: "", ads: null, median: null, r2: null },
);
fs.writeFileSync(path.join(root, "src/data/catalog.json"), JSON.stringify({ totals, reports }, null, 1) + "\n");
console.log(`catalog: ${reports.length} analyses, ${free.size} free with details`);
