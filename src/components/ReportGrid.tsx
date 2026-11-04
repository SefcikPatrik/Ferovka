"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatDate, formatNum, photosFor, type Report } from "@/lib/reports";

const DAY = 86_400_000;
const FRESH_DAYS = 7; // "Nová"
const STALE_DAYS = 30; // "Staršie údaje" – ceny na trhu sa medzitým zmenili

type Period = "" | "7" | "30" | "old" | `d:${string}`;
type Sort = "new" | "old" | "name";

const ageDays = (iso: string, now: number) => Math.floor((now - new Date(`${iso}T00:00:00`).getTime()) / DAY);

function ageLabel(days: number) {
  if (days <= 0) return "dnes";
  if (days === 1) return "včera";
  if (days < 30) return `pred ${days} dňami`;
  const m = Math.floor(days / 30);
  return m === 1 ? "pred mesiacom" : `pred ${m} mesiacmi`;
}

function Freshness({ date, now }: { date: string; now: number | null }) {
  if (now === null) return <span className="date">{formatDate(date)}</span>;
  const d = ageDays(date, now);
  const cls = d <= FRESH_DAYS ? "fresh" : d > STALE_DAYS ? "stale" : "mid";
  const text = d <= FRESH_DAYS ? "Nová" : d > STALE_DAYS ? "Staršie údaje" : "Aktuálna";
  return (
    <span className="date" title={`Analýza z ${formatDate(date)}`}>
      <span className={`badge ${cls}`}>{text}</span>
      {formatDate(date)} · {ageLabel(d)}
    </span>
  );
}

export default function ReportGrid({ reports }: { reports: Report[] }) {
  // "now" only on the client, so the static HTML does not freeze the age at build time
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  const [period, setPeriod] = useState<Period>("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [sort, setSort] = useState<Sort>("new");

  const brands = useMemo(() => [...new Set(reports.map((r) => r.brand))].sort((a, b) => a.localeCompare(b, "sk")), [reports]);
  const models = useMemo(
    () => [...new Set(reports.filter((r) => !brand || r.brand === brand).map((r) => r.model))].sort((a, b) => a.localeCompare(b, "sk")),
    [reports, brand],
  );
  const dates = useMemo(() => [...new Set(reports.map((r) => r.date))].sort().reverse(), [reports]);

  const shown = reports
    .filter((r) => !brand || r.brand === brand)
    .filter((r) => !model || r.model === model)
    .filter((r) => {
      if (!period) return true;
      if (period.startsWith("d:")) return r.date === period.slice(2);
      if (now === null) return true;
      const d = ageDays(r.date, now);
      return period === "old" ? d > STALE_DAYS : d <= Number(period);
    })
    .sort((a, b) =>
      sort === "name"
        ? `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, "sk")
        : (sort === "new" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)) || a.name.localeCompare(b.name, "sk"),
    );

  const active = Boolean(period || brand || model || sort !== "new");
  const reset = () => {
    setPeriod("");
    setBrand("");
    setModel("");
    setSort("new");
  };

  return (
    <>
      <div className="section-head" data-reveal>
        <div>
          <h2>Analýzy trhu</h2>
          <p>Každá analýza obsahuje odporúčané ponuky, porovnanie motorov a kompletný rebríček inzerátov.</p>
        </div>
      </div>

      <div className="filterbar" data-reveal role="search" aria-label="Filtrovanie analýz">
        <label className="field">
          <span>Kedy bola spravená</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
            <option value="">Kedykoľvek</option>
            <option value="7">Nové – posledných 7 dní</option>
            <option value="30">Posledných 30 dní</option>
            <option value="old">Staršie ako 30 dní</option>
            <optgroup label="Konkrétny deň">
              {dates.map((d) => (
                <option key={d} value={`d:${d}`}>
                  {formatDate(d)} ({reports.filter((r) => r.date === d).length})
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <label className="field">
          <span>Značka</span>
          <select
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setModel("");
            }}
          >
            <option value="">Všetky značky</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b === "Porovnanie" ? "Porovnania modelov" : b}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Model</span>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="">{brand ? `Všetky modely (${brand})` : "Všetky modely"}</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Zoradiť</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="new">Najnovšie hore</option>
            <option value="old">Najstaršie hore</option>
            <option value="name">Podľa názvu</option>
          </select>
        </label>
        <div className="filter-meta">
          <span>
            {shown.length} z {reports.length}
          </span>
          {active && (
            <button type="button" className="linkbtn" onClick={reset}>
              Zrušiť filtre
            </button>
          )}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          Pre tento výber nemáme žiadnu analýzu.{" "}
          <button type="button" className="linkbtn" onClick={reset}>
            Zobraziť všetky
          </button>
        </div>
      ) : (
        <div className="grid">
          {shown.map((r, i) => {
            const photos = photosFor(r);
            return (
              <Link
                key={`${r.slug}|${period}|${brand}|${model}|${sort}`} // new key = replay the entrance animation after filtering
                href={`/analyza/${r.slug}/`}
                className={`rcard${r.kind === "comparison" ? " feature" : ""}`}
                style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}
              >
                <div className={`rimg${photos.length > 1 ? " collage" : ""}`}>
                  {photos.map((p) => (
                    <img key={p.src} src={p.src} alt="" loading="lazy" />
                  ))}
                  <span className="rimg-brand">{r.kind === "comparison" ? "Porovnanie modelov" : r.brand}</span>
                </div>
                <div className="rbody">
                  <Freshness date={r.date} now={now} />
                  <h3>{r.name}</h3>
                  <p>{r.summary}</p>
                  <div className="meta">
                    <div>
                      <div className="v">{r.ads ? formatNum(r.ads) : "–"}</div>
                      <div className="l">inzerátov</div>
                    </div>
                    <div>
                      <div className="v">{r.median ?? "3 modely"}</div>
                      <div className="l">{r.median ? "medián ceny" : "v porovnaní"}</div>
                    </div>
                    <div>
                      <div className="v">{r.r2 ?? "✓"}</div>
                      <div className="l">{r.r2 ? "presnosť modelu" : "odporúčanie"}</div>
                    </div>
                  </div>
                  <span className="go">
                    Otvoriť analýzu <span className="arrow">→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
