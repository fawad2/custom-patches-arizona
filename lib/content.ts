// Page content lives in content/: one HTML file per page (content/pages/<slug>.html), shared header and footer,
// and JSON data for the menus, the 3D rail, the quote form and each page's SEO fields (content/data/*.json).
// Edit those files to change the site; {{EMAIL}} is replaced with the contact address.
import { existsSync, readFileSync, readdirSync } from "node:fs";
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

type Photo = { src: string; file: string; alt: string };
type PhotoSet = { heading: string; photos: Photo[] };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const hasPhoto = (p: Photo) => existsSync(path.join(process.cwd(), "public", "photos", `${p.file}.webp`));
const tile = (p: Photo) => `<figure><img src="/photos/${p.file}.webp" alt="${esc(p.alt)}" loading="lazy" decoding="async" width="600" height="600"/></figure>`;

/** A "patches we've made" photo section for a page, or "" when it has no photos (see content/data/photos.json). */
export function galleryHtml(slug: string): string {
  const all = json<Record<string, PhotoSet>>("data/photos.json");
  let heading: string;
  let photos: Photo[];
  if (slug === "home" || slug === "custom-patches") {
    heading = "Real patches from our workshop";
    photos = Object.values(all).map((g) => g.photos.find(hasPhoto)).filter((p): p is Photo => !!p).slice(0, 8);
  } else {
    const set = all[slug];
    if (!set) return "";
    heading = set.heading;
    photos = set.photos.filter(hasPhoto);
  }
  if (!photos.length) return "";
  return `<section class="section section--white photo-sec"><div class="wrap"><div class="sec-head"><span class="eyebrow">Our work</span><h2 class="h2">${esc(heading)}</h2></div><div class="photo-grid photo-grid--${Math.min(photos.length, 4)}">${photos.map(tile).join("")}</div></div></section>`;
}

/** A page's HTML with its photo section placed after the first block (the hero). */
export function pageWithGallery(slug: string): string {
  const html = pageHtml(slug);
  const g = galleryHtml(slug);
  if (!g) return html;
  const marker = slug === "home" ? '<section class="section">' : "</section>";
  const at = html.indexOf(marker);
  if (at < 0) return html + g;
  const cut = slug === "home" ? at : at + marker.length;
  return html.slice(0, cut) + g + html.slice(cut);
}
