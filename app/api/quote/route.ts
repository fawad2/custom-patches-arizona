// Quote form → email. Set these on Vercel (Project → Settings → Environment Variables):
//   SMTP_HOST, SMTP_PORT (465 or 587), SMTP_USER, SMTP_PASS   the mailbox that sends the email
//   QUOTE_TO     where requests go (default orders@hatdigitizing.com)
//   MAIL_FROM    optional sender, e.g. "Custom Patches Arizona <quotes@yourdomain.com>" (default: SMTP_USER)
import nodemailer from "nodemailer";
import quoteData from "@/content/data/quote.json";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE = 4 * 1024 * 1024;
const OK_EXT = /\.(ai|eps|pdf|png|jpe?g|svg|webp)$/i;
const hits = new Map<string, number[]>(); // simple per-instance rate limit

const clean = (v: FormDataEntryValue | null, max = 200) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const fail = (error: string, status = 400) => Response.json({ error }, { status });

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 5) return fail("Too many requests in a few minutes. Please wait a little and try again.", 429);
  hits.set(ip, [...recent, now]);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("That didn't come through. Please try again.");
  }
  if (clean(form.get("website"))) return Response.json({ ok: true }); // honeypot: quietly ignore bots

  const name = clean(form.get("name"), 120);
  const email = clean(form.get("email"), 160);
  const phone = clean(form.get("phone"), 40);
  const org = clean(form.get("organization"), 160);
  const productSlug = clean(form.get("product"), 80);
  const quantity = clean(form.get("quantity"), 12);
  const size = clean(form.get("size"), 80);
  const backing = clean(form.get("backing"), 60);
  const deadline = clean(form.get("deadline"), 20);
  const message = String(form.get("message") ?? "").trim().slice(0, 4000);
  if (!name || !email || !productSlug || !quantity) return fail("Please fill in your name, email, patch type and quantity.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please check your email address.");
  if (!/^\d{1,7}$/.test(quantity)) return fail("Please enter the quantity as a number.");
  const product = quoteData.options.find((o) => o.slug === productSlug)?.name || (productSlug === "not-sure" ? "Not sure yet" : productSlug);

  const attachments: { filename: string; content: Buffer }[] = [];
  const file = form.get("artwork");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE) return fail("That file is over 4 MB.");
    if (!OK_EXT.test(file.name)) return fail("Please send artwork as AI, EPS, PDF, PNG, JPG, SVG or WEBP.");
    attachments.push({ filename: file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 100), content: Buffer.from(await file.arrayBuffer()) });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error("quote: SMTP is not configured");
    return fail("Our quote form is being set up.", 503);
  }
  const port = Number(SMTP_PORT || 465);
  const transport = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
  const to = process.env.QUOTE_TO || "orders@hatdigitizing.com";
  const from = process.env.MAIL_FROM || `${SITE_NAME} <${SMTP_USER}>`;
  const rows: [string, string][] = [
    ["Name", name], ["Email", email], ["Phone", phone], ["Team or company", org], ["Patch type", product],
    ["Quantity", quantity], ["Size or placement", size], ["Backing", backing || "Recommend one"], ["Need it by", deadline],
    ["Artwork", attachments[0]?.filename || "none attached"],
  ];
  const html = `<h2 style="font-family:Arial">New quote request — ${esc(SITE_NAME)}</h2><table style="font-family:Arial;font-size:14px;border-collapse:collapse">${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`)
    .join("")}</table>${message ? `<p style="font-family:Arial;font-size:14px;white-space:pre-wrap">${esc(message)}</p>` : ""}`;
  const text = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n") + (message ? `\n\n${message}` : "");

  try {
    await transport.sendMail({ from, to, replyTo: `${name} <${email}>`, subject: `Quote request: ${product} × ${quantity} — ${name}`, text, html, attachments });
  } catch (e) {
    console.error("quote: send failed", e);
    return fail("We couldn't send your request just now.", 502);
  }
  // A short confirmation for the customer (not critical if it fails).
  transport
    .sendMail({
      from, to: email, replyTo: CONTACT_EMAIL,
      subject: `We got your patch quote request — ${SITE_NAME}`,
      text: `Hi ${name},\n\nThanks for your request for ${quantity} × ${product}. We'll email your quote and free digital mockup shortly.\nReply to this email if you want to add anything.\n\n${SITE_NAME}`,
    })
    .catch((e) => console.error("quote: confirmation failed", e));
  return Response.json({ ok: true });
}
