// Page content lives in content/: one HTML file per page (content/pages/<slug>.html), shared header and footer,
// and JSON data for the menus, the 3D rail, the quote form and each page's SEO fields (content/data/*.json).
// Edit those files to change the site; {{EMAIL}} is replaced with the contact address.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { CONTACT_EMAIL } from "./site";

const DIR = path.join(process.cwd(), "content");
const cache = new Map<string, string>();

function read(rel: string): string {
  let v = cache.get(rel);
  if (v === undefined) {
    v = readFileSync(path.join(DIR, rel), "utf8").replaceAll("{{EMAIL}}", CONTACT_EMAIL);
    cache.set(rel, v);
  }
  return v;
}
const json = <T,>(rel: string): T => JSON.parse(read(rel)) as T;

export type PageMeta = { title: string; description: string; canonical: string; robots: string; ogImage: string; jsonld: unknown[] };

export const pageHtml = (slug: string) => read(`pages/${slug}.html`);
export const headerHtml = () => read("header.html");
export const footerHtml = () => read("footer.html");
export const svgDefs = () => read("svg-defs.html");
export const allMeta = () => json<Record<string, PageMeta>>("data/meta.json");
export const navGroups = () => json<{ key: string; title: string; items: { slug: string; name: string }[] }[]>("data/nav.json");
export const railData = () => json<{ items: import("./patch-rail").RailItem[]; start: number }>("data/rail.json");

/** Every page under /<slug>/ (everything except the home page and the 404 page). */
export function slugs(): string[] {
  return readdirSync(path.join(DIR, "pages"))
    .filter((f) => f.endsWith(".html"))
    .map((f) => f.slice(0, -5))
    .filter((s) => s !== "home" && s !== "not-found");
}
