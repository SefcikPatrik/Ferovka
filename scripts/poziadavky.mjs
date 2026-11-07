// Prints visitors' requests from the private Vercel Blob store (form at the bottom of every page → api/poziadavka.js).
//   BLOB_READ_WRITE_TOKEN=… node scripts/poziadavky.mjs            all requests, newest first
//   node scripts/poziadavky.mjs --env <file> [--since 2026-11-01] [--delete <pathname>]
// The token comes from `vercel env pull <file>` (keep that file outside the repo, never commit it).
import fs from "node:fs";
import { list, get, del } from "@vercel/blob";

const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const envFile = opt("--env");
if (envFile) {
  const m = fs.readFileSync(envFile, "utf8").match(/^BLOB_READ_WRITE_TOKEN="?([^"\r\n]+)"?/m);
  if (m) process.env.BLOB_READ_WRITE_TOKEN = m[1];
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("Chýba BLOB_READ_WRITE_TOKEN (alebo --env <súbor z vercel env pull>).");
  process.exit(1);
}

const toDelete = opt("--delete");
if (toDelete) {
  await del(toDelete);
  console.log("zmazané:", toDelete);
  process.exit(0);
}

const since = opt("--since") ?? "";
const blobs = [];
let cursor;
do {
  const page = await list({ prefix: "poziadavky/", cursor, limit: 1000 });
  blobs.push(...page.blobs);
  cursor = page.hasMore ? page.cursor : undefined;
} while (cursor);

const rows = blobs.filter((b) => b.uploadedAt.toISOString() >= since).sort((a, b) => b.uploadedAt - a.uploadedAt);
console.log(`Požiadaviek: ${rows.length}${since ? ` (od ${since})` : ""}\n`);
for (const b of rows) {
  const res = await get(b.pathname, { access: "private" });
  const r = JSON.parse(await new Response(res.stream).text());
  console.log(`${r.prijate.slice(0, 16).replace("T", " ")}  [${r.typ_nazov}]  ${r.stranka || ""}${r.email ? `  ✉ ${r.email}` : ""}`);
  console.log(`  ${r.sprava.replace(/\s+/g, " ")}`);
  console.log(`  (${b.pathname})\n`);
}
