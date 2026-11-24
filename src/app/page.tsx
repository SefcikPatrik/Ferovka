import Link from "next/link";
import Logo from "@/components/Logo";
import LinkForm from "@/components/LinkForm";
import ReportGrid from "@/components/ReportGrid";
import AccountLink from "@/components/AccountLink";
import FeedbackForm from "@/components/FeedbackForm";
import { FREE_SLUGS } from "@/lib/access";
import { allPhotos, reports } from "@/lib/reports";

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
  const items = reports.filter((r) => r.kind !== "comparison").map(({ slug, name, brand, model }) => ({ slug, name, brand, model }));
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
              Analyzovať inzerát
            </a>
            <AccountLink />
          </nav>
        </div>
      </header>

      <main>
        <section id="top" className="wrap oa-hero">
          <div className="oa-hero-text">
            <p className="eyebrow-plain">AI analýza inzerátov ojazdených áut</p>
            <h1>Než zavoláš predajcovi, ukáž inzerát nám.</h1>
            <p className="lede">Vlož odkaz na inzerát a do minúty zistíš, či je cena férová, čo v inzeráte chýba a koľko zjednať.</p>
            <LinkForm items={items} />
          </div>

          <div className="oa-hero-card">
            <article className="verdict" aria-label="Ukážka verdiktu">
              <div className="top">
                <span className="label">Ukážka verdiktu</span>
                <span className="pill">Hotové za 42 s</span>
              </div>
              <div>
                <p className="car">Škoda Octavia Combi 2.0 TDI</p>
                <p className="facts">2018 · 168 000 km · inzerovaná cena 14 900 €</p>
              </div>
              <div className="box">
                <span className="k">Verdikt</span>
                <span className="v">Cena ~9 % nad trhom</span>
                <span className="f">
                  Férová cena: <strong>13 500 – 13 900 €</strong>
                </span>
              </div>
              <div className="signals">
                <div>
                  <Warn />
                  <span>V inzeráte chýba servisná história.</span>
                </div>
                <div>
                  <Warn />
                  <span>Fotky neukazujú stav interiéru.</span>
                </div>
                <div>
                  <Ok />
                  <span>Výbava zodpovedá verzii Style.</span>
                </div>
              </div>
              <p className="small">Ilustračný príklad, nie skutočný inzerát.</p>
            </article>
          </div>
        </section>

        <section aria-label="Čoho sa kupujúci boja" className="oa-dark">
          <div className="wrap oa-fears">
            <div>
              <span className="t">Preplatíš?</span>
              <span className="d">Porovnáme cenu s podobnými autami na trhu a povieme ti, koľko je férových.</span>
            </div>
            <div>
              <span className="t">Niečo ti unikne?</span>
              <span className="d">AI si všimne, čo v inzeráte chýba alebo nesedí, a upozorní ťa na to.</span>
            </div>
            <div>
              <span className="t">Nevieš, koľko zjednať?</span>
              <span className="d">Dostaneš konkrétnu sumu a argumenty, s ktorými ideš za predajcom.</span>
            </div>
          </div>
        </section>

        <section id="ako" className="wrap oa-section">
          <h2>Ako to funguje</h2>
          <ol className="oa-steps">
            <li>
              <span className="n">1</span>
              <span className="t">Vlož odkaz</span>
              <span className="d">Skopíruj adresu inzerátu, ktorý ťa zaujal.</span>
            </li>
            <li>
              <span className="n">2</span>
              <span className="t">AI ho rozoberie</span>
              <span className="d">Cenu, popis, výbavu aj fotky porovná s trhom.</span>
            </li>
            <li>
              <span className="n">3</span>
              <span className="t">Dostaneš verdikt</span>
              <span className="d">Férovú cenu, varovné signály a čo sa pýtať predajcu.</span>
            </li>
          </ol>
        </section>

        <section id="co" className="wrap oa-section oa-what">
          <div className="intro">
            <h2>Čo dostaneš v plnej analýze</h2>
            <p>Všetko, čo potrebuješ pred prvým telefonátom, na jednej stránke.</p>
          </div>
          <ul>
            {[
              ["Porovnanie s trhom", "Kde sa cena nachádza oproti podobným autám."],
              ["Varovné signály", "Čo v inzeráte chýba, nesedí alebo je podozrivé."],
              ["Otázky pre predajcu", "Presne to, čo sa opýtať pri telefonáte."],
              ["Plán vyjednávania", "Odporúčaná suma a argumenty na zľavu."],
              ["Na čo pri obhliadke", "Typické slabiny daného modelu a motora."],
              ["PDF na stiahnutie", "Vezmeš si ho so sebou na obhliadku."],
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
                {FREE_SLUGS.length} najpredávanejších modelov: Octavia, Superb, Golf, Passat, Fabia, Tiguan, Kodiaq a ďalšie.
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

        <section aria-label="Čo AI nevie" className="wrap oa-honest">
          <div className="in">
            <h2>Úprimne: čo AI nevie</h2>
            <p>
              Hodnotíme inzerát, nie samotné auto. Stočené kilometre ani skryté vady s istotou neodhalíme. Pred kúpou preto vždy
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
            <p>Prvý verdikt máš zadarmo za menej ako minútu.</p>
            <a href="#start">Analyzovať inzerát</a>
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
