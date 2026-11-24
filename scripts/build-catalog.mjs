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
// Home page sample: the first recommended offers ("cards") of a free analysis, straight from its current report.
const SAMPLE = read("src/data/access.json").sample ?? [...free][0];
const text = (h) => h.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
function picksOf(slug, n = 3) {
  const file = path.join(root, "public/reports", `${slug}-analyza.html`);
  if (!free.has(slug) || !fs.existsSync(file)) return [];
  const html = fs.readFileSync(file, "utf8");
  const start = html.indexOf('<div class="cards">');
  if (start < 0) return [];
  const block = html.slice(start, html.indexOf("</div>\n</section>", start) > 0 ? undefined : undefined);
  const out = [];
  for (const m of block.matchAll(/<article class="card">([\s\S]*?)<\/article>/g)) {
    const a = m[1];
    const link = /<h3><a href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a><\/h3>/.exec(a); // both quote styles occur
    const facts = /<div class="facts">([\s\S]*?)<\/div>/.exec(a);
    const val = (label) => {
      const r = new RegExp(`<span class="lbl">${label}</span><span[^>]*>([\\s\\S]*?)</span>`).exec(a);
      return r ? text(r[1]) : null;
    };
    const pick = {
      title: link ? text(link[2]) : null,
      url: link ? link[1] : null,
      facts: facts ? text(facts[1]).split(" · ").slice(0, 3).join(" · ") : null,
      price: val("Cena"),
      fair: val("Férová cena"),
      discount: val("Pod trhom"),
    };
    if (pick.url && /^https:\/\//.test(pick.url) && pick.price && pick.fair) out.push(pick);
    if (out.length >= n) break;
  }
  return out;
}
const sample = { slug: SAMPLE, picks: picksOf(SAMPLE) };
fs.writeFileSync(path.join(root, "src/data/catalog.json"), JSON.stringify({ totals, reports, sample }, null, 1) + "\n");
console.log(`catalog: home sample ${SAMPLE} with ${sample.picks.length} offers`);
console.log(`catalog: ${reports.length} analyses, ${free.size} free with details`);
