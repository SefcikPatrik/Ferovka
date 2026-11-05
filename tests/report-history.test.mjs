import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const script = fs.readFileSync(new URL("../public/report-history.js", import.meta.url), "utf8");
const fixture = () => ({
  slug: "test", as_of: "2026-11-05",
  summary: { paired_median_change_pct: -5, paired_count: 2, price_lowered_count: 1, seen_median: 10000, seen_price_count: 2 },
  timeline: [{ day: "2026-11-04", historical_median: 10000, total_count: 35 }, { day: "2026-11-05", historical_median: 9900, total_count: 35 }],
  listings: Array.from({ length: 35 }, (_, i) => ({
    id: String(i), url: `https://auto.bazos.sk/inzerat/${i}/car.php`, title: "Auto " + i,
    year: 2020, km: 100000, price_gross: 10000, price_delta: i === 1 ? -500 : 0,
    is_new: i === 2, status: i < 3 ? "active" : i === 3 ? "inactive" : "unverified",
    first_seen: "2026-11-04", last_seen: "2026-11-05T12:00:00", price_as_of: "2026-11-05",
    history: [{ listing_id: String(i), at: "2026-11-04", price: 10500, basis: "gross" }, { listing_id: String(i), at: "2026-11-05", price: 10000, basis: "advertised" }],
  })),
});

async function load(data = fixture(), fail = false) {
  const element = () => ({ value: "", innerHTML: "", textContent: "", disabled: false, handlers: {},
    addEventListener(name, fn) { this.handlers[name] = fn; },
  });
  const status = element(), change = element(), body = element(), count = element();
  const previous = element(), next = element(), page = element(), pager = element();
  pager.querySelector = (selector) => selector === "span" ? page : selector.includes("previous") ? previous : next;
  const target = element();
  const selectors = { "#fvHistoryStatus": status, "#fvHistoryChanges": change, tbody: body, ".fv-history-count": count, ".fv-history-pages": pager };
  target.querySelector = (selector) => selectors[selector];
  const root = { dataset: { history: "/history/test.json" }, querySelector: () => target };
  let requested;
  const context = {
    document: { querySelector: () => root, createElement: () => ({}), head: { appendChild() {} } },
    URL, Date, console,
    fetch: async (url) => { requested = url; return { ok: !fail, json: async () => data }; },
  };
  vm.createContext(context); vm.runInContext(script, context);
  await new Promise((resolve) => setImmediate(resolve));
  const click = (dataset) => target.handlers.click({ target: { closest: () => ({ dataset }) } });
  return { target, status, change, body, count, previous, next, page, click, requested };
}

test("large histories paginate instead of rendering every archived offer", async () => {
  const ui = await load();
  assert.equal(ui.requested, "/history/test.json");
  assert.equal((ui.body.innerHTML.match(/<tr>/g) || []).length, 30);
  assert.equal(ui.page.textContent, "1 / 2");
  assert.equal(ui.previous.disabled, true);
  ui.click({ page: "next" });
  assert.equal((ui.body.innerHTML.match(/<tr>/g) || []).length, 5);
  assert.equal(ui.next.disabled, true);
});

test("inactive and unverified offers stay in the dataset and can be selected separately", async () => {
  const data = fixture(), ui = await load(data);
  ui.status.value = "inactive"; ui.status.handlers.change();
  assert.match(ui.body.innerHTML, /Auto 3/);
  assert.match(ui.body.innerHTML, /Potvrdene nedostupné/);
  assert.doesNotMatch(ui.body.innerHTML, /Auto 2</);
  ui.status.value = "unverified"; ui.status.handlers.change();
  assert.match(ui.count.textContent, /31 z 35/);
  assert.equal(data.listings.length, 35);
});

test("new and lower-price filters use explicit historical data", async () => {
  const ui = await load();
  ui.change.value = "new"; ui.change.handlers.change();
  assert.match(ui.body.innerHTML, /Auto 2</);
  assert.match(ui.count.textContent, /1 z 35/);
  ui.change.value = "lower"; ui.change.handlers.change();
  assert.match(ui.body.innerHTML, /Auto 1</);
  assert.doesNotMatch(ui.body.innerHTML, /Auto 2</);
});

test("expanded history distinguishes gross and advertised prices and escapes seller text", async () => {
  const data = fixture();
  data.listings[2].title = '<img src=x onerror="alert(1)">';
  data.listings[2].url = "javascript:alert(1)";
  const ui = await load(data);
  assert.doesNotMatch(ui.body.innerHTML, /<img|href="javascript:/);
  assert.match(ui.body.innerHTML, /&lt;img/);
  ui.click({ historyRow: "2" });
  assert.match(ui.body.innerHTML, /cena s DPH/);
  assert.match(ui.body.innerHTML, /inzerovaná cena \(DPH neoverená\)/);
  assert.match(ui.body.innerHTML, /aria-expanded="true"/);
});

test("a failed history fetch shows an error without declaring adverts unavailable", async () => {
  const ui = await load(fixture(), true);
  assert.match(ui.target.innerHTML, /nepodarilo načítať/);
  assert.match(ui.target.innerHTML, /nepovažujeme za zmazané/);
});
