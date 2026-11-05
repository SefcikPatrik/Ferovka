/* Historical observations stay separate from the original fair-price analysis. */
(() => {
  const root = document.querySelector("[data-history]");
  if (!root || root.dataset.historyReady) return;
  root.dataset.historyReady = "1";
  const target = root.querySelector(".fv-history-content");
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const number = (value) => value == null ? "–" : Math.round(value).toLocaleString("sk-SK");
  const money = (value) => value == null ? "–" : `${number(value)} €`;
  const day = (value) => value ? new Date(value.slice(0, 10) + "T12:00:00").toLocaleDateString("sk-SK") : "nezistené";
  const link = (value) => {
    try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? esc(url.href) : "#"; } catch { return "#"; }
  };
  const states = { active: "Videné v aktuálnom zbere", inactive: "Potvrdene nedostupné", unverified: "Dostupnosť neoverená" };
  const style = document.createElement("style");
  style.textContent = `
  .fv-market-history{border:1px solid var(--border);border-radius:16px;padding:18px;margin:24px 0 36px;background:var(--surface)}
  .fv-market-history h2{margin-top:0}.fv-history-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:18px 0 10px}
  .fv-history-bar select,.fv-history-bar button{font:inherit;color:var(--text);background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:7px 10px}
  .fv-history-count{font-size:13px;color:var(--muted);margin-left:auto}.fv-history-chart{width:100%;height:190px;display:block}
  .fv-history-table{min-width:720px}.fv-history-table button{background:none;border:0;color:var(--accent,var(--brand));cursor:pointer;font:inherit;padding:2px 0}
  .fv-history-status{font-size:12px;white-space:normal}.fv-history-active{color:var(--good,#16865a)}.fv-history-inactive{color:var(--bad,#b4332f)}
  .fv-history-unverified{color:var(--muted)}.fv-history-card{font-size:12px}.fv-history-detail{background:var(--surface-2)}
  .fv-history-pages{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin:12px 0}.fv-history-pages button{font:inherit;padding:6px 12px}
  .fv-history-detail ul{padding-left:20px;margin:4px 0}.fv-history-caption{font-size:13px;color:var(--text-2);margin:4px 0 14px}
  @media(max-width:640px){.fv-market-history{padding:12px}.fv-history-bar select{max-width:100%}.fv-history-count{flex-basis:100%}}
  `;
  document.head.appendChild(style);

  function trend(data) {
    const points = data.timeline.filter((p) => p.historical_median != null);
    if (!points.length) return "";
    const values = points.map((p) => p.historical_median), min = Math.min(...values) * .92, max = Math.max(...values) * 1.08;
    const y = (value) => 158 - (value - min) / Math.max(1, max - min) * 130;
    const x = (index) => 70 + index / Math.max(1, points.length - 1) * 650;
    const labels = points.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.historical_median)}" r="5" fill="var(--s1,var(--brand))"><title>${esc(day(p.day))}: ${money(p.historical_median)} · ${p.total_count} áut</title></circle><text x="${x(i)}" y="180" text-anchor="middle">${esc(day(p.day))}</text>`).join("");
    const line = `<polyline points="${points.map((p, i) => `${x(i)},${y(p.historical_median)}`).join(" ")}" fill="none" stroke="var(--s1,var(--brand))" stroke-width="2"/>`;
    const paired = data.summary.paired_median_change_pct;
    return `<h3>Vývoj zachytených cien</h3><svg class="fv-history-chart" viewBox="0 0 790 190" role="img" aria-label="Medián posledných cien historickej vzorky podľa dátumu"><text x="64" y="22" text-anchor="end">${esc(money(max))}</text><text x="64" y="158" text-anchor="end">${esc(money(min))}</text>${line}${labels}</svg>
      <p class="fv-history-caption">Graf zahŕňa všetky zachytené autá vrátane histórie. Počet a skladba áut sa menia; krivka nie je cenový index. Máme ${points.length} dátové body.</p>
      <p class="section-lead">${paired == null ? "Na porovnanie rovnakých inzerátov zatiaľ nemáme nové cenové pozorovania." : `Na ${number(data.summary.paired_count)} rovnakých inzerátoch je medián zmeny oproti pôvodnej analýze ${paired > 0 ? "+" : ""}${paired.toLocaleString("sk-SK")} %. Z toho ${number(data.summary.price_lowered_count)} zlacnelo.`} ${data.summary.seen_median == null ? "" : `Medián cien pozorovaných v aktuálnom zbere: ${money(data.summary.seen_median)} (${number(data.summary.seen_price_count)} cien).`}</p>`;
  }

  function render(data) {
    let page = 0;
    const size = 30, expanded = new Set();
    target.innerHTML = trend(data) + `<div class="fv-history-bar">
      <select id="fvHistoryStatus" data-analytics-filter="availability" aria-label="Dostupnosť inzerátov"><option value="">Všetky zachytené aj historické</option><option value="active">Videné v aktuálnom zbere</option><option value="inactive">Potvrdene nedostupné</option><option value="unverified">Dostupnosť neoverená</option></select>
      <select id="fvHistoryChanges" data-analytics-filter="history_changes" aria-label="Zmeny ponúk"><option value="">Všetky zmeny</option><option value="new">Novo zachytené od pôvodnej analýzy</option><option value="price">Zmenená cena</option><option value="lower">Zlacnené</option></select><span class="fv-history-count"></span></div>
      <div class="table-scroll"><table class="fv-history-table"><thead><tr><th>Auto / cenová história</th><th>Rok / km</th><th>Posledná cena s DPH</th><th>Zmena</th><th>Dostupnosť</th></tr></thead><tbody></tbody></table></div>
      <div class="fv-history-pages"><button type="button" data-page="previous">Predchádzajúce</button><span></span><button type="button" data-page="next">Ďalšie</button></div>`;
    const status = target.querySelector("#fvHistoryStatus"), change = target.querySelector("#fvHistoryChanges");
    const body = target.querySelector("tbody"), count = target.querySelector(".fv-history-count"), pager = target.querySelector(".fv-history-pages");
    function draw() {
      const rows = data.listings.filter((r) => (!status.value || r.status === status.value)
        && (!change.value || (change.value === "new" ? r.is_new : change.value === "lower" ? r.price_delta < 0 : Boolean(r.price_delta))))
        .sort((a, b) => Number(b.is_new) - Number(a.is_new) || (b.last_seen || "").localeCompare(a.last_seen || "") || String(a.id).localeCompare(String(b.id)));
      const pages = Math.max(1, Math.ceil(rows.length / size));
      page = Math.max(0, Math.min(page, pages - 1));
      count.textContent = `${number(rows.length)} z ${number(data.listings.length)} zachytených áut`;
      body.innerHTML = rows.slice(page * size, (page + 1) * size).map((r) => {
        const delta = r.price_delta == null ? "–" : r.price_delta === 0 ? "bez zmeny" : `${r.price_delta > 0 ? "+" : ""}${money(r.price_delta)}`;
        const points = r.history.map((p) => `<li>${esc(day(p.at))}: ${esc(money(p.price))} · ${p.basis === "gross" ? "cena s DPH" : "inzerovaná cena (DPH neoverená)"}${String(p.listing_id) !== String(r.id) ? " · kópia na inom portáli" : ""}</li>`).join("");
        return `<tr><td><a href="${link(r.current_url || r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a>${r.is_new ? ' <span class="badge">novo zachytené</span>' : ""}<div><button type="button" data-history-row="${esc(r.id)}" aria-expanded="${expanded.has(r.id)}">${expanded.has(r.id) ? "Skryť" : "Zobraziť"} históriu cien (${number(r.history.length)})</button></div></td>
          <td>${r.year || "–"}<div class="sub">${number(r.km)} km</div></td><td class="num">${money(r.price_gross)}<div class="sub">pozorovaná ${esc(day(r.price_as_of))}</div></td><td class="num">${esc(delta)}</td><td class="fv-history-status fv-history-${r.status}">${states[r.status]}<div class="sub">naposledy videné ${esc(day(r.last_seen || r.first_seen))}</div></td></tr>
          ${expanded.has(r.id) ? `<tr class="fv-history-detail"><td colspan="5"><ul>${points || "<li>Zatiaľ bez zaznamenanej ceny.</li>"}</ul></td></tr>` : ""}`;
      }).join("") || '<tr><td colspan="5">Tomuto výberu nezodpovedá žiadny inzerát.</td></tr>';
      pager.querySelector("span").textContent = `${page + 1} / ${pages}`;
      pager.querySelector('[data-page="previous"]').disabled = page === 0;
      pager.querySelector('[data-page="next"]').disabled = page + 1 >= pages;
    }
    [status, change].forEach((el) => el.addEventListener("change", () => { page = 0; draw(); }));
    target.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      if (button.dataset.historyRow) {
        const key = button.dataset.historyRow;
        if (expanded.has(key)) expanded.delete(key); else expanded.add(key);
      } else if (button.dataset.page) page += button.dataset.page === "next" ? 1 : -1;
      draw();
    });
    draw();
  }
  fetch(root.dataset.history, { cache: "no-cache" })
    .then((response) => { if (!response.ok) throw new Error("history unavailable"); return response.json(); })
    .then((data) => { if (data.slug && Array.isArray(data.listings)) render(data); else throw new Error("invalid history"); })
    .catch(() => { target.innerHTML = "<p>Históriu sa nepodarilo načítať. Súhrn vyššie zostáva dostupný; chybu načítania nepovažujeme za zmazané inzeráty.</p>"; });
})();
