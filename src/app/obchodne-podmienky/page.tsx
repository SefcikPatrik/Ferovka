import type { Metadata } from "next";
import SimpleHeader, { SimpleFooter } from "@/components/SimpleHeader";

export const metadata: Metadata = { title: "Obchodné podmienky", robots: { index: false } };

// Template – the operator's details and the final wording must be filled in (and checked by a lawyer) before payments start.
export default function Terms() {
  return (
    <>
      <SimpleHeader />
      <main className="legal">
        <h1>Obchodné podmienky</h1>
        <p className="todo">Šablóna na doplnenie. Údaje v [hranatých zátvorkách] doplní prevádzkovateľ pred spustením platených analýz.</p>

        <h2>1. Prevádzkovateľ</h2>
        <p>[Obchodné meno], [sídlo], IČO [•], zapísaný v [register]. Kontakt: [e-mail].</p>

        <h2>2. Predmet služby</h2>
        <p>
          OverAuto hodnotí verejný inzerát ojazdeného auta, ktorý vloží používateľ: porovnáva cenu s trhom, upozorňuje na varovné
          signály v inzeráte a navrhuje otázky pre predajcu a plán vyjednávania.
        </p>
        <p>
          <strong>Hodnotíme inzerát, nie samotné auto.</strong> Výsledok nenahrádza obhliadku v servise ani kontrolu histórie
          vozidla podľa VIN.
        </p>

        <h2>3. Cena a platba</h2>
        <ul>
          <li>Analýzy 5 základných modelov (Octavia, Golf, Fabia, Passat a Superb): zadarmo.</li>
          <li>Prístup ku všetkým analýzam modelov na 30 dní: 5 € (jednorazovo, automaticky sa neobnovuje).</li>
        </ul>
        <p>Platby spracúva [platobná brána]. [Podmienky vrátenia peňazí a odstúpenia od zmluvy pri digitálnom obsahu.]</p>

        <h2>4. Zodpovednosť</h2>
        <p>[Rozsah zodpovednosti prevádzkovateľa za správnosť hodnotenia a dostupnosť služby.]</p>

        <h2>5. Reklamácie</h2>
        <p>[Postup a lehoty reklamácie.]</p>

        <h2>6. Záverečné ustanovenia</h2>
        <p>Tieto podmienky platia od [dátum].</p>
      </main>
      <SimpleFooter />
    </>
  );
}
