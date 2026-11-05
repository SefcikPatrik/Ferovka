# Férovka – web s analýzami ojazdených áut

Statický Next.js web, ktorý zobrazuje HTML analýzy z `bazos-mcp` (`../data/reports/*.html`).
Nemá žiadny server ani databázu, takže beží zadarmo na Verceli (Hobby).

## Lokálne

```bash
npm install
npm run dev      # skopíruje reporty a spustí http://localhost:3000
```

## Pridanie / aktualizácia analýzy

1. Vygeneruj nový report do `../data/reports/` (napr. `bmw-x3-analyza.html`).
2. `npm run sync` – skopíruje reporty do `public/reports/` a obnoví katalóg `src/data/reports.json`
   (názov, dátum, počet inzerátov, medián, presnosť sa vyčítajú priamo z HTML).
3. `git add -A && git commit -m "Nové analýzy" && git push` – Vercel web sám prebuduje do ~1 minúty.

Adresa analýzy je názov súboru bez `-analyza.html`: `bmw-x3-analyza.html` → `/analyza/bmw-x3/`.

## Prvé nasadenie na Vercel

1. Vytvor repozitár na GitHube a pushni doň obsah tohto priečinka `web/` (alebo celý `bazos-mcp`).
2. Na vercel.com → **Add New… → Project** → vyber repozitár.
   Ak je v repozitári celý `bazos-mcp`, nastav **Root Directory** na `web`.
3. Framework sa rozpozná sám (Next.js), stačí **Deploy**.

Vlastná doména (napr. `ferovka.sk`) sa pridá v **Settings → Domains**, platíš len za doménu.

## Návštevnosť a kliknutia

Web má nastavené Google Analytics 4 s verejným meracím ID `G-C01RV0ZJ38`
v `analytics.config.json`. Každý build z neho vytvorí konfiguráciu aj pre samostatné HTML reporty.
Premenná prostredia `NEXT_PUBLIC_GA_MEASUREMENT_ID` má prednosť pred súborom;
jej explicitne prázdna hodnota meranie vypne. Bez platného meracieho ID je meranie vypnuté.
Návštevníkovi sa po nastavení ID zobrazí voľba analytických cookies; Google sa načíta
a návštevy aj udalosti sa začnú odosielať až po povolení. Kliknutia pred povolením
sa nezbierajú ani spätne neposielajú. Voľba sa dá zmeniť tlačidlom „Nastavenia merania“.

### Aktivácia

1. V Google Analytics vytvor webový dátový stream pre doménu Férovky a skopíruj jeho
   **meracie ID** `G-XXXXXXXXXX` (nie číselné ID vlastníctva).
2. V nastaveniach streamu vypni **Enhanced measurement / Rozšírené meranie**.
   Web posiela vlastné `page_view` a kliknutia; vypnutím automatického merania sa zobrazenia
   pri navigácii Next.js nebudú rátať dvakrát a vyhľadávanie nebude zbierať Google automaticky.
3. ID je už uložené v `analytics.config.json`; stačí nasadiť túto verziu webu.
   Ak chceš iné ID pre konkrétne prostredie, vo Verceli nastav **Settings → Environment Variables →
   NEXT_PUBLIC_GA_MEASUREMENT_ID** a sprav nové nasadenie. ID je verejné, nie je to heslo ani API secret.
4. `npm run build` vytvorí `public/analytics-config.js`; `npm run sync` doplní spoločný
   skript do všetkých HTML reportov. Existujúce `dev` spúšťa oba prípravné kroky.
   Samotné meranie je aktívne iba na HTTPS.

### Čo sa meria

| Udalosť | Význam | Parametre |
| --- | --- | --- |
| `page_view` | Zobrazenie stránky / analýzy; iframe neposiela ďalšie zobrazenie | `page_path`, `report_slug` |
| `analysis_open` | Kliknutie na analýzu | `report_slug`, `placement` |
| `listing_click` | Otvorenie konkrétneho inzerátu | `report_slug`, `portal`, `listing_id`, `placement` |
| `report_fullscreen` | Otvorenie samostatného HTML reportu | `report_slug` |
| `filter_change` | Zmena filtra v katalógu alebo analýze | `report_slug`, `filter_name`, `filter_value` |
| `filters_reset` | Zrušenie filtrov | `report_slug` |
| `ranking_sort` | Zoradenie tabuľky | `report_slug`, `column` |
| `navigation_click` | Prechod na sekciu úvodnej stránky | `section` |
| `theme_change` | Prepnutie svetlého / tmavého vzhľadu | `theme` |

`listing_click.placement` rozlišuje `recommendation`, `ranking`, `chart` a `report_link`.
Dotyk grafu sa ráta až pri skutočnom otvorení inzerátu, nie pri prvom zobrazení tooltipu.
Kliknutia v iframe sa posielajú cez rodičovskú stránku. Pri otvorení reportu samostatne
funguje ten istý skript a tá istá uložená voľba súhlasu.

Text vyhľadávania sa neposiela (`used` / `cleared`), neposielajú sa VIN, mená predajcov,
telefóny ani celý obsah inzerátov. Vlastné udalosti používajú URL stránky bez query a hash.
Odmietnutie alebo blokovanie analytiky znamená, že daná návšteva nebude v štatistikách.

### Kde sú výsledky

V [Google Analytics](https://analytics.google.com/) vyber vlastníctvo Férovky:
**Reports → Realtime** na kontrolu živých udalostí; **Reports → Engagement → Pages and screens**
na návštevy stránok; **Explore → Free form** na vlastný prehľad kliknutí.
Pre prehľad podľa auta a umiestnenia zaregistruj v **Admin → Custom definitions** vlastné
dimenzie s rozsahom Event: `report_slug`, `portal`, `listing_id`, `placement`, `filter_name`,
`filter_value`, `column`, `section`, `theme`. Spracované prehľady môžu mať oneskorenie.
Počítadlo na vlastnom počítači v localStorage by návštevy ostatných ľudí nespočítalo;
celkové štatistiky ukladá účet GA4 a zobrazujú sa iba jeho oprávneným používateľom.

Kontroly: `npm run test:analytics` a `npx tsc --noEmit`.
Dokumentácia: [GA4 udalosti](https://developers.google.com/analytics/devguides/collection/ga4/events),
[meranie SPA](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications).
