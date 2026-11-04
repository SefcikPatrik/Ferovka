import Link from "next/link";

/** Wordmark: a price gauge whose needle points into the green "fair" zone. */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--text)" />
      <path d="M7 21a9 9 0 0 1 18 0" fill="none" stroke="var(--bg)" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" />
      <path d="M11.2 13.4A9 9 0 0 1 20.8 13.4" fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" />
      <path d="M16 21 19.5 12.5" stroke="var(--bg)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="16" cy="21" r="2.4" fill="var(--bg)" />
    </svg>
  );
}

export default function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Férovka – domov">
      <Mark />
      <span>
        Férovka<span className="dot">.</span>
      </span>
    </Link>
  );
}
