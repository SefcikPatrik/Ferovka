"use client";

import Link from "next/link";
import { useState } from "react";

type Item = { slug: string; name: string; brand: string; model: string };

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** The model analysis whose brand and model both appear in the ad's address (bazoš and most portals put them in the URL). */
function matchModel(url: string, items: Item[]): Item | undefined {
  const u = `-${norm(url)}-`;
  let best: Item | undefined;
  let bestLen = 0;
  for (const it of items) {
    const model = norm(it.model).replace(/^-|-$/g, "");
    const brand = norm(it.brand).replace(/^-|-$/g, "");
    if (!model || !u.includes(`-${model}-`)) continue;
    const len = model.length + (u.includes(`-${brand}-`) ? 100 : 0);
    if (len > bestLen) {
      best = it;
      bestLen = len;
    }
  }
  return best;
}

/**
 * The hero form (design/landing-page.html). The AI verdict for one ad is the next step of the project;
 * until it runs, the form points to the market analysis of the same model when it recognises it.
 */
export default function LinkForm({ items }: { items: Item[] }) {
  const [result, setResult] = useState<{ kind: "match"; item: Item } | { kind: "none" } | { kind: "invalid" } | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("link") || "").trim();
    if (!/^https?:\/\/\S+\.\S+/.test(value)) {
      setResult({ kind: "invalid" });
      return;
    }
    const item = matchModel(value, items);
    setResult(item ? { kind: "match", item } : { kind: "none" });
  }

  return (
    <form id="start" className="oa-start" onSubmit={submit} noValidate>
      <label htmlFor="link">Odkaz na inzerát</label>
      <div className="row">
        <input id="link" name="link" type="url" inputMode="url" autoComplete="off" placeholder="https://www.bazar.sk/inzerat/…" />
        <button type="submit" data-analytics-action="verdict_submit">
          Získať verdikt zadarmo
        </button>
      </div>
      {result === null && (
        <p className="hint">Rýchle skóre je zadarmo a bez registrácie. Funguje s inzerátmi zo slovenských a českých portálov.</p>
      )}
      {result?.kind === "invalid" && (
        <p className="notice" role="alert">
          Vlož celý odkaz na inzerát, napríklad https://auto.bazos.sk/inzerat/…
        </p>
      )}
      {result?.kind === "match" && (
        <p className="notice" role="status">
          AI verdikt pre konkrétny inzerát práve spúšťame. Kým bude hotový, porovnaj cenu s trhom v našej analýze{" "}
          <Link href={`/analyza/${result.item.slug}/`}>{result.item.name} →</Link>
        </p>
      )}
      {result?.kind === "none" && (
        <p className="notice" role="status">
          AI verdikt pre konkrétny inzerát práve spúšťame. Kým bude hotový, nájdi svoj model v{" "}
          <a href="#analyzy">analýzach férových cien</a> nižšie.
        </p>
      )}
    </form>
  );
}
