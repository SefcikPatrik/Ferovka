import ReportGrid from "@/components/ReportGrid";
import SiteHeader, { MainNav } from "@/components/SiteHeader";
import { formatDate, formatNum, reports, totals } from "@/lib/reports";

export default function Home() {
  const t = totals();
  return (
    <>
      <SiteHeader>
        <MainNav />
      </SiteHeader>

      <main className="wrap">
        <section className="intro">
          <h1>Zisti, či je ojazdené auto za férovú cenu</h1>
          <p>
            Porovnávame každý inzerát s celým slovenským trhom. Uvidíš, ktoré autá sú lacnejšie, ako by mali byť – a ktoré sú
            lacné podozrivo.
          </p>
          <ul className="facts">
            <li>
              <b>{formatNum(t.ads)}</b>
              <span>preverených inzerátov</span>
            </li>
            <li>
              <b>{t.analyses}</b>
              <span>modelov áut</span>
            </li>
            <li>
              <b>{formatDate(t.updated)}</b>
              <span>posledná aktualizácia</span>
            </li>
          </ul>
        </section>

        <section className="sec" id="analyzy">
          <ReportGrid reports={reports} />
        </section>

        <section className="sec" id="ako-to-funguje">
          <h2>Ako to funguje</h2>
          <p className="lead-in">Férovú cenu nepočítame od oka, ale z cien všetkých podobných áut na trhu.</p>
          <ol className="steps">
            <li>
              <h3>Zozbierame inzeráty</h3>
              <p>Z bazoša aj z autobazar.eu. Rovnaké auto ponúkané na oboch portáloch započítame len raz.</p>
            </li>
            <li>
              <h3>Vypočítame férovú cenu</h3>
              <p>Podľa veku, nájazdu, motora, prevodovky, pohonu, pôvodu auta a toho, kto ho predáva.</p>
            </li>
            <li>
              <h3>Prečítame najlepšie ponuky</h3>
              <p>Odporúčame len autá, ktoré obstoja aj po prečítaní celého inzerátu.</p>
            </li>
          </ol>

          <div className="example">
            <div>
              <h3>Príklad: Cupra Formentor 1.5 TSI, 2024, 24 000 km</h3>
              <p>Podobné autá sa na trhu predávajú okolo 27 730 €. Toto stojí 24 690 €, teda o 11 % menej.</p>
            </div>
            <div className="compare" role="img" aria-label="Cena v inzeráte 24 690 € oproti férovej cene 27 730 €">
              <div className="bar">
                <span>Férová cena</span>
                <span className="track">
                  <span className="fill" style={{ display: "block", width: "100%" }} />
                </span>
                <b>27 730 €</b>
              </div>
              <div className="bar mine">
                <span>Cena v inzeráte</span>
                <span className="track">
                  <span className="fill" style={{ display: "block", width: "89%" }} />
                </span>
                <b>24 690 €</b>
              </div>
              <div className="saving">Ušetríš približne 3 040 € (11 % pod trhom)</div>
            </div>
          </div>

          <ul className="checks">
            <li>
              <b>Podvody:</b> upozorníme na predajcu s viacerými podozrivo lacnými autami bez popisu.
            </li>
            <li>
              <b>Havarované autá</b> („pojazdné, motor OK“) do porovnania nezarátavame.
            </li>
            <li>
              <b>Stočené kilometre:</b> označíme nájazd, ktorý nesedí s vekom auta.
            </li>
            <li>
              <b>Čipované autá:</b> upozorníme na úpravu výkonu, pri ktorej sa stráca záruka.
            </li>
          </ul>
        </section>
      </main>

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
