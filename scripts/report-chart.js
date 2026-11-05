/* Férovka – chart → ad links, injected into every report by sync-reports.mjs.
 *
 * The reports draw one invisible 11px "hit" circle per ad. In dense charts (and always on a narrow phone) those
 * circles overlap and the one drawn last wins, so a click/tap often opened a neighbouring ad. Here the pointer is
 * always resolved to the NEAREST point, the report's own tooltip is shown for that point, and a click opens its ad.
 * Touch: the first tap shows the tooltip (with a hint), a second tap on the same point opens the ad.
 */
(() => {
  let rows;
  try { rows = DATA; } catch { return; } // eslint-disable-line no-undef
  if (!Array.isArray(rows) || !rows.length || !("url" in rows[0])) return;
  const byId = new Map(rows.map((d) => [String(d.id), d]));
  const MOUSE = ["mouseover", "mouseout", "mouseenter", "mouseleave", "mousemove", "mousedown", "mouseup", "click"];
  let lastPointer = "mouse", down = null;
  // the finger position as it was – Chrome "snaps" the later click of a tap to the centre of a nearby clickable element
  addEventListener("pointerdown", (e) => { lastPointer = e.pointerType || "mouse"; down = { clientX: e.clientX, clientY: e.clientY }; }, true);

  // the old per-point hit circles must not be targets (they overlap, and touch snapping aims at them)
  document.head.insertAdjacentHTML("beforeend", "<style>svg circle.hit[data-id],svg circle.pt[data-id]{pointer-events:none}</style>");

  function nearest(svg, ev, radius) {
    let best = null, bd = Infinity;
    for (const c of svg.querySelectorAll("circle.pt[data-id]")) {
      const r = c.getBoundingClientRect();
      const dx = r.left + r.width / 2 - ev.clientX, dy = r.top + r.height / 2 - ev.clientY;
      const d = dx * dx + dy * dy;
      if (d <= bd) { bd = d; best = c; } // ties: the point drawn on top (later) wins – that is the one you see
    }
    return best && bd <= radius * radius ? best : null;
  }

  function bind(svg) {
    if (svg.__fvLinks) return;
    svg.__fvLinks = true;
    let current = null, armed = null;
    const hitOf = (pt) => pt && svg.querySelector(`circle.hit[data-id="${CSS.escape(pt.dataset.id)}"]`);
    const fire = (el, type, ev) => {
      if (!el) return;
      const e = new MouseEvent(type, { clientX: ev.clientX, clientY: ev.clientY, bubbles: false });
      e.__fv = true;
      el.dispatchEvent(e);
    };
    const tip = () => (svg.parentElement && svg.parentElement.querySelector("#tip, .tip")) || document.getElementById("tip");
    const mark = (pt) => {
      if (current === pt) return;
      if (current) current.setAttribute("r", current.__r || "5");
      current = pt;
      if (pt) { pt.__r = pt.__r || pt.getAttribute("r"); pt.setAttribute("r", String(+pt.__r + 2)); }
    };
    const show = (pt, ev, hint) => {
      mark(pt);
      if (!pt) { const t = tip(); if (t) t.style.display = "none"; return; }
      fire(hitOf(pt), "mousemove", ev); // the report's own tooltip, for the nearest point
      const t = tip();
      if (t && hint) t.insertAdjacentHTML("beforeend", `<div class="fv-hint">Ťukni ešte raz – otvorí sa inzerát ↗</div>`);
    };
    const open = (pt) => {
      const d = byId.get(pt.dataset.id);
      if (d && d.url) {
        try { window.FerovkaAnalytics?.listingClick(d.url, "chart"); } catch { /* analytics must never block an ad */ }
        window.open(d.url, "_blank", "noopener");
      }
    };

    // the per-circle handlers of the report never see real mouse events – only our synthetic ones
    for (const type of MOUSE) {
      svg.addEventListener(type, (ev) => {
        if (ev.__fv) return;
        ev.stopImmediatePropagation();
        if (type === "mousemove" && lastPointer === "mouse") {
          show(nearest(svg, ev, 18), ev, false);
          svg.style.cursor = current ? "pointer" : "";
        } else if (type === "mouseleave" && ev.target === svg && lastPointer === "mouse") {
          show(null, ev);
        } else if (type === "click") {
          const touch = lastPointer !== "mouse";
          const at = touch && down ? down : ev;
          const pt = nearest(svg, at, touch ? 26 : 18);
          if (!pt) { armed = null; show(null, ev); return; }
          if (!touch || armed === pt) { armed = null; open(pt); }
          else { armed = pt; show(pt, at, true); }
        }
      }, true);
    }
  }

  const scan = () => document.querySelectorAll("svg").forEach((s) => s.querySelector("circle.pt[data-id]") && bind(s));
  scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
})();
