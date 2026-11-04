/* Férovka – filters for the whole report, injected into every model report by sync-reports.mjs.
 *
 * The reports render the chart (drawChart) and the full ranking (renderTable) from the global DATA array; their own
 * filter bar only filters the table. Here the filter bar moves above the chart, gets more filters (year, price from/to,
 * km, fuel, discount, picks only, text search) and every filter applies to the chart and the ranking together: DATA is
 * refilled in place with the matching ads and both are drawn again. "</script" can't occur inside this file.
 */
(() => {
  let data;
  try { data = DATA; } catch { return; } // eslint-disable-line no-undef
  if (!Array.isArray(data) || !data.length || typeof renderTable !== "function") return; // eslint-disable-line no-undef
  const bar = document.querySelector(".filters");
  if (!bar || bar.dataset.fv) return;
  bar.dataset.fv = "1";
  const ALL = data.slice();
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const fmt = (n) => Math.round(n).toLocaleString("sk-SK");
  const norm = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  let groups = null;
  try { groups = GROUPS; } catch { /* report without groups */ } // eslint-disable-line no-undef

  const FUEL = { diesel: "Diesel", petrol: "Benzín", hybrid: "Hybrid", "plug-in hybrid": "Plug-in hybrid", electric: "Elektro", lpg: "LPG", cng: "CNG" };
  const fuelOf = (d) => {
    const e = norm(d.eg);
    if (/tdi|crdi|dci|hdi|diesel|\bd\b|cdi|\d+d\b|blue/.test(e)) return "Diesel";
    if (/plug-in|phev|e-hybrid|recharge|\bgte\b|\bt8\b|\b\d{2}e\b|\b\d{3} ?e\b/.test(e)) return "Plug-in hybrid";
    if (/elektro|electric|\bev\b/.test(e)) return "Elektro";
    if (/cng|lpg|g-tec|g-tron|tgi|ecofuel/.test(e)) return "Plyn (CNG/LPG)";
    if (/mild|mhev/.test(e)) return "Benzín"; // mild-hybrid petrol (the diesel ones say TDI / d above)
    if (/hybrid|hev/.test(e)) return "Hybrid";
    if (/tsi|tfsi|mpi|fsi|benzin|gdi|dpi|htp|12v|\bt\d\b|\bb[56]\b|\d+i\b|turbo|tce|\bs4\b|rs ?\d|amg|competition|\bm\d{2,3}i?\b|gti|\bx5 m\b/.test(e)) return "Benzín";
    return d.fuel ? FUEL[d.fuel] || String(d.fuel) : null;
  };

  // --- controls ---------------------------------------------------------------------------------------------------
  const years = ALL.map((d) => d.year).filter(Boolean);
  const yMin = Math.min(...years), yMax = Math.max(...years);
  const yearOpts = (label) => `<option value="">${label}</option>` +
    Array.from({ length: yMax - yMin + 1 }, (_, i) => yMax - i).map((y) => `<option>${y}</option>`).join("");
  const kms = [30000, 50000, 75000, 100000, 150000, 200000, 250000, 300000];
  const fuels = [...new Set(ALL.map(fuelOf).filter(Boolean))].sort((a, b) => a.localeCompare(b, "sk"));
  const showGroups = Array.isArray(groups) && groups.length > 1 && ALL.some((d) => Number.isInteger(d.cg));

  const maxInput = $("fMax");
  if (maxInput) { maxInput.placeholder = "Cena do €"; maxInput.title = "Najvyššia cena (s DPH)"; }
  const html =
    `<select id="fvYearFrom" title="Rok výroby od">${yearOpts("Rok od")}</select>` +
    `<select id="fvYearTo" title="Rok výroby do">${yearOpts("Rok do")}</select>` +
    `<input id="fvPriceMin" type="number" placeholder="Cena od €" step="500" min="0" title="Najnižšia cena (s DPH)" style="width:110px">`;
  if (maxInput) maxInput.insertAdjacentHTML("beforebegin", html);
  else bar.insertAdjacentHTML("afterbegin", html);
  const more =
    `<select id="fvKm" title="Najviac najazdených km"><option value="">Nájazd – všetky</option>${kms.map((k) => `<option value="${k}">do ${fmt(k)} km</option>`).join("")}</select>` +
    (fuels.length > 1 ? `<select id="fvFuel" title="Palivo"><option value="">Všetky palivá</option>${fuels.map((f) => `<option>${esc(f)}</option>`).join("")}</select>` : "") +
    (showGroups ? `<select id="fvGroup" title="Skupina motorov (farba v grafe)"><option value="">Všetky skupiny</option>${groups.map((g, i) => `<option value="${i}">${esc(g)}</option>`).join("")}</select>` : "") +
    `<select id="fvDisc" title="O koľko je auto lacnejšie ako férová cena"><option value="">Cena – všetky</option><option value="0">pod férovou cenou</option><option value="10">aspoň 10 % pod trhom</option><option value="20">aspoň 20 % pod trhom</option></select>` +
    `<input id="fvText" type="search" placeholder="Hľadať (výbava, mesto…)" title="Hľadá v názve inzerátu, motore a lokalite" style="width:170px">` +
    `<label class="fv-check"><input id="fvPick" type="checkbox"> len odporúčané</label>` +
    `<button type="button" id="fvReset" class="fv-reset">Zrušiť filtre</button>`;
  const count = $("count");
  if (count) count.insertAdjacentHTML("beforebegin", more);
  else bar.insertAdjacentHTML("beforeend", more);

  // the bar moves above the chart, so one set of filters drives the chart and the ranking
  const chart = $("chartWrap");
  let anchorH2 = chart;
  while (anchorH2 && anchorH2.tagName !== "H2") anchorH2 = anchorH2.previousElementSibling;
  const box = document.createElement("section");
  box.className = "fv-filters";
  box.id = "filtre";
  box.innerHTML = `<div class="fv-head"><b>Filtre</b><span>platia pre graf aj kompletný rebríček</span></div>`;
  box.appendChild(bar);
  if (anchorH2) anchorH2.before(box);
  else (chart || document.querySelector("#tbl"))?.before(box);
  const tbl = document.querySelector("#tbl");
  const note = document.createElement("div");
  note.className = "fv-note";
  const tableHost = tbl && (tbl.closest(".table-scroll") || tbl);
  tableHost?.before(note);

  document.head.insertAdjacentHTML("beforeend", `<style id="fv-filters-css">
.fv-filters{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 14px 4px;margin:24px 0 8px}
.fv-filters .fv-head{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-bottom:8px}
.fv-filters .fv-head span{color:var(--muted);font-size:13px}
.fv-filters .filters{margin-bottom:8px}
.fv-filters .filters .count{flex-basis:100%;margin-left:0}
.fv-check{display:inline-flex;gap:6px;align-items:center;font-size:13px;color:var(--text-2,var(--text));white-space:nowrap}
.fv-reset{background:none;border:1px solid var(--border);color:var(--text);border-radius:8px;padding:6px 10px;font:inherit;font-size:13px;cursor:pointer}
.fv-reset:hover{background:var(--surface-2,var(--surface))}
.fv-note{color:var(--muted);font-size:13px;margin:0 0 8px}
.fv-note a{color:inherit}
.fv-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:14px;pointer-events:none}
@media (max-width:600px){.fv-filters .filters select,.fv-filters .filters input[type=number],.fv-filters .filters input[type=search]{flex:1 1 calc(50% - 8px);min-width:0;width:auto!important}}
</style>`);

  // --- filtering --------------------------------------------------------------------------------------------------
  const val = (id) => ($(id) ? $(id).value : "");
  const num = (id) => { const v = parseFloat(val(id)); return Number.isFinite(v) ? v : null; };
  function matches(d) {
    const yf = num("fvYearFrom"), yt = num("fvYearTo"), pmin = num("fvPriceMin"), pmax = num("fMax"), km = num("fvKm"), disc = num("fvDisc");
    const fuel = val("fvFuel"), grp = val("fvGroup"), q = norm(val("fvText")).trim();
    if (yf != null && !(d.year >= yf)) return false;
    if (yt != null && !(d.year <= yt)) return false;
    if (pmin != null && !(d.price_gross >= pmin)) return false;
    if (pmax != null && !(d.price_gross <= pmax)) return false;
    if (km != null && !(d.km <= km)) return false;
    if (disc != null && !(d.discount_pct > disc || (disc > 0 && d.discount_pct >= disc))) return false;
    if (fuel && fuelOf(d) !== fuel) return false;
    if (grp !== "" && String(d.cg) !== grp) return false;
    if ($("fvPick")?.checked && !d.pick) return false;
    if (q && !q.split(/\s+/).every((w) => norm(`${d.title} ${d.eg ?? ""} ${d.engine ?? ""} ${d.location ?? ""}`).includes(w))) return false;
    // the report's own filters (engine, gearbox, seller, portal, body, origin) – same rules as its renderTable
    const en = val("fEngine"), tr = val("fTrans"), se = val("fSeller"), so = val("fSource"), og = val("fOrigin"), bo = val("fBody");
    if (en && d.eg !== en) return false;
    if (tr && d.transmission !== tr) return false;
    if (se && d.seller_type === "dealer") return false;
    if (so && !(d.source === so || (d.also_listed || []).some((a) => a.source === so))) return false;
    if (og && d.origin !== og) return false;
    if (bo && d.body !== bo) return false;
    return true;
  }
  const active = () => [...box.querySelectorAll("select, input")].filter((el) => (el.type === "checkbox" ? el.checked : el.value !== "")).length;

  let drawing = false;
  function apply() {
    if (drawing) return;
    drawing = true;
    const rows = ALL.filter(matches);
    data.length = 0;
    data.push(...rows);
    const wrap = $("chartWrap");
    wrap?.querySelector(".fv-empty")?.remove();
    const plotted = rows.filter((d) => d.km && d.price_gross).length;
    try {
      if (typeof drawChart === "function") { // eslint-disable-line no-undef
        if (plotted) drawChart(); // eslint-disable-line no-undef
        else { const svg = $("chart"); if (svg) svg.innerHTML = ""; }
      }
    } catch (e) { console.warn("chart", e); }
    if (wrap && !plotted) {
      if (getComputedStyle(wrap).position === "static") wrap.style.position = "relative";
      wrap.insertAdjacentHTML("beforeend", `<div class="fv-empty">Filtrom nezodpovedá žiadny inzerát</div>`);
    }
    try { renderTable(); } catch (e) { console.warn("table", e); } // eslint-disable-line no-undef
    const n = active();
    if (count) count.textContent = `Zobrazených ${fmt(rows.length)} z ${fmt(ALL.length)} inzerátov` + (n ? ` · aktívne filtre: ${n}` : "");
    note.innerHTML = n
      ? `Zobrazených ${fmt(rows.length)} z ${fmt(ALL.length)} inzerátov podľa <a href="#filtre">filtrov nad grafom</a>.`
      : `Filtre (rok, cena, nájazd, palivo…) nájdeš <a href="#filtre">nad grafom</a>.`;
    drawing = false;
  }
  box.querySelectorAll("select, input").forEach((el) => el.addEventListener("input", apply));
  $("fvPick")?.addEventListener("change", apply);
  $("fvReset").addEventListener("click", () => {
    box.querySelectorAll("select, input").forEach((el) => { if (el.type === "checkbox") el.checked = false; else el.value = ""; });
    apply();
  });
  apply();
})();
