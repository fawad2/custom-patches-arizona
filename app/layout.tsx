import type { Metadata, Viewport } from "next";
import "./app.css";
import { footerHtml, headerHtml, navGroups, svgDefs } from "@/lib/content";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";
import SiteScripts from "@/components/SiteScripts";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  icons: { icon: "/favicon.svg" },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = { themeColor: "#f4f5f5", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-base="/">
      <body>
        <div aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} dangerouslySetInnerHTML={{ __html: svgDefs() }} />
        <a className="sr-only" href="#main">Skip to content</a>
        <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: headerHtml() }} />
        {children}
        <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: footerHtml() }} />
        <SiteScripts groups={navGroups()} email={CONTACT_EMAIL} />
      </body>
    </html>
  );
}
