import Link from "next/link";
import Logo from "@/components/Logo";

/** Header for the plain pages (legal): logo + the main call to action. */
export default function SimpleHeader() {
  return (
    <header className="oa-header">
      <div className="wrap">
        <Logo />
        <nav className="oa-nav" aria-label="Hlavná navigácia">
          <Link href="/#analyzy">Férové ceny</Link>
          <Link href="/#start" className="nav-cta">
            Analyzovať inzerát
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SimpleFooter() {
  return (
    <footer>
      <div className="wrap oa-footer">
        <span>© 2026 OverAuto · overauto.eu</span>
        <nav aria-label="Právne informácie">
          <Link href="/obchodne-podmienky/">Obchodné podmienky</Link>
          <Link href="/ochrana-osobnych-udajov/">Ochrana osobných údajov</Link>
          <Link href="/#poziadavka">Kontakt</Link>
        </nav>
      </div>
    </footer>
  );
}
