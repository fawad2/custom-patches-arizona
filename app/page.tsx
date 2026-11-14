import { pageWithGallery, railData } from "@/lib/content";
import { metaFor } from "@/lib/metadata";
import { JsonLd } from "@/components/Html";
import RailMount from "@/components/RailMount";

export const metadata = metaFor("home");

export default function Home() {
  const rail = railData();
  return (
    <>
      <main id="main" dangerouslySetInnerHTML={{ __html: pageWithGallery("home") }} />
      <JsonLd slug="home" />
      <RailMount items={rail.items} start={rail.start} />
    </>
  );
}
