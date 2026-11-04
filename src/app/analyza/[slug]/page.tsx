import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
      <header className="viewer-bar">
        <div className="inner">
          <Link href="/#analyzy" className="home" title="Späť na všetky analýzy">
            Férovka<span className="dot">.</span>
          </Link>
          <div className="t">
            <b>{r.name}</b>
            <span>
              {formatDate(r.date)}
              {r.ads ? ` · ${formatNum(r.ads)} inzerátov` : ""}
            </span>
          </div>
          <div className="actions">
            <Link href="/#analyzy" className="hide-sm">
              ← Všetky analýzy
            </Link>
            <a href={src} target="_blank" rel="noopener" className="hide-sm">
              Samostatne ↗
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <ReportFrame src={src} title={`Analýza ${r.name}`} />
    </>
  );
}
