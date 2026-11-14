import type { Metadata } from "next";
import { allMeta } from "./content";
import { SITE_NAME, SITE_URL } from "./site";

export function metaFor(slug: string): Metadata {
  const m = allMeta()[slug];
  if (!m) return {};
  const url = m.canonical || `${SITE_URL}/${slug === "home" ? "" : `${slug}/`}`;
  return {
    title: { absolute: m.title },
    description: m.description,
    alternates: { canonical: url },
    robots: m.robots || undefined,
    openGraph: {
      title: m.title, description: m.description, url, siteName: SITE_NAME, locale: "en_US", type: "website",
      images: [{ url: m.ogImage || "/og.png", width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: { card: "summary_large_image", title: m.title, description: m.description },
  };
}
