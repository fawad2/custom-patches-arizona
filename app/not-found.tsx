import { pageHtml } from "@/lib/content";

export const metadata = { title: { absolute: "Page not found | Custom Patches Arizona" }, robots: "noindex" };

export default function NotFound() {
  return <main id="main" dangerouslySetInnerHTML={{ __html: pageHtml("not-found") }} />;
}
