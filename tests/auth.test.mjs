// node --test tests/auth.test.mjs – session cookie, password hashing and the locked-report function.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

process.env.AUTH_SECRET = "test-secret-test-secret-test-secret-1234";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
const auth = await import("../api/_auth.js");
const { default: report } = await import("../api/report.js");

function fakeRes() {
  const res = { statusCode: 200, headers: {}, body: undefined };
  res.setHeader = (k, v) => (res.headers[k.toLowerCase()] = v);
  res.status = (c) => ((res.statusCode = c), res);
  res.send = (b) => ((res.body = b), res);
  res.json = (b) => ((res.body = b), res);
  return res;
}
const cookieFor = (email, paidUntil = null) => `other=1; ${auth.COOKIE}=${encodeURIComponent(auth.signSession(email, paidUntil))}`;
const inDays = (d) => new Date(Date.now() + d * 86_400_000).toISOString();

test("session round-trip, tampering and expiry", () => {
  const t = auth.signSession("a@b.sk");
  assert.deepEqual(auth.verifySession(t), { email: "a@b.sk", paidUntil: null });
  assert.equal(auth.verifySession(auth.signSession("a@b.sk", "2030-01-01T00:00:00.000Z")).paidUntil, "2030-01-01T00:00:00.000Z");
  const [p, s] = t.split(".");
  const forged = Buffer.from(JSON.stringify({ e: "x@y.sk", x: 9e9 })).toString("base64url");
  assert.equal(auth.verifySession(`${forged}.${s}`), null);
  assert.equal(auth.verifySession(`${p}.${s.slice(0, -2)}AA`), null);
  assert.equal(auth.verifySession("garbage"), null);
  assert.equal(auth.verifySession(t, Date.now() + (auth.MAX_AGE + 10) * 1000), null);
  assert.equal(auth.currentUser({ headers: { cookie: cookieFor("a@b.sk") } }).email, "a@b.sk");
  assert.equal(auth.hasAccess(auth.currentUser({ headers: { cookie: cookieFor("a@b.sk") } })), false);
  assert.equal(auth.hasAccess({ email: "a", paidUntil: inDays(30) }), true);
  assert.equal(auth.hasAccess({ email: "a", paidUntil: inDays(-1) }), false);
  assert.equal(auth.hasAccess(null), false);
  assert.equal(auth.currentUser({ headers: {} }), null);
});

test("password hash", async () => {
  const h = await auth.hashPassword("tajneheslo");
  assert.match(h, /^scrypt\$/);
  assert.equal(await auth.checkPassword("tajneheslo", h), true);
  assert.equal(await auth.checkPassword("ine-heslo", h), false);
  assert.equal(await auth.checkPassword("x", "nonsense"), false);
  assert.notEqual(await auth.hashPassword("tajneheslo"), h); // random salt
});

test("user path hides the e-mail and ignores case", () => {
  assert.equal(auth.userPath("A@B.sk "), auth.userPath("a@b.sk"));
  assert.doesNotMatch(auth.userPath("a@b.sk"), /@/);
});

test("same-site check", () => {
  assert.equal(auth.sameSite({ headers: { host: "ferovka.sk", origin: "https://ferovka.sk" } }), true);
  assert.equal(auth.sameSite({ headers: { host: "ferovka.sk", origin: "https://evil.example" } }), false);
});

const locked = fs.readdirSync("public/reports").find((f) => f.endsWith("-analyza.html") && !f.startsWith("skoda-octavia"));

test("locked report needs active paid access", () => {
  const anon = fakeRes();
  report({ query: { file: locked }, headers: {} }, anon);
  assert.equal(anon.statusCode, 401);
  assert.match(anon.body, /prémiová/);
  assert.equal(anon.headers["cache-control"], "private, no-store");

  for (const paid of [null, inDays(-1)]) {
    const noAccess = fakeRes();
    report({ query: { file: locked }, headers: { cookie: cookieFor("a@b.sk", paid) } }, noAccess);
    assert.equal(noAccess.statusCode, 401, String(paid));
  }

  const ok = fakeRes();
  report({ query: { file: locked }, headers: { cookie: cookieFor("a@b.sk", inDays(30)) } }, ok);
  assert.equal(ok.statusCode, 200);
  assert.ok(ok.body.length > 1000);
});

test("free report without a session, bad names are 404", () => {
  const free = fakeRes();
  report({ query: { file: "skoda-octavia-analyza.html" }, headers: {} }, free);
  assert.equal(free.statusCode, 200);
  for (const file of ["../package.json", "..%2Fpackage.json", "x.html", "", "a/b.html"]) {
    const r = fakeRes();
    report({ query: { file }, headers: { cookie: cookieFor("a@b.sk") } }, r);
    assert.equal(r.statusCode, 404, file);
  }
});
