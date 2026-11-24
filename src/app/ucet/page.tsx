import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/Logo";
import AccountPanel from "@/components/AccountPanel";

export const metadata: Metadata = {
  title: "Môj účet",
  description: "Prihlásenie a registrácia – po prihlásení uvidíš všetky analýzy OverAuto.",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <>
      <header className="topbar viewer-bar">
        <div className="wrap">
          <Link href="/" className="logo" aria-label="OverAuto – úvod">
            <Mark size={32} />
          </Link>
          <span className="sep" />
          <div className="viewer-title">
            <b>Môj účet</b>
          </div>
          <div className="viewer-actions">
            <Link className="btn ghost hide-sm" href="/#analyzy">
              ← Všetky analýzy
            </Link>
          </div>
        </div>
      </header>
      <main className="account-page">
        <div className="wrap">
          <AccountPanel />
        </div>
      </main>
    </>
  );
}
