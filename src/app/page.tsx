import Link from "next/link";
import Logo from "@/components/Logo";
import { CountUp } from "@/components/Motion";
import ReportGrid from "@/components/ReportGrid";
import ThemeToggle from "@/components/ThemeToggle";
import { allPhotos, formatDate, photosFor, reports, totals } from "@/lib/reports";
import FeedbackForm from "@/components/FeedbackForm";

function Gauge() {
  // −20 % … +20 % against the fair price; the needle sweeps to +11 % (cheaper than the market)
  const arc = (from: number, to: number) => {
    const p = (a: number) => {
      const r = ((a - 90) * Math.PI) / 180;
      return `${150 + Math.cos(r) * 110} ${120 + Math.sin(r) * 110}`;
    };
    return `M ${p(from)} A 110 110 0 0 1 ${p(to)}`;
  };
  return (
    <svg className="gauge" viewBox="0 0 300 135" width="100%" role="img" aria-label="Cena je 11 % pod férovou cenou">
      <path d={arc(-90, -31)} stroke="var(--hot)" strokeWidth="14" fill="none" strokeLinecap="round" opacity=".85" />
      <path d={arc(-27, 27)} stroke="var(--surface-2)" strokeWidth="14" fill="none" />
      <path className="gauge-good" d={arc(31, 90)} stroke="var(--brand)" strokeWidth="14" fill="none" strokeLinecap="round" />
      <g className="needle" style={{ transformOrigin: "150px 120px" }}>
        <line x1="150" y1="120" x2="150" y2="28" stroke="var(--text)" strokeWidth="4" strokeLinecap="round" />
      </g>
      <circle cx="150" cy="120" r="8" fill="var(--text)" />
    </svg>
  );
}

export default function Home() {
  const t = totals();
  const heroReport = reports.find((r) => r.slug === "cupra-formentor") ?? reports.find((r) => r.kind === "model");
  const heroPhoto = heroReport ? photosFor(heroReport)[0] : undefined;
  const photos = allPhotos();
  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <Logo />
          <nav className="nav">
            <a href="#analyzy">Analýzy</a>
            <a href="#ako-to-funguje" className="hide-sm">
              Ako to funguje
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <section className="hero-photo">
        {heroPhoto && <img className="hero-bg" src={heroPhoto.src} alt="" />}
        <div className="hero-fx" aria-hidden="true">
          <span className="hero-grid" />
          <span className="hero-sweep" />
        </div>
        <div className="wrap hero">
          <div className="hero-text">
            <span className="eyebrow">● Aktualizované {formatDate(t.updated)}</span>
            <h1>
              Vieš, koľko má to auto <em>naozaj</em> stáť?
            </h1>
            <p className="sub">
              Férovka porovná každý inzerát s celým slovenským trhom a ukáže, ktoré ojazdenky sú pod cenou – a ktoré sú
              podozrivo lacné.
            </p>
            <div className="cta">
              <a className="btn primary" href="#analyzy">
                Pozrieť analýzy →
              </a>
              <a className="btn ghost" href="#ako-to-funguje">
                Ako počítame férovú cenu
              </a>
            </div>
            <div className="stats">
              <div className="stat">
                <div className="v">
                  <CountUp value={t.ads} />
                </div>
                <div className="l">preverených inzerátov</div>
              </div>
              <div className="stat">
                <div className="v">
                  <CountUp value={t.analyses} duration={900} />
                </div>
                <div className="l">modelov áut</div>
              </div>
              <div className="stat">
                <div className="v">2</div>
                <div className="l">portály: bazoš + autobazar.eu</div>
              </div>
            </div>
          </div>

          <aside className="sample glass" aria-label="Príklad ohodnotenia inzerátu">
            <span className="tag">Príklad z analýzy</span>
            <h3>Cupra Formentor 1.5 TSI DSG</h3>
            <div className="facts">2024 · 24 000 km · záruka do 6/2029</div>
            <Gauge />
            <div className="scale">
              <span>predražené</span>
              <span>férová cena</span>
              <span>pod trhom</span>
            </div>
            <div className="row">
              <div>
                <div className="l">Cena</div>
                <div className="v">24 690 €</div>
              </div>
              <div>
                <div className="l">Férová</div>
                <div className="v">27 730 €</div>
              </div>
              <div>
                <div className="l">Pod trhom</div>
                <div className="v good">+11 %</div>
              </div>
            </div>
            <div className="note">Inzerát sme aj prečítali: dovoz, bez popisu výbavy → pred kúpou over históriu cez VIN.</div>
          </aside>
        </div>
      </section>

      <main className="wrap">
        <section id="analyzy">
          <ReportGrid reports={reports} />
        </section>

        <section id="ako-to-funguje">
          <div className="section-head" data-reveal>
            <div>
              <h2>Ako to funguje</h2>
              <p>Žiadne odhady od oka. Férovú cenu počíta model naučený na stovkách skutočných inzerátov.</p>
            </div>
          </div>
          <div className="steps">
            <div className="step" data-reveal>
              <div className="n">1</div>
              <h3>Zozbierame celý trh</h3>
              <p>Prejdeme inzeráty na bazoši aj autobazar.eu. To isté auto ponúkané na oboch portáloch započítame len raz.</p>
            </div>
            <div className="step" data-reveal style={{ transitionDelay: ".08s" }}>
              <div className="n">2</div>
              <h3>Vypočítame férovú cenu</h3>
              <p>
                Model zohľadní vek, nájazd, motor, prevodovku, pohon, pôvod auta aj typ predajcu – a povie, koľko by auto malo
                stáť.
              </p>
            </div>
            <div className="step" data-reveal style={{ transitionDelay: ".16s" }}>
              <div className="n">3</div>
              <h3>Prečítame najlepšie ponuky</h3>
              <p>Najvýhodnejšie inzeráty prejdeme celé a odporučíme len tie, ktoré obstoja. Zvyšok nájdeš v rebríčku s filtrami.</p>
            </div>
          </div>
          <div className="flags">
            {[
              ["Podvody", "Predajca s viacerými podozrivo lacnými autami bez popisu."],
              ["Havarované autá", "„Pojazdné, motor OK“ a autá na diely vyradíme z porovnania."],
              ["Stočené km", "Nájazd, ktorý nesedí s vekom auta – nahor aj nadol."],
              ["Čipované autá", "Lacné takmer nové auto so Stage 1 a stratenou zárukou."],
            ].map(([b, t], i) => (
              <div className="flag" key={b} data-reveal style={{ transitionDelay: `${i * 0.06}s` }}>
                <b>{b}</b>
                {t}
              </div>
            ))}
          </div>
        </section>
      </main>

      <FeedbackForm />

      <footer className="site">
        <div className="wrap">
          <p>
            Férovka je nezávislý prehľad. Údaje pochádzajú z verejných inzerátov a sú vyťažené automaticky, preto môžu obsahovať
            chyby. Pred kúpou si auto vždy over osobne a podľa VIN.
          </p>
          <p>
            <Link href="#analyzy">Analýzy</Link> · © {t.updated.slice(0, 4)} Férovka
          </p>
        </div>
        {photos.length > 0 && (
          <div className="wrap credits">
            Fotografie z Wikimedia Commons:{" "}
            {photos.map((p, i) => (
              <span key={p.src}>
                {i > 0 && " · "}
                {p.name} –{" "}
                <a href={p.source} target="_blank" rel="noopener">
                  {p.author}
                </a>{" "}
                ({p.license})
              </span>
            ))}
          </div>
        )}
      </footer>
    </>
  );
}
