"use client";

import AuthForm from "@/components/AuthForm";
import ReportFrame from "@/components/ReportFrame";
import { hasAccess, useUser } from "@/lib/account";

export const PRICE = "5 €";
export const PERIOD = "30 dní";

/** A premium analysis: the report with active paid access, otherwise login / registration and the unlock offer. */
export default function LockedReport({ src, title, name }: { src: string; title: string; name: string }) {
  const user = useUser();
  if (hasAccess(user)) return <ReportFrame src={src} title={title} />;
  return (
    <section className="gate" aria-labelledby="gate-title">
      <div className="wrap">
        <div className="gate-card">
          <div className="gate-intro">
            <span className="lock-pill">
              <LockIcon /> Prémiová analýza
            </span>
            <h2 id="gate-title">
              Odomkni analýzu {name} a všetky ostatné na {PERIOD} za {PRICE}
            </h2>
            <p>
              Zadarmo je 15 analýz: Octavia, Golf, Fabia, Passat, Superb a k tomu Kia Ceed SW, Toyota Yaris, Peugeot 3008, Hyundai Tucson, Mercedes-Benz GLC, Nissan Qashqai, Dacia Duster, Seat Leon, VW Tiguan a BMW 3.
              Ostatné analýzy – odporúčané ponuky, porovnanie motorov a kompletný rebríček inzerátov – sú prémiové.
            </p>
            <ul className="gate-list">
              <li>Jednorazová platba {PRICE}, žiadne predplatné – nič sa samo neobnovuje</li>
              <li>Prístup ku všetkým analýzam na {PERIOD}</li>
              <li>Analýzy priebežne obnovujeme s aktuálnymi inzerátmi</li>
            </ul>
          </div>
          {user === undefined ? (
            <div className="auth-form loading" aria-busy="true" />
          ) : user === null ? (
            <div className="gate-steps">
              <p className="gate-step">
                <b>1.</b> Prihlás sa alebo si vytvor účet, <b>2.</b> zaplať {PRICE}.
              </p>
              <AuthForm />
            </div>
          ) : (
            <PayBox email={user.email} />
          )}
        </div>
      </div>
    </section>
  );
}

/** Shown to a logged-in visitor without active access. The payment gateway is not connected yet. */
export function PayBox({ email }: { email: string }) {
  return (
    <div className="auth-form pay-box">
      <div className="pay-price">
        <b>{PRICE}</b>
        <span>/ {PERIOD} · všetky analýzy</span>
      </div>
      <button type="button" className="btn primary" disabled>
        Zaplatiť {PRICE}
      </button>
      <p className="pay-soon" role="status">
        Online platbu práve spúšťame. Ak chceš prístup hneď, napíš nám cez formulár nižšie (typ „Iné“) a uveď e-mail{" "}
        <b>{email}</b>.
      </p>
    </div>
  );
}

export function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
