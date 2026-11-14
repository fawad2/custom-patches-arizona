import { allMeta } from "@/lib/content";

/** A page's structured data (JSON-LD), as written in content/data/meta.json. */
export function JsonLd({ slug }: { slug: string }) {
  const items = allMeta()[slug]?.jsonld || [];
  return (
    <>
      {items.map((x, k) => (
        <script key={k} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(x).replace(/</g, "\\u003c") }} />
      ))}
    </>
  );
}
