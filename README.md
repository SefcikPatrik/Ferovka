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
