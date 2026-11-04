"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatDate, formatNum, type Report } from "@/lib/reports";

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

function Status({ date, now }: { date: string; now: number | null }) {
  if (now === null) return <span>{formatDate(date)}</span>;
  const d = ageDays(date, now);
  const cls = d <= FRESH_DAYS ? "fresh" : d > STALE_DAYS ? "stale" : "mid";
  const text = d <= FRESH_DAYS ? "Nová" : d > STALE_DAYS ? "Staršie údaje" : "Aktuálna";
  return (
    <>
      <span className={`pill ${cls}`}>{text}</span>
      <span>
        {formatDate(date)} ({ageLabel(d)})
      </span>
    </>
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
      <h2>Analýzy</h2>
      <p className="lead-in">Každá analýza obsahuje odporúčané ponuky, porovnanie motorov a zoznam všetkých inzerátov.</p>

      <div className="filters" role="search" aria-label="Filtrovanie analýz">
        <label>
          Kedy bola spravená
          <select value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
            <option value="">Kedykoľvek</option>
            <option value="7">Posledných 7 dní</option>
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
        <label>
          Značka
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
        <label>
          Model
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="">Všetky modely</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label>
          Zoradiť
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="new">Od najnovších</option>
            <option value="old">Od najstarších</option>
            <option value="name">Podľa názvu</option>
          </select>
        </label>
      </div>
      <div className="result-line" aria-live="polite">
        <span>
          Zobrazené: <b>{shown.length}</b> z {reports.length}
        </span>
        {active && (
          <button type="button" className="linkbtn" onClick={reset}>
            Zrušiť filtre
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          Pre tento výber nemáme žiadnu analýzu.{" "}
          <button type="button" className="linkbtn" onClick={reset}>
            Zobraziť všetky
          </button>
        </div>
      ) : (
        <ul className="list">
          {shown.map((r) => (
            <li key={r.slug}>
              <Link href={`/analyza/${r.slug}/`} className="item">
                <div>
                  <div className="top">
                    {r.kind === "comparison" && <span className="pill kind">Porovnanie</span>}
                    <Status date={r.date} now={now} />
                  </div>
                  <h3>{r.name}</h3>
                  <p>{r.summary}</p>
                </div>
                <div className="stats">
                  <div>
                    <b>{r.ads ? formatNum(r.ads) : "–"}</b>
                    <span>inzerátov</span>
                  </div>
                  {r.median && (
                    <div>
                      <b>{r.median}</b>
                      <span>stredná cena</span>
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
