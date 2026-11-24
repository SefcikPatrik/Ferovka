"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthForm from "@/components/AuthForm";
import { PayBox, PERIOD, PRICE } from "@/components/LockedReport";
import { accountAction, formatDay, hasAccess, useUser } from "@/lib/account";

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
        <h1>Prihlásenie</h1>
        <p className="lead">
          10 analýz rôznych značiek je otvorených pre každého. Všetky ostatné analýzy odomkneš na {PERIOD} za{" "}
          {PRICE} – najprv sa prihlás alebo si vytvor účet.
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
      <h1>Môj účet</h1>
      <p className="lead">
        Prihlásený ako <b>{user.email}</b>.{" "}
        {hasAccess(user) && user.paidUntil ? (
          <>
            Všetky analýzy máš odomknuté do <b>{formatDay(user.paidUntil)}</b>.
          </>
        ) : user.paidUntil ? (
          <>Prístup ti skončil {formatDay(user.paidUntil)}.</>
        ) : (
          <>Zatiaľ máš len analýzy zadarmo.</>
        )}
      </p>
      {!hasAccess(user) && <PayBox email={user.email} />}
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
