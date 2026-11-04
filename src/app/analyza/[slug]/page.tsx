import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mark } from "@/components/Logo";
import ReportFrame from "@/components/ReportFrame";
import ThemeToggle from "@/components/ThemeToggle";
import { formatDate, formatNum, getReport, reports } from "@/lib/reports";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return reports.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = getReport((await params).slug);
  return r ? { title: `${r.name} – férové ceny`, description: r.summary } : {};
}

export default async function ReportPage({ params }: Props) {
  const r = getReport((await params).slug);
  if (!r) notFound();
  const src = `/reports/${r.file}`;
  return (
    <>
      <header className="topbar viewer-bar">
        <div className="wrap">
          <Link href="/#analyzy" className="logo" aria-label="Späť na všetky analýzy">
            <Mark />
          </Link>
          <span className="sep" />
          <div className="viewer-title">
            <b>{r.name}</b>
            <span>
              {formatDate(r.date)}
              {r.ads ? ` · ${formatNum(r.ads)} inzerátov` : ""}
            </span>
          </div>
          <div className="viewer-actions">
            <Link className="btn ghost hide-sm" href="/#analyzy">
              ← Všetky analýzy
            </Link>
            <a className="btn ghost hide-sm" href={src} target="_blank" rel="noopener">
              Na celú obrazovku ↗
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <ReportFrame src={src} title={`Analýza ${r.name}`} />
    </>
  );
}
