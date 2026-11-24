"use client";

import { useEffect, useState } from "react";

export type Account = { email: string; paidUntil: string | null };
// undefined = still checking, null = logged out
export type User = Account | null | undefined;

/** Paid access to all analyses is active (5 € / 30 days). */
export const hasAccess = (u: User) => Boolean(u?.paidUntil && Date.parse(u.paidUntil) > Date.now());

let current: User;
let pending: Promise<User> | undefined;
const listeners = new Set<(u: User) => void>();

function publish(u: User) {
  current = u;
  listeners.forEach((l) => l(u));
}

const parse = (j: { user?: { email?: unknown; platene_do?: unknown } | null }): Account | null =>
  j?.user && typeof j.user.email === "string"
    ? { email: j.user.email, paidUntil: typeof j.user.platene_do === "string" ? j.user.platene_do : null }
    : null;

export function loadUser(): Promise<User> {
  pending ??= fetch("/api/ucet/", { cache: "no-store", credentials: "same-origin" })
    .then((r) => (r.ok ? r.json() : { user: null }))
    .then(parse)
    .catch(() => null)
    .then((u) => {
      publish(u);
      return u;
    });
  return pending;
}

/** The logged-in account (null = logged out, undefined = not known yet). */
export function useUser(): User {
  const [user, setUser] = useState<User>(current);
  useEffect(() => {
    listeners.add(setUser);
    loadUser();
    return () => {
      listeners.delete(setUser);
    };
  }, []);
  return user;
}

export type Action = "registracia" | "prihlasenie" | "odhlasenie" | "zmazanie";

export async function accountAction(akcia: Action, fields: Record<string, unknown> = {}): Promise<User> {
  const res = await fetch("/api/ucet/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ akcia, ...fields }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) throw new Error(json.error || "Niečo sa pokazilo, skús to prosím neskôr.");
  const user = parse(json);
  pending = Promise.resolve(user);
  publish(user);
  (window as unknown as { FerovkaAnalytics?: { track?: (e: string, p?: object) => void } }).FerovkaAnalytics?.track?.(
    akcia === "registracia" ? "sign_up" : akcia === "prihlasenie" ? "login" : akcia === "odhlasenie" ? "logout" : "account_delete",
  );
  return user;
}

export const formatDay = (iso: string) => new Date(iso).toLocaleDateString("sk-SK");
