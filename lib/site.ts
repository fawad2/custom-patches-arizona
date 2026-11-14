// Site-wide settings. Change them here (or with the environment variables on Vercel).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://custompatchesarizona.com").replace(/\/$/, "");
export const SITE_NAME = "Custom Patches Arizona";
/** The address shown on the site. Quote requests are emailed to QUOTE_TO (see app/api/quote/route.ts). */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "orders@custompatchesarizona.com";
