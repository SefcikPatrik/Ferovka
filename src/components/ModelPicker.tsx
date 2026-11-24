"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { hasAccess, useUser } from "@/lib/account";

type Option = { slug: string; name: string; free: boolean };

/** Hero form (in the place of the design's link field): pick a model → its market analysis. */
export default function ModelPicker({ options }: { options: Option[] }) {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const unlocked = hasAccess(useUser());
  const free = options.filter((o) => o.free);
  // without paid access only the free models are offered
  const rest = unlocked ? options.filter((o) => !o.free) : [];
  const lockedCount = options.length - free.length;
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
          {unlocked ? (
            <optgroup label="Prémiové (máš odomknuté)">
              {rest.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.name}
                </option>
              ))}
            </optgroup>
          ) : (
            <option disabled>+ ďalších {lockedCount} modelov po zaplatení 5 €</option>
          )}
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
