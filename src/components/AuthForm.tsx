"use client";

import { useState } from "react";
import { accountAction } from "@/lib/account";

type Mode = "registracia" | "prihlasenie";

/** Registration / login form. Calls onDone after a successful login, so the caller can show the content. */
export default function AuthForm({ initial = "registracia", onDone }: { initial?: Mode; onDone?: () => void }) {
  const [mode, setMode] = useState<Mode>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await accountAction(mode, { email: data.get("email"), heslo: data.get("heslo"), web: data.get("web") });
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Niečo sa pokazilo.");
    } finally {
      setBusy(false);
    }
  }

  const switchTo = (m: Mode) => {
    setMode(m);
    setError("");
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="auth-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={mode === "registracia"} onClick={() => switchTo("registracia")}>
          Registrácia
        </button>
        <button type="button" role="tab" aria-selected={mode === "prihlasenie"} onClick={() => switchTo("prihlasenie")}>
          Prihlásenie
        </button>
      </div>
      <label className="field">
        <span>E-mail</span>
        <input type="email" name="email" required maxLength={200} autoComplete="email" placeholder="meno@example.sk" />
      </label>
      <label className="field">
        <span>{mode === "registracia" ? "Heslo (aspoň 8 znakov)" : "Heslo"}</span>
        <input
          type="password"
          name="heslo"
          required
          minLength={mode === "registracia" ? 8 : 1}
          maxLength={200}
          autoComplete={mode === "registracia" ? "new-password" : "current-password"}
        />
      </label>
      <input className="feedback-hp" type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button type="submit" className="btn primary" disabled={busy}>
        {busy ? "Chvíľku…" : mode === "registracia" ? "Zaregistrovať sa zadarmo" : "Prihlásiť sa"}
      </button>
      {error && (
        <p className="feedback-error" role="alert">
          {error}
        </p>
      )}
      <p className="feedback-note">
        {mode === "registracia"
          ? "Uložíme len tvoj e-mail a zašifrovaný odtlačok hesla – na prihlásenie. Žiadne newslettre. Účet môžeš kedykoľvek zmazať v sekcii Môj účet."
          : "Zabudnuté heslo? Napíš nám cez formulár na spodku stránky a pomôžeme."}
      </p>
    </form>
  );
}
