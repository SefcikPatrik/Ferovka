import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mark } from "@/components/Logo";
import ReportFrame from "@/components/ReportFrame";
import ThemeToggle from "@/components/ThemeToggle";
import { formatDate, formatNum, getReport, photosFor, reports } from "@/lib/reports";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return reports.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = getReport((await params).slug);
  if (!r) return {};
  const photo = photosFor(r)[0];
  return {
    title: `${r.name} – férové ceny`,
    description: r.summary,
    openGraph: photo ? { images: [photo.src] } : undefined,
  };
}

export default async function ReportPage({ params }: Props) {
  const r = getReport((await params).slug);
  if (!r) notFound();
  const src = `/reports/${r.file}`;
  const photos = photosFor(r);
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

      <section className={`vhero${photos.length > 1 ? " collage" : ""}`}>
        <div className="vhero-img">
          {photos.map((p) => (
            <img key={p.src} src={p.src} alt="" />
          ))}
        </div>
        <div className="hero-fx" aria-hidden="true">
          <span className="hero-grid" />
          <span className="hero-sweep" />
        </div>
        <div className="wrap vhero-text">
          <span className="eyebrow">{r.kind === "comparison" ? "Porovnanie modelov" : r.brand}</span>
          <h1>{r.name}</h1>
          <div className="chips">
            <span className="chip-stat">Analýza z {formatDate(r.date)}</span>
            {r.ads && <span className="chip-stat">{formatNum(r.ads)} inzerátov</span>}
            {r.median && <span className="chip-stat">medián {r.median}</span>}
            {r.r2 && <span className="chip-stat">presnosť modelu {r.r2}</span>}
          </div>
        </div>
        {photos.length > 0 && (
          <div className="photo-credit">
            Foto:{" "}
            {photos.map((p, i) => (
              <span key={p.src}>
                {i > 0 && " · "}
                <a href={p.source} target="_blank" rel="noopener">
                  {p.author}
                </a>
                , {p.license}
              </span>
            ))}{" "}
            (Wikimedia Commons)
          </div>
        )}
      </section>

      <ReportFrame src={src} title={`Analýza ${r.name}`} />
    </>
  );
}
