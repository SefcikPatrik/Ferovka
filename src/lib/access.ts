import access from "@/data/access.json";

/** Analyses anyone can open; the rest need a (free) account – see api/report.js and scripts/lock-reports.mjs. */
export const FREE_SLUGS: readonly string[] = access.free;
export const isFree = (slug: string) => FREE_SLUGS.includes(slug);
