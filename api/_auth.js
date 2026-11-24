// Shared helpers for the account functions (files starting with "_" are not deployed as their own function).
// Session = signed cookie "fv_session": base64url({e: email, x: expiry}) + "." + HMAC-SHA256(AUTH_SECRET).
// Passwords are stored only as scrypt hashes (random salt per account) in the private Vercel Blob store.
import crypto from "node:crypto";

export const COOKIE = "fv_session";
export const MAX_AGE = 60 * 60 * 24 * 90; // 90 days
export const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET is not set");
  return s;
}

const mac = (payload) => crypto.createHmac("sha256", secret()).update(payload).digest();

export function signSession(email, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ e: email, x: Math.floor(now / 1000) + MAX_AGE })).toString("base64url");
  return `${payload}.${mac(payload).toString("base64url")}`;
}

/** The e-mail from a valid, unexpired session token, otherwise null. */
export function verifySession(token, now = Date.now()) {
  if (typeof token !== "string") return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = mac(payload);
  const got = Buffer.from(sig, "base64url");
  if (got.length !== expected.length || !crypto.timingSafeEqual(got, expected)) return null;
  let data;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!data || typeof data.e !== "string" || !(data.x > now / 1000)) return null;
  return data.e;
}

export function readCookie(req, name = COOKIE) {
  for (const part of String(req.headers.cookie ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) {
      try {
        return decodeURIComponent(part.slice(i + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function currentUser(req) {
  try {
    return verifySession(readCookie(req));
  } catch {
    return null;
  }
}

export function setSession(res, email) {
  res.setHeader("Set-Cookie", `${COOKIE}=${signSession(email)}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`);
}

export function clearSession(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
}

export const normEmail = (email) => String(email ?? "").trim().toLowerCase();

/** Blob pathname of an account; the e-mail is hashed so it is not visible in listings / URLs. */
export const userPath = (email) => `ucty/${crypto.createHash("sha256").update(normEmail(email)).digest("hex")}.json`;

const scrypt = (password, salt) =>
  new Promise((resolve, reject) =>
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, key) => (err ? reject(err) : resolve(key))),
  );

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt);
  return `scrypt$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function checkPassword(password, stored) {
  const [kind, salt, hash] = String(stored ?? "").split("$");
  if (kind !== "scrypt" || !salt || !hash) return false;
  const key = await scrypt(password, Buffer.from(salt, "base64url"));
  const expected = Buffer.from(hash, "base64url");
  return key.length === expected.length && crypto.timingSafeEqual(key, expected);
}

/** Blocks form posts from other sites (the session cookie is also SameSite=Lax). */
export function sameSite(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const host = new URL(origin).host;
    return host === req.headers.host || host === req.headers["x-forwarded-host"] || host.startsWith("localhost:");
  } catch {
    return false;
  }
}

export function jsonBody(req) {
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  return body && typeof body === "object" ? body : null;
}
