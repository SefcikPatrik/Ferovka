// Vercel Function: serves an analysis HTML that is not public (see src/data/access.json and scripts/lock-reports.mjs).
// vercel.json rewrites /reports/<file>.html here when no static file exists. Free analyses are served without login,
// the rest only with a session that carries active paid access (5 € / 30 days, api/ucet.js).
import fs from "node:fs";
import path from "node:path";
import { currentUser, hasAccess } from "./_auth.js";

// read at runtime (bundled via includeFiles in vercel.json), so the list is shared with the site build
const FREE = new Set(JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/access.json"), "utf8")).free);
const FILE = /^([a-z0-9-]+?)(-analyza)?\.html$/;
// lock-reports.mjs copies locked reports to private/reports during the Vercel build; public/reports is the fallback
// in case the function was bundled before that step ran.
const DIRS = ["private/reports", "public/reports"];

const page = (title, body) => `<!doctype html><html lang="sk"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:560px;margin:15vh auto;padding:0 16px;line-height:1.5;color:#141a16;background:#f5f4ef}
@media (prefers-color-scheme:dark){body{color:#e8ece9;background:#0d110f}}a{color:#0f9d63;font-weight:700}</style></head>
<body>${body}</body></html>`;

export default function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  const file = String(req.query.file ?? "");
  const m = FILE.exec(file);
  const found = m && DIRS.map((d) => path.join(process.cwd(), d, file)).find((p) => fs.existsSync(p));
  if (!found) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(404).send(page("Analýza neexistuje", `<h1>Analýza neexistuje</h1><p><a href="/#analyzy">Všetky analýzy →</a></p>`));
  }
  const slug = m[1];
  if (!FREE.has(slug) && !hasAccess(currentUser(req))) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res
      .status(401)
      .send(
        page(
          "Prémiová analýza",
          `<h1>Táto analýza je prémiová</h1><p>Zadarmo je 10 analýz najväčších trhov. Všetky ostatné analýzy odomkneš na 30 dní za 5 €.</p>
<p><a href="/analyza/${slug}/">Odomknúť analýzu →</a></p>`,
        ),
      );
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(fs.readFileSync(found));
}
