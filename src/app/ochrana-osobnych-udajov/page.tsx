import type { Metadata } from "next";
import SimpleHeader, { SimpleFooter } from "@/components/SimpleHeader";

export const metadata: Metadata = { title: "Ochrana osobných údajov", robots: { index: false } };

// Template – the final wording must be filled in (and checked) by the operator.
export default function Privacy() {
  return (
    <>
      <SimpleHeader />
      <main className="legal">
        <h1>Ochrana osobných údajov</h1>
        <p className="todo">Šablóna na doplnenie. Údaje v [hranatých zátvorkách] doplní prevádzkovateľ.</p>

        <h2>1. Prevádzkovateľ</h2>
        <p>[Obchodné meno], [sídlo], IČO [•]. Kontakt vo veciach osobných údajov: [e-mail].</p>

        <h2>2. Aké údaje spracúvame</h2>
        <ul>
          <li>Odkaz na inzerát, ktorý vložíš, a výsledok jeho hodnotenia.</li>
          <li>Správy z formulára „Chýba ti model alebo niečo nesedí?“ a e-mail, ak ho dobrovoľne uvedieš.</li>
          <li>Analytické cookies Google Analytics, iba s tvojím súhlasom.</li>
          <li>[Pri platbe: údaje potrebné na vystavenie dokladu; platobné údaje spracúva platobná brána.]</li>
        </ul>
        <p>
          Osobné údaje predajcov z inzerátov (mená, telefónne čísla) neukladáme. Hodnotíme len verejný obsah inzerátu, ktorý vložíš
          ty.
        </p>

        <h2>3. Účel a právny základ</h2>
        <p>[Poskytnutie služby (zmluva), odpoveď na správu (oprávnený záujem), analytika (súhlas).]</p>

        <h2>4. Ako dlho údaje uchovávame</h2>
        <p>[Lehoty uchovávania.]</p>

        <h2>5. Príjemcovia</h2>
        <p>Hosting Vercel (EÚ), Google Analytics (so súhlasom), [platobná brána].</p>

        <h2>6. Tvoje práva</h2>
        <p>
          Máš právo na prístup k údajom, ich opravu, vymazanie, obmedzenie spracúvania, prenosnosť, námietku a odvolanie súhlasu.
          Sťažnosť môžeš podať na Úrade na ochranu osobných údajov SR.
        </p>
      </main>
      <SimpleFooter />
    </>
  );
}
