// Build step: keeps only the free analyses (src/data/access.json) in the public static output.
// Every other report is copied to private/reports/ (served after login by api/report.js) and removed from
// public/reports/; history JSONs of locked models are removed from public/history/ (no page reads them).
// It changes the working tree, so it runs only on Vercel (VERCEL=1) or when forced with LOCK_REPORTS=1 –
// a local `npm run build` / the publish flow keep public/ intact.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (process.env.VERCEL !== "1" && process.env.LOCK_REPORTS !== "1") {
  console.log("lock-reports: skipped (not a Vercel build; set LOCK_REPORTS=1 to force)");
  process.exit(0);
}

const free = new Set(JSON.parse(fs.readFileSync(path.join(root, "src/data/access.json"), "utf8")).free);
const reportsDir = path.join(root, "public/reports");
const historyDir = path.join(root, "public/history");
const privateDir = path.join(root, "private/reports");
fs.mkdirSync(privateDir, { recursive: true });

const slugOf = (file) => file.replace(/(-analyza)?\.html$/, "");
let locked = 0;
let open = 0;
for (const file of fs.readdirSync(reportsDir).filter((f) => f.endsWith(".html"))) {
  const src = path.join(reportsDir, file);
  fs.copyFileSync(src, path.join(privateDir, file));
  if (free.has(slugOf(file))) {
    open++;
  } else {
    fs.rmSync(src);
    locked++;
  }
}
let history = 0;
if (fs.existsSync(historyDir)) {
  for (const file of fs.readdirSync(historyDir).filter((f) => f.endsWith(".json"))) {
    if (!free.has(file.replace(/\.json$/, ""))) {
      fs.rmSync(path.join(historyDir, file));
      history++;
    }
  }
}
const missing = [...free].filter((s) => !fs.existsSync(path.join(reportsDir, `${s}-analyza.html`)));
if (missing.length) console.warn(`lock-reports: free analyses without a report: ${missing.join(", ")}`);
console.log(`lock-reports: ${open} free, ${locked} locked (private/reports), ${history} history files removed`);
