"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthForm from "@/components/AuthForm";
import { accountAction, useUser } from "@/lib/account";

/** Where to go after login: ?dalej=/analyza/<slug>/ (same-site paths only). */
function nextPath() {
  const p = new URLSearchParams(location.search).get("dalej") ?? "";
  return /^\/(?!\/)[\w\-/]*$/.test(p) ? p : "";
}

export default function AccountPanel() {
  const user = useUser();
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => setNext(nextPath()), []);

  if (user === undefined) return <div className="account-card loading" aria-busy="true" />;

  if (!user)
    return (
      <div className="account-card">
        <h1>Prihlás sa a uvidíš všetky analýzy</h1>
        <p className="lead">
          Päť najpredávanejších modelov je otvorených pre každého. Ostatné analýzy sú po bezplatnej registrácii.
        </p>
        <AuthForm onDone={() => next && location.assign(next)} />
      </div>
    );

  async function run(akcia: "odhlasenie" | "zmazanie", heslo?: string) {
    setBusy(true);
    setError("");
    try {
      await accountAction(akcia, heslo === undefined ? {} : { heslo });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Niečo sa pokazilo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="account-card">
      <h1>Si prihlásený</h1>
      <p className="lead">
        Ako <b>{user}</b>. Všetky analýzy máš odomknuté.
      </p>
      <div className="account-actions">
        <Link className="btn primary" href={next || "/#analyzy"}>
          {next ? "Pokračovať na analýzu →" : "Prejsť na analýzy →"}
        </Link>
        <button type="button" className="btn ghost" disabled={busy} onClick={() => run("odhlasenie")}>
          Odhlásiť sa
        </button>
      </div>
      <div className="account-danger">
        {confirmDelete ? (
          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              run("zmazanie", String(new FormData(e.currentTarget).get("heslo") ?? ""));
            }}
          >
            <label className="field">
              <span>Na potvrdenie zadaj heslo – účet sa natrvalo zmaže</span>
              <input type="password" name="heslo" required autoComplete="current-password" />
            </label>
            <div className="account-actions">
              <button type="submit" className="btn ghost danger" disabled={busy}>
                Zmazať účet
              </button>
              <button type="button" className="linkbtn" onClick={() => setConfirmDelete(false)}>
                Zrušiť
              </button>
            </div>
          </form>
        ) : (
          <button type="button" className="linkbtn" onClick={() => setConfirmDelete(true)}>
            Zmazať môj účet
          </button>
        )}
        {error && (
          <p className="feedback-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
