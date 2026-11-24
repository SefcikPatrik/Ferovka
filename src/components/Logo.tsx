import Link from "next/link";

/** OverAuto mark: a dark rounded square with an orange check (design/znacka.html). */
export function Mark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true">
      <rect x="1" y="1" width="34" height="34" rx="9" fill="#14161A" />
      <path d="M10 18.5l5 5 11-12" fill="none" stroke="#F26A1B" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="logo" aria-label="OverAuto – domov">
      <Mark />
      <span className="word">
        Over<span>Auto</span>
      </span>
    </Link>
  );
}
