import type { MetadataRoute } from "next";
import { slugs } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const main = ["custom-patches", "custom-embroidered-patches", "custom-pvc-patches", "custom-chenille-patches", "contact"];
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    ...slugs()
      .filter((s) => !["privacy", "terms", "thank-you"].includes(s))
      .map((s) => ({ url: `${SITE_URL}/${s}/`, changeFrequency: "monthly" as const, priority: main.includes(s) ? 0.9 : 0.7 })),
    { url: `${SITE_URL}/sitemap/`, changeFrequency: "monthly" as const, priority: 0.3 },
    ...["privacy", "terms"].map((s) => ({ url: `${SITE_URL}/${s}/`, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
