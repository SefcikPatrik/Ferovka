// Vercel Function: visitor accounts for the paid analyses (5 € = 30 days of access to all of them).
//   GET  /api/ucet/                                   → { user: { email, platene_do } | null }
//   POST /api/ucet/ { akcia: "registracia" | "prihlasenie", email, heslo }
//   POST /api/ucet/ { akcia: "odhlasenie" }
//   POST /api/ucet/ { akcia: "zmazanie", heslo }       (logged in; deletes the account)
// Accounts live in the private Vercel Blob store as ucty/<sha256(e-mail)>.json – the e-mail, a scrypt hash of the
// password, the registration time and "platene_do" (ISO date until which the paid access runs; set by the payment
// webhook or by hand with scripts/pristup.mjs). An account alone unlocks nothing.
import { del, get, put } from "@vercel/blob";
import {
  EMAIL,
  checkPassword,
  clearSession,
  currentUser,
  hashPassword,
  jsonBody,
  normEmail,
  sameSite,
  setSession,
  userPath,
} from "./_auth.js";

const WRONG = "Nesprávny e-mail alebo heslo.";

async function loadUser(email) {
  try {
    const res = await get(userPath(email), { access: "private" });
    if (!res?.stream) return null;
    return JSON.parse(await new Response(res.stream).text());
  } catch (e) {
    if (/not.?found|does not exist|404/i.test(`${e?.name} ${e?.message}`)) return null;
    throw e;
  }
}

const paidUntil = (record) => (typeof record?.platene_do === "string" ? record.platene_do : null);
const view = (email, until) => ({ email, platene_do: until });
const fail = (res, status, error) => res.status(status).json({ ok: false, error });

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const session = currentUser(req);
      if (!session) return res.status(200).json({ ok: true, user: null });
      // re-read the account, so a payment (or a deleted account) shows up without logging in again
      const record = await loadUser(session.email);
      if (!record) {
        clearSession(res);
        return res.status(200).json({ ok: true, user: null });
      }
      const until = paidUntil(record);
      if (until !== session.paidUntil) setSession(res, session.email, until);
      return res.status(200).json({ ok: true, user: view(session.email, until) });
    }
    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return fail(res, 405, "Nepodporovaná požiadavka.");
    }
    if (!sameSite(req)) return fail(res, 403, "Požiadavka z inej stránky.");
    const body = jsonBody(req);
    if (!body) return fail(res, 400, "Neplatná požiadavka.");
    if (body.web) return res.status(200).json({ ok: true, user: null }); // honeypot

    const akcia = body.akcia;
    if (akcia === "odhlasenie") {
      clearSession(res);
      return res.status(200).json({ ok: true, user: null });
    }

    const heslo = String(body.heslo ?? "");

    if (akcia === "zmazanie") {
      const session = currentUser(req);
      if (!session) return fail(res, 401, "Nie si prihlásený.");
      const user = await loadUser(session.email);
      if (user && !(await checkPassword(heslo, user.heslo))) return fail(res, 400, "Nesprávne heslo.");
      if (user) await del(userPath(session.email));
      clearSession(res);
      return res.status(200).json({ ok: true, user: null });
    }

    const email = normEmail(body.email);
    if (!EMAIL.test(email)) return fail(res, 400, "E-mail nevyzerá správne.");

    if (akcia === "registracia") {
      if (heslo.length < 8) return fail(res, 400, "Heslo musí mať aspoň 8 znakov.");
      if (heslo.length > 200) return fail(res, 400, "Heslo je príliš dlhé.");
      if (await loadUser(email)) return fail(res, 409, "Tento e-mail je už zaregistrovaný – prihlás sa.");
      const record = { email, heslo: await hashPassword(heslo), registrovany: new Date().toISOString(), platene_do: null };
      try {
        await put(userPath(email), JSON.stringify(record), {
          access: "private",
          contentType: "application/json",
          addRandomSuffix: false,
          allowOverwrite: false,
        });
      } catch (e) {
        if (/already exists/i.test(e?.message ?? "")) return fail(res, 409, "Tento e-mail je už zaregistrovaný – prihlás sa.");
        throw e;
      }
      setSession(res, email, null);
      return res.status(200).json({ ok: true, user: view(email, null) });
    }

    if (akcia === "prihlasenie") {
      const user = await loadUser(email);
      // the hash runs even for an unknown e-mail, so the response time does not reveal which e-mails exist
      const valid = await checkPassword(heslo, user?.heslo ?? "scrypt$AAAAAAAAAAAAAAAAAAAAAA$AAAA");
      if (!user || !valid) return fail(res, 401, WRONG);
      setSession(res, email, paidUntil(user));
      return res.status(200).json({ ok: true, user: view(email, paidUntil(user)) });
    }

    return fail(res, 400, "Neznáma akcia.");
  } catch (e) {
    console.error("ucet failed", e?.message);
    return fail(res, 500, "Niečo sa pokazilo, skús to prosím neskôr.");
  }
}
