"use client";

import { useState } from "react";

// Visitors' requests (another model, a sold / outdated ad, wrong data) → api/poziadavka.js → private Vercel Blob store.
const TYPES = [
  { value: "model", label: "Pridajte analýzu ďalšieho modelu" },
  { value: "neaktualne", label: "Inzerát je predaný alebo neaktuálny" },
  { value: "chyba", label: "Chyba v údajoch (rok, km, cena…)" },
  { value: "ine", label: "Iné" },
];

type State = { kind: "idle" | "sending" | "ok" } | { kind: "error"; message: string };

export default function FeedbackForm({ context }: { context?: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/poziadavka/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typ: data.get("typ"),
          sprava: data.get("sprava"),
          email: data.get("email"),
          web: data.get("web"),
          stranka: context ?? location.pathname,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Odoslanie zlyhalo, skús to prosím neskôr.");
      form.reset();
      setState({ kind: "ok" });
    } catch (err) {
      setState({ kind: "error", message: err instanceof Error ? err.message : "Odoslanie zlyhalo." });
    }
  }

  return (
    <section className="feedback" id="poziadavka" aria-labelledby="feedback-title">
      <div className="wrap">
        <div className="feedback-card">
          <div className="feedback-intro">
            <h2 id="feedback-title">Chýba ti model alebo niečo nesedí?</h2>
            <p>
              Napíš nám, ktorú analýzu máme pridať alebo obnoviť, prípadne ktorý inzerát je už predaný či má zlé údaje.
              Ak pridáš odkaz na inzerát, opravíme to rýchlejšie.
            </p>
          </div>
          {state.kind === "ok" ? (
            <div className="feedback-done" role="status">
              <strong>Ďakujeme, požiadavku sme dostali.</strong>
              <button type="button" className="linkbtn" onClick={() => setState({ kind: "idle" })}>
                Poslať ďalšiu
              </button>
            </div>
          ) : (
            <form className="feedback-form" onSubmit={submit}>
              <label className="field">
                <span>O čo ide</span>
                <select name="typ" defaultValue="model">
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Správa</span>
                <textarea
                  name="sprava"
                  required
                  minLength={5}
                  maxLength={3000}
                  rows={4}
                  placeholder="Napr. Pridajte Toyotu RAV4, alebo: inzerát https://… je už predaný"
                />
              </label>
              <label className="field">
                <span>E-mail (nepovinné, ak chceš odpoveď)</span>
                <input type="email" name="email" maxLength={200} autoComplete="email" placeholder="meno@example.sk" />
              </label>
              {/* honeypot: hidden from people, bots fill it */}
              <input className="feedback-hp" type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="feedback-actions">
                <button type="submit" className="btn primary" disabled={state.kind === "sending"}>
                  {state.kind === "sending" ? "Odosielam…" : "Odoslať"}
                </button>
                {state.kind === "error" && (
                  <p className="feedback-error" role="alert">
                    {state.message}
                  </p>
                )}
              </div>
              <p className="feedback-note">E-mail použijeme len na odpoveď k tejto požiadavke.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
