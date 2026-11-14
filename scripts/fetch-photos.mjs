// Runs before every build (see "prebuild" in package.json). Copies the product photos listed in
// content/data/photos.json from the workshop's media library into public/photos/ as WebP files, so the site
// serves its own copies. A photo that can't be fetched is skipped (its gallery tile simply doesn't appear).
// To use your own file instead, drop <file>.webp into public/photos/ and commit it: existing files are kept.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE = process.env.PHOTO_SOURCE || "https://teddypatches.com/wp-content/uploads/";
const OUT = path.join(process.cwd(), "public", "photos");
mkdirSync(OUT, { recursive: true });
const data = JSON.parse(readFileSync(path.join(process.cwd(), "content/data/photos.json"), "utf8"));

async function get(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; site-build)" }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!/^image\//.test(res.headers.get("content-type") || "")) throw new Error("not an image");
  return Buffer.from(await res.arrayBuffer());
}

let ok = 0, kept = 0, failed = 0;
const jobs = Object.values(data).flatMap((g) => g.photos);
for (const p of jobs) {
  const dest = path.join(OUT, `${p.file}.webp`);
  if (existsSync(dest)) { kept++; continue; }
  // Prefer the full-size original over a WordPress thumbnail ("name-300x300.png" -> "name.png").
  const full = p.src.replace(/-\d+x\d+(\.\w+)$/, "$1");
  let buf = null;
  for (const src of full === p.src ? [p.src] : [full, p.src]) {
    try { buf = await get(SOURCE + src); break; } catch { /* try the next one */ }
  }
  if (!buf) { failed++; console.warn(`photos: skipped ${p.file}`); continue; }
  try {
    const out = await sharp(buf).rotate().resize({ width: 900, height: 900, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    writeFileSync(dest, out);
    ok++;
  } catch (e) { failed++; console.warn(`photos: couldn't convert ${p.file}: ${e.message}`); }
}
console.log(`photos: ${ok} fetched, ${kept} already here, ${failed} skipped`);
