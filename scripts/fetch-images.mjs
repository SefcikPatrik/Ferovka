// Finds a freely licensed photo for every analysis on Wikimedia Commons, downloads it to public/img/<slug>.jpg
// and records author + licence in src/data/images.json (shown on the site – CC BY / BY-SA require attribution).
//
//   npm run images                 – only analyses without a photo
//   npm run images -- --redo slug  – pick a photo again
//   pin a specific file: set "file": "File:…jpg" for the slug in images.json and run with --redo slug
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const imgDir = path.join(root, "public", "img");
const dataFile = path.join(root, "src", "data", "images.json");
const UA = { "User-Agent": "Ferovka/0.1 (https://github.com/SefcikPatrik/Ferovka)" };
const API = "https://commons.wikimedia.org/w/api.php";
const OK_LICENSE = /^(CC BY(-SA)? [\d.]+|CC0|Public domain)/i;
const BAD_TITLE = /interior|innen|cockpit|engine|motor|dashboard|interieur|rear|heck|detail|logo|badge|wheel|seat|trunk|kofferraum/i;
const strip = (s = "") => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

// search phrase per analysis (Commons titles are mostly English / German)
const query = (r) =>
  r.name
    .replace(/Š/g, "S")
    .replace(/\bkombi\b|\bcombi\b|\bSW\b/i, (m) => (/sw/i.test(m) ? "Sportswagon" : "Combi"))
    .replace("Hyundai i30 Combi", "Hyundai i30 Kombi");

async function search(q) {
  const u = new URL(API);
  Object.entries({
    action: "query", format: "json", generator: "search", gsrnamespace: "6", gsrlimit: "40",
    gsrsearch: `${q} filetype:bitmap`, prop: "imageinfo", iiprop: "url|size|extmetadata", iiurlwidth: "1800",
  }).forEach(([k, v]) => u.searchParams.set(k, v));
  const d = await (await fetch(u, { headers: UA })).json();
  return Object.values(d.query?.pages ?? {}).sort((a, b) => a.index - b.index);
}

async function info(title) {
  const u = new URL(API);
  Object.entries({ action: "query", format: "json", titles: title, prop: "imageinfo", iiprop: "url|size|extmetadata", iiurlwidth: "1800" })
    .forEach(([k, v]) => u.searchParams.set(k, v));
  const d = await (await fetch(u, { headers: UA })).json();
  return Object.values(d.query.pages)[0];
}

function usable(p, words) {
  const ii = p.imageinfo?.[0];
  if (!ii) return false;
  const m = ii.extmetadata ?? {};
  const ratio = ii.width / ii.height;
  const t = p.title.toLowerCase();
  return (
    OK_LICENSE.test(m.LicenseShortName?.value ?? "") &&
    ii.width >= 1800 && ratio >= 1.35 && ratio <= 2.3 &&
    !BAD_TITLE.test(p.title) &&
    words.every((w) => t.includes(w))
  );
}

/** Downloads a photo for every model analysis that has none yet; returns the images catalogue. */
export async function fetchImages(reports, redo = new Set()) {
  fs.mkdirSync(imgDir, { recursive: true });
  const images = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, "utf8")) : {};
  for (const r of reports) {
    if (r.kind !== "model") continue;
    if (images[r.slug]?.src && !redo.has(r.slug)) continue;
    const pinned = images[r.slug]?.file;
    let page;
    if (pinned) page = await info(pinned);
    else {
      const q = query(r);
      const words = r.model.toLowerCase().split(" ").slice(0, 1); // the model name must be in the file name
      const wagon = /kombi|combi|\bsw\b/i.test(r.model);
      const WAGON = /combi|kombi|wagon|estate|\bsw\b|\bcw\b|sportswagon|touring/i;
      page = (await search(q)).find((p) => usable(p, words) && (!wagon || WAGON.test(p.title)));
    }
    if (!page) {
      console.warn(`! ${r.slug}: no suitable photo found`);
      continue;
    }
    const ii = page.imageinfo[0];
    const m = ii.extmetadata ?? {};
    const buf = Buffer.from(await (await fetch(ii.thumburl, { headers: UA })).arrayBuffer());
    fs.writeFileSync(path.join(imgDir, `${r.slug}.jpg`), buf);
    images[r.slug] = {
      src: `/img/${r.slug}.jpg`,
      file: page.title,
      author: strip(m.Artist?.value) || "neznámy autor",
      license: m.LicenseShortName?.value ?? "",
      source: ii.descriptionurl,
    };
    console.log(`✓ ${r.slug}: ${page.title} (${images[r.slug].license}, ${images[r.slug].author})`);
  }
  fs.writeFileSync(dataFile, JSON.stringify(images, null, 2));
  return images;
}

if (path.resolve(process.argv[1] ?? "") === path.resolve(import.meta.filename)) {
  const reports = JSON.parse(fs.readFileSync(path.join(root, "src", "data", "reports.json"), "utf8"));
  const i = process.argv.indexOf("--redo");
  await fetchImages(reports, new Set(i >= 0 ? process.argv.slice(i + 1) : []));
}
