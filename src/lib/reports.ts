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

export const reports = data as Report[];

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
