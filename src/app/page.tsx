import Link from "next/link";
import Logo from "@/components/Logo";
import ModelPicker from "@/components/ModelPicker";
import ReportGrid from "@/components/ReportGrid";
import AccountLink from "@/components/AccountLink";
import FeedbackForm from "@/components/FeedbackForm";
import { FREE_SLUGS, isFree } from "@/lib/access";
import { allPhotos, getReport, reports, sample as homeSample } from "@/lib/reports";

const Warn = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M10 2l8.5 15h-17z" fill="none" stroke="#C2410C" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M10 8v4M10 14.5v.5" stroke="#C2410C" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const Ok = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="10" cy="10" r="8" fill="none" stroke="#1E4ED8" strokeWidth="1.8" />
    <path d="M6.5 10.2l2.4 2.4 4.6-5" fill="none" stroke="#1E4ED8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Home() {
  const photos = allPhotos();
  const options = reports
    .filter((r) => r.kind !== "comparison")
    .map((r) => ({ slug: r.slug, name: r.name, free: isFree(r.slug) }))
    .sort((a, b) => a.name.localeCompare(b.name, "sk"));
  // the hero card shows a real free analysis (numbers of premium models are not in the public catalogue)
  const sample = getReport(homeSample.slug);
  return (
    <>
      <header className="oa-header">
        <div className="wrap">
          <Logo href="#top" />
          <nav className="oa-nav" aria-label="Hlavná navigácia">
            <a href="#ako">Ako to funguje</a>
            <a href="#co">Čo dostaneš</a>
            <a href="#cennik">Cenník</a>
            <a href="#start" className="nav-cta">
              Vybrať model
            </a>
            <AccountLink />
          </nav>
        </div>
      </header>

      <main>
        <section id="top" className="wrap oa-hero">
          <div className="oa-hero-text">
            <p className="eyebrow-plain">Analýzy trhu ojazdených áut</p>
            <h1>Než zavoláš predajcovi, pozri sa na trh.</h1>
            <p className="lede">
              Vyber model a uvidíš férovú cenu, najvýhodnejšie ponuky aj tie podozrivo lacné – z celého slovenského trhu.
            </p>
            <ModelPicker options={options} />
          </div>

          <div className="oa-hero-card">
            <article className="verdict" aria-label="Ukážka analýzy">
              <div className="top">
                <span className="label">Ukážka analýzy</span>
                <span className="pill">Zadarmo</span>
              </div>
              <div>
                <p className="car">{sample?.name}</p>
                <p className="facts">
                  {sample?.ads
                    ? `${sample.ads.toLocaleString("sk-SK")} áut z bazoša, autobazar.eu a bazar.sk`
                    : "Inzeráty z bazoša, autobazar.eu a bazar.sk"}
                </p>
              </div>
              <div className="box">
                <span className="k">Medián ceny</span>
                <span className="v">{sample?.median ?? "–"}</span>
                <span className="f">
                  Férovú cenu počíta model, ktorý vysvetlí <strong>{sample?.r2 ?? "–"}</strong> rozdielov v cenách.
                </span>
              </div>
              {homeSample.picks.length > 0 ? (
                <div className="picks">
                  <span className="picks-h">Odporúčané ponuky</span>
                  {homeSample.picks.map((p) => (
                    <a key={p.url} className="pick" href={p.url} target="_blank" rel="noopener" data-analytics-action="sample_pick">
                      <span className="pick-facts">{p.facts}</span>
                      <span className="pick-row">
                        <strong>{p.price}</strong>
                        <span className="pick-fair">férová {p.fair}</span>
                        {p.discount && <span className="pick-disc">{p.discount.replace(/^\+/, "").replace(".", ",")} pod trhom</span>}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="signals">
                  <div>
                    <Ok />
                    <span>Odporúčané ponuky, ktoré sme prečítali celé.</span>
                  </div>
                  <div>
                    <Warn />
                    <span>Podozrivo lacné autá a nesediace kilometre.</span>
                  </div>
                </div>
              )}
              <p className="small">
                <Link href={`/analyza/${homeSample.slug}/`}>Otvoriť celú analýzu {sample?.name} →</Link>
              </p>
            </article>
          </div>
        </section>

        <section aria-label="Čoho sa kupujúci boja" className="oa-dark">
          <div className="wrap oa-fears">
            <div>
              <span className="t">Preplatíš?</span>
              <span className="d">Pri každom inzeráte uvidíš, koľko by auto malo stáť podľa celého trhu.</span>
            </div>
            <div>
              <span className="t">Niečo ti unikne?</span>
              <span className="d">Upozorníme na podozrivo lacné ponuky, nesediace kilometre aj havarované autá.</span>
            </div>
            <div>
              <span className="t">Nevieš, koľko zjednať?</span>
              <span className="d">Uvidíš, o koľko je ponuka nad alebo pod férovou cenou – to je tvoj argument.</span>
            </div>
          </div>
        </section>

        <section id="ako" className="wrap oa-section">
          <h2>Ako to funguje</h2>
          <ol className="oa-steps">
            <li>
              <span className="n">1</span>
              <span className="t">Vyber model</span>
              <span className="d">Máme analýzy {options.length} modelov zo slovenského trhu.</span>
            </li>
            <li>
              <span className="n">2</span>
              <span className="t">Porovnáme celý trh</span>
              <span className="d">Prejdeme inzeráty na bazoši, autobazar.eu a bazar.sk a vypočítame férovú cenu.</span>
            </li>
            <li>
              <span className="n">3</span>
              <span className="t">Vyberieš si auto</span>
              <span className="d">Odporúčané ponuky, varovné signály a rebríček všetkých inzerátov.</span>
            </li>
          </ol>
        </section>

        <section id="co" className="wrap oa-section oa-what">
          <div className="intro">
            <h2>Čo nájdeš v analýze modelu</h2>
            <p>Všetko, čo potrebuješ pred prvým telefonátom, na jednej stránke.</p>
          </div>
          <ul>
            {[
              ["Férová cena", "Podľa veku, nájazdu, motora, prevodovky a výbavy."],
              ["Odporúčané ponuky", "Najvýhodnejšie inzeráty, ktoré sme prečítali celé."],
              ["Varovné signály", "Podozrivo lacné autá, stočené kilometre, čipované motory."],
              ["Porovnanie motorov", "Ktoré motorizácie sa oplatia a ktorým sa vyhnúť."],
              ["Kompletný rebríček", "Všetky inzeráty s filtrami podľa roku, ceny, nájazdu a paliva."],
              ["Aktuálne ceny", "Analýzy priebežne obnovujeme s novými inzerátmi."],
            ].map(([t, d]) => (
              <li key={t}>
                <strong>{t}</strong>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="cennik" className="wrap oa-section">
          <h2>Cenník</h2>
          <div className="oa-prices">
            <div className="price-card">
              <span className="name">Zadarmo</span>
              <span className="amount">0 €</span>
              <span className="d">
                {FREE_SLUGS.length} modelov rôznych značiek – od Dacie a Toyoty po BMW a Mercedes.
                Bez registrácie.
              </span>
              <a className="go" href="#analyzy">
                Pozrieť modely zadarmo
              </a>
            </div>
            <div className="price-card dark">
              <div className="head">
                <span className="name">Všetky modely</span>
              </div>
              <span className="amount">5 €</span>
              <span className="d">
                Pre ďalšie modely zaplatíš 5 € a na 30 dní máš odomknuté všetky analýzy. Jednorazovo, nič sa samo neobnovuje.
              </span>
              <Link className="go" href="/ucet/">
                Odomknúť všetky modely
              </Link>
            </div>
          </div>
        </section>

        <section aria-label="Čo nevieme" className="wrap oa-honest">
          <div className="in">
            <h2>Úprimne: čo nevieme</h2>
            <p>
              Hodnotíme inzeráty, nie samotné autá. Stočené kilometre ani skryté vady s istotou neodhalíme. Pred kúpou preto vždy
              odporúčame obhliadku v servise a kontrolu histórie podľa VIN.
            </p>
          </div>
        </section>

        <section id="analyzy" className="wrap">
          <ReportGrid reports={reports} />
        </section>

        <section className="oa-dark">
          <div className="wrap oa-final">
            <h2>Neprepláť ojazdenca.</h2>
            <p>{FREE_SLUGS.length} analýz rôznych značiek máš zadarmo, bez registrácie.</p>
            <a href="#analyzy">Pozrieť analýzy</a>
          </div>
        </section>
      </main>

      <FeedbackForm />

      <footer>
        <div className="wrap oa-footer">
          <span>© 2026 OverAuto · overauto.eu</span>
          <nav aria-label="Právne informácie">
            <Link href="/obchodne-podmienky/">Obchodné podmienky</Link>
            <Link href="/ochrana-osobnych-udajov/">Ochrana osobných údajov</Link>
            <a href="#poziadavka">Kontakt</a>
          </nav>
        </div>
        {photos.length > 0 && (
          <div className="wrap oa-credits">
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
