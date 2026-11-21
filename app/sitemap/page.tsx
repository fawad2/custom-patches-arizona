import { allMeta, navGroups } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

// An HTML sitemap: one page that links to every page on the site, grouped the way the menu is.
// It updates itself from content/data/nav.json and content/data/meta.json.

export const metadata = {
  title: { absolute: "Sitemap | Custom Patches Arizona" },
  description: "Every page on Custom Patches Arizona in one place: patch types, products, patch styles, guides and company pages.",
  alternates: { canonical: `${SITE_URL}/sitemap/` },
};

const label = (title: string) => title.split(/\s+[|–-]\s+/)[0].replace(/ Arizona$/, "").trim();

export default function SitemapPage() {
  const meta = allMeta();
  const groups = navGroups();
  const company = [
    { href: "/", name: "Home" },
    { href: "/custom-patches/", name: "All custom patches" },
    { href: "/iron-on-instructions/", name: "Iron-on instructions" },
    { href: "/about/", name: "About us" },
    { href: "/contact/", name: "Get a free quote" },
    { href: "/privacy/", name: "Privacy policy" },
    { href: "/terms/", name: "Terms" },
  ];
  const describe = (slug: string) => meta[slug]?.description || "";
  return (
    <main id="main">
      <section className="section">
        <div className="wrap" style={{ maxWidth: 1080 }}>
          <span className="eyebrow">Sitemap</span>
          <h1 className="h-display" style={{ marginTop: 12 }}>Every page on the site</h1>
          <p className="lede">Find any patch type, product or guide. Every page links to a free quote and digital mockup.</p>
        </div>
      </section>
      {[...groups.map((g) => ({ title: g.title, links: g.items.map((i) => ({ href: `/${i.slug}/`, name: i.name, desc: describe(i.slug) })) })),
        { title: "Company and guides", links: company.map((c) => ({ ...c, desc: describe(c.href === "/" ? "home" : c.href.replace(/\//g, "")) })) }].map((g) => (
        <section className="section section--white" key={g.title} style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="wrap" style={{ maxWidth: 1080 }}>
            <h2 className="h2" style={{ marginBottom: 20 }}>{g.title}</h2>
            <ul className="sitemap-list">
              {g.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.name}</a>
                  {l.desc ? <p>{l.desc}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </main>
  );
}
