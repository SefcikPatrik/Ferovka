// Vercel Function: stores a visitor's request ("pridajte model", "inzerát je predaný", "chyba v údajoch") as a private
// JSON file in the Vercel Blob store "ferovka-poziadavky" (EU, fra1). No IP address or other tracking data is kept.
// Read them with: vercel blob list --prefix poziadavky/   and   vercel blob get <pathname>
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

const TYPES = { model: "Analýza ďalšieho modelu", neaktualne: "Neaktuálny / predaný inzerát", chyba: "Chyba v údajoch", ine: "Iné" };
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

function sameSite(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // same-origin form posts from older browsers
  try {
    const host = new URL(origin).host;
    return host === req.headers.host || host === "ferovka-nine.vercel.app" || host.startsWith("localhost:");
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Použi formulár na stránke." });
  }
  if (!sameSite(req)) return res.status(403).json({ ok: false, error: "Požiadavka z inej stránky." });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== "object") return res.status(400).json({ ok: false, error: "Neplatná požiadavka." });
  if (body.web) return res.status(200).json({ ok: true }); // honeypot field filled = bot; pretend success

  const typ = Object.hasOwn(TYPES, body.typ) ? body.typ : "ine";
  const sprava = String(body.sprava ?? "").trim();
  const email = String(body.email ?? "").trim();
  const stranka = String(body.stranka ?? "").slice(0, 300);
  if (sprava.length < 5) return res.status(400).json({ ok: false, error: "Napíš prosím aspoň pár slov." });
  if (sprava.length > 3000) return res.status(400).json({ ok: false, error: "Správa je príliš dlhá (najviac 3000 znakov)." });
  if (email && !EMAIL.test(email)) return res.status(400).json({ ok: false, error: "E-mail nevyzerá správne." });

  const now = new Date();
  const id = `${now.toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`;
  const record = { id, prijate: now.toISOString(), typ, typ_nazov: TYPES[typ], sprava, email: email || null, stranka };
  try {
    await put(`poziadavky/${id}.json`, JSON.stringify(record, null, 2), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
    });
  } catch (e) {
    console.error("blob put failed", e?.message);
    return res.status(500).json({ ok: false, error: "Uloženie zlyhalo, skús to prosím neskôr." });
  }
  return res.status(200).json({ ok: true });
}
