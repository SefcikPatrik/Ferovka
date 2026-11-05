/* Shared by the Next.js shell and standalone reports. No dependency or backend required. */
(() => {
  "use strict";
  if (window.FerovkaAnalytics) return;
  const KEY = "fv-analytics-consent-v1";
  const id = window.FEROVKA_ANALYTICS_CONFIG?.measurementId || "";
  const embedded = window.parent !== window;
  const enabled = /^G-[A-Z0-9]{6,20}$/.test(id) && location.protocol === "https:";
  let consent = "denied", lastPage = null, started = false;
  let panel, settings;
  const filterNames = {
    fEngine: "engine", fTrans: "transmission", fSeller: "seller", fSource: "portal", fBody: "body",
    fOrigin: "origin", fMax: "price_max", fvPriceMin: "price_min", fvYearFrom: "year_min",
    fvYearTo: "year_max", fvKm: "km_max", fvFuel: "fuel", fvGroup: "engine_group",
    fvDisc: "discount", fvText: "search", fvPick: "recommended_only",
  };
  const cleanPath = (value) => {
    try { return new URL(value || location.href, location.origin).pathname; } catch { return "/"; }
  };
  const cleanUrl = (value) => {
    try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? url.origin + url.pathname : ""; } catch { return ""; }
  };
  const reportSlug = (path = location.pathname) => {
    const match = path.match(/^\/analyza\/([a-z0-9-]+)\/?$/) || path.match(/^\/reports\/([a-z0-9-]+?)(?:-analyza)?(?:\.html|\/)?$/);
    return match ? match[1] : "";
  };
  const parentApi = () => {
    try { return embedded && window.parent.location.origin === location.origin ? window.parent.FerovkaAnalytics : null; } catch { return null; }
  };
  function gtag() { (window.dataLayer = window.dataLayer || []).push(arguments); }
  function start() {
    if (started) return;
    started = true;
    window.gtag = gtag;
    gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    gtag("consent", "update", { analytics_storage: "granted" });
    gtag("js", new Date());
    gtag("config", id, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
  }
  function track(name, properties = {}) {
    if (embedded) { parentApi()?.track(name, { ...properties, report_slug: reportSlug() }); return; }
    if (!enabled || consent !== "granted") return;
    start();
    // Only callers below construct properties; no form contents, seller names, VINs or query strings.
    gtag("event", name, { ...properties, page_location: location.origin + location.pathname });
  }
  function pageView(path) {
    if (embedded || !enabled || consent !== "granted") return;
    const current = cleanPath(path);
    if (lastPage === current) return;
    lastPage = current;
    track("page_view", { page_path: current, page_referrer: cleanUrl(document.referrer), report_slug: reportSlug(current) });
  }
  function listingClick(value, placement) {
    let url;
    try { url = new URL(value, location.origin); } catch { return; }
    if (!/^https?:$/.test(url.protocol)) return;
    let portal, listingId;
    if (url.hostname === "auto.bazos.sk") {
      const match = url.pathname.match(/^\/inzerat\/(\d+)\//);
      if (!match) return;
      portal = "bazos"; listingId = match[1];
    } else if (url.hostname === "www.autobazar.eu" || url.hostname === "autobazar.eu") {
      const match = url.pathname.match(/^\/detail(?:-[a-z-]+)?\/[^/]+\/([a-zA-Z0-9_-]+)\/?$/);
      if (!match) return;
      portal = "autobazar"; listingId = "ab-" + match[1];
    } else return;
    track("listing_click", { report_slug: reportSlug(), portal, listing_id: listingId, placement });
  }
  function setConsent(value) {
    if (embedded) { parentApi()?.setConsent(value); return; }
    consent = value === "granted" ? "granted" : "denied";
    try { localStorage.setItem(KEY, consent); } catch { /* preference remains valid for this page */ }
    window["ga-disable-" + id] = consent !== "granted";
    if (consent === "granted") {
      if (started) gtag("consent", "update", { analytics_storage: "granted" });
      lastPage = null; pageView();
    }
    else {
      if (started) gtag("consent", "update", { analytics_storage: "denied" });
      lastPage = null;
      // Clear analytics cookies on this host and its parent domains after withdrawing consent.
      for (const cookie of document.cookie.split(";")) {
        const name = cookie.split("=")[0].trim();
        if (!/^_ga(?:_|$)/.test(name)) continue;
        const domains = location.hostname.split(".");
        document.cookie = `${name}=; Max-Age=0; path=/`;
        while (domains.length > 1) {
          document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domains.join(".")}`;
          domains.shift();
        }
      }
    }
    if (panel) panel.hidden = true;
    if (settings) settings.hidden = false;
  }
  window.FerovkaAnalytics = { track, pageView, listingClick, setConsent };

  // Delegation includes dynamically redrawn tables and keyboard / middle-button activation.
  function click(event) {
    if (event.type === "auxclick" && event.button !== 1) return;
    const element = event.target?.closest?.("a, button, th[data-k]");
    if (!element) return;
    if (element.matches("th[data-k]")) {
      const column = element.dataset.k;
      if (["title", "year", "km", "price_gross", "fair_price", "discount_pct"].includes(column))
        track("ranking_sort", { report_slug: reportSlug(), column });
      return;
    }
    if (element.id === "fvReset" || element.dataset.analyticsAction === "reset_filters") {
      track("filters_reset", { report_slug: reportSlug() }); return;
    }
    if (element.id === "themeBtn") {
      queueMicrotask(() => track("theme_change", { theme: document.documentElement.dataset.theme || "system" }));
      return;
    }
    if (!element.matches("a[href]")) return;
    let url;
    try { url = new URL(element.href, location.origin); } catch { return; }
    if (url.origin !== location.origin) {
      listingClick(url.href, element.closest(".card") ? "recommendation" : element.closest("table") ? "ranking" : "report_link");
    } else if (/^\/analyza\//.test(url.pathname)) {
      track("analysis_open", { report_slug: reportSlug(url.pathname), placement: element.closest(".rcard") ? "catalogue" : "navigation" });
    } else if (/^\/reports\//.test(url.pathname)) {
      track("report_fullscreen", { report_slug: reportSlug(url.pathname) });
    } else if (["#analyzy", "#ako-to-funguje"].includes(url.hash)) {
      track("navigation_click", { section: url.hash.slice(1) });
    }
  }
  document.addEventListener("click", click, true);
  document.addEventListener("auxclick", click, true);
  document.addEventListener("change", (event) => {
    const element = event.target;
    const name = filterNames[element?.id] || element?.dataset?.analyticsFilter;
    if (!name) return;
    const value = name === "search" ? (element.value ? "used" : "cleared") : element.type === "checkbox" ? String(element.checked) : String(element.value).slice(0, 80);
    track("filter_change", { report_slug: reportSlug(), filter_name: name, filter_value: value });
  }, true);
  window.addEventListener("themechange", (event) => {
    if (["light", "dark"].includes(event.detail)) track("theme_change", { theme: event.detail });
  });
  if (embedded || !enabled) return;

  // Load Google only after consent; clicks made beforehand are never queued or replayed.
  let saved;
  try { saved = localStorage.getItem(KEY); } catch { /* show the choice */ }
  if (saved === "granted") { consent = "granted"; pageView(); }
  const style = document.createElement("link");
  style.rel = "stylesheet"; style.href = "/analytics.css"; document.head.appendChild(style);
  panel = document.createElement("aside");
  panel.className = "fv-consent";
  panel.setAttribute("aria-label", "Meranie návštevnosti");
  panel.innerHTML = '<div><b>Pomôžeš nám zlepšiť Férovku?</b><p>S tvojím súhlasom použijeme analytické cookies Google Analytics na meranie návštev a kliknutí. Výber môžeš kedykoľvek zmeniť.</p></div><div class="fv-consent-actions"><button type="button" data-choice="denied">Odmietnuť</button><button type="button" data-choice="granted">Povoliť meranie</button></div>';
  panel.hidden = saved === "granted" || saved === "denied";
  panel.addEventListener("click", (event) => {
    const choice = event.target?.closest?.("button[data-choice]")?.dataset.choice;
    if (choice) setConsent(choice);
  });
  document.body.appendChild(panel);
  settings = document.createElement("button");
  settings.className = "fv-consent-settings";
  settings.type = "button"; settings.textContent = "Nastavenia merania";
  settings.hidden = !panel.hidden;
  settings.addEventListener("click", () => { panel.hidden = false; settings.hidden = true; panel.querySelector("button")?.focus(); });
  document.body.appendChild(settings);
  window.addEventListener("storage", (event) => {
    if (event.key !== KEY) return;
    // Mirror the choice across tabs without writing the storage key again.
    consent = event.newValue === "granted" ? "granted" : "denied";
    window["ga-disable-" + id] = consent !== "granted";
    if (consent === "granted") {
      if (started) gtag("consent", "update", { analytics_storage: "granted" });
      lastPage = null; pageView();
    }
    else if (started) gtag("consent", "update", { analytics_storage: "denied" });
    panel.hidden = event.newValue === "granted" || event.newValue === "denied";
    settings.hidden = !panel.hidden;
  });
})();
