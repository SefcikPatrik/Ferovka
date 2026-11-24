// Grants / shows / removes the paid access of an account by hand (until the payment gateway is connected,
// or for friends and testing). The account must exist (the person registers on the web first).
//   node scripts/pristup.mjs --env <file> --email a@b.sk                 show the account
//   node scripts/pristup.mjs --env <file> --email a@b.sk --dni 30        extend access by 30 days (from today
//                                                                        or from the current end, whichever is later)
//   node scripts/pristup.mjs --env <file> --email a@b.sk --zrusit        remove the access
//   node scripts/pristup.mjs --env <file> --zoznam                       all accounts
// The token comes from `vercel env pull <file>` (keep that file outside the repo, never commit it).
// The person sees the change on the next page load (GET /api/ucet/ refreshes the session).
import crypto from "node:crypto";
import fs from "node:fs";
import { get, list, put } from "@vercel/blob";

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

const read = async (pathname) => JSON.parse(await new Response((await get(pathname, { access: "private" })).stream).text());
const day = (iso) => (iso ? new Date(iso).toLocaleDateString("sk-SK") : "–");
const active = (r) => Boolean(r.platene_do && Date.parse(r.platene_do) > Date.now());

if (args.includes("--zoznam")) {
  let cursor;
  const rows = [];
  do {
    const page = await list({ prefix: "ucty/", cursor, limit: 1000 });
    for (const b of page.blobs) rows.push(await read(b.pathname));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  rows.sort((a, b) => a.registrovany.localeCompare(b.registrovany));
  console.log(`Účtov: ${rows.length}, s aktívnym prístupom: ${rows.filter(active).length}\n`);
  for (const r of rows) console.log(`${r.registrovany.slice(0, 10)}  ${r.email}  ${active(r) ? `prístup do ${day(r.platene_do)}` : "bez prístupu"}`);
}

async function account() {

const email = String(opt("--email") ?? "").trim().toLowerCase();
if (!email) {
  console.error("Zadaj --email <e-mail> alebo --zoznam.");
  process.exit(1);
}
const pathname = `ucty/${crypto.createHash("sha256").update(email).digest("hex")}.json`;
let record;
try {
  record = await read(pathname);
} catch {
  console.error(`Účet ${email} neexistuje – nech sa najprv zaregistruje na webe.`);
  process.exit(1);
}

const days = opt("--dni");
if (days || args.includes("--zrusit")) {
  if (args.includes("--zrusit")) {
    record.platene_do = null;
  } else {
    const n = Number(days);
    if (!Number.isInteger(n) || n < 1 || n > 3650) {
      console.error("--dni musí byť celé číslo 1–3650.");
      process.exit(1);
    }
    const from = Math.max(Date.now(), Date.parse(record.platene_do ?? "") || 0);
    record.platene_do = new Date(from + n * 86_400_000).toISOString();
  }
  record.zmenene = new Date().toISOString();
  await put(pathname, JSON.stringify(record), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
console.log(`${record.email}: ${active(record) ? `prístup do ${day(record.platene_do)}` : "bez prístupu"} (registrovaný ${day(record.registrovany)})`);
}

if (!args.includes("--zoznam")) await account();
