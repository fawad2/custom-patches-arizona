# Custom Patches Arizona

The website for **custompatchesarizona.com** — Next.js 16, hosted on Vercel. Every push to `main` deploys automatically.

## Where things are
| What | File |
|---|---|
| Page text and layout | `content/pages/<page>.html` (home is `home.html`) |
| Header menu / footer | `content/header.html`, `content/footer.html` |
| Page titles, descriptions, schema | `content/data/meta.json` |
| 3D patch rail on the home page | `content/data/rail.json`, `lib/patch-rail.ts`, artwork in `lib/patch-art.ts` |
| Quote form → email | `app/api/quote/route.ts` |
| Contact email shown on the site | `lib/site.ts` (`{{EMAIL}}` in the content files) |
| Photos | `public/photos/` (reference them as `/photos/<name>.webp`) |

## Vercel settings
- Framework: Next.js (detected automatically). No build settings to change.
- Environment variables (Project → Settings → Environment Variables):
  - `SMTP_HOST`, `SMTP_PORT` (465), `SMTP_USER`, `SMTP_PASS` — the mailbox that sends quote emails
  - `QUOTE_TO` — where quote requests go (default `orders@hatdigitizing.com`)
  - `NEXT_PUBLIC_CONTACT_EMAIL` — optional, the address shown on the site (default `orders@custompatchesarizona.com`)
- Domain: Project → Settings → Domains → add `custompatchesarizona.com` and `www.custompatchesarizona.com`.

## Run it locally
```
npm install
npm run dev
```
