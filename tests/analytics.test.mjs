import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const runtime = fs.readFileSync(new URL("../public/analytics.js", import.meta.url), "utf8");
const chart = fs.readFileSync(new URL("../scripts/report-chart.js", import.meta.url), "utf8");
const KEY = "fv-analytics-consent-v1";

function browser({ saved, id = "G-TEST123456", parent, path = "/", query = "" } = {}) {
  const handlers = new Map(), windowHandlers = new Map(), children = [];
  const store = new Map(saved ? [[KEY, saved]] : []);
  const location = new URL("https://ferovka.example" + path + query);
  const element = (tag) => ({
    tagName: tag, hidden: false, dataset: {}, style: {},
    setAttribute() {}, addEventListener() {}, appendChild(child) { children.push(child); },
    querySelector() { return { focus() {} }; },
  });
  const document = {
    head: element("head"), body: element("body"), cookie: "", referrer: "https://search.example/find?q=private",
    documentElement: { dataset: {} }, createElement: element,
    addEventListener(name, fn) { handlers.set(name, fn); },
  };
  const window = {
    FEROVKA_ANALYTICS_CONFIG: { measurementId: id }, location,
    addEventListener(name, fn) { windowHandlers.set(name, fn); },
  };
  window.parent = parent || window;
  const sandbox = { window, document, location, URL, Date, queueMicrotask,
    localStorage: { getItem: (key) => store.get(key), setItem: (key, value) => store.set(key, value) } };
  vm.createContext(sandbox); vm.runInContext(runtime, sandbox);
  const events = () => (window.dataLayer || []).filter((args) => args[0] === "event").map((args) => ({ name: args[1], properties: args[2] }));
  return { window, document, location, handlers, windowHandlers, children, store, events, api: window.FerovkaAnalytics };
}

test("no ID or no consent: no Google request, pageview or queued click", () => {
  const disabled = browser({ id: "" });
  disabled.api.setConsent("granted");
  assert.equal(disabled.children.length, 0);
  assert.equal(disabled.events().length, 0);
  const b = browser();
  b.api.listingClick("https://auto.bazos.sk/inzerat/123/auto.php", "ranking");
  assert.equal(b.events().length, 0);
  assert.equal(b.children.filter((c) => c.src).length, 0);
  b.api.setConsent("granted");
  assert.equal(b.events().length, 1);
  assert.equal(b.events()[0].name, "page_view");
  assert.equal(b.children.filter((c) => c.src?.startsWith("https://www.googletagmanager.com")).length, 1);
  assert.equal(b.store.get(KEY), "granted");
});

test("SPA views are deduplicated; page URLs and referrers omit query / hash", () => {
  const b = browser({ saved: "granted", query: "?email=private#fragment" });
  b.api.pageView("/");
  assert.equal(b.events().length, 1);
  b.location.pathname = "/analyza/kia-sportage/";
  b.api.pageView(b.location.pathname);
  b.api.pageView(b.location.pathname);
  assert.equal(b.events().length, 2);
  assert.equal(b.events()[1].properties.report_slug, "kia-sportage");
  assert.equal(b.events()[1].properties.page_location, "https://ferovka.example/analyza/kia-sportage/");
  assert.equal(b.events()[1].properties.page_referrer, "https://search.example/find");
  assert.ok(!JSON.stringify(b.events()).includes("private"));
  b.location.pathname = "/"; b.api.pageView("/");
  assert.equal(b.events().length, 3);
});

test("withdrawing consent stops subsequent clicks", () => {
  const b = browser({ saved: "granted" });
  b.api.setConsent("denied");
  const count = b.events().length;
  b.api.listingClick("https://auto.bazos.sk/inzerat/123/auto.php", "chart");
  b.api.pageView("/analyza/bmw-3/");
  assert.equal(b.events().length, count);
  assert.equal(b.window["ga-disable-G-TEST123456"], true);
  assert.equal(b.store.get(KEY), "denied");
  b.api.setConsent("granted");
  assert.equal(b.events().length, count + 1);
  const updates = b.window.dataLayer.filter((args) => args[0] === "consent" && args[1] === "update");
  assert.equal(updates.at(-1)[2].analytics_storage, "granted");
});

test("listing events retain the exact ad ID and placement; unrelated hosts are rejected", () => {
  const b = browser({ saved: "granted", path: "/reports/kia-sportage-analyza.html" });
  b.api.listingClick("https://auto.bazos.sk/inzerat/123/auto.php?secret=ignore", "chart");
  b.api.listingClick("https://www.autobazar.eu/detail-aaa/car/Aa_ID-123/", "ranking");
  b.api.listingClick("https://auto.bazos.sk.attacker.example/inzerat/456/car.php", "ranking");
  b.api.listingClick("javascript:alert(1)", "ranking");
  const events = b.events().filter((e) => e.name === "listing_click");
  assert.equal(events.length, 2);
  assert.equal(events[0].properties.report_slug, "kia-sportage");
  assert.equal(events[0].properties.listing_id, "123");
  assert.equal(events[0].properties.placement, "chart");
  assert.equal(events[1].properties.listing_id, "ab-Aa_ID-123");
  assert.ok(!JSON.stringify(events).includes("secret"));
});

test("embedded report relays clicks to its parent without another pageview or cookie banner", () => {
  const root = browser({ saved: "granted", path: "/analyza/vw-tiguan/" });
  const frame = browser({ parent: root.window, path: "/reports/vw-tiguan-analyza.html" });
  frame.api.pageView();
  frame.api.listingClick("https://auto.bazos.sk/inzerat/123/car.php", "recommendation");
  assert.equal(root.events().filter((e) => e.name === "page_view").length, 1);
  assert.equal(frame.children.length, 0);
  assert.equal(root.events().at(-1).properties.report_slug, "vw-tiguan");
  const blocked = { get location() { throw new Error("Cross-origin"); } };
  const foreignFrame = browser({ parent: blocked, path: "/reports/bmw-3-analyza.html" });
  assert.doesNotThrow(() => foreignFrame.api.listingClick("https://auto.bazos.sk/inzerat/1/car.php", "chart"));
  assert.equal(foreignFrame.events().length, 0);
});

test("search filter never sends search text, and numeric filter changes remain useful", () => {
  const b = browser({ saved: "granted" });
  b.handlers.get("change")({ target: { id: "fvText", value: "seller@example.com", dataset: {} } });
  b.handlers.get("change")({ target: { id: "fMax", value: "15000", dataset: {} } });
  const events = b.events().filter((e) => e.name === "filter_change");
  assert.equal(events[0].properties.filter_value, "used");
  assert.equal(events[1].properties.filter_value, "15000");
  assert.ok(!JSON.stringify(events).includes("seller@example.com"));
});

test("delegation tracks normal and middle-button ad links once and ignores right-clicks", () => {
  const b = browser({ saved: "granted" });
  const link = {
    href: "https://auto.bazos.sk/inzerat/123/car.php", dataset: {},
    matches: (selector) => selector === "a[href]",
    closest: (selector) => selector === "table" ? {} : null,
  };
  const target = { closest: () => link };
  b.handlers.get("click")({ target, type: "click", button: 0 });
  b.handlers.get("auxclick")({ target, type: "auxclick", button: 1 });
  b.handlers.get("auxclick")({ target, type: "auxclick", button: 2 });
  assert.equal(b.events().filter((e) => e.name === "listing_click").length, 2);
  assert.equal(b.events().at(-1).properties.placement, "ranking");
});

function chartBrowser({ throws = false } = {}) {
  const listeners = new Map(), globals = new Map(), opened = [], tracked = [];
  const point = { dataset: { id: "1" }, getBoundingClientRect: () => ({ left: 45, top: 45, width: 10, height: 10 }), getAttribute: () => "5", setAttribute() {} };
  const hit = { dispatchEvent() {} };
  const svg = {
    style: {}, parentElement: null,
    querySelector: (s) => s.startsWith("circle.pt") ? point : hit,
    querySelectorAll: () => [point], addEventListener: (type, fn) => listeners.set(type, fn),
  };
  const window = { open: (...args) => opened.push(args), FerovkaAnalytics: { listingClick: (...args) => { if (throws) throw new Error("analytics offline"); tracked.push(args); } } };
  const context = { window, DATA: [{ id: "1", url: "https://auto.bazos.sk/inzerat/123/car.php" }],
    document: { head: { insertAdjacentHTML() {} }, body: {}, querySelectorAll: () => [svg], getElementById: () => null },
    addEventListener: (name, fn) => globals.set(name, fn), CSS: { escape: (s) => s },
    MutationObserver: class { observe() {} }, MouseEvent: class {},
  };
  vm.createContext(context); vm.runInContext(chart, context);
  const click = () => listeners.get("click")({ type: "click", clientX: 50, clientY: 50, stopImmediatePropagation() {} });
  return { click, globals, opened, tracked };
}

test("chart counts the actual opened ad; touch tooltip is not a conversion", () => {
  const b = chartBrowser();
  b.globals.get("pointerdown")({ pointerType: "touch", clientX: 50, clientY: 50 });
  b.click();
  assert.equal(b.opened.length, 0); assert.equal(b.tracked.length, 0);
  b.click();
  assert.equal(b.opened.length, 1); assert.equal(b.tracked.length, 1);
  assert.equal(b.tracked[0][1], "chart");
  const broken = chartBrowser({ throws: true });
  broken.click(); assert.equal(broken.opened.length, 1);
});
