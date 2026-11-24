"use client";

import AuthForm from "@/components/AuthForm";
import ReportFrame from "@/components/ReportFrame";
import { useUser } from "@/lib/account";

/** A locked analysis: the report for a logged-in visitor, otherwise the free registration / login form. */
export default function LockedReport({ src, title, name }: { src: string; title: string; name: string }) {
  const user = useUser();
  if (user) return <ReportFrame src={src} title={title} />;
  return (
    <section className="gate" aria-labelledby="gate-title">
      <div className="wrap">
        <div className="gate-card">
          <div className="gate-intro">
            <span className="lock-pill">
              <LockIcon /> Po prihlásení
            </span>
            <h2 id="gate-title">Celá analýza {name} je po bezplatnej registrácii</h2>
            <p>
              Päť najpredávanejších modelov (Octavia, Golf, Fabia, Passat, Superb) je otvorených pre každého. Ostatné
              analýzy – odporúčané ponuky, porovnanie motorov a kompletný rebríček inzerátov – uvidíš po prihlásení.
            </p>
            <ul className="gate-list">
              <li>Registrácia je zadarmo, stačí e-mail a heslo</li>
              <li>Prístup ku všetkým analýzam naraz</li>
              <li>Žiadne newslettre ani reklamy</li>
            </ul>
          </div>
          {user === undefined ? <div className="auth-form loading" aria-busy="true" /> : <AuthForm />}
        </div>
      </div>
    </section>
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
