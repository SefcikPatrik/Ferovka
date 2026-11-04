import imageData from "@/data/images.json";
import data from "@/data/reports.json";

export type Report = {
  slug: string;
  file: string;
  name: string;
  brand: string;
  model: string;
  kind: "model" | "comparison";
  date: string;
  summary: string;
  ads: number | null;
  median: string | null;
  r2: string | null;
};

export type Photo = { src: string; author: string; license: string; source: string; file?: string };

export const reports = data as Report[];
const images = imageData as Record<string, Partial<Photo>>;

/** The model's photo; a comparison gets the photos of the models it compares. */
export const photosFor = (r: Report): Photo[] =>
  (r.kind === "model"
    ? [images[r.slug]]
    : reports
        .filter((m) => m.kind === "model" && r.name.toLowerCase().includes(m.model.split(" ")[0].toLowerCase()))
        .map((m) => images[m.slug])
  ).filter((p): p is Photo => Boolean(p?.src));

export const allPhotos = () =>
  reports.filter((r) => r.kind === "model").flatMap((r) => photosFor(r).map((p) => ({ ...p, name: r.name })));

export const getReport = (slug: string) => reports.find((r) => r.slug === slug);

export const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${m}. ${y}`;
};

export const formatNum = (n: number) => n.toLocaleString("sk-SK").replace(/ /g, " ");

export const totals = () => {
  const models = reports.filter((r) => r.kind === "model");
  return {
    analyses: models.length,
    ads: models.reduce((s, r) => s + (r.ads ?? 0), 0),
    updated: reports.map((r) => r.date).sort().at(-1) ?? "",
  };
};
