"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Option = { slug: string; name: string; free: boolean };

/** Hero form (in the place of the design's link field): pick a model → its market analysis. */
export default function ModelPicker({ options }: { options: Option[] }) {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const free = options.filter((o) => o.free);
  const rest = options.filter((o) => !o.free);
  return (
    <form
      id="start"
      className="oa-start"
      onSubmit={(e) => {
        e.preventDefault();
        if (slug) router.push(`/analyza/${slug}/`);
      }}
    >
      <label htmlFor="model">Model auta</label>
      <div className="row">
        <select id="model" value={slug} onChange={(e) => setSlug(e.target.value)} required>
          <option value="">Vyber model…</option>
          <optgroup label="Zadarmo">
            {free.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Za 5 € (prístup na 30 dní)">
            {rest.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name}
              </option>
            ))}
          </optgroup>
        </select>
        <button type="submit" data-analytics-action="model_pick">
          Zobraziť analýzu
        </button>
      </div>
      <p className="hint">
        {free.length} najpredávanejších modelov je zadarmo a bez registrácie. Porovnávame inzeráty z bazos.sk, autobazar.eu a
        bazar.sk.
      </p>
    </form>
  );
}
