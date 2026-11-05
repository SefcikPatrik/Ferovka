import fs from "node:fs";
import path from "node:path";

const configPath = path.resolve(import.meta.dirname, "../analytics.config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
// An explicit environment value overrides the checked-in, public site ID.
// An empty value intentionally disables collection.
const id = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? config.measurementId ?? "").trim();
if (id && !/^G-[A-Z0-9]{6,20}$/.test(id)) {
  throw new Error("NEXT_PUBLIC_GA_MEASUREMENT_ID musí byť platné GA4 ID v tvare G-XXXXXXXXXX.");
}
const target = path.resolve(import.meta.dirname, "../public/analytics-config.js");
fs.writeFileSync(target, `/* Generated at build time; the measurement ID is public. */\nwindow.FEROVKA_ANALYTICS_CONFIG = ${JSON.stringify({ measurementId: id })};\n`);
console.log(id ? "Analytics configuration ready." : "Analytics disabled: NEXT_PUBLIC_GA_MEASUREMENT_ID is not set.");
