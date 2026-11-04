import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReportFrame from "@/components/ReportFrame";
import SiteHeader from "@/components/SiteHeader";
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
      <div className="viewer-bar">
        <SiteHeader>
          <div className="title">
            <b>{r.name}</b>
            <span>
              Analýza z {formatDate(r.date)}
              {r.ads ? ` · ${formatNum(r.ads)} inzerátov` : ""}
            </span>
          </div>
          <nav className="nav" aria-label="Navigácia analýzy">
            <Link href="/#analyzy" className="hide-sm">
              ← Všetky analýzy
            </Link>
            <a href={src} target="_blank" rel="noopener" className="hide-sm">
              Otvoriť samostatne
            </a>
            <ThemeToggle />
          </nav>
        </SiteHeader>
      </div>
      <ReportFrame src={src} title={`Analýza ${r.name}`} />
    </>
  );
}
