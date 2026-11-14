import { notFound } from "next/navigation";
import { pageHtml, slugs } from "@/lib/content";
import { metaFor } from "@/lib/metadata";
import { JsonLd } from "@/components/Html";

export const dynamicParams = false;
export const generateStaticParams = () => slugs().map((slug) => ({ slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return metaFor((await params).slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slugs().includes(slug)) notFound();
  return (
    <>
      <main id="main" dangerouslySetInnerHTML={{ __html: pageHtml(slug) }} />
      <JsonLd slug={slug} />
    </>
  );
}
