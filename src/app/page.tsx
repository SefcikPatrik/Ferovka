import ReportGrid from "@/components/ReportGrid";
import ThemeToggle from "@/components/ThemeToggle";
import { formatNum, reports, totals } from "@/lib/reports";

const MONTHS = ["januára", "februára", "marca", "apríla", "mája", "júna", "júla", "augusta", "septembra", "októbra", "novembra", "decembra"];
const longDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${MONTHS[m - 1]} ${y}`;
};

/** Where a price sits against the fair price: left = cheaper than the market, right = dearer (±20 %). */
function Scale() {
  const pos = (pct: number) => `${50 + (pct / 20) * 50}%`;
  return (
    <div className="scale" role="img" aria-label="Cena 24 690 € je o 11 % nižšia ako férová cena 27 730 €">
      <div className="track" />
      <div className="zone" style={{ left: pos(-7), width: `${(14 / 40) * 100}%` }} />
      {[-20, -10, 0, 10, 20].map((p) => (
        <div key={p} className="tick" style={{ left: pos(p) }} />
      ))}
      <span className="mark" style={{ left: pos(-20) }}>−20 %</span>
      <span className="mark" style={{ left: pos(0) }}>férová cena</span>
      <span className="mark" style={{ left: pos(20) }}>+20 %</span>
      <div className="dotm" style={{ left: pos(-11) }} />
      <span className="mark price" style={{ left: pos(-11) }}>24 690 €</span>
    </div>
  );
}

export default function Home() {
  const t = totals();
  return (
    <>
      <div className="wrap">
        <div className="dateline">
          <span>{longDate(t.updated)}</span>
          <nav>
            <a href="#analyzy">Analýzy</a>
            <a href="#metoda" className="hide-sm">
              Ako počítame
            </a>
            <ThemeToggle />
          </nav>
        </div>
        <header className="masthead">
          <h1 className="wordmark">
            Férovka<span className="dot">.</span>
          </h1>
          <p className="claim">
            <b>Cenník ojazdených áut zo slovenského trhu.</b> Každý inzerát porovnaný s tým, koľko by auto naozaj malo stáť.
          </p>
        </header>

        <div className="lead">
          <h1>
            Lacné auto nie je vždy výhodné. My ti povieme, <em>ktoré je</em>.
          </h1>
          <div>
            <p>
              Prejdeme inzeráty na bazoši aj autobazar.eu, z celého trhu vypočítame férovú cenu každého auta a najlepšie
              ponuky si prečítame celé – vrátane tých, ktoré sú podozrivo lacné.
            </p>
            <div className="figures">
              <div>
                <span className="v">{formatNum(t.ads)}</span>
                <span className="l">preverených inzerátov</span>
              </div>
              <div>
                <span className="v">{t.analyses}</span>
                <span className="l">modelov</span>
              </div>
              <div>
                <span className="v">2</span>
                <span className="l">portály</span>
              </div>
            </div>
          </div>
        </div>

        <section className="sec" id="analyzy">
          <ReportGrid reports={reports} />
        </section>

        <section className="sec" id="metoda">
          <div className="sec-title">
            <h2>Ako počítame férovú cenu</h2>
            <p>Žiadne odhady od oka.</p>
          </div>
          <div className="method">
            <div>
              <div className="n">1</div>
              <h3>Celý trh, nie pár inzerátov</h3>
              <p>Bazoš aj autobazar.eu. To isté auto ponúkané na oboch portáloch započítame raz.</p>
            </div>
            <div>
              <div className="n">2</div>
              <h3>Model naučený na skutočných cenách</h3>
              <p>Vek, nájazd, motor, prevodovka, pohon, pôvod auta a typ predajcu – každý vplyv vyčíslený v percentách.</p>
            </div>
            <div>
              <div className="n">3</div>
              <h3>Najlepšie ponuky čítame celé</h3>
              <p>Odporúčame len autá, ktoré obstoja aj po prečítaní inzerátu. Zvyšok nájdeš v rebríčku s filtrami.</p>
            </div>
          </div>

          <div className="example">
            <div>
              <span className="kicker">Príklad</span>
              <h3>Cupra Formentor 1.5 TSI DSG, 2024, 24 000 km</h3>
              <p>Férová cena podľa trhu je 27 730 €. Predajca pýta 24 690 € – o 11 % menej, čo je nad bežným rozptylom cien.</p>
            </div>
            <div>
              <Scale />
              <div className="verdict">
                <span>
                  <b>24 690 €</b>cena v inzeráte
                </span>
                <span>
                  <b>27 730 €</b>férová cena
                </span>
                <span className="good">
                  <b>−11 %</b>pod trhom
                </span>
              </div>
            </div>
          </div>

          <ul className="dropped">
            <li>
              <b>Podvody</b>Predajca s viacerými podozrivo lacnými autami bez popisu.
            </li>
            <li>
              <b>Havarované autá</b>„Pojazdné, motor OK“ a autá na diely nepočítame.
            </li>
            <li>
              <b>Stočené km</b>Nájazd, ktorý nesedí s vekom auta.
            </li>
            <li>
              <b>Čipované autá</b>Lacné takmer nové auto so Stage 1 a stratenou zárukou.
            </li>
          </ul>
        </section>
      </div>

      <footer className="site">
        <div className="wrap">
          <p>
            Férovka je nezávislý prehľad. Údaje pochádzajú z verejných inzerátov a sú spracované automaticky, preto môžu
            obsahovať chyby. Pred kúpou si auto vždy over osobne a podľa VIN.
          </p>
          <p>© {t.updated.slice(0, 4)} Férovka</p>
        </div>
      </footer>
    </>
  );
}
