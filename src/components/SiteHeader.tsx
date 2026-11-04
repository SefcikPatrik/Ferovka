import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="topbar">
      <div className="wrap">
        <Link href="/" className="logo">
          <span className="sq" aria-hidden="true">
            F
          </span>
          Férovka
        </Link>
        {children}
      </div>
    </header>
  );
}

export function MainNav() {
  return (
    <nav className="nav" aria-label="Hlavná navigácia">
      <a href="#analyzy">Analýzy</a>
      <a href="#ako-to-funguje" className="hide-sm">
        Ako to funguje
      </a>
      <ThemeToggle />
    </nav>
  );
}
